'use server';

import dbConnect from '@/lib/db';
import City from '@/models/City';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Service from '@/models/Service';
import Addon from '@/models/Addon';
import Bundle from '@/models/Bundle';
import { getActiveEvent } from './event';
import { unstable_cache } from 'next/cache';
import mongoose from 'mongoose';

// Cached fetch for the entire planning view data
export const getPlanningData = unstable_cache(
    async (citySlug: string) => {
        await dbConnect();

        const event = await getActiveEvent('val-2026');
        if (!event) throw new Error("No active event found");

        const city = await City.findOne({ slug: citySlug, isActive: true }).lean();
        if (!city) return null;

        const categories = await Category.find({ event: event._id }).lean();

        // IN-MEMORY FILTERING WORKAROUND
        const allProducts = await Product.find({ 
            event: event._id, 
            isActive: true,
        })
        .sort({ rank: -1, createdAt: -1 })
        .populate('category').lean();

        const products = allProducts.filter(p => {
             // 1. Bundle check
             if (p.isBundle === true) return false;

             // 2. Location Check
             // If locations is missing, null, or empty -> Global (Keep)
             if (!p.locations || p.locations.length === 0) return true;

             // If locations has entries, check if city._id is in it
             // Use loose string comparison for safety
             return p.locations.some((loc: any) => loc.toString() === city._id.toString());
        });
        
        // Use the same logic for bundles
        const allBundles = await Product.find({
            event: event._id,
            isBundle: true,
            isActive: true
        })
        .sort({ rank: -1, createdAt: -1 })
        .lean();

        const bundles = allBundles.filter((b: any) => {
             if (!b.locations || b.locations.length === 0) return true;
             return b.locations.some((loc: any) => loc.toString() === city._id.toString());
        });

        const services = await Service.find({ 
            event: event._id,
            location: city._id,
            isActive: true
        }).lean();

        const addons = await Addon.find({ 
            event: event._id, 
            isActive: true 
        }).lean();

        const allCities = await City.find({ 
            _id: { $in: event.cities },
            isActive: true 
        }).lean();

        return {
            allCities: JSON.parse(JSON.stringify(allCities)),
            city: JSON.parse(JSON.stringify(city)),
            categories: JSON.parse(JSON.stringify(categories)),
            products: JSON.parse(JSON.stringify(products)),
            services: JSON.parse(JSON.stringify(services)),
            addons: JSON.parse(JSON.stringify(addons)),
            bundles: JSON.parse(JSON.stringify(bundles)),
        };
    },
    ['planning-data'], 
    { revalidate: 3600, tags: ['products', 'services', 'addons'] }
);

export const getProductsByIds = async (ids: string[]) => {
    await dbConnect();
    // Filter out special IDs like 'surprise-box' and 'logistics-fee'
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    const products = await Product.find({ 
        _id: { $in: validIds },
        isActive: true 
    }).populate('category').populate('tags').lean();
    
    return JSON.parse(JSON.stringify(products));
};

