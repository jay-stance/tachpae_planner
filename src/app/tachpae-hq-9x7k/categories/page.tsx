'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', icon: '' });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', slug: '', icon: '📦' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newForm.name) return;
    
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    
    // Get default event
    const eventsRes = await fetch('/api/events');
    const eventsData = await eventsRes.json();
    const eventId = eventsData.data?.[0]?._id;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newForm,
          slug: newForm.slug || newForm.name.toLowerCase().replace(/\s+/g, '-'),
          event: eventId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setShowNew(false);
        setNewForm({ name: '', slug: '', icon: '📦' });
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
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === id ? data.data : c));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to update:', err);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    
    const token = localStorage.getItem('admin_token');

    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, slug: cat.slug, icon: cat.icon });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Categories</h1>
          <p className="text-white/50 mt-1">{categories.length} categories</p>
        </div>
        <Button 
          onClick={() => setShowNew(true)}
          className="border-0"
          style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* New Category Form */}
      {showNew && (
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">New Category</h2>
            <button onClick={() => setShowNew(false)} className="text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              value={newForm.icon}
              onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
              placeholder="Icon (emoji)"
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-center text-2xl"
            />
            <Input
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="Category name"
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl md:col-span-2"
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

      {/* Categories List */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50">No categories yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {categories.map((cat) => (
              <div key={cat._id} className="p-4 hover:bg-white/5">
                {editingId === cat._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <Input
                      value={editForm.icon}
                      onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      className="h-10 bg-white/5 border-white/10 text-white rounded-lg text-center text-xl"
                    />
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="h-10 bg-white/5 border-white/10 text-white rounded-lg md:col-span-2"
                    />
                    <Input
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      placeholder="slug"
                      className="h-10 bg-white/5 border-white/10 text-white rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdate(cat._id)}
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
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{cat.name}</p>
                      <p className="text-white/40 text-sm">{cat.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(cat)} className="text-white/50 hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cat._id)} className="text-red-400 hover:text-red-300">
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
