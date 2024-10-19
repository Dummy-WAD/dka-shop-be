import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getPresignedUrls = async (bucketName, keys, expiresIn = 900) => {
  try {
    console.log("Bucket Name: ", bucketName);
    const urls = await Promise.all(
      keys.map(async (key) => {
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        return await getSignedUrl(s3Client, command, { expiresIn });
      })
    );
    return urls;
  } catch (err) {
    console.error("Error generating presigned URL", err);
    throw err;
  }
}

export default { getPresignedUrls };