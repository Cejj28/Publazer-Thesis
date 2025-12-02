const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');
const Paper = require('./models/Paper');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- NEW LINE: Serve static files from 'uploads' folder ---
// This allows you to visit http://localhost:3001/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- 1. SETUP FILE STORAGE ---
// Ensure the 'uploads' folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure where to save the files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save to 'server/uploads' folder
  },
  filename: function (req, file, cb) {
    // Rename file to avoid duplicates (e.g., "170999-research.pdf")
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

//CONNECTION
const MONGO_URI = "mongodb+srv://admin:admin123@publazer.arhmawq.mongodb.net/?appName=Publazer";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas successfully!"))
  .catch((err) => console.error("❌ Connection error:", err));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// --- ROUTES ---

// 1. REGISTER ROUTE
app.post('/api/register', async (req, res) => {
  try {
    // 1. Accept name, email, password, AND department
    const { name, email, password, department } = req.body; 

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const newUser = new User({ 
        name, 
        email, 
        password,
        department 
    });
    
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// 2. LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

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

// 3. REAL UPLOAD ROUTE (With File Support)
// 'upload.single("file")' tells the server to look for a file named "file"
app.post('/api/papers/upload', upload.single("file"), async (req, res) => {
  try {
    // Now we have req.file (the PDF) and req.body (the text)
    const { title, abstract, keywords, author, authorId, department } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const newPaper = new Paper({
      title,
      abstract,
      keywords,
      fileName: req.file.filename, // Save the actual system filename
      author,
      authorId,
      department,
      plagiarismScore: Math.floor(Math.random() * 30) + 5
    });

    await newPaper.save();

    res.status(201).json({ message: "File uploaded successfully!", paper: newPaper });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload" });
  }
});


app.listen(3001, () => {
  console.log('🚀 Server is running on port 3001');
});