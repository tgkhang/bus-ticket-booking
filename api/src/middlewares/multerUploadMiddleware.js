import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { ALLOWED_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE_BYTES } from '~/utils/constants'

const customFileFilter = (req, file, cb) => {
  // console.log(file)
  if (!ALLOWED_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'Unsupported file type.'
    return cb(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage), null)
  }
  cb(null, true)
}

const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE_BYTES },
  fileFilter: customFileFilter,
})

export const multerUploadMiddleware = {
  upload,
}
