import OSS from 'ali-oss';
import * as dotenv from 'dotenv';

dotenv.config();

// Check if OSS config is present to avoid errors during dev if not needed immediately
const isOssConfigured = process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET;

export const ossClient = isOssConfigured ? new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET,
}) : null;

export const generatePresignedUrl = async (objectName: string) => {
    if (!ossClient) throw new Error('OSS client not configured');
    return ossClient.signatureUrl(objectName, {
        method: 'PUT',
        expires: 3600
    });
}
