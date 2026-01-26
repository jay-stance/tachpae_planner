import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus = 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED';

export interface IOrder extends Document {
  event: mongoose.Types.ObjectId;
  orderId: string; // Friendly unique ID (e.g., VAL-1234)
  customer: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    secondaryPhone?: string;
    address: string;
    city: string; // Snapshotted city name
    customMessage?: string;
  };
  
  items: {
    type: 'PRODUCT' | 'SERVICE';
    referenceId: mongoose.Types.ObjectId; // Original Product/Service ID
    name: string;
    quantity: number;
    priceAtPurchase: number;
    
    // For Products
    variantSelection?: Record<string, any>; // { Color: "Red", Size: "M" }
    customizationData?: Record<string, any>; // { "Enter Name": "John" }
    
    // For Services
    serviceId?: string; // Unique Ticket Code (e.g. TICKET-XYZ)
    bookingDate?: string;
    bookingTime?: string;
  }[];

  totalAmount: number;
  status: OrderStatus;
  paymentProof?: string; // URL to payment proof if uploaded
  notes?: string;
}

const OrderSchema: Schema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    secondaryPhone: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    customMessage: { type: String },
  },
  items: [
    {
      type: { type: String, enum: ['PRODUCT', 'SERVICE'], required: true },
      referenceId: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      priceAtPurchase: { type: Number, required: true },
      variantSelection: { type: Schema.Types.Mixed },
      customizationData: { type: Schema.Types.Mixed },
      serviceId: { type: String }, // Ticket ID
      bookingDate: { type: String },
      bookingTime: { type: String },
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'FULFILLED', 'CANCELLED'], default: 'PENDING' },
  paymentProof: { type: String },
  notes: { type: String },
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
