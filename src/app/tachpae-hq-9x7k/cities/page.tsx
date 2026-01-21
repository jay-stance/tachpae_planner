'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, Save, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface City {
  _id: string;
  name: string;
  slug: string;
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '' });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities');
      const data = await res.json();
      setCities(data.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleCreate = async () => {
    if (!newForm.name) return;
    
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('/api/admin/cities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newForm,
          slug: newForm.slug || newForm.name.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCities([...cities, data.data]);
        setShowNew(false);
        setNewForm({ name: '', slug: '' });
      }
    } catch (err) {
      console.error('Failed to create:', err);
    }
    setSaving(false);
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`/api/admin/cities/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        setCities(cities.map(c => c._id === id ? data.data : c));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to update:', err);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this city?')) return;
    
    const token = localStorage.getItem('admin_token');

    try {
      await fetch(`/api/admin/cities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setCities(cities.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Cities</h1>
          <p className="text-white/50 mt-1">Locations where services are available</p>
        </div>
        <Button 
          onClick={() => setShowNew(true)}
          className="border-0"
          style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add City
        </Button>
      </div>

      {/* New City Form */}
      {showNew && (
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">New City</h2>
            <button onClick={() => setShowNew(false)} className="text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="City name (e.g. Lagos)"
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
            />
            <Input
              value={newForm.slug}
              onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
              placeholder="slug (e.g. lagos)"
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
            />
            <Button 
              onClick={handleCreate}
              disabled={saving || !newForm.name}
              className="h-12 border-0"
              style={{ background: 'var(--tachpae-primary)' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Create
            </Button>
          </div>
        </div>
      )}

      {/* Cities List */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50">No cities yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {cities.map((city) => (
              <div key={city._id} className="p-4 hover:bg-white/5">
                {editingId === city._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="h-10 bg-white/5 border-white/10 text-white rounded-lg md:col-span-2"
                    />
                    <Input
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      className="h-10 bg-white/5 border-white/10 text-white rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdate(city._id)}
                        disabled={saving}
                        className="border-0"
                        style={{ background: 'var(--tachpae-primary)' }}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white/50">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white/50" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{city.name}</p>
                      <p className="text-white/40 text-sm">{city.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setEditingId(city._id);
                          setEditForm({ name: city.name, slug: city.slug });
                        }} 
                        className="text-white/50 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(city._id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
