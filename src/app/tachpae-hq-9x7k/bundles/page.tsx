'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, Package, ArrowLeft, Save, Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Bundle {
  _id: string;
  name: string;
  slug: string;
  description: string;
  bundlePrice: number;
  originalValue?: number;
  savings?: number;
  mediaGallery: string[];
  products: { _id: string; name: string; basePrice: number; mediaGallery: string[] }[];
  isActive: boolean;
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBundles = async () => {
    try {
      const res = await fetch('/api/admin/bundles');
      const data = await res.json();
      setBundles(data.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bundle?')) return;
    
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`/api/admin/bundles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setBundles(bundles.filter(b => b._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      const data = await res.json();
      if (data.success) {
        setBundles(bundles.map(b => b._id === id ? { ...b, isActive: !currentStatus } : b));
      }
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Package className="w-8 h-8" />
            Bundles
          </h1>
          <p className="text-white/50 mt-1">{bundles.length} curated bundles</p>
        </div>
        <Link href="/tachpae-hq-9x7k/bundles/new">
          <Button 
            className="border-0"
            style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Bundle
          </Button>
        </Link>
      </div>

      {/* Bundles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <Package className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/50 mb-4">No bundles yet</p>
          <Link href="/tachpae-hq-9x7k/bundles/new">
            <Button className="border-0" style={{ background: 'var(--tachpae-primary)' }}>
              Create Your First Bundle
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div 
              key={bundle._id} 
              className="rounded-2xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Bundle Image */}
              <div className="aspect-video relative">
                {bundle.mediaGallery?.[0] ? (
                  <Image 
                    src={bundle.mediaGallery[0]} 
                    alt={bundle.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Package className="w-12 h-12 text-white/20" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold ${bundle.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {bundle.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
                
                {/* Savings Badge */}
                {bundle.savings && bundle.savings > 0 && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold bg-green-500 text-white">
                    SAVE ₦{bundle.savings.toLocaleString()}
                  </div>
                )}
              </div>
              
              {/* Bundle Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{bundle.name}</h3>
                  <p className="text-white/50 text-sm line-clamp-2">{bundle.description}</p>
                </div>
                
                {/* Products Preview */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {bundle.products?.slice(0, 3).map((product, idx) => (
                      <div 
                        key={product._id}
                        className="w-8 h-8 rounded-full border-2 border-gray-900 overflow-hidden"
                      >
                        {product.mediaGallery?.[0] ? (
                          <Image src={product.mediaGallery[0]} alt="" width={32} height={32} className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center text-[10px]">📦</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-white/40 text-xs">{bundle.products?.length || 0} products</span>
                </div>
                
                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">₦{bundle.bundlePrice.toLocaleString()}</span>
                  {bundle.originalValue && bundle.originalValue > bundle.bundlePrice && (
                    <span className="text-sm text-white/40 line-through">₦{bundle.originalValue.toLocaleString()}</span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-white/10 text-white/70 hover:text-white"
                    onClick={() => router.push(`/tachpae-hq-9x7k/bundles/${bundle._id}`)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`border-white/10 ${bundle.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                    onClick={() => handleToggleActive(bundle._id, bundle.isActive)}
                  >
                    {bundle.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(bundle._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
