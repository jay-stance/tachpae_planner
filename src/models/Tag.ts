import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  color: string; // Hex color for badge display
  icon?: string; // Emoji or icon name
  isSystem: boolean; // System tags can't be deleted
  displayOrder: number;
}

// Predefined system tags from CRO review
export const SYSTEM_TAGS = [
  { name: 'Most Popular', slug: 'most-popular', color: '#ef4444', icon: '🔥', isSystem: true, displayOrder: 1 },
  { name: 'Best Seller', slug: 'best-seller', color: '#f59e0b', icon: '⭐', isSystem: true, displayOrder: 2 },
  { name: 'Luxury Pick', slug: 'luxury-pick', color: '#8b5cf6', icon: '💎', isSystem: true, displayOrder: 3 },
  { name: 'Romantic', slug: 'romantic', color: '#ec4899', icon: '💝', isSystem: true, displayOrder: 4 },
  { name: 'Sweet & Simple', slug: 'sweet-simple', color: '#10b981', icon: '🌸', isSystem: true, displayOrder: 5 },
  { name: 'Grand Gesture', slug: 'grand-gesture', color: '#6366f1', icon: '👑', isSystem: true, displayOrder: 6 },
  { name: 'Budget Friendly', slug: 'budget-friendly', color: '#22c55e', icon: '💰', isSystem: true, displayOrder: 7 },
  { name: 'New Arrival', slug: 'new-arrival', color: '#0ea5e9', icon: '✨', isSystem: true, displayOrder: 8 },
  { name: 'Limited Stock', slug: 'limited-stock', color: '#f43f5e', icon: '⏰', isSystem: true, displayOrder: 9 },
];

const TagSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  color: { type: String, required: true, default: '#6366f1' },
  icon: { type: String },
  isSystem: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 100 },
}, { timestamps: true });

const Tag: Model<ITag> = mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);

export default Tag;
