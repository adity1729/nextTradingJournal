import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// Initialize S3 client with credentials from environment variables
const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

/**
 * Uploads a file to S3 and returns the public URL
 * @param file - The file to upload (from FormData)
 * @param folder - The folder path within the bucket (e.g., "screenshots")
 * @returns The public URL of the uploaded file
 */
export async function uploadToS3(file: File, folder: string = "screenshots"): Promise<string> {
    // Generate a unique filename to prevent collisions
    const fileExtension = file.name.split(".").pop();
    const uniqueKey = `${folder}/${randomUUID()}.${fileExtension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueKey,
        Body: buffer,
        ContentType: file.type,
    });

    await s3Client.send(command);

    // Return the public URL
    // This assumes your bucket is configured for public access or you're using CloudFront
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

    return url;
}

/**
 * Uploads multiple files to S3
 * @param files - Array of files to upload
 * @param folder - The folder path within the bucket
 * @returns Array of public URLs
 */
export async function uploadMultipleToS3(files: File[], folder: string = "screenshots"): Promise<string[]> {
    const uploadPromises = files.map((file) => uploadToS3(file, folder));
    return Promise.all(uploadPromises);
}
