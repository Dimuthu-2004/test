const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
name: { type: String, required: true },
description: { type: String, required: true },
// TODO: Add price field here
price: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Item', ItemSchema);