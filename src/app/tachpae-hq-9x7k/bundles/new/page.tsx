'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Upload, X, ImageIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  mediaGallery: string[];
}

interface Event {
  _id: string;
  name: string;
}

export default function NewBundlePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bundlePrice, setBundlePrice] = useState('');
  const [mediaGallery, setMediaGallery] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        setEvents(eventsData.data || []);
        if (eventsData.data?.[0]) {
          setSelectedEvent(eventsData.data[0]._id);
        }
        
        // Fetch products
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        setAllProducts(productsData.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    
    fetchData();
  }, []);

  const originalValue = selectedProducts.reduce((sum, p) => sum + p.basePrice, 0);
  const savings = originalValue - (parseFloat(bundlePrice) || 0);

  const handleAddProduct = (product: Product) => {
    if (!selectedProducts.find(p => p._id === product._id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setShowProductPicker(false);
    setProductSearch('');
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const token = localStorage.getItem('admin_token');
    
    for (const file of Array.from(files)) {
      try {
        // Get presigned URL
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folder: 'bundles',
          }),
        });
        
        const { uploadUrl, publicUrl } = await response.json();
        
        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        
        setMediaGallery(prev => [...prev, publicUrl]);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!name || !bundlePrice || selectedProducts.length === 0) {
      alert('Please fill in all required fields and add at least one product');
      return;
    }
    
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('/api/admin/bundles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          bundlePrice: parseFloat(bundlePrice),
          originalValue,
          savings: savings > 0 ? savings : 0,
          mediaGallery,
          products: selectedProducts.map(p => p._id),
          event: selectedEvent,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/tachpae-hq-9x7k/bundles');
      } else {
        alert(data.error || 'Failed to create bundle');
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
    setSaving(false);
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    !selectedProducts.find(sp => sp._id === p._id)
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tachpae-hq-9x7k/bundles">
          <Button variant="ghost" className="text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Create Bundle</h1>
          <p className="text-white/50">Build a curated package of products</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Bundle Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., For Her Valentine Pack"
                className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl px-4"
              >
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what makes this bundle special..."
              className="bg-white/5 border-white/10 text-white rounded-xl min-h-[100px]"
            />
          </div>
        </div>

        {/* Products Selection */}
        <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Products in Bundle</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProductPicker(true)}
              className="border-white/10 text-white/70 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
          
          {/* Selected Products */}
          {selectedProducts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
              <p className="text-white/40">No products added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedProducts.map(product => (
                <div 
                  key={product._id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10">
                    {product.mediaGallery?.[0] ? (
                      <Image src={product.mediaGallery[0]} alt="" width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-white/50 text-sm">₦{product.basePrice.toLocaleString()}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveProduct(product._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Product Picker Modal */}
          {showProductPicker && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden" style={{ background: '#0a0a1a' }}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Add Product</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowProductPicker(false)} className="text-white/50">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className="pl-10 h-12 bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {filteredProducts.map(product => (
                      <button
                        key={product._id}
                        onClick={() => handleAddProduct(product)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10">
                          {product.mediaGallery?.[0] ? (
                            <Image src={product.mediaGallery[0]} alt="" width={48} height={48} className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-white/50 text-sm">₦{product.basePrice.toLocaleString()}</p>
                        </div>
                        <Plus className="w-5 h-5 text-white/40" />
                      </button>
                    ))}
                    
                    {filteredProducts.length === 0 && (
                      <p className="text-center py-8 text-white/40">No products found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Bundle Price *</label>
              <Input
                type="number"
                value={bundlePrice}
                onChange={(e) => setBundlePrice(e.target.value)}
                placeholder="0"
                className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Original Value</label>
              <div className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-white/50">
                ₦{originalValue.toLocaleString()}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Customer Savings</label>
              <div className={`h-12 border rounded-xl px-4 flex items-center font-bold ${savings > 0 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
                {savings > 0 ? `₦${savings.toLocaleString()}` : '₦0'}
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white">Bundle Image</h2>
          
          <div className="flex flex-wrap gap-4">
            {mediaGallery.map((url, idx) => (
              <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden group">
                <Image src={url} alt="" fill className="object-cover" />
                <button 
                  onClick={() => setMediaGallery(mediaGallery.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-32 h-32 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-white/60 hover:border-white/40 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Upload</span>
                </>
              )}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || !name || !bundlePrice || selectedProducts.length === 0}
          className="w-full h-14 text-lg font-bold border-0 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Create Bundle
        </Button>
      </div>
    </div>
  );
}
