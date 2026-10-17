const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Images only (jpg, jpeg, png, webp)!'));
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== API ROUTES ====================

// --- 1. PROFILE ---
app.get('/api/profile', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM profile WHERE id = 1 LIMIT 1');
        res.json({ success: true, data: rows[0] || {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/profile', upload.single('profile_image'), async (req, res) => {
    try {
        const { full_name, headline, bio, email, github, linkedin } = req.body;
        let query, params;

        if (req.file) {
            const imagePath = `/uploads/${req.file.filename}`;
            query = `
                INSERT INTO profile (id, full_name, headline, bio, email, github, linkedin, profile_image)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    full_name=VALUES(full_name), headline=VALUES(headline), bio=VALUES(bio),
                    email=VALUES(email), github=VALUES(github), linkedin=VALUES(linkedin),
                    profile_image=VALUES(profile_image)
            `;
            params = [full_name, headline, bio, email, github, linkedin, imagePath];
        } else {
            query = `
                INSERT INTO profile (id, full_name, headline, bio, email, github, linkedin)
                VALUES (1, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    full_name=VALUES(full_name), headline=VALUES(headline), bio=VALUES(bio),
                    email=VALUES(email), github=VALUES(github), linkedin=VALUES(linkedin)
            `;
            params = [full_name, headline, bio, email, github, linkedin];
        }

        await db.query(query, params);
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 2. SKILLS (CRUD) ---
app.get('/api/skills', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM skills ORDER BY category, id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/skills', async (req, res) => {
    try {
        const { name, category, proficiency } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Skill name required' });
        const [result] = await db.query(
            'INSERT INTO skills (name, category, proficiency) VALUES (?, ?, ?)',
            [name, category || 'Backend', proficiency || 80]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/skills/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Skill deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 3. EXPERIENCES (CRUD) ---
app.get('/api/experiences', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM experiences ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/experiences', async (req, res) => {
    try {
        const { role, company, duration, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO experiences (role, company, duration, description) VALUES (?, ?, ?, ?)',
            [role, company, duration, description]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/experiences/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM experiences WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Experience deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 4. EDUCATION (CRUD) ---
app.get('/api/education', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM education ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/education', async (req, res) => {
    try {
        const { degree, institution, year, details } = req.body;
        const [result] = await db.query(
            'INSERT INTO education (degree, institution, year, details) VALUES (?, ?, ?, ?)',
            [degree, institution, year, details]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/education/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM education WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Education record deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 5. PROJECTS (CRUD) ---
app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, tech_stack, project_url } = req.body;
        const [result] = await db.query(
            'INSERT INTO projects (title, description, tech_stack, project_url) VALUES (?, ?, ?, ?)',
            [title, description, tech_stack, project_url]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Portfolio server running at http://localhost:${PORT}`);
});