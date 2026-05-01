const mongoose = require('mongoose');

const SignalSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['buy', 'sell']
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    lots: {
        type: Number,
        required: true,
        min: 0.01
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Signal', SignalSchema);
