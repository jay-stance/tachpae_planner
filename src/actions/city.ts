'use server';

import dbConnect from '@/lib/db';
import City, { ICity } from '@/models/City';
import { unstable_cache } from 'next/cache';

const getCitiesFn = unstable_cache(
  async (cityIds?: string[]) => {
    await dbConnect();
    const query: any = { isActive: true };
    if (cityIds && cityIds.length > 0) {
      query._id = { $in: cityIds };
    }
    const cities = await City.find(query).lean();
    return JSON.parse(JSON.stringify(cities)) as ICity[];
  },
  ['cities-list'],
  { revalidate: 3600, tags: ['cities'] }
);

export async function getCities(cityIds?: string[]) {
  return await getCitiesFn(cityIds);
}

export const getCityBySlug = unstable_cache(
  async (slug: string) => {
    await dbConnect();
    const city = await City.findOne({ slug, isActive: true }).lean();
    return city ? JSON.parse(JSON.stringify(city)) as ICity : null;
  },
  ['city-by-slug'],
  { revalidate: 3600, tags: ['cities'] }
);
