'use server';

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

/**
 * Generate a presigned URL for uploading product media to S3
 */
export async function getProductMediaUploadUrl(fileName: string, contentType: string) {
  const extension = fileName.split('.').pop() || 'jpg';
  const fileKey = `products/${uuidv4()}.${extension}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    ContentType: contentType,
    ACL: 'public-read',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  
  return { uploadUrl, publicUrl };
}
