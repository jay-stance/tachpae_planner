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

        const products = await Product.find({ 
            event: event._id, 
            isActive: true,
            isBundle: { $ne: true }, // Exclude bundles from regular products
            $or: [
                { locations: { $size: 0 } }, // Available everywhere
                { locations: city._id }      // Available in this city
            ]
        }).populate('category').lean();

        const services = await Service.find({ 
            event: event._id, 
            location: city._id,
            isActive: true
        }).lean();

        const addons = await Addon.find({ 
            event: event._id, 
            isActive: true 
        }).lean();

        // Fetch bundles from Product model where isBundle = true
        const bundles = await Product.find({ 
            event: event._id, 
            isBundle: true,
            isActive: true,
            $or: [
                { locations: { $size: 0 } },
                { locations: city._id }
            ]
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

