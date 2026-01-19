import mongoose, { Schema, Document, Model } from 'mongoose';

export type AddonType = 'QUESTIONNAIRE' | 'LOGISTICS' | 'LINK';

export interface IAddon extends Document {
  name: string;
  slug: string;
  type: AddonType;
  description: string;
  price: number;
  event: mongoose.Types.ObjectId;
  config: {
    redirectUrl?: string;
    questionnaireSchema?: any;
    hubAddress?: string;
  };
  icon?: string;
  isActive: boolean;
}

const AddonSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  type: { type: String, enum: ['QUESTIONNAIRE', 'LOGISTICS', 'LINK'], required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  config: { type: Schema.Types.Mixed, default: {} },
  icon: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

AddonSchema.index({ event: 1, slug: 1 }, { unique: true });

const Addon: Model<IAddon> = mongoose.models.Addon || mongoose.model<IAddon>('Addon', AddonSchema);

export default Addon;
