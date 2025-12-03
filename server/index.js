const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const stringSimilarity = require('string-similarity');
const pdf = require('pdf-parse');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Paper = require('./models/Paper');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
// Serve static files (PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- FILE STORAGE SETUP ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
// --- DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://admin:admin123@publazer.arhmawq.mongodb.net/?appName=Publazer";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas successfully!"))
  .catch((err) => console.error("❌ Connection error:", err));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// --- ROUTES ---

// 1. REGISTER (With Encryption)
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
        password: hashedPassword, // Save the scrambled version
        department 
    });
    
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// 2. LOGIN (With Comparison)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // COMPARE ENCRYPTED PASSWORD
    // We check if "password" matches the scrambled "user.password"
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
      title,
      abstract,
      keywords,
      fileName: req.file.filename,
      author,
      authorId,
      department,
      status: 'pending', // Explicitly pending
      plagiarismScore: Math.floor(Math.random() * 30) + 5
    });

    await newPaper.save();
    res.status(201).json({ message: "File uploaded successfully!", paper: newPaper });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload" });
  }
});

// 4. GET PAPERS (THE FIX IS HERE)
app.get('/api/papers', async (req, res) => {
  try {
    // We grab the filters from the URL (e.g. ?status=approved)
    const { authorId, status, search } = req.query;
    
    let query = {};

    // Filter by Author (for My Submissions)
    if (authorId) {
      query.authorId = authorId;
    }

    // Filter by Status (This was missing before!)
    if (status) {
      query.status = status;
    }

    // Search by Title or Keywords
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }

    const papers = await Paper.find(query).sort({ uploadDate: -1 });
    res.json(papers);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

// 5. DELETE PAPER
app.delete('/api/papers/:id', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    const filePath = path.join(__dirname, 'uploads', paper.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Paper.findByIdAndDelete(req.params.id);
    res.json({ message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting paper" });
  }
});

// 6. UPDATE PAPER (Enhanced with Comments)
app.put('/api/papers/:id', async (req, res) => {
  try {
    const { title, abstract, keywords, status, comments } = req.body; // <--- Added comments
    
    const updateData = {};
    if (title) updateData.title = title;
    if (abstract) updateData.abstract = abstract;
    if (keywords) updateData.keywords = keywords;
    if (status) updateData.status = status;
    if (comments !== undefined) updateData.comments = comments; // <--- Save it if it exists

    const updatedPaper = await Paper.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedPaper);
  } catch (error) {
    res.status(500).json({ error: "Error updating paper" });
  }
});

// 7. SEED DUMMY DATA ROUTE
app.get('/api/seed', async (req, res) => {
  try {
    const dummyPapers = [
      {
        title: "Impact of Artificial Intelligence on Modern Healthcare Systems",
        abstract: "This study explores how AI algorithms are revolutionizing diagnostic procedures and patient care management in tertiary hospitals. We analyzed data from 500 patients to determine the accuracy of ML-based predictions versus traditional methods.",
        keywords: "AI, Healthcare, Machine Learning, Medical Diagnosis",
        fileName: "placeholder.pdf", // Replace with a real filename from your uploads folder if you want the link to work
        author: "Dr. Sarah Connor",
        authorId: "dummy_author_1",
        department: "Computer Science",
        status: "approved", // Directly approved so it shows in Repository
        plagiarismScore: 12,
        uploadDate: new Date('2023-10-15')
      },
      {
        title: "Sustainable Urban Planning: A Case Study of Metro Cities",
        abstract: "Urbanization poses significant challenges to environmental sustainability. This paper proposes a new framework for green infrastructure in high-density metropolitan areas, focusing on waste management and renewable energy integration.",
        keywords: "Urban Planning, Sustainability, Green Energy, Smart Cities",
        fileName: "placeholder.pdf",
        author: "John Smith",
        authorId: "dummy_author_2",
        department: "Civil Engineering",
        status: "approved",
        plagiarismScore: 5,
        uploadDate: new Date('2023-11-02')
      },
      {
        title: "Blockchain Technology in Supply Chain Management",
        abstract: "A comprehensive analysis of how decentralized ledgers can improve transparency and reduce fraud in global logistics. The research highlights specific use cases in the pharmaceutical and food safety industries.",
        keywords: "Blockchain, Supply Chain, Logistics, Cryptography",
        fileName: "placeholder.pdf",
        author: "Emily Chen",
        authorId: "dummy_author_3",
        department: "Information Technology",
        status: "approved",
        plagiarismScore: 8,
        uploadDate: new Date('2023-12-10')
      },
      {
        title: "The Psychological Effects of Remote Work on Employee Productivity",
        abstract: "Post-pandemic work culture has shifted dramatically. This paper investigates the long-term psychological impacts of isolation and digital fatigue on corporate employees working from home.",
        keywords: "Psychology, Remote Work, Mental Health, HR",
        fileName: "placeholder.pdf",
        author: "Michael Ross",
        authorId: "dummy_author_4",
        department: "Psychology",
        status: "approved",
        plagiarismScore: 15,
        uploadDate: new Date('2024-01-20')
      },
      {
        title: "Renewable Energy Storage: Advancements in Solid-State Batteries",
        abstract: "Energy storage remains the bottleneck for renewable adoption. We present a review of recent breakthroughs in solid-state battery technology that could double the efficiency of solar and wind power storage systems.",
        keywords: "Energy, Physics, Batteries, Engineering",
        fileName: "placeholder.pdf",
        author: "David Miller",
        authorId: "dummy_author_5",
        department: "Electrical Engineering",
        status: "approved",
        plagiarismScore: 3,
        uploadDate: new Date('2024-02-05')
      }
    ];

    await Paper.insertMany(dummyPapers);
    res.json({ message: "Successfully added 5 dummy papers!" });
  } catch (error) {
    console.error("Seeding Error:", error);
    res.status(500).json({ error: "Failed to seed data" });
  }
});

// 8. GET ALL USERS (For Admin Panel)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // -password means "don't send the password back"
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 9. UPDATE USER (Enhanced to allow Password & Department updates)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, role, department, password } = req.body;
    
    // 1. Prepare the data to update
    const updateData = { name, email, role, department };

    // 2. Only update password if the admin typed something new
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10); // Encrypt new password
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// 10. DELETE USER
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// 11. CREATE USER (Admin - Secure)
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

