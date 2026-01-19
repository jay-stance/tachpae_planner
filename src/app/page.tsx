import { getCities } from '@/actions/city';
import HomeClient from '@/components/home/HomeClient';

export default async function Home() {
  const cities = await getCities();

  return (
    <HomeClient cities={cities} />
  );
}
