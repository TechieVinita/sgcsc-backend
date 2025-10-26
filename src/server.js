require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors()); // Allow all origins (you can restrict later)
app.use(express.json());
app.use(morgan('dev'));

// Routes
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
