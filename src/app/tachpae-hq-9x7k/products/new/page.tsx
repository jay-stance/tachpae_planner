'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
    isActive: true,
  });

  const handleSave = async () => {
    if (!form.name) {
      setError('Product name is required');
      return;
    }
    
    setSaving(true);
    setError('');
    const token = localStorage.getItem('admin_token');

    try {
      // Get default event (you may want to make this selectable)
      const eventsRes = await fetch('/api/events');
      const eventsData = await eventsRes.json();
      const defaultEvent = eventsData.data?.[0]?._id;

      if (!defaultEvent) {
        setError('No event found. Please create an event first.');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          event: defaultEvent,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to create product');
      } else {
        router.push('/tachpae-hq-9x7k/products');
      }
    } catch (err) {
      setError('Failed to create product');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tachpae-hq-9x7k/products">
          <Button variant="ghost" className="text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">New Product</h1>
          <p className="text-white/50 text-sm">Create a new product</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="border-0"
          style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Create Product
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="grid gap-4">
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Product Name *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter product name"
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..."
              className="min-h-[100px] bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Base Price (₦)</label>
            <Input
              type="number"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl max-w-xs"
            />
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-5 h-5 rounded accent-green-500"
              />
              <span className="text-white">Product is active</span>
            </label>
          </div>
        </div>
      </div>

      <p className="text-white/40 text-sm">
        Note: You can add images, variants, and assign a category after creating the product.
      </p>
    </div>
  );
}
