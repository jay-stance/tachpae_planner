
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

// 2. NOW import db
async function findIds() {
    const { default: dbConnect } = await import('../src/lib/db');
    const { default: Event } = await import('../src/models/Event');
    const { default: Category } = await import('../src/models/Category');

    await dbConnect();
    // ... rest of logic


    // 1. Find Event
    const event = await Event.findOne({ slug: 'val-2026' });
    console.log("EVENT:", event ? `${event.name} -> ${event._id}` : "Not Found");

    // 2. Find ANY Category to use as default (e.g. 'Gifts' or create one)
    const categories = await Category.find({ event: event?._id });
    console.log("CATEGORIES:");
    categories.forEach(c => console.log(`- ${c.name} -> ${c._id}`));

    process.exit(0);
}

findIds();
