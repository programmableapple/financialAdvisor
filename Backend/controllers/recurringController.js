const Recurring = require('../models/Recurring');
const Transaction = require('../models/Transaction');
const logger = require('./logger');

exports.getRecurring = async (req, res) => {
    try {
        const recurring = await Recurring.find({ userId: req.userId, isActive: true }).sort({ nextDueDate: 1 });
        res.json({ recurring });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.addRecurring = async (req, res) => {
    try {
        const { name, amount, category, frequency, nextDueDate } = req.body;

        const recurring = await Recurring.create({
            userId: req.userId,
            name,
            amount,
            category,
            frequency,
            nextDueDate
        });

        res.status(201).json({ message: 'Subscription added', recurring });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteRecurring = async (req, res) => {
    try {
        await Recurring.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Subscription removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Simple Auto-Detection Algorithm
exports.detectRecurring = async (req, res) => {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const transactions = await Transaction.find({
            userId: req.userId,
            type: 'expense',
            date: { $gte: threeMonthsAgo }
        });

        // Group by description (normalized)
        const grouped = {};
        transactions.forEach(t => {
            const key = t.description.trim().toLowerCase();
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(t);
        });

        const suggestions = [];

        // Check for patterns
        Object.keys(grouped).forEach(key => {
            const txs = grouped[key];
            // If appears 2 or more times
            if (txs.length >= 2) {
                // Check if amounts are similar (within 10%)
                const avgAmount = txs.reduce((sum, t) => sum + t.amount, 0) / txs.length;
                const consistentAmount = txs.every(t => Math.abs(t.amount - avgAmount) < (avgAmount * 0.1));

                if (consistentAmount) {
                    // Check if already exists in active recurring
                    suggestions.push({
                        name: txs[0].description, // Use original casing
                        amount: Math.round(avgAmount),
                        category: txs[0].category,
                        frequency: 'monthly', // Guess monthly
                        confidence: 'high'
                    });
                }
            }
        });

        // Filter out already active subscriptions
        const existing = await Recurring.find({ userId: req.userId });
        const existingNames = new Set(existing.map(r => r.name.toLowerCase()));

        const finalSuggestions = suggestions.filter(s => !existingNames.has(s.name.toLowerCase()));

        res.json({ suggestions: finalSuggestions });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
