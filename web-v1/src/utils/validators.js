export const FIELD_REQUIRED_MESSAGE = 'This field is required.'
export const EMAIL_RULE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export const EMAIL_RULE_MESSAGE = 'Please enter a valid email address.'
export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
export const PASSWORD_RULE_MESSAGE = 'Password must be at least 8 characters long and include uppercase, lowercase letters, and a number.'


// VALIDATION FILE
export const LIMIT_COMMON_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_COMMON_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
]

export const singleFileValidator = (file) => {
  if (!file || !file.name || !file.size || !file.type) {
    return 'File cannot be empty.'
  }

  if (file.size > LIMIT_COMMON_FILE_SIZE_BYTES) {
    return `File size should not exceed ${LIMIT_COMMON_FILE_SIZE_BYTES / (1024 * 1024)} MB.`
  }

  if (!ALLOWED_COMMON_FILE_TYPES.includes(file.type)) {
    return 'Unsupported file type.'
  }
  return null
}