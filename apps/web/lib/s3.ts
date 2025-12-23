import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;


export async function uploadToS3(file: File, folder: string = "screenshots"): Promise<string> {
    const fileExtension = file.name.split(".").pop();
    const uniqueKey = `${folder}/${randomUUID()}.${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueKey,
        Body: buffer,
        ContentType: file.type,
    });

    await s3Client.send(command);

    return uniqueKey;
}


export async function uploadMultipleToS3(files: File[], folder: string = "screenshots"): Promise<string[]> {
    const uploadPromises = files.map((file) => uploadToS3(file, folder));
    return Promise.all(uploadPromises);
}


export async function getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key
    })
    return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}