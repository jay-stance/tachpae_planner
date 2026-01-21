'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface VariantValue {
  label: string;
  value: string;
  priceModifier?: number;
  image?: string;
}

interface VariantOption {
  name: string;
  values: VariantValue[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  mediaGallery: string[];
  isActive: boolean;
  variantsConfig: { options: VariantOption[] };
}

interface Category {
  _id: string;
  name: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products?id=${id}`),
          fetch('/api/categories'),
        ]);

        const productData = await productRes.json();
        const categoriesData = await categoriesRes.json();

        // Find the specific product
        const foundProduct = productData.data?.find((p: Product) => p._id === id);
        if (foundProduct) {
          setProduct({
            ...foundProduct,
            category: foundProduct.category?._id || foundProduct.category || '',
          });
        }
        setCategories(categoriesData.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load product');
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!product) return;
    
    setSaving(true);
    setError('');
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          basePrice: product.basePrice,
          category: product.category,
          isActive: product.isActive,
          variantsConfig: product.variantsConfig,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to save');
      } else {
        router.push('/tachpae-hq-9x7k/products');
      }
    } catch (err) {
      setError('Failed to save product');
    }
    setSaving(false);
  };

  const updateVariantPrice = (optionIndex: number, valueIndex: number, price: number) => {
    if (!product) return;
    
    const newConfig = { ...product.variantsConfig };
    newConfig.options[optionIndex].values[valueIndex].priceModifier = price;
    setProduct({ ...product, variantsConfig: newConfig });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50">Product not found</p>
        <Link href="/tachpae-hq-9x7k/products" className="text-blue-400 mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tachpae-hq-9x7k/products">
          <Button variant="ghost" className="text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">Edit Product</h1>
          <p className="text-white/50 text-sm">{product.name}</p>
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
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="grid gap-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Basic Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Product Name</label>
              <Input
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Description</label>
              <Textarea
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="min-h-[100px] bg-white/5 border-white/10 text-white rounded-xl"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Category</label>
              <select
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 text-white rounded-xl"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Pricing</h2>
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Base Price (₦)</label>
            <Input
              type="number"
              value={product.basePrice}
              onChange={(e) => setProduct({ ...product, basePrice: Number(e.target.value) })}
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl max-w-xs"
            />
          </div>

          {/* Variant Pricing */}
          {product.variantsConfig?.options?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-medium mb-3">Variant Price Modifiers</h3>
              {product.variantsConfig.options.map((option, optionIndex) => (
                <div key={optionIndex} className="mb-4">
                  <p className="text-white/50 text-sm mb-2">{option.name}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {option.values.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex items-center gap-2">
                        <span className="text-white text-sm min-w-[80px]">{value.label}</span>
                        <Input
                          type="number"
                          value={value.priceModifier || 0}
                          onChange={(e) => updateVariantPrice(optionIndex, valueIndex, Number(e.target.value))}
                          className="h-10 bg-white/5 border-white/10 text-white rounded-lg text-sm"
                          placeholder="+₦0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Gallery */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Media Gallery</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {product.mediaGallery?.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-white/10">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {(!product.mediaGallery || product.mediaGallery.length === 0) && (
              <p className="text-white/40 text-sm col-span-full">No images uploaded</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Status</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={product.isActive}
              onChange={(e) => setProduct({ ...product, isActive: e.target.checked })}
              className="w-5 h-5 rounded accent-green-500"
            />
            <span className="text-white">Product is active and visible to customers</span>
          </label>
        </div>
      </div>
    </div>
  );
}
