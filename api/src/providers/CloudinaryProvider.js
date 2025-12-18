import cloudinary from 'cloudinary'
import streamifier from 'streamifier'

const cloudinaryv2 = cloudinary.v2
cloudinaryv2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryv2.uploader.upload_stream(
      {
        folder: folderName,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = { streamUpload }
