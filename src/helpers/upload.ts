import AWS from "aws-sdk";

const S3_BUCKET = "simplefi";
const REGION = "us-east-2";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_SECRET_KEY,
  region: REGION,
});

const uploadFileToS3 = async (file: File) => {
  const s3 = new AWS.S3();

  const params = {
    Bucket: S3_BUCKET,
    Key: `uploads/${file.name}`, // Ruta dentro del bucket
    Body: file,
    ACL: "public-read", // Permite acceso público al archivo
  };

  try {
    const data = await s3.upload(params).promise();
    console.log("Archivo subido con éxito:", data);
    return data.Location; // Devuelve la URL del archivo
  } catch (error) {
    console.error("Error al subir archivo a S3:", error);
    throw error;
  }
};

export default uploadFileToS3;
