const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const roleRouter = require('./routes/roleRoute')
const departmentRouter = require('./routes/departmentRoute');
const categoryRouter = require('./routes/categoryRoute')
dotenv.config();
const attendanceRoutes = require('./routes/attendenceRoute');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/users', userRoutes);
app.use('/role',roleRouter);
app.use('/department',departmentRouter)
app.use('/category',categoryRouter)
app.use('/scanning', attendanceRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
