import mongoose, { Schema, Document, Model } from 'mongoose';

export type ServiceBookingType = 'DIRECT' | 'REDIRECT';

export interface IService extends Document {
  name: string;
  description: string;
  basePrice: number;
  event: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId; // City
  bookingType: ServiceBookingType;
  redirectUrl?: string; // If bookingType is REDIRECT

  // Availability Configuration
  availabilityConfig: {
    dates: {
        date: string; // ISO Date "2026-02-14"
        slots: {
            time: string; // "10:00"
            maxCapacity: number;
            bookedCount: number;
        }[];
    }[];
    // Or a pattern based approach, but sticking to specific slots is easier for events
    defaultSlots: {
        time: string;
        maxCapacity: number;
    }[];
  };

  isActive: boolean;
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  location: { type: Schema.Types.ObjectId, ref: 'City', required: true },
  bookingType: { type: String, enum: ['DIRECT', 'REDIRECT'], required: true },
  redirectUrl: { type: String },
  
  availabilityConfig: { type: Schema.Types.Mixed, default: {} },
  
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
