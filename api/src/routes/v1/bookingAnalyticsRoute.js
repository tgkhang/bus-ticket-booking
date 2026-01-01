import express from 'express';
import { getBookingAnalytics } from '~/controllers/bookingAnalyticsController';

const router = express.Router();

router.get('/bookings', getBookingAnalytics);

export default router;