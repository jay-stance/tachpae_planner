import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICity extends Document {
  name: string;
  slug: string;
  isActive: boolean;
}

const CitySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const City: Model<ICity> = mongoose.models.City || mongoose.model<ICity>('City', CitySchema);

export default City;
