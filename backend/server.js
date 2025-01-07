const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // MongoDB connection
const authRoutes = require('./routes/authRoutes');

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

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
