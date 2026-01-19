import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface IProposal extends Document {
  proposerName: string;
  proposerEmail?: string;
  partnerName: string;
  message: string;
  theme: string;
  deviceId?: string; // For tracking on the creator's side
  
  // Response
  status: ProposalStatus;
  reactionVideoUrl?: string;
  rejectionReason?: string;
  respondedAt?: Date;
  
  createdAt: Date;
}

const ProposalSchema: Schema = new Schema({
  proposerName: { type: String, required: true },
  proposerEmail: { type: String },
  partnerName: { type: String, required: true },
  message: { type: String, required: true },
  theme: { type: String, default: 'classic-red' },
  deviceId: { type: String }, // Index this for faster lookups later if needed
  
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  reactionVideoUrl: { type: String },
  rejectionReason: { type: String },
  respondedAt: { type: Date },
}, { timestamps: true });

// Help with hot-reloading: wipe the model if it's missing fields we just added
if (process.env.NODE_ENV === 'development' && mongoose.models.Proposal) {
  if (!mongoose.models.Proposal.schema.path('deviceId')) {
    delete mongoose.models.Proposal;
  }
}

const Proposal: Model<IProposal> = mongoose.models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema);

export default Proposal;
