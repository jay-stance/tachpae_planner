import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  basePrice: number;
  event: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  mediaGallery: string[]; // URLs of images/videos
  
  // CRO Tags for filtering and display
  tags: string[]; // e.g., ['popular', 'romantic', 'luxury', 'for-her', 'for-him']
  tierLabel?: 'entry' | 'popular' | 'grandGesture';
  microBenefits?: string[]; // e.g., ["Fast Delivery", "Premium Quality"]
  rank?: number; // Sorting rank (default 0)
  
  // Bundle fields
  isBundle?: boolean;
  bundleCategory?: 'couples' | 'for-her' | 'for-him' | 'self-love';
  bundleItems?: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
  }[];
  
  // Dynamic Configuration for SKUs
  variantsConfig: {
    options: {
      name: string; // e.g. "Color"
      values: {
        label: string; // e.g. "Red"
        value: string; // e.g. "#ff0000" or "red"
        image?: string; // Visual swatch
        priceModifier?: number; // Added to base price
      }[];
    }[];
  };

  // User input required (Wizard steps)
  customizationSchema: {
    steps: {
      title: string;
      fields: {
        name: string; // Field key
        label: string;
        type: 'text' | 'textarea' | 'select' | 'file' | 'date';
        required: boolean;
        options?: string[]; // For select
        accept?: string; // For file (e.g., "video/*")
        maxImages?: number; // For file
        maxVideos?: number; // For file
      }[];
    }[];
  };

  isActive: boolean;
  
  // Location restrictions (empty = available everywhere)
  locations: mongoose.Types.ObjectId[];
  
  // Video upload constraints (optional)
  videoConfig?: {
    maxDuration: number; // seconds
    maxSize: number;     // MB
  };
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  mediaGallery: [{ type: String }],
  
  // CRO fields
  tags: [{ type: String }], // Simple string array
  tierLabel: { type: String, enum: ['entry', 'popular', 'grandGesture'], default: null },
  microBenefits: [{ type: String }],
  
  // Bundle fields
  isBundle: { type: Boolean, default: false },
  bundleCategory: { type: String, enum: ['couples', 'for-her', 'for-him', 'self-love'], default: null },
  bundleItems: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String },
    quantity: { type: Number, default: 1 }
  }],
  
  variantsConfig: { type: Schema.Types.Mixed, default: { options: [] } },
  customizationSchema: { type: Schema.Types.Mixed, default: { steps: [] } },
  videoConfig: { type: Schema.Types.Mixed, default: null },
  
  isActive: { type: Boolean, default: true },
  
  // Location restrictions: empty array = available to all locations
  locations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
  
  // Sorting Rank (Higher shows first)
  rank: { type: Number, default: 0 },
}, { timestamps: true });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
