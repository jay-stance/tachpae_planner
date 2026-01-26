import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBundle extends Document {
  name: string; // "For Her Pack", "Student Pack"
  slug: string;
  description: string;
  products: mongoose.Types.ObjectId[]; // Products included
  bundlePrice: number; // Fixed bundle price (set by admin)
  originalValue?: number; // Sum of individual products (for showing savings)
  savings?: number; // Amount saved vs individual items
  mediaGallery: string[];
  isActive: boolean;
  locations: mongoose.Types.ObjectId[]; // Location restrictions
  event: mongoose.Types.ObjectId;
  displayOrder: number;
}

const BundleSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  bundlePrice: { type: Number, required: true },
  originalValue: { type: Number },
  savings: { type: Number },
  mediaGallery: [{ type: String }],
  isActive: { type: Boolean, default: true },
  locations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

// Compound index to ensure bundles are unique per event
BundleSchema.index({ slug: 1, event: 1 }, { unique: true });

const Bundle: Model<IBundle> = mongoose.models.Bundle || mongoose.model<IBundle>('Bundle', BundleSchema);

export default Bundle;
