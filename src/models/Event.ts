import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  slug: string; // e.g., 'val-2026'
  cities: mongoose.Types.ObjectId[];
  themeConfig: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    assets: {
      logo: string;
      heroImage: string;
      [key: string]: string;
    };
    [key: string]: any;
  };
  isActive: boolean;
}

const EventSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  cities: [{ type: Schema.Types.ObjectId, ref: 'City' }],
  themeConfig: { type: Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
