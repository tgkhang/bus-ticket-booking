// API Root URL - uses environment variable or defaults based on NODE_ENV
const getApiRoot = () => {
  // Always use NEXT_PUBLIC_API_URL for production
  // This ensures the correct API endpoint is used when deployed
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // Fallback for local development only
  return 'http://localhost:8010'
}

export const API_ROOT = getApiRoot()
export const FIELD_REQUIRED_MESSAGE = 'This field is required.'
