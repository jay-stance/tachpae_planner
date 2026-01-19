'use server';

import dbConnect from '@/lib/db';
import Proposal, { IProposal } from '@/models/Proposal';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

import { revalidatePath } from 'next/cache';

export async function createProposal(data: { 
  proposerName: string; 
  proposerEmail?: string;
  partnerName: string; 
  message: string; 
  theme: string;
  deviceId?: string;
}) {
  await dbConnect();
  console.log('Action: createProposal with deviceId:', data.deviceId);
  const proposal = await Proposal.create(data);
  revalidatePath('/proposal/create');
  return { id: proposal._id.toString() };
}

export async function getProposal(id: string) {
  await dbConnect();
  const proposal = await Proposal.findById(id).lean();
  if (!proposal) return null;
  return JSON.parse(JSON.stringify(proposal));
}

export async function getProposalsByDeviceId(deviceId: string) {
  await dbConnect();
  console.log('Action: getProposalsByDeviceId for:', deviceId);
  const proposals = await Proposal.find({ deviceId }).sort({ createdAt: -1 }).lean();
  console.log('Found proposals:', proposals.length);
  return JSON.parse(JSON.stringify(proposals));
}

export async function getPresignedUploadUrl() {
  const fileKey = `reactions/${uuidv4()}.mp4`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    ContentType: 'video/mp4',
    ACL: 'public-read', // Request public access for this object
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  
  return { uploadUrl, publicUrl };
}

export async function respondToProposal(id: string, status: 'ACCEPTED' | 'REJECTED', data?: { videoUrl?: string; reason?: string }) {
    await dbConnect();
    console.log('Action: respondToProposal for:', id, status);
    
    const update: Partial<IProposal> = { 
      status,
      respondedAt: new Date()
    };
    if (status === 'ACCEPTED' && data?.videoUrl) {
        update.reactionVideoUrl = data.videoUrl;
    }
    if (status === 'REJECTED' && data?.reason) {
        update.rejectionReason = data.reason;
    }

    await Proposal.findByIdAndUpdate(id, update);
    revalidatePath('/proposal/create');
    return { success: true };
}
