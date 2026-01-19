import { getProposal } from '@/actions/proposal';
import ProposalViewer from '@/components/proposal/ProposalViewer';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return {
        title: `A Special Question for You | Tachpae`,
    };
}

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await getProposal(id);

  if (!proposal) return notFound();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black overflow-hidden relative">
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-40 animate transition-all duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

        {/* Floating Particles/Hearts could go here */}

        <ProposalViewer proposal={proposal} />
    </div>
  );
}
