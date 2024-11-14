const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Department', departmentSchema);
