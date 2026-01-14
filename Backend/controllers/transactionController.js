const Transaction = require('../models/Transaction');
const logger = require('./logger');

exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      amount,
      category,
      description,
      date: date || Date.now()
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { type, amount, category, description, date },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
    logger.info(`Transaction updated successfully for user ${req.userId}`);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    logger.info(`Transaction deleted successfully for user ${req.userId}`);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    const filter = { userId: req.userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const transactions = await Transaction.find(filter);

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0 };
      }
      acc[t.category][t.type] += t.amount;
      return acc;
    }, {});

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      categoryBreakdown
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSpendingTrends = async (req, res) => {
  try {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month

    const transactions = await Transaction.find({
      userId: req.userId,
      type: 'expense',
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 });

    // 1. Weekly/Monthly Trends
    const monthlyData = {};
    transactions.forEach(t => {
      const monthKey = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
      monthlyData[monthKey] += t.amount;
    });

    const trends = Object.keys(monthlyData).map(key => ({
      name: key,
      amount: monthlyData[key]
    }));

    // 2. Highest Spending Categories (All time in selected range)
    const categoryTotals = {};
    transactions.forEach(t => {
      if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
      categoryTotals[t.category] += t.amount;
    });

    const highestSpendingCategories = Object.keys(categoryTotals)
      .map(key => ({ name: key, value: categoryTotals[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 3. Unusual Patterns (Compare current month to average)
    // Calculate average excluding current month (if possible)
    const currentMonthKey = today.toLocaleString('default', { month: 'short', year: 'numeric' });

    const unusualPatterns = [];
    const categories = [...new Set(transactions.map(t => t.category))];

    categories.forEach(cat => {
      const catTransactions = transactions.filter(t => t.category === cat);
      const history = catTransactions.filter(t => {
        const tDate = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        return tDate !== currentMonthKey;
      });

      const currentMonthTx = catTransactions.filter(t => {
        const tDate = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        return tDate === currentMonthKey;
      });

      const currentSpent = currentMonthTx.reduce((sum, t) => sum + t.amount, 0);

      if (history.length > 0) {
        // Simple average of total spent / number of distinct months found in history
        const distinctMonths = new Set(history.map(t => new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' }))).size;
        const totalHistorySpent = history.reduce((sum, t) => sum + t.amount, 0);
        const average = distinctMonths > 0 ? totalHistorySpent / distinctMonths : 0;

        if (currentSpent > average * 1.5 && average > 0) {
          unusualPatterns.push({
            category: cat,
            current: currentSpent,
            average: average,
            percentIncrease: Math.round(((currentSpent - average) / average) * 100)
          });
        }
      }
    });

    res.json({
      trends,
      highestSpendingCategories,
      unusualPatterns
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
