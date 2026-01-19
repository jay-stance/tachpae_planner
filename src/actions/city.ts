'use server';

import dbConnect from '@/lib/db';
import City, { ICity } from '@/models/City';
import { unstable_cache } from 'next/cache';

const getCitiesFn = unstable_cache(
  async () => {
    await dbConnect();
    const cities = await City.find({ isActive: true }).lean();
    return JSON.parse(JSON.stringify(cities)) as ICity[];
  },
  ['cities-list'],
  { revalidate: 3600, tags: ['cities'] }
);

export async function getCities() {
  return await getCitiesFn();
}
