'use server';

import dbConnect from '@/lib/db';
import Event, { IEvent } from '@/models/Event';
import { unstable_cache } from 'next/cache';

// Cache the event fetch for performance
const getEvent = unstable_cache(
  async (slug: string) => {
    await dbConnect();
    const event = await Event.findOne({ slug, isActive: true }).lean();
    if (!event) return null;
    
    // Serialization for Client Components
    return JSON.parse(JSON.stringify(event)) as IEvent;
  },
  ['event-data'],
  { revalidate: 3600, tags: ['event'] }
);

export async function getActiveEvent(slug: string = 'val-2026') {
  return await getEvent(slug);
}
