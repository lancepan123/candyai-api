import OSS from 'ali-oss';
import path from 'path';
import { randomUUID } from 'crypto';

let client: OSS;

function getClient() {
    if (!client) {
        if (!process.env.ALIYUN_ACCESS_KEY_ID || !process.env.ALIYUN_ACCESS_KEY_SECRET || !process.env.ALIYUN_OSS_REGION || !process.env.ALIYUN_OSS_BUCKET) {
            throw new Error('Aliyun OSS config missing');
        }
        client = new OSS({
            region: process.env.ALIYUN_OSS_REGION,
            accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
            accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
            bucket: process.env.ALIYUN_OSS_BUCKET,
            secure: true, // Use HTTPS
        });
    }
    return client;
}

export async function uploadToOSS(fileStream: any, filename: string): Promise<string> {
  const ossClient = getClient();
  const ext = path.extname(filename);
  const newFilename = `avatars/${randomUUID()}${ext}`;
  
  try {
    // ali-oss put supports stream
    const result = await ossClient.put(newFilename, fileStream);
    return result.url;
  } catch (e) {
    console.error('OSS Upload Error:', e);
    throw new Error('Upload failed');
  }
}
