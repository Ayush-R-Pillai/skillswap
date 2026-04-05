require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

const {
  getDoc, getDocs, addDoc,
  updateDoc, deleteDoc, queryDocs,
} = require('./firebase');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_secret';

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const genToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// ═══════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await queryDocs('users', 'email', '==', email);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await addDoc('users', {
      name,
      email,
      passwordHash,
      bio: '',
      profilePhoto: '',
      rating: 0,
      reviewCount: 0,
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: genToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await queryDocs('users', 'email', '==', email);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: genToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// USER ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/users/me
app.get('/api/users/me', protect, async (req, res) => {
  try {
    const user = await getDoc('users', req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get skills offered by this user
    const skillsOffered = await queryDocs('skills', 'offeredBy', '==', req.userId);

    const { passwordHash, ...safeUser } = user;
    res.json({ ...safeUser, skillsOffered });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getDoc('users', req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const skillsOffered = await queryDocs('skills', 'offeredBy', '==', req.params.id);

    const { passwordHash, ...safeUser } = user;
    res.json({ ...safeUser, skillsOffered });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me
app.put('/api/users/me', protect, async (req, res) => {
  try {
    const { name, bio, profilePhoto } = req.body;
    const updates = {};
    if (name)                      updates.name = name;
    if (bio !== undefined)         updates.bio = bio;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

    const updated = await updateDoc('users', req.userId, updates);
    const { passwordHash, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// SKILL ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/skills
app.get('/api/skills', async (req, res) => {
  try {
    const { search, category, level } = req.query;
    let skills = await getDocs('skills');

    // Attach user info to each skill
    const usersCache = {};
    for (const skill of skills) {
      if (!usersCache[skill.offeredBy]) {
        const u = await getDoc('users', skill.offeredBy);
        usersCache[skill.offeredBy] = u
          ? { id: u.id, name: u.name, rating: u.rating, profilePhoto: u.profilePhoto }
          : null;
      }
      skill.offeredByUser = usersCache[skill.offeredBy];
    }

    // Apply filters
    if (search) {
      const q = search.toLowerCase();
      skills = skills.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (category) skills = skills.filter(s => s.category === category);
    if (level)    skills = skills.filter(s => s.level === level);

    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/skills
app.post('/api/skills', protect, async (req, res) => {
  try {
    const { title, category, description, level, tags } = req.body;

    const skill = await addDoc('skills', {
      title,
      category,
      description,
      level: level || 'beginner',
      tags: tags || [],
      offeredBy: req.userId,
    });

    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/skills/:id
app.delete('/api/skills/:id', protect, async (req, res) => {
  try {
    const skill = await getDoc('skills', req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.offeredBy !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    await deleteDoc('skills', req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// SESSION ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/sessions
app.post('/api/sessions', protect, async (req, res) => {
  try {
    const { teacherId, skillId, scheduledAt, notes } = req.body;

    const session = await addDoc('sessions', {
      teacher: teacherId,
      learner: req.userId,
      skill: skillId,
      status: 'pending',
      scheduledAt,
      notes: notes || '',
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sessions/me
app.get('/api/sessions/me', protect, async (req, res) => {
  try {
    const allSessions = await getDocs('sessions');
    const mySessions  = allSessions.filter(
      s => s.teacher === req.userId || s.learner === req.userId
    );

    // Populate teacher, learner, skill data
    const populated = await Promise.all(mySessions.map(async (s) => {
      const [teacherData, learnerData, skillData] = await Promise.all([
        getDoc('users', s.teacher),
        getDoc('users', s.learner),
        getDoc('skills', s.skill),
      ]);
      return {
        ...s,
        teacherData: teacherData ? { id: teacherData.id, name: teacherData.name, profilePhoto: teacherData.profilePhoto } : null,
        learnerData: learnerData ? { id: learnerData.id, name: learnerData.name, profilePhoto: learnerData.profilePhoto } : null,
        skillData:   skillData   ? { id: skillData.id,   title: skillData.title, category: skillData.category } : null,
      };
    }));

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/sessions/:id
app.put('/api/sessions/:id', protect, async (req, res) => {
  try {
    const session = await getDoc('sessions', req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const updated = await updateDoc('sessions', req.params.id, {
      status: req.body.status,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// REVIEW ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/reviews
app.post('/api/reviews', protect, async (req, res) => {
  try {
    const { revieweeId, sessionId, rating, comment } = req.body;

    const review = await addDoc('reviews', {
      reviewer: req.userId,
      reviewee: revieweeId,
      session:  sessionId,
      rating,
      comment,
    });

    // Recalculate average rating for reviewee
    const allReviews = await queryDocs('reviews', 'reviewee', '==', revieweeId);
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await updateDoc('users', revieweeId, {
      rating:      Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/:userId
app.get('/api/reviews/:userId', async (req, res) => {
  try {
    const reviews = await queryDocs('reviews', 'reviewee', '==', req.params.userId);

    const populated = await Promise.all(reviews.map(async (r) => {
      const reviewer = await getDoc('users', r.reviewer);
      return {
        ...r,
        reviewerData: reviewer
          ? { id: reviewer.id, name: reviewer.name, profilePhoto: reviewer.profilePhoto }
          : null,
      };
    }));

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 SkillSwap API running with Firebase!', status: 'ok' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SkillSwap server running on port ${PORT}`);
  console.log(`🔥 Connected to Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);
});
