const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // MongoDB connection
const authRoutes = require('./routes/authRoutes');
const axios = require('axios'); // Add axios for API requests

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());



// Connect to DB
connectDB();

// Allow requests from your frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL, // Use the FRONTEND_URL environment variable
  credentials: true, // Allow cookies and credentials
}));

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to My Backend API! Use /api/auth for authentication-related endpoints.');
});

// Routes
app.use('/api/auth', authRoutes);

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }
    );
    const reply = response.data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with Google Generative AI API:', error);
    res.status(500).json({ error: 'Failed to get chatbot response' });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));