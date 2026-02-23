// Override DNS to use Google's servers (bypasses ISP DNS restrictions)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const { Product, connectDB } = require('./database');

async function migrate() {
    console.log('--- Migrating products.json to MongoDB ---');

    // Connect to MongoDB
    await connectDB();

    // Read local JSON file
    const jsonPath = path.join(__dirname, 'products.json');
    let localProducts = [];
    try {
        const raw = await fs.readFile(jsonPath, 'utf8');
        localProducts = JSON.parse(raw);
        console.log(`Found ${localProducts.length} products in products.json`);
    } catch {
        console.error('Could not read products.json. Make sure it exists!');
        process.exit(1);
    }

    if (localProducts.length === 0) {
        console.log('No products to migrate.');
        process.exit(0);
    }

    // Check existing products in MongoDB
    const existingCount = await Product.countDocuments();
    console.log(`MongoDB currently has ${existingCount} products.`);

    // Insert products
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
        } catch (err) {
            console.error(`Failed to insert product #${p.number}:`, err.message);
        }
    }

    console.log(`\n--- Migration Complete! Inserted ${inserted} / ${localProducts.length} products ---`);
    mongoose.disconnect();
}

migrate().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
