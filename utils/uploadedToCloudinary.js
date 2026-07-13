import cloudinary from "./cloudinary.js";

export const uploadBufferToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "career-resumes",
        public_id: `${Date.now()}_${filename.replace(/\s+/g, "_")}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};
