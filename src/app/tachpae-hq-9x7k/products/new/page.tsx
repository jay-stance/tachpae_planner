'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { getProductMediaUploadUrl } from '@/actions/media';

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

interface CustomizationField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'file' | 'date';
  required: boolean;
  options?: string[];
}

interface CustomizationStep {
  title: string;
  fields: CustomizationField[];
}

interface Category {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
    category: '',
    event: '',
    isActive: true,
    mediaGallery: [] as string[],
    variantsConfig: { options: [] as VariantOption[] },
    customizationSchema: { steps: [] as CustomizationStep[] },
  });

  // Fetch categories and events on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, eventRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/events'),
        ]);
        const catData = await catRes.json();
        const eventData = await eventRes.json();
        
        setCategories(catData.data || []);
        setEvents(eventData.data || []);
        
        // Auto-select first event if available
        if (eventData.data?.[0]?._id) {
          setForm(f => ({ ...f, event: eventData.data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  // Handle file upload to S3
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newUrls: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        // Get presigned URL
        const { uploadUrl, publicUrl } = await getProductMediaUploadUrl(file.name, file.type);
        
        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        
        newUrls.push(publicUrl);
      }
      
      setForm(f => ({ ...f, mediaGallery: [...f.mediaGallery, ...newUrls] }));
    } catch (err) {
      setError('Failed to upload images. Please try again.');
      console.error('Upload error:', err);
    }
    
    setUploading(false);
  };

  // Remove media from gallery
  const removeMedia = (index: number) => {
    setForm(f => ({
      ...f,
      mediaGallery: f.mediaGallery.filter((_, i) => i !== index)
    }));
  };

  // Add variant option
  const addVariantOption = () => {
    setForm(f => ({
      ...f,
      variantsConfig: {
        options: [
          ...f.variantsConfig.options,
          { name: '', values: [{ label: '', value: '', priceModifier: 0 }] }
        ]
      }
    }));
  };

  // Remove variant option
  const removeVariantOption = (index: number) => {
    setForm(f => ({
      ...f,
      variantsConfig: {
        options: f.variantsConfig.options.filter((_, i) => i !== index)
      }
    }));
  };

  // Update variant option
  const updateVariantOption = (index: number, field: string, value: string) => {
    setForm(f => {
      const options = [...f.variantsConfig.options];
      options[index] = { ...options[index], [field]: value };
      return { ...f, variantsConfig: { options } };
    });
  };

  // Add variant value
  const addVariantValue = (optionIndex: number) => {
    setForm(f => {
      const options = [...f.variantsConfig.options];
      options[optionIndex].values.push({ label: '', value: '', priceModifier: 0 });
      return { ...f, variantsConfig: { options } };
    });
  };

  // Update variant value
  const updateVariantValue = (optionIndex: number, valueIndex: number, field: string, value: string | number) => {
    setForm(f => {
      const options = [...f.variantsConfig.options];
      options[optionIndex].values[valueIndex] = { 
        ...options[optionIndex].values[valueIndex], 
        [field]: value 
      };
      return { ...f, variantsConfig: { options } };
    });
  };

  // Add customization step
  const addCustomizationStep = () => {
    setForm(f => ({
      ...f,
      customizationSchema: {
        steps: [
          ...f.customizationSchema.steps,
          { title: '', fields: [] }
        ]
      }
    }));
  };

  // Add field to customization step
  const addCustomizationField = (stepIndex: number) => {
    setForm(f => {
      const steps = [...f.customizationSchema.steps];
      steps[stepIndex].fields.push({
        name: '',
        label: '',
        type: 'text',
        required: false,
      });
      return { ...f, customizationSchema: { steps } };
    });
  };

  const handleSave = async () => {
    // Validation
    if (!form.name) {
      setError('Product name is required');
      return;
    }
    if (!form.category) {
      setError('Please select a category');
      return;
    }
    if (!form.event) {
      setError('Please select an event');
      return;
    }
    
    setSaving(true);
    setError('');
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tachpae-hq-9x7k/products">
          <Button variant="ghost" className="text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">New Product</h1>
          <p className="text-white/50 text-sm">Create a new product with all details</p>
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

      {/* Form Sections */}
      <div className="grid gap-6">
        
        {/* Basic Info */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Basic Information</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm font-medium block mb-2">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 text-white rounded-xl"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-2">Event *</label>
                <select
                  value={form.event}
                  onChange={(e) => setForm({ ...form, event: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 text-white rounded-xl"
                >
                  <option value="">Select event</option>
                  {events.map((evt) => (
                    <option key={evt._id} value={evt._id}>{evt.name}</option>
                  ))}
                </select>
              </div>
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
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
              className="h-12 bg-white/5 border-white/10 text-white rounded-xl max-w-xs"
            />
          </div>
        </div>

        {/* Media Gallery */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Media Gallery</h2>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
            {form.mediaGallery.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-white/10 group">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-white/40 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-white/50" />
                  <span className="text-xs text-white/50">Add Media</span>
                </>
              )}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <p className="text-white/40 text-xs">Upload images or videos for your product. Max 10 files.</p>
        </div>

        {/* Variant Options */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Variant Options</h2>
            <Button
              onClick={addVariantOption}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Variant
            </Button>
          </div>
          
          {form.variantsConfig.options.length === 0 ? (
            <p className="text-white/40 text-sm">No variants added. Add variants like Size, Color, etc.</p>
          ) : (
            <div className="space-y-4">
              {form.variantsConfig.options.map((option, optIndex) => (
                <div key={optIndex} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Input
                      value={option.name}
                      onChange={(e) => updateVariantOption(optIndex, 'name', e.target.value)}
                      placeholder="Variant name (e.g. Size, Color)"
                      className="h-10 bg-white/5 border-white/10 text-white rounded-lg flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariantOption(optIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-white/50 text-xs mb-2">Values:</p>
                  <div className="space-y-2">
                    {option.values.map((val, valIndex) => (
                      <div key={valIndex} className="flex gap-2">
                        <Input
                          value={val.label}
                          onChange={(e) => updateVariantValue(optIndex, valIndex, 'label', e.target.value)}
                          placeholder="Label (e.g. Small)"
                          className="h-9 bg-white/5 border-white/10 text-white rounded-lg text-sm flex-1"
                        />
                        <Input
                          value={val.value}
                          onChange={(e) => updateVariantValue(optIndex, valIndex, 'value', e.target.value)}
                          placeholder="Value (e.g. sm)"
                          className="h-9 bg-white/5 border-white/10 text-white rounded-lg text-sm w-24"
                        />
                        <Input
                          type="number"
                          value={val.priceModifier || 0}
                          onChange={(e) => updateVariantValue(optIndex, valIndex, 'priceModifier', Number(e.target.value))}
                          placeholder="+₦0"
                          className="h-9 bg-white/5 border-white/10 text-white rounded-lg text-sm w-24"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addVariantValue(optIndex)}
                    className="text-white/50 hover:text-white mt-2"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Value
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customization Schema */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Customization Steps</h2>
              <p className="text-white/40 text-xs">Define what customers need to fill out when ordering</p>
            </div>
            <Button
              onClick={addCustomizationStep}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Step
            </Button>
          </div>
          
          {form.customizationSchema.steps.length === 0 ? (
            <p className="text-white/40 text-sm">No customization required for this product.</p>
          ) : (
            <div className="space-y-4">
              {form.customizationSchema.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Input
                    value={step.title}
                    onChange={(e) => {
                      const steps = [...form.customizationSchema.steps];
                      steps[stepIndex].title = e.target.value;
                      setForm({ ...form, customizationSchema: { steps } });
                    }}
                    placeholder="Step title (e.g. Personal Details)"
                    className="h-10 bg-white/5 border-white/10 text-white rounded-lg mb-3"
                  />
                  
                  <div className="space-y-2">
                    {step.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="flex gap-2 items-center">
                        <Input
                          value={field.label}
                          onChange={(e) => {
                            const steps = [...form.customizationSchema.steps];
                            steps[stepIndex].fields[fieldIndex].label = e.target.value;
                            steps[stepIndex].fields[fieldIndex].name = e.target.value.toLowerCase().replace(/\s+/g, '_');
                            setForm({ ...form, customizationSchema: { steps } });
                          }}
                          placeholder="Field label"
                          className="h-9 bg-white/5 border-white/10 text-white rounded-lg text-sm flex-1"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const steps = [...form.customizationSchema.steps];
                            steps[stepIndex].fields[fieldIndex].type = e.target.value as any;
                            setForm({ ...form, customizationSchema: { steps } });
                          }}
                          className="h-9 px-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                          <option value="date">Date</option>
                          <option value="file">File</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs text-white/50">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const steps = [...form.customizationSchema.steps];
                              steps[stepIndex].fields[fieldIndex].required = e.target.checked;
                              setForm({ ...form, customizationSchema: { steps } });
                            }}
                            className="rounded"
                          />
                          Req
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addCustomizationField(stepIndex)}
                    className="text-white/50 hover:text-white mt-2"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Field
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Status</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-5 h-5 rounded accent-green-500"
            />
            <span className="text-white">Product is active and visible to customers</span>
          </label>
        </div>
      </div>
    </div>
  );
}
