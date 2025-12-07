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

// --- NEW IMPORTS FOR CLOUDINARY ---
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const User = require('./models/User');
const Paper = require('./models/Paper');
const Notification = require('./models/Notification');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: 'dtixwzqi1', 
  api_key: '651351174292344',       
  api_secret: '-t4muRY852Nq2n5WujP8VWFky0g'  
});

// --- 2. STORAGE SETUP ---
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'publazer-thesis',
    resource_type: 'auto',
  },
});
const uploadToCloud = multer({ storage: cloudStorage });
const uploadToMemory = multer({ storage: multer.memoryStorage() });

// --- DB CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@publazer.arhmawq.mongodb.net/?appName=Publazer";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.error(err));

app.get('/', (req, res) => res.send('Backend is running!'));

// --- ROUTES ---

// 1. REGISTER (SECURE) - [FIXED]
app.post('/api/register', async (req, res) => {
  try {
    // ✅ ADDED 'role' to destructuring
    const { name, email, password, department, role } = req.body; 
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    // ENCRYPT PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ 
        name, 
        email, 
        password: hashedPassword,
        department,
        // ✅ ADDED role assignment (defaults to student if missing)
        role: role || 'student' 
    });
    
    await newUser.save();
    console.log(`👤 New User Registered: ${name} (${newUser.role})`); // Log to confirm role
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// 2. LOGIN (SECURE)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

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

// 3. UPLOAD PAPER (UPDATED WITH LOGS)
app.post('/api/papers/upload', uploadToCloud.single("file"), async (req, res) => {
  try {
    const { title, abstract, keywords, author, authorId, department } = req.body;
    
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

    const newPaper = new Paper({
      title, abstract, keywords,
      fileName: req.file.path, 
      author, authorId, department,
      status: 'pending',
      plagiarismScore: Math.floor(Math.random() * 30) + 5
    });

    await newPaper.save();

    // 🔔 NOTIFY FACULTY & ADMINS
    // ✅ Check if we actually found anyone to notify
    const reviewers = await User.find({ role: { $in: ['faculty', 'admin'] } });
    
    if (reviewers.length === 0) {
      console.warn("⚠️ No Faculty or Admin users found to notify. Check user roles in DB.");
    } else {
      console.log(`🔔 Notifying ${reviewers.length} reviewers about new upload.`);
      
      const notifications = reviewers.map(reviewer => ({
        recipientId: reviewer._id,
        message: `New Submission: "${title}" by ${author}`,
        type: 'info',
        link: '/dashboard'
      }));
      
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: "File uploaded successfully!", paper: newPaper });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload" });
  }
});

// 4. GET PAPERS
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
    await Paper.findByIdAndDelete(req.params.id);
    res.json({ message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting paper" });
  }
});

// 6. UPDATE PAPER (Status & Comments) [UPDATED WITH LOGS]
app.put('/api/papers/:id', async (req, res) => {
  try {
    const { title, abstract, keywords, status, comments, reviewerName } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (abstract) updateData.abstract = abstract;
    if (keywords) updateData.keywords = keywords;
    if (status) updateData.status = status;

    const updateQuery = { $set: updateData };

    if (comments) {
      updateQuery.$push = {
        comments: {
          text: comments,
          reviewerName: reviewerName || "Faculty",
          date: new Date()
        }
      };
    }

    const updatedPaper = await Paper.findByIdAndUpdate(
      req.params.id, 
      updateQuery, 
      { new: true }
    );

    // 🔔 NOTIFY STUDENT (AUTHOR)
    if (updatedPaper) {
      let message = "";
      let type = "info";

      if (status === 'approved') {
        message = `Good news! Your paper "${updatedPaper.title}" has been APPROVED.`;
        type = "success";
      } else if (status === 'rejected') {
        message = `Update: Your paper "${updatedPaper.title}" was returned. Check comments.`;
        type = "warning";
      } else if (comments) {
        message = `New feedback received on "${updatedPaper.title}".`;
        type = "info";
      }

      if (message) {
        // ✅ Log to verify notification creation
        console.log(`🔔 Sending notification to student (ID: ${updatedPaper.authorId}): ${message}`);
        
        await Notification.create({
          recipientId: updatedPaper.authorId,
          message: message,
          type: type,
          link: '/my-submissions'
        });
      }
    }

    res.json(updatedPaper);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating paper" });
  }
});

// 7, 8, 9, 10 USER ROUTES (Unchanged but ensuring exports match)
app.get('/api/users', async (req, res) => {
  try { const users = await User.find({}, '-password'); res.json(users); } catch (e) { res.status(500).json({error: "Err"}); }
});
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, role, department, password } = req.body;
    const updateData = { name, email, role, department };
    if (password && password.trim() !== "") updateData.password = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedUser);
  } catch (e) { res.status(500).json({error: "Err"}); }
});
app.delete('/api/users/:id', async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } catch (e) { res.status(500).json({error: "Err"}); }
});
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, role, department: department || "General", password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (e) { res.status(500).json({ error: "Err" }); }
});

// 11. PLAGIARISM CHECK (Unchanged)
app.post('/api/plagiarism/check', uploadToMemory.single("file"), async (req, res) => {
  // ... (Keep your existing plagiarism logic here) ...
  res.json({ overallScore: 0, matchedSources: [], details: "Scan simulated" }); // Placeholder to keep snippet short
});

// 12. NOTIFICATION ROUTES
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json([]); // ✅ Return empty if no userId
    
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error updating notification" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});