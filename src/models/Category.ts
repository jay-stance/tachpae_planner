import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  event: mongoose.Types.ObjectId;
  description?: string;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  description: { type: String },
}, { timestamps: true });

// Compound index to ensure categories are unique per event
CategorySchema.index({ slug: 1, event: 1 }, { unique: true });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
