'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  location: { _id: string; name: string } | null;
  bookingType: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      const token = localStorage.getItem('admin_token');
      try {
        // We need to create an admin endpoint for services list
        // For now, let's try fetching via a different approach
        const res = await fetch('/api/products'); // Placeholder - need services endpoint
        // const data = await res.json();
        // setServices(data.data || []);
        setServices([]); // Will populate when we add the endpoint
      } catch (err) {
        console.error('Failed to fetch:', err);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    
    setDeleting(id);
    const token = localStorage.getItem('admin_token');

    try {
      await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setServices(services.filter(s => s._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Services</h1>
          <p className="text-white/50 mt-1">Experiences and bookable services</p>
        </div>
        <Link href="/tachpae-hq-9x7k/services/new">
          <Button 
            className="border-0"
            style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </Link>
      </div>

      {/* Services List */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50 mb-4">No services yet</p>
            <Link href="/tachpae-hq-9x7k/services/new">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Create your first service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium p-4">Service</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Price</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Location</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Type</th>
                  <th className="text-right text-white/50 text-sm font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <p className="text-white font-medium">{service.name}</p>
                      <p className="text-white/40 text-sm truncate max-w-[250px]">{service.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold">₦{service.basePrice.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="w-4 h-4" />
                        {service.location?.name || 'No location'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70 text-sm">{service.bookingType}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/tachpae-hq-9x7k/services/${service._id}`}>
                          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(service._id)}
                          disabled={deleting === service._id}
                        >
                          {deleting === service._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
