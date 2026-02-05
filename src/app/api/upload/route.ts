import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";

const S3_BUCKET = "simplefi";
const REGION = "us-east-2";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: REGION,
});

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params: AWS.S3.PutObjectRequest = {
      Bucket: S3_BUCKET,
      Key: `uploads/${file.name}`,
      Body: buffer,
      ACL: "public-read",
      ContentType: file.type,
    };

    const data = await s3.upload(params).promise();

    return NextResponse.json({
      success: true,
      url: data.Location,
    });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
