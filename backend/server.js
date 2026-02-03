// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const connectDB = require('./DB/db.js');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(helmet());
// app.use(morgan('combined'));
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// // const connectDB = async () => {
// //   try {
// //     const conn = await mongoose.connect("mongodb+srv://jadeja:meet6782@sgp.hr5tk.mongodb.net/?retryWrites=true&w=majority&appName=SGP", {
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //     });

// //     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
// //   } catch (error) {
// //     console.error(`❌ Error: ${error.message}`);
// //     process.exit(1); // exit the process with failure
// //   }
// // };


// // MongoDB Connection
// // const connectDB = async () => {
// //   try {
// //     const conn = await mongoose.connect("mongodb+srv://jadeja:jadeja@sgp.hr5tk.mongodb.net/?retryWrites=true&w=majority&appName=SGP");
// //     console.log(`MongoDB Connected: ${conn.connection.host}`);
// //   } catch (error) {
// //     console.error('❌ Error connecting to MongoDB:', error.message);
// //     console.log('💡 Please make sure MongoDB is running or use MongoDB Atlas');
// //     console.log('🔗 For MongoDB Atlas: Update MONGO_URI in backend/config.env');
// //     console.log('🔄 Retrying connection in 5 seconds...');
// //     setTimeout(connectDB, 5000);
// //   }
// // };

// // Routes (we'll add these later)
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to Agri-Sathi API' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// const PORT = process.env.PORT || 5000;

// // Start server
// const startServer = async () => {
//   await connectDB();
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// };

// startServer(); 
// // backend/config/db.js

// // connectDB();
// connectDB();

// // module.exports = connectDB;


import express from 'express';
import dotenv from 'dotenv';
// Load environment variables from .env (default)
dotenv.config();
import connectDB from './DB/db.js';
import userRoutes from './DB/userRoutes.js';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/api/user', userRoutes);
// Serve uploads statically
app.use('/uploads', express.static(path.resolve('uploads')));

const PORT = process.env.PORT || 5000;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});