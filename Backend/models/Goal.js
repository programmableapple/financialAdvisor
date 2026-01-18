const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: '$',
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    targetDate: {
        type: Date,
        required: true
    },
    color: {
        type: String,
        default: '#3b82f6' // Default blue
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Goal', goalSchema);
