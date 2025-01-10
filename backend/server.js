const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // MongoDB connection
const authRoutes = require('./routes/authRoutes');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Use the Google Generative AI SDK

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

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    // Generate content using the Gemini model
    const result = await model.generateContent(message);
    const reply = result.response.text(); // Extract the response text
    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with Google Generative AI API:', error);
    res.status(500).json({ error: 'Failed to get chatbot response' });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));