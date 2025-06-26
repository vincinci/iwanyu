import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const SUPABASE_S3_ENDPOINT = process.env.SUPABASE_S3_ENDPOINT || 'https://januuygbpxenuhhlsjph.supabase.co/storage/v1/s3';
const SUPABASE_S3_BUCKET = process.env.SUPABASE_S3_BUCKET || 'your-bucket-name';
const SUPABASE_S3_ACCESS_KEY_ID = process.env.SUPABASE_S3_ACCESS_KEY_ID;
const SUPABASE_S3_SECRET_ACCESS_KEY = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;

export const s3Client = new S3Client({
  region: 'us-east-1', // Not used by Supabase, but required
  endpoint: SUPABASE_S3_ENDPOINT,
  credentials: {
    accessKeyId: SUPABASE_S3_ACCESS_KEY_ID!,
    secretAccessKey: SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function uploadToSupabaseS3(localFilePath: string, destKey: string, contentType?: string) {
  const fileStream = fs.createReadStream(localFilePath);
  const putCommand = new PutObjectCommand({
    Bucket: SUPABASE_S3_BUCKET,
    Key: destKey,
    Body: fileStream,
    ContentType: contentType || 'application/octet-stream',
  });
  await s3Client.send(putCommand);
  // Return the public URL (assuming bucket is public)
  return `${SUPABASE_S3_ENDPOINT.replace('/s3', '')}/${SUPABASE_S3_BUCKET}/${destKey}`;
} 