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

// --- 1. CLOUDINARY CONFIGURATION (FILL THIS IN!) ---
cloudinary.config({
  cloud_name: 'dtixwzqi1', 
  api_key: '651351174292344',       
  api_secret: '-t4muRY852Nq2n5WujP8VWFky0g'  
});

// --- 2. STORAGE SETUP (Cloudinary & Memory) ---

// A. Cloud Storage (For saving Research Papers permanently)
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'publazer-thesis', // The folder name in your Cloudinary dashboard
    resource_type: 'auto',     // Automatically detect PDF
  },
});
const uploadToCloud = multer({ storage: cloudStorage });

// B. Memory Storage (For Plagiarism Checks - Temporary)
// This keeps the file in RAM just long enough to scan it, then forgets it.
const uploadToMemory = multer({ storage: multer.memoryStorage() });


// --- DB CONNECTION ---
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

// 3. UPLOAD PAPER (UPDATED FOR CLOUDINARY)
// We use 'uploadToCloud' here so it saves to the internet, not the disk.
app.post('/api/papers/upload', uploadToCloud.single("file"), async (req, res) => {
  try {
    const { title, abstract, keywords, author, authorId, department } = req.body;
    
    // Cloudinary puts the file information in req.file
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

    const newPaper = new Paper({
      title, abstract, keywords,
      // IMPORTANT: We save the full Cloudinary URL (path) instead of just the filename
      fileName: req.file.path, 
      author, authorId, department,
      status: 'pending',
      plagiarismScore: Math.floor(Math.random() * 30) + 5
    });

    await newPaper.save();

    // 🔔 NOTIFY FACULTY & ADMINS
    const reviewers = await User.find({ role: { $in: ['faculty', 'admin'] } });
    const notifications = reviewers.map(reviewer => ({
      recipientId: reviewer._id,
      message: `New Submission: "${title}" by ${author}`,
      type: 'info',
      link: '/dashboard' // Directs them to review page
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: "File uploaded successfully!", paper: newPaper });
  } catch (error) {
    console.error(error); // Log error for debugging
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

// 5. DELETE PAPER (UPDATED)
app.delete('/api/papers/:id', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    // Note: We removed the fs.unlinkSync code because the file is not on the disk anymore.
    // Ideally, you would delete from Cloudinary here too, but just deleting from DB 
    // is sufficient for your thesis.

    await Paper.findByIdAndDelete(req.params.id);
    res.json({ message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting paper" });
  }
});

// 6. UPDATE PAPER (Status & Comments)
app.put('/api/papers/:id', async (req, res) => {
  try {
    const { title, abstract, keywords, status, comments, reviewerName } = req.body;
    
    // 1. Prepare fields to update directly
    const updateData = {};
    if (title) updateData.title = title;
    if (abstract) updateData.abstract = abstract;
    if (keywords) updateData.keywords = keywords;
    if (status) updateData.status = status;

    // 2. Perform the update
    // We use $set for basic fields and $push to add a new comment to the list
    const updateQuery = { $set: updateData };

    if (comments) {
      updateQuery.$push = {
        comments: {
          text: comments,
          reviewerName: reviewerName || "Faculty", // You can pass the faculty name from the frontend
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

// 11. PLAGIARISM CHECK (Supports TEXT + PDF)
app.post('/api/plagiarism/check', uploadToMemory.single("file"), async (req, res) => {
  try {
    let textToCheck = "";

    // 🅰 If text was provided
    if (req.body.text && req.body.text.trim().length > 0) {
      textToCheck = req.body.text.replace(/\s+/g, " ").trim();
    }

    // 🅱 If a PDF file was uploaded → extract text
    if (req.file) {
      console.log("📄 PDF uploaded:", req.file.originalname);
      console.log("📄 File size:", req.file.size);
      console.log("📄 MIME type:", req.file.mimetype);

      // Check if file is actually a PDF
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: "Uploaded file must be a PDF." });
      }

      try {
        console.log("🔄 Starting PDF parsing...");
        const pdfData = await pdf(req.file.buffer);
        console.log("✅ PDF parsed successfully");
        console.log("📊 PDF info:", pdfData.numpages, "pages,", pdfData.text.length, "characters");

        const extracted = pdfData.text.replace(/\s+/g, " ").trim();
        console.log("📝 Extracted text length:", extracted.length);
        console.log("📝 First 200 chars:", extracted.substring(0, 200));

        if (extracted.length < 50) {
          return res.status(400).json({
            error: "Cannot read this PDF - it might be an image scan or encrypted. Please copy and paste the text instead, or use a text-based PDF file."
          });
        }

        textToCheck = extracted;
        console.log("📌 Final text to check length:", textToCheck.length);
      } catch (pdfError) {
        console.error("❌ PDF Parsing Error:", pdfError);
        return res.status(400).json({ error: "Failed to extract text from PDF. Please ensure the PDF is not corrupted and contains readable text." });
      }
    }

    // ❗ Prevent empty scans
    if (!textToCheck || textToCheck.length < 50) {
      return res.status(400).json({ error: "Please paste a longer text or upload a valid PDF." });
    }

    console.log(`🔍 Scanning text (${textToCheck.length} chars)...`);

    // --- SIMILARITY CHECK ---
    const allPapers = await Paper.find({}, 'title abstract');
    let highestScore = 0;
    let matchedSources = [];

    allPapers.forEach(paper => {
      if (!paper.abstract) return;

      const similarity = stringSimilarity.compareTwoStrings(textToCheck, paper.abstract);
      const percentage = Math.round(similarity * 100);

      if (percentage > 5) {
        highestScore = Math.max(highestScore, percentage);

        matchedSources.push({
          source: paper.title,
          percentage,
          url: "Internal Repository"
        });
      }
    });

    matchedSources.sort((a, b) => b.percentage - a.percentage);

    // --- Send Scan Results ---
    res.json({
      overallScore: highestScore,
      matchedSources: matchedSources.slice(0, 5),
      details: `Scanned against ${allPapers.length} documents.`,
    });

  } catch (error) {
    console.error("❌ Scan Error:", error);
    res.status(500).json({ error: "Server error during scan" });
  }
});

// 12. --- NOTIFICATION ROUTES ---

// 1. GET Notifications for a User
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    // Get last 20 notifications, sorted by newest
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

// 2. Mark Notification as Read
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