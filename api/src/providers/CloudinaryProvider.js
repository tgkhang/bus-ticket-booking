import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {Object} options - Upload options (folder, resource_type, etc.)
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryv2.uploader.upload_stream(
      {
        folder: options.folder || 'buses',
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) reject(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Image upload failed'))
        else resolve(result)
      }
    )
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

/**
 * Delete image from Cloudinary
 * @param {String} imageUrl - Cloudinary image URL
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/buses/abc123.jpg
    // public_id: buses/abc123
    const urlParts = imageUrl.split('/')
    const uploadIndex = urlParts.indexOf('upload')

    if (uploadIndex === -1) throw new Error('Invalid Cloudinary URL')

    // Get everything after 'upload/v{version}/'
    const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/')

    // Remove file extension
    const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '')

    const result = await cloudinaryv2.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    throw error
  }
}

export const CloudinaryProvider = {
  streamUpload,
  uploadImage,
  deleteImage,
}
