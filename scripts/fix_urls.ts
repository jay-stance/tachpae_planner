
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// 1. Load env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            process.env[key] = value;
        }
    });
}

async function run() {
    const { default: dbConnect } = await import('../src/lib/db');
    const { default: Product } = await import('../src/models/Product');
    const { default: Event } = await import('../src/models/Event');
    
    await dbConnect();
    
    console.log("🚀 Checking for URLs with spaces...");

    const products = await Product.find({ 
        mediaGallery: { $elemMatch: { $regex: / / } } 
    });

    console.log(`Found ${products.length} products with spaces in URLs.`);

    for (const p of products) {
        console.log(`Processing: ${p.name}`);
        const newGallery = p.mediaGallery.map((url: string) => {
            // Replace spaces with %20
            return url.replace(/ /g, '%20');
        });
        
        // Update directly
        await Product.updateOne({ _id: p._id }, { $set: { mediaGallery: newGallery } });
        console.log(`  ✅ Updated ${newGallery.length} URLs.`);
    }

    console.log("\n✨ URL Fix Complete.");
    process.exit(0);
}

run();
