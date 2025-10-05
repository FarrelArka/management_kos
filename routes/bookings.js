const express = require('express');
const router = express.Router();
const bookingCtl = require('../controllers/bookingController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.post('/:kosId', authenticate, bookingCtl.createBooking);

// Owner change status
router.post('/status/:bookingId', authenticate, requireRole('owner'), bookingCtl.changeStatus);

// Owner history
router.get('/history', authenticate, requireRole('owner'), bookingCtl.history);

// Invoice (both owner of kos and booking owner can access)
router.get('/:bookingId/invoice', authenticate, bookingCtl.invoice);

module.exports = router;
