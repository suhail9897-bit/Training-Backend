const connectDB = require('./config/db');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());


const path = require('path');
app.use('/uploads', express.static('uploads'));

// admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);


//training routes
const trainingRoutes = require('./routes/trainingRoutes');
app.use('/api/admin', trainingRoutes);


const PORT = 5000;

// Connect to MongoDB using connectDB function
connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
