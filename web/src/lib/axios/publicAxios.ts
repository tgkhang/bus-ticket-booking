import axios from 'axios'

const publicAxiosInstance = axios.create()
publicAxiosInstance.defaults.timeout = 10 * 60 * 1000 // 10 minutes
publicAxiosInstance.defaults.withCredentials = true

export default publicAxiosInstance
