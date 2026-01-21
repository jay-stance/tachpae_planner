'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  category: { _id: string; name: string } | null;
  mediaGallery: string[];
  isActive: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeleting(id);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setDeleting(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (res.ok) {
        setProducts(products.map(p => 
          p._id === id ? { ...p, isActive: !currentStatus } : p
        ));
      }
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Products</h1>
          <p className="text-white/50 mt-1">{products.length} products total</p>
        </div>
        <Link href="/tachpae-hq-9x7k/products/new">
          <Button 
            className="border-0"
            style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <Input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium p-4">Product</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Price</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Category</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Status</th>
                  <th className="text-right text-white/50 text-sm font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                          {product.mediaGallery?.[0] ? (
                            <Image
                              src={product.mediaGallery[0]}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30 text-lg">📦</div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-white/40 text-sm truncate max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold">₦{product.basePrice.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70">{product.category?.name || 'No category'}</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(product._id, product.isActive)}
                        className="flex items-center gap-2"
                      >
                        {product.isActive ? (
                          <>
                            <ToggleRight className="w-6 h-6 text-green-400" />
                            <span className="text-green-400 text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-6 h-6 text-white/30" />
                            <span className="text-white/30 text-sm">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/tachpae-hq-9x7k/products/${product._id}`}>
                          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting === product._id}
                        >
                          {deleting === product._id ? (
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
