const connectDB = require('./config/db');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const app = express();
app.use(express.json());

const buildpath = path.join(__dirname,"dist")
app.use(express.static(buildpath));
app.use(cors());



//upload files in uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);


//training routes
const trainingRoutes = require('./routes/trainingRoutes');
app.use('/api/admin', trainingRoutes);

//test routes
const testRoutes = require('./routes/testRoutes');
app.use('/api/admin', testRoutes);


const PORT = 5000;

// Connect to MongoDB using connectDB function
connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
