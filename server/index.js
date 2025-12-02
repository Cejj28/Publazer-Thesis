const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// YOUR CONNECTION
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

app.listen(3001, () => {
  console.log('🚀 Server is running on port 3001');
});