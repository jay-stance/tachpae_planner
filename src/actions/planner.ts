'use server';

import dbConnect from '@/lib/db';
import City from '@/models/City';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Service from '@/models/Service';
import Addon from '@/models/Addon';
import { getActiveEvent } from './event';
import { unstable_cache } from 'next/cache';

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
            isActive: true 
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
        };
    },
    ['planning-data'], 
    { revalidate: 3600, tags: ['products', 'services', 'addons'] }
);

