const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // MongoDB connection
const authRoutes = require('./routes/authRoutes');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Use the Google Generative AI SDK

const fetch = require('node-fetch');
global.fetch = fetch; // Make fetch globally available


dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());

// Connect to DB
connectDB();

// Allow requests from your frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL, // Use the FRONTEND_URL environment variable
  credentials: true, // Allow cookies and credentials
}));

// Initialize Google Generative AI
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('GOOGLE_API_KEY is not set in the environment variables.');
  process.exit(1); // Exit if the API key is missing
}

const genAI = new GoogleGenerativeAI(apiKey);
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
    console.log('Sending request to Google Generative AI API with message:', message);
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
    });

    const reply = result.response.text();
    console.log('Received response from Google Generative AI API:', reply);
    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with Google Generative AI API:', error);

    let errorMessage = 'Failed to get chatbot response';
    if (error.response) {
      errorMessage = error.response.data?.error || errorMessage;
      console.error('API Response Error:', error.response.data);
    } else if (error.request) {
      errorMessage = 'No response received from the API';
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    // Fallback response
    const fallbackReply = 'I am unable to respond at the moment. Please try again later.';
    res.status(500).json({ error: errorMessage, reply: fallbackReply });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));