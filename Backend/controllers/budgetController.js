const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const logger = require('./logger');

exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const newBudget = new Budget({
      userId: req.userId,
      category,
      amount,
      month,
      year
    });

    await newBudget.save();

    logger.info(`Budget created for user ${req.userId} - ${category}`);

    res.status(201).json({ message: 'Budget created successfully', budget: newBudget });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Budget for this category/month/year already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;

    const filter = { userId: req.userId };
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const budgets = await Budget.find(filter);

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

        const transactions = await Transaction.find({
          userId: req.userId,
          category: budget.category,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        });

        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

        return {
          ...budget.toObject(),
          spent,
          remaining: budget.amount - spent,
          percentage: (spent / budget.amount) * 100
        };
      })
    );

    res.json({ budgets: budgetsWithSpent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    // Construct update object with only provided fields
    const updateFields = {};
    if (category) updateFields.category = category;
    if (amount) updateFields.amount = amount;
    if (month) updateFields.month = month;
    if (year) updateFields.year = year;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateFields,
      { new: true, runValidators: true } // runValidators ensures min/max for month are checked
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    logger.info(`Budget updated successfully for user ${req.userId}`);

    res.json({
      message: 'Budget updated successfully',
      budget
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Budget for this category/month/year already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    logger.info(`Budget deleted successfully for user ${req.userId}`);

    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
