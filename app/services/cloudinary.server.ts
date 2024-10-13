import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadCloudinaryStream(
  file: File,

  useTransformation = true,
): Promise<{
  error?: cloudinary.UploadApiErrorResponse;
  success: boolean;
  result?: cloudinary.UploadApiResponse;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer); //  <-- convert to Buffer

  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        {
          folder: "uploads",
          resource_type: "auto",
          transformation: useTransformation ? ["with_logo"] : [],
        },
        onDone,
      )
      // @ts-ignore
      .end(buffer);

    function onDone(
      err?: cloudinary.UploadApiErrorResponse,
      result?: cloudinary.UploadApiResponse,
    ) {
      if (err) {
        return reject({ success: false, error: err });
      }
      return resolve({ success: true, result });
    }
  });
}

export { uploadCloudinaryStream, cloudinary };
