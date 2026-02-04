
import fs from 'fs';
import path from 'path';

// 1. Load .env.local manually BEFORE imports
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
    const uri = process.env.MONGODB_URI || '';
    console.log("✅ Loaded .env.local. URI starts with: " + uri.substring(0, 15) + "...");
    if (uri.includes("appName=")) {
        console.warn("⚠️ URI contains appName. Checking value...");
        const appNamePart = uri.split("appName=")[1];
        console.log("appName value:", appNamePart ? `'${appNamePart}'` : "EMPTY");
    }
} else {
    console.warn("⚠️ .env.local not found");
}

async function debug() {
    console.log("🚀 Starting debug script...");
    
    // 2. Dynamic Imports
    const { default: dbConnect } = await import('../src/lib/db');
    const { default: City } = await import('../src/models/City');
    const { default: Product } = await import('../src/models/Product');
    // Import Event model directly instead of action
    const { default: Event } = await import('../src/models/Event');

    await dbConnect();

    // 1. Get Event - Direct DB call
    const event = await Event.findOne({ slug: 'val-2026', isActive: true });
    if (!event) {
        console.error("❌ Event 'val-2026' not found!");
        return;
    }
    console.log(`✅ Event found: ${event.name} (${event._id})`);

    // 2. Get City (PH)
    const citySlug = 'ph';
    const city = await City.findOne({ slug: citySlug, isActive: true });
    if (!city) {
        console.error(`❌ City '${citySlug}' not found!`);
        return;
    }
    console.log(`✅ City found: ${city.name} (${city._id})`);

    // 3. Define the critical query
    const query = { 
        event: event._id, 
        isActive: true,
        isBundle: { $ne: true },
        $or: [
            { locations: { $exists: false } },
            { locations: { $eq: null } },
            { locations: { $size: 0 } },
            { locations: { $in: [city._id] } }
        ]
    };

    console.log("🔍 Running Product Query:", JSON.stringify(query, null, 2));

    // 4. Run Query
    const products = await Product.find(query).lean();
    console.log(`📦 Found ${products.length} total products`);

    // 5. Look for the specific missing product
    // ID: 69765da22b7787e55975e7bd
    // Name: The "Cupid’s Choice" Collection
    const targetId = '69765da22b7787e55975e7bd';
    const found = products.find((p: any) => p._id.toString() === targetId);

    if (found) {
        console.log("🎉 SUCCESS! The product was found in the query results.");
        console.log("Product Details:", {
            id: found._id,
            name: found.name,
            locations: found.locations
        });
    } else {
        console.log("😱 FAILURE! The product was NOT found.");
        
        // Debug why
        const actualProduct = await Product.findById(targetId);
        if (actualProduct) {
             console.log("🤔 The product exists in DB. Let's check why it failed filter:");
             console.log(`- Product Event: ${actualProduct.event} (Match? ${actualProduct.event.toString() === event._id.toString()})`);
             console.log(`- Product Active: ${actualProduct.isActive}`);
             console.log(`- Product isBundle: ${actualProduct.isBundle}`);
             console.log(`- Product Locations: ${JSON.stringify(actualProduct.locations)}`);
             console.log(`- City ID: ${city._id}`);

             // Type checks
             console.log(`- Event ID Type: ${typeof actualProduct.event} vs ${typeof event._id}`);
             console.log(`- Location ID Type: ${typeof actualProduct.locations[0]} vs ${typeof city._id}`);
             
             const locMatch = actualProduct.locations.some((l: any) => l.toString() === city._id.toString());
             console.log(`- Location Match (toString comparison)? ${locMatch}`);

             // Run minimal query to isolate failure
             
             // 1. Array with ObjectId object
             const q1 = { _id: targetId, locations: { $in: [city._id] } };
             const r1 = await Product.find(q1).lean();
             console.log(`- Q1: { $in: [city._id (obj)] } Match? ${r1.length > 0}`);

             // 2. Array with String ID
             const q2 = { _id: targetId, locations: { $in: [city._id.toString()] } };
             const r2 = await Product.find(q2).lean();
             console.log(`- Q2: { $in: [city._id (str)] } Match? ${r2.length > 0}`);

             // 3. Exact match (single value check logic for array)
             const q3 = { _id: targetId, locations: city._id };
             const r3 = await Product.find(q3).lean();
             console.log(`- Q3: { locations: city._id (obj) } Match? ${r3.length > 0}`);

             // 4. Mongoose specific check
             // Dynamically import mongoose to be sure
             const mongooseLib = await import('mongoose');
             const q4 = { _id: targetId, locations: new mongooseLib.default.Types.ObjectId(city._id.toString()) };
             const r4 = await Product.find(q4).lean();
             console.log(`- Q4: { locations: new ObjectId(..) } Match? ${r4.length > 0}`);
             
             // 5. Check actual storage DEEP
             const util = await import('util');
             console.log("ACTUAL STORAGE (Deep):", util.inspect(actualProduct.locations, { showHidden: true, depth: null, colors: true }));
             console.log("ACTUAL STORAGE (JSON):", JSON.stringify(actualProduct.locations));
             
             // Check individual element prototype
             if (actualProduct.locations.length > 0) {
                 const loc0 = actualProduct.locations[0];
                 console.log("Element 0 constructor:", loc0.constructor.name);
                 console.log("Element 0 is ObjectId?", loc0 instanceof mongooseLib.default.Types.ObjectId);
                 console.log("Element 0 _bsontype:", (loc0 as any)._bsontype);
             }

        } else {
            console.log("❌ The product ID does not exist in the database at all.");
        }
    }
    
    process.exit(0);
}

debug().catch(console.error);
