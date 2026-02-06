
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
    
    // Find event
    const event = await Event.findOne({ slug: 'val-2026' });
    if (!event) {
        console.error("Event not found!");
        process.exit(1);
    }

    // The 5 New Bundles names
    const bundleNames = [
        "The Gentleman's Valentine Bundle",
        "The Lady's Valentine Bundle",
        "The King's Ultimate Bundle",
        "The Queen's Luxury Bundle",
        "The Perfect Match (Unisex)"
    ];

    console.log("🚀 Updating Ranks...");

    // Update New Bundles to Rank 10
    const res = await Product.updateMany(
        { 
            event: event._id,
            name: { $in: bundleNames }
        },
        { $set: { rank: 10 } }
    );
    
    console.log(`✅ Set Rank 10 for ${res.modifiedCount} new bundles.`);

    // Log the current order
    const all = await Product.find({ event: event._id, isBundle: true }).sort({ rank: -1, createdAt: -1 }).select('name rank');
    console.log("\n📋 Current Bundle Order:");
    all.forEach((p, i) => console.log(`${i+1}. [${p.rank}] ${p.name}`));

    process.exit(0);
}

run();
