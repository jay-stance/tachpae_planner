import { getPlanningData } from '@/actions/planner';
import PlannerDashboard from '@/components/planner/PlannerDashboard';
import { notFound } from 'next/navigation';

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
  const data = await getPlanningData(resolvedParams.citySlug);

  if (!data) {
    return notFound();
  }

  return (
    <PlannerDashboard data={data} />
  );
}
