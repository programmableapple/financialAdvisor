const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const logger = require('./logger');

// Helper to update linked goal
const updateLinkedGoal = async (userId, transaction, action = 'add') => {
  try {
    // specific logic: Find goal by name matching category or description
    const goal = await Goal.findOne({
      userId,
      name: { $in: [transaction.category, transaction.description] }
    });

    if (goal) {
      let change = transaction.amount;
      if (action === 'remove') change = -change;

      goal.currentAmount += change;
      await goal.save();
      logger.info(`Updated goal '${goal.name}' by ${change} due to transaction '${transaction.description}'`);
    }
  } catch (err) {
    logger.error(`Error updating linked goal: ${err.message}`);
  }
};

const checkDueTransactions = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Find upcoming transactions due today
    const dueTransactions = await Transaction.find({
      userId,
      status: 'upcoming',
      date: { $lte: new Date() }
    });

    if (dueTransactions.length > 0) {
      const result = await Transaction.updateMany(
        { _id: { $in: dueTransactions.map(t => t._id) } },
        { status: 'completed' }
      );

      if (result.modifiedCount > 0) {
        // Update goals for these newly completed transactions
        for (const t of dueTransactions) {
          await updateLinkedGoal(userId, t, 'add');
        }
        logger.info(`${result.modifiedCount} upcoming transactions converted to completed for user ${userId}`);
      }
    }
  } catch (err) {
    logger.error(`Error in checkDueTransactions: ${err.message}`);
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, status } = req.body;

    // If date is in the future and status not specified, default to upcoming
    // but the user requirement said "not add as expense/income for now", 
    // so we'll respect the status sent from frontend.
    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      amount,
      category,
      description,
      date: date || Date.now(),
      status: status || 'completed'
    });

    // Only update goal if transaction is completed (active)
    if (transaction.status === 'completed') {
      await updateLinkedGoal(req.userId, transaction, 'add');
    }

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
    const { startDate, endDate, type, category, status } = req.query;

    await checkDueTransactions(req.userId);

    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

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
    const { type, amount, currency, category, description, date } = req.body;

    // First find original to revert its effect on goal if necessary
    const originalTx = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!originalTx) return res.status(404).json({ message: 'Transaction not found' });

    // Update the transaction
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { type, amount, currency, category, description, date },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Revert old goal impact and apply new (simple approach)
    // Only if status was/is completed (for now assuming simple edits on active txs)
    if (originalTx.status === 'completed') {
      await updateLinkedGoal(req.userId, originalTx, 'remove');
    }
    if (transaction.status === 'completed') {
      await updateLinkedGoal(req.userId, transaction, 'add');
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

    if (transaction.status === 'completed') {
      await updateLinkedGoal(req.userId, transaction, 'remove');
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

    await checkDueTransactions(req.userId);

    const filter = { userId: req.userId, status: 'completed' };

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
      status: 'completed',
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
