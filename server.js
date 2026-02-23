require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { Product, connectDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// One-time migration endpoint - run once after deployment to import products.json into MongoDB
app.post('/api/migrate-seed', async (req, res) => {
    try {
        const secret = req.headers['x-migrate-secret'];
        if (secret !== (process.env.MIGRATE_SECRET || 'migrate123')) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        let localProducts = [];

        // 1. Try to get products from request body (recovery mode)
        if (req.body.products && Array.isArray(req.body.products)) {
            localProducts = req.body.products;
            console.log(`Received ${localProducts.length} products via request body for recovery.`);
        }
        // 2. Fallback to products.json
        else {
            const jsonPath = path.join(__dirname, 'products.json');
            try {
                const raw = await fs.readFile(jsonPath, 'utf8');
                localProducts = JSON.parse(raw);
            } catch {
                return res.status(404).json({ error: 'products.json not found on server and no data provided in body' });
            }
        }

        const existingCount = await Product.countDocuments();
        if (existingCount > 0) {
            return res.json({ message: `Skipped - MongoDB already has ${existingCount} products` });
        }

        let inserted = 0;
        for (const p of localProducts) {
            try {
                await Product.create({
                    number: p.number || '',
                    classification: p.classification || 'silver',
                    name_ar: p.name_ar || p.nameAr || '',
                    name_en: p.name_en || p.nameEn || '',
                    desc_ar: p.desc_ar || p.descAr || '',
                    desc_en: p.desc_en || p.descEn || '',
                    image: p.image || null,
                    created_at: p.created_at || new Date().toISOString(),
                    updated_at: p.updated_at || new Date().toISOString()
                });
                inserted++;
            } catch { }
        }
        res.json({ message: `Migration complete! Inserted ${inserted} / ${localProducts.length} products` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ number: 1 });
        // Return products with frontend-friendly field
        const result = products.map(p => ({
            id: p._id.toString(),
            number: p.number,
            classification: p.classification,
            name_ar: p.name_ar,
            nameAr: p.name_ar,
            name_en: p.name_en,
            nameEn: p.name_en,
            desc_ar: p.desc_ar,
            descAr: p.desc_ar,
            desc_en: p.desc_en,
            descEn: p.desc_en,
            image: p.image,
            created_at: p.created_at,
            updated_at: p.updated_at
        }));
        res.json(result);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// 2. Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const { number, classification, name_ar, name_en, desc_ar, desc_en, image } = req.body;

        const product = new Product({
            number,
            classification,
            name_ar,
            name_en,
            desc_ar,
            desc_en,
            image,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        await product.save();
        res.status(201).json({ message: 'Product added successfully', id: product._id.toString() });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// 3. Update an existing product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { number, classification, name_ar, name_en, desc_ar, desc_en, image } = req.body;

        const updated = await Product.findByIdAndUpdate(
            id,
            { number, classification, name_ar, name_en, desc_ar, desc_en, image, updated_at: new Date().toISOString() },
            { new: true }
        );

        if (updated) {
            res.json({ message: 'Product updated successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// 4. Delete a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);

        if (deleted) {
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Node.js/Express Backend running on http://localhost:${PORT}`);
        console.log(`Access API at http://localhost:${PORT}/api/products`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
