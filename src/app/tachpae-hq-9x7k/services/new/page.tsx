'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface City {
  _id: string;
  name: string;
}

export default function NewServicePage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
    location: '',
    bookingType: 'DIRECT',
  });

  useEffect(() => {
    const fetchCities = async () => {
      const res = await fetch('/api/cities');
      const data = await res.json();
      setCities(data.data || []);
    };
    fetchCities();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.location) {
      setError('Name and location are required');
      return;
    }
    
    setSaving(true);
    setError('');
    const token = localStorage.getItem('admin_token');

    try {
      const eventsRes = await fetch('/api/events');
      const eventsData = await eventsRes.json();
      const eventId = eventsData.data?.[0]?._id;

      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          event: eventId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to create service');
      } else {
        router.push('/tachpae-hq-9x7k/services');
      }
    } catch (err) {
      setError('Failed to create service');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tachpae-hq-9x7k/services">
          <Button variant="ghost" className="text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">New Service</h1>
          <p className="text-white/50 text-sm">Create a bookable experience</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="border-0"
          style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Create Service
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
            <label className="text-white/70 text-sm font-medium block mb-2">Service Name *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Candlelight Dinner Experience"
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the experience..."
              className="min-h-[100px] bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/30 placeholder:text-opacity-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Price (₦)</label>
              <Input
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Location *</label>
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 text-white rounded-xl"
              >
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Booking Type</label>
            <select
              value={form.bookingType}
              onChange={(e) => setForm({ ...form, bookingType: e.target.value })}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 text-white rounded-xl"
            >
              <option value="DIRECT">Direct Booking</option>
              <option value="REDIRECT">Redirect to Partner</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
