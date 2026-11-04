const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    deviceType: { type: String, required: true },
    room: { type: String, required: true },
    brand: { type: String },
    model: { type: String },
    quantity: { type: Number, required: true },
    status: { type: String, required: true },
    purchaseDate: { type: Date },
    description: { type: String }
});

module.exports = mongoose.model('Device', deviceSchema);