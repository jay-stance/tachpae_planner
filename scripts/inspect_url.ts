
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// 1. Load env FIRST
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

    // Find one new bundle
    const product = await Product.findOne({ name: "The Queen's Luxury Bundle" });
    if (product) {
        console.log("Found:", product.name);
        console.log("All URLs:");
        product.mediaGallery.forEach(url => console.log(url));
    } else {
        console.log("Product not found");
    }

    process.exit(0);
}

run();
