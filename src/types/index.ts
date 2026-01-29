export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
}

export interface VariantOption {
  label: string;
  value: string;
  image?: string;
  priceModifier?: number;
}

export interface VariantConfig {
  name: string;
  values: VariantOption[];
}

export interface CustomizationField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'file' | 'date';
  required: boolean;
  options?: string[];
  accept?: string;
  maxImages?: number;
  maxVideos?: number;
}

export interface CustomizationStep {
  title: string;
  fields: CustomizationField[];
}

export interface BundleItem {
  productId: string;
  productName: string;
  quantity: number;
  productImage?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string | Category;
  mediaGallery: string[];
  tags?: string[];
  tierLabel?: 'entry' | 'popular' | 'grandGesture';
  microBenefits?: string[];
  
  // Bundle specific
  isBundle?: boolean;
  bundleCategory?: 'couples' | 'for-her' | 'for-him' | 'self-love';
  bundleItems?: BundleItem[];
  
  // Configuration
  variantsConfig?: {
    options: VariantConfig[];
  };
  customizationSchema?: {
    steps: CustomizationStep[];
  };
  
  isActive: boolean;
  locations?: string[];
  videoConfig?: {
    maxDuration: number;
    maxSize: number;
  };
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category?: string | Category;
}

export interface City {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}
