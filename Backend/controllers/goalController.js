const Goal = require('../models/Goal');
const logger = require('./logger');

exports.createGoal = async (req, res) => {
    try {
        const { name, targetAmount, currency, targetDate, color } = req.body;
        const userId = req.user.id;

        const newGoal = new Goal({
            userId,
            name,
            targetAmount,
            currency,
            targetDate,
            color,
            currentAmount: 0
        });

        const goal = await newGoal.save();

        logger.info(`Goal created user ${userId} - ${name}`);
        res.status(201).json({ message: 'Goal created', goal });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.userId }).sort({ targetDate: 1 });
        res.json({ goals });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { name, targetAmount, currentAmount, targetDate, color } = req.body;

        // Helper to add funds simply by passing { addAmount: 500 }
        let updateData = { name, targetAmount, currentAmount, targetDate, color };

        if (req.body.addAmount) {
            const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
            if (goal) {
                updateData.currentAmount = goal.currentAmount + Number(req.body.addAmount);
            }
        }

        // Clean undefined
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            updateData,
            { new: true }
        );

        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        res.json({ message: 'Goal updated', goal });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!goal) return res.status(404).json({ message: 'Goal not found' });

        res.json({ message: 'Goal deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
