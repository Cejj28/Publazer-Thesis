const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs'); 
const stringSimilarity = require('string-similarity');
const pdf = require('pdf-parse');
require('dotenv').config();

const User = require('./models/User');
const Paper = require('./models/Paper');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- FILE STORAGE ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- DB CONNECTION ---
// Replace with your actual MongoDB URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@publazer.arhmawq.mongodb.net/?appName=Publazer";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.error(err));

app.get('/', (req, res) => res.send('Backend is running!'));

// --- ROUTES ---

// 1. REGISTER (SECURE)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body; 
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    // ENCRYPT PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ 
        name, 
        email, 
        password: hashedPassword, // Save hash
        department 
    });
    
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// 2. LOGIN (SECURE)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // COMPARE HASHED PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// 3. UPLOAD PAPER
app.post('/api/papers/upload', upload.single("file"), async (req, res) => {
  try {
    const { title, abstract, keywords, author, authorId, department } = req.body;
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

    const newPaper = new Paper({
      title, abstract, keywords,
      fileName: req.file.filename,
      author, authorId, department,
      status: 'pending',
      plagiarismScore: Math.floor(Math.random() * 30) + 5
    });

    await newPaper.save();
    res.status(201).json({ message: "File uploaded successfully!", paper: newPaper });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload" });
  }
});

// 4. GET PAPERS (Filter & Search)
app.get('/api/papers', async (req, res) => {
  try {
    const { authorId, status, search } = req.query;
    let query = {};
    if (authorId) query.authorId = authorId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }
    const papers = await Paper.find(query).sort({ uploadDate: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

// 5. DELETE PAPER
app.delete('/api/papers/:id', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    const filePath = path.join(__dirname, 'uploads', paper.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Paper.findByIdAndDelete(req.params.id);
    res.json({ message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting paper" });
  }
});

// 6. UPDATE PAPER (Status & Comments)
app.put('/api/papers/:id', async (req, res) => {
  try {
    const { title, abstract, keywords, status, comments } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (abstract) updateData.abstract = abstract;
    if (keywords) updateData.keywords = keywords;
    if (status) updateData.status = status;
    if (comments !== undefined) updateData.comments = comments;

    const updatedPaper = await Paper.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedPaper);
  } catch (error) {
    res.status(500).json({ error: "Error updating paper" });
  }
});

// 7. GET ALL USERS
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 8. UPDATE USER (Secure Password Update)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, role, department, password } = req.body;
    const updateData = { name, email, role, department };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10); // Encrypt new password
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// 9. DELETE USER
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// 10. CREATE USER (Admin - Secure)
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10); // Encrypt

    const newUser = new User({
      name, email, role, department: department || "General",
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// 11. PLAGIARISM CHECK
app.post('/api/plagiarism/check', upload.single("file"), async (req, res) => {
  try {
    const { text } = req.body;
    let textToCheck = text || "";

    if (req.file) {
      const filePath = path.join(__dirname, 'uploads', req.file.filename);
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      textToCheck = pdfData.text;
      fs.unlinkSync(filePath); 
    }

    if (!textToCheck || textToCheck.length < 50) {
      return res.status(400).json({ error: "Text is too short to scan (min 50 chars)" });
    }

    const allPapers = await Paper.find({}, 'title abstract');
    let highestScore = 0;
    let matchedSources = [];

    allPapers.forEach(paper => {
      const abstractSimilarity = stringSimilarity.compareTwoStrings(textToCheck, paper.abstract);
      const score = Math.round(abstractSimilarity * 100);
      if (score > 5) {
        if (score > highestScore) highestScore = score;
        matchedSources.push({ source: paper.title, percentage: score, url: "Internal Repository" });
      }
    });

    matchedSources.sort((a, b) => b.percentage - a.percentage);
    res.json({
      overallScore: highestScore,
      matchedSources: matchedSources.slice(0, 5),
      details: `Scanned against ${allPapers.length} documents.`
    });
  } catch (error) {
    res.status(500).json({ error: "Scan failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});