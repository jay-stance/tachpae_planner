import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  basePrice: number;
  event: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  mediaGallery: string[]; // URLs of images/videos
  
  // CRO Tags for filtering and display
  tags: mongoose.Types.ObjectId[]; // References to Tag model
  tierLabel?: 'entry' | 'popular' | 'grandGesture';
  microBenefits?: string[]; // e.g., ["Fast Delivery", "Premium Quality"]
  
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
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  tierLabel: { type: String, enum: ['entry', 'popular', 'grandGesture'], default: null },
  microBenefits: [{ type: String }],
  
  variantsConfig: { type: Schema.Types.Mixed, default: { options: [] } },
  customizationSchema: { type: Schema.Types.Mixed, default: { steps: [] } },
  videoConfig: { type: Schema.Types.Mixed, default: null },
  
  isActive: { type: Boolean, default: true },
  
  // Location restrictions: empty array = available to all locations
  locations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
}, { timestamps: true });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