// 12. CHECK PLAGIARISM ROUTE
app.post('/api/plagiarism/check', upload.single("file"), async (req, res) => {
  try {
    const { text } = req.body;
    let textToCheck = text || "";

    // A. If a file was uploaded, extract text from PDF
    if (req.file) {
      const filePath = path.join(__dirname, 'uploads', req.file.filename);
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      textToCheck = pdfData.text;
      
      // Clean up the temp file after reading
      fs.unlinkSync(filePath); 
    }

    if (!textToCheck || textToCheck.length < 50) {
      return res.status(400).json({ error: "Text is too short to scan (min 50 chars)" });
    }

    // B. Fetch all existing papers to compare against
    const allPapers = await Paper.find({}, 'title abstract'); // Only get title and abstract for speed

    let highestScore = 0;
    let matchedSources = [];

    // C. Compare input against every paper in the DB
    allPapers.forEach(paper => {
      // Compare against Abstract
      const abstractSimilarity = stringSimilarity.compareTwoStrings(textToCheck, paper.abstract);
      const score = Math.round(abstractSimilarity * 100);

      if (score > 5) { // Only report matches > 5%
        if (score > highestScore) highestScore = score;
        
        matchedSources.push({
          source: paper.title,
          percentage: score,
          url: "Internal Repository"
        });
      }
    });

    // Sort matches by highest percentage
    matchedSources.sort((a, b) => b.percentage - a.percentage);

    res.json({
      overallScore: highestScore,
      matchedSources: matchedSources.slice(0, 5), // Top 5 matches
      details: `Scanned against ${allPapers.length} documents in the repository.`
    });

  } catch (error) {
    console.error("Plagiarism Check Error:", error);
    res.status(500).json({ error: "Failed to process plagiarism check" });
  }
});

app.listen(3001, () => {
  console.log('🚀 Server is running on port 3001');
});