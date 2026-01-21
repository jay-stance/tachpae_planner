'use server';

import dbConnect from '@/lib/db';
import Proposal, { IProposal } from '@/models/Proposal';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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

// Helper to generate a presigned GET URL for a reaction video
async function signReactionUrl(url?: string) {
  if (!url) return url;
  
  try {
    // Extract key from URL formats:
    // Format 1: https://bucket.s3.region.amazonaws.com/key
    // Format 2: https://s3.region.amazonaws.com/bucket/key
    const urlObj = new URL(url);
    let key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    
    // If the URL is already signed (has query params), don't re-sign
    if (urlObj.search && urlObj.search.includes('X-Amz-Signature')) {
      return url;
    }
    
    console.log('[signReactionUrl] Signing key:', key);
    
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });
    
    // Links refresh on every page visit/action. 
    // Setting to 7 days so they last a long time if tab stays open.
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 * 7 }); 
    console.log('[signReactionUrl] Generated signed URL');
    return signedUrl;
  } catch (error) {
    console.error('[signReactionUrl] Failed to sign URL:', url, error);
    return url;
  }
}

export async function getProposal(id: string) {
  await dbConnect();
  const proposal = await Proposal.findById(id).lean();
  if (!proposal) return null;
  
  const signedProposal = JSON.parse(JSON.stringify(proposal));
  if (signedProposal.reactionVideoUrl) {
    signedProposal.reactionVideoUrl = await signReactionUrl(signedProposal.reactionVideoUrl);
  }
  
  return signedProposal;
}

export async function getProposalsByDeviceId(deviceId: string) {
  await dbConnect();
  console.log('Action: getProposalsByDeviceId for:', deviceId);
  const proposals = await Proposal.find({ deviceId }).sort({ createdAt: -1 }).lean();
  console.log('Found proposals:', proposals.length);
  
  const processedProposals = await Promise.all(proposals.map(async (p) => {
    const proposal = JSON.parse(JSON.stringify(p));
    if (proposal.reactionVideoUrl) {
      proposal.reactionVideoUrl = await signReactionUrl(proposal.reactionVideoUrl);
    }
    return proposal;
  }));
  
  return processedProposals;
}

export async function getPresignedUploadUrl() {
  const fileKey = `reactions/${uuidv4()}.mp4`;
  
  // Note: For ACL to work, your bucket must have:
  // 1. "Block public access" settings disabled for ACLs
  // 2. Object Ownership set to "Bucket owner preferred" or "Object writer"
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    ContentType: 'video/mp4',
    ACL: 'public-read', // Makes the uploaded file publicly readable
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
