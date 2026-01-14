const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./controllers/logger');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const goalRoutes = require('./routes/goalRoutes');
const recurringRoutes = require('./routes/recurringRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/categories', categoryRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('✅MongoDB Connected'))
  .catch(err => logger.error('❌MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`✅Server running on port ${PORT}`));

