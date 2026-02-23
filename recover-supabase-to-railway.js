// Supabase Configuration (Source)
const SUPABASE_URL = 'https://gvvztupjrveliytnrjzm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dnp0dXBqcnZlbGl5dG5yanptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzI2OTIsImV4cCI6MjA4NjE0ODY5Mn0.PRr33r_mSb5Ee79L85lk9RUHsgTbHKmP_qAcXeebG6Q';

// Railway Configuration (Target)
const RAILWAY_URL = 'https://kahraman-al-yaman-production.up.railway.app';
const MIGRATE_SECRET = 'migrate123';

async function recoverData() {
    console.log('--- Starting Data Recovery from Supabase to Railway (using fetch) ---');

    try {
        // 1. Fetch products from Supabase REST API
        console.log('1. Fetching products from Supabase...');
        const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!supabaseRes.ok) {
            throw new Error(`Supabase Error: ${supabaseRes.status} ${await supabaseRes.text()}`);
        }

        const products = await supabaseRes.json();
        console.log(`Successfully fetched ${products.length} products from Supabase.`);

        if (products.length === 0) {
            console.log('No products found in Supabase. Nothing to migrate.');
            return;
        }

        // 2. Map Supabase data to comply with our MongoDB/Node.js backend schema
        console.log('2. Mapping products for migration...');
        const mappedProducts = products.map(p => ({
            number: p.number || '000',
            classification: p.classification || 'silver',
            nameAr: p.name_ar || p.nameAr || '',
            nameEn: p.name_en || p.nameEn || '',
            descAr: p.desc_ar || p.descAr || '',
            descEn: p.desc_en || p.descEn || '',
            image: p.image || null
        }));

        // 3. Upload to Railway via the migration endpoint
        console.log('3. Sending data to Railway migration endpoint...');
        const railwayRes = await fetch(`${RAILWAY_URL}/api/migrate-seed`, {
            method: 'POST',
            body: JSON.stringify({ products: mappedProducts }),
            headers: {
                'Content-Type': 'application/json',
                'x-migrate-secret': MIGRATE_SECRET
            }
        });

        const result = await railwayRes.json();
        if (!railwayRes.ok) {
            throw new Error(`Railway Error: ${railwayRes.status} ${JSON.stringify(result)}`);
        }

        console.log('Success!', result.message);
        console.log('--- Recovery Process Finished Successfully ---');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

recoverData();
