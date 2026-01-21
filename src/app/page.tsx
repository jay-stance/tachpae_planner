import { getCities } from '@/actions/city';
import { getActiveEvent } from '@/actions/event';
import HomeClient from '@/components/home/HomeClient';

export default async function Home() {
  const event = await getActiveEvent('val-2026');
  const cities = await getCities(event?.cities as any);

  return (
    <HomeClient cities={cities} />
  );
}
