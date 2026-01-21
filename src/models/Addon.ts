import mongoose, { Schema, Document, Model } from 'mongoose';

export type AddonType = 'QUESTIONNAIRE' | 'LOGISTICS' | 'LINK';

// Questionnaire Schema Types
export interface QuestionOption {
  label: string;       // "Netflix & Chill 🍿"
  value: string;       // "home-comfort"
  icon?: string;       // emoji or icon name
  resultHint?: string; // "Cozy Box"
}

export interface QuestionnaireQuestion {
  id: string;                    // "budget", "hero-item", "hates"
  label: string;                 // "What's your love budget?"
  description?: string;          // Subtitle/helper text
  type: 'select' | 'text';       // select = options, text = free input
  options?: QuestionOption[];    // For select type
  placeholder?: string;          // For text type
  required?: boolean;
}

export interface PriceTier {
  label: string;       // "₦50,000"
  value: number;       // 50000
  description: string; // "The Self-Care Bloom 🌸"
}

export interface QuestionnaireSchema {
  title: string;
  subtitle?: string;
  questions: QuestionnaireQuestion[];
  prices: PriceTier[];
}

export interface IAddon extends Document {
  name: string;
  slug: string;
  type: AddonType;
  description: string;
  price: number;
  event: mongoose.Types.ObjectId;
  config: {
    redirectUrl?: string;
    questionnaireSchema?: QuestionnaireSchema;
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
