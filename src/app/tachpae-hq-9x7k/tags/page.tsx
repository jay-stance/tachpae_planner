'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, Save, X, RefreshCw, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  displayOrder: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', color: '', icon: '' });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', slug: '', color: '#6366f1', icon: '' });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags');
      const data = await res.json();
      setTags(data.data || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSeedSystemTags = async () => {
    setSeeding(true);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'seed' }),
      });
      
      const data = await res.json();
      if (data.success) {
        fetchTags();
      }
    } catch (err) {
      console.error('Failed to seed:', err);
    }
    setSeeding(false);
  };

  const handleCreate = async () => {
    if (!newForm.name) return;
    
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newForm,
          slug: newForm.slug || newForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTags([...tags, data.data]);
        setShowNew(false);
        setNewForm({ name: '', slug: '', color: '#6366f1', icon: '' });
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
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        setTags(tags.map(t => t._id === id ? data.data : t));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to update:', err);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success) {
        setTags(tags.filter(t => t._id !== id));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag._id);
    setEditForm({ name: tag.name, slug: tag.slug, color: tag.color, icon: tag.icon || '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <TagIcon className="w-8 h-8" />
            Tags
          </h1>
          <p className="text-white/50 mt-1">{tags.length} tags for product labelling</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSeedSystemTags}
            disabled={seeding}
            variant="outline"
            className="border-white/10 text-white/70 hover:text-white"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Seed System Tags
          </Button>
          <Button 
            onClick={() => setShowNew(true)}
            className="border-0"
            style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </Button>
        </div>
      </div>

      {/* New Tag Form */}
      {showNew && (
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">New Tag</h2>
            <button onClick={() => setShowNew(false)} className="text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              value={newForm.icon}
              onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
              placeholder="Icon (emoji)"
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-center text-2xl"
            />
            <Input
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder="Tag name"
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl md:col-span-2"
            />
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={newForm.color}
                onChange={(e) => setNewForm({ ...newForm, color: e.target.value })}
                className="h-12 w-16 bg-white/5 border-white/10 rounded-xl cursor-pointer"
              />
              <div 
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: newForm.color }}
              >
                Preview
              </div>
            </div>
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

      {/* Tags List */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50 mb-4">No tags yet</p>
            <Button onClick={handleSeedSystemTags} disabled={seeding} variant="outline" className="border-white/10 text-white/70">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Seed System Tags
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {tags.map((tag) => (
              <div key={tag._id} className="p-4 hover:bg-white/5">
                {editingId === tag._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
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
                      type="color"
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="h-10 w-full bg-white/5 border-white/10 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-2 md:col-span-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdate(tag._id)}
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
                    <span className="text-2xl">{tag.icon}</span>
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: tag.color }}
                    >
                      {tag.name}
                    </div>
                    {tag.isSystem && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20">
                        SYSTEM
                      </span>
                    )}
                    <div className="flex-1">
                      <p className="text-white/40 text-sm">{tag.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(tag)} className="text-white/50 hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {!tag.isSystem && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(tag._id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
