const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
    id: { type: String },
    number: { type: String },
    classification: { type: String, default: 'silver' },
    name_ar: { type: String },
    name_en: { type: String },
    desc_ar: { type: String },
    desc_en: { type: String },
    image: { type: String },
    created_at: { type: String },
    updated_at: { type: String }
});

const Product = mongoose.model('Product', productSchema);

// Connect to MongoDB
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set.');
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas!');
};

module.exports = { Product, connectDB };
