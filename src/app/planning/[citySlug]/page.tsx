import { getPlanningData } from '@/actions/planner';
import { getCities } from '@/actions/city';
import { getActiveEvent } from '@/actions/event';
import PlannerDashboard from '@/components/planner/PlannerDashboard';
import { notFound } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';

interface PageProps {
  params: Promise<{ citySlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    return {
        title: `Plan your Valentine in ${resolvedParams.citySlug.charAt(0).toUpperCase() + resolvedParams.citySlug.slice(1)} | Tachpae`,
    };
}

export default async function PlanningPage({ params }: PageProps) {
  const resolvedParams = await params;
  const event = await getActiveEvent('val-2026');
  const data = await getPlanningData(resolvedParams.citySlug);
  const allCities = await getCities(event?.cities as any);

  if (!data) {
    return notFound();
  }

  return (
    <CartProvider cityId={data.city._id}>
      <PlannerDashboard data={{ ...data, allCities } as any} />
    </CartProvider>
  );
}
