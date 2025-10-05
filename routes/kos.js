const express = require('express');
const router = express.Router();
const kosCtl = require('../controllers/kosController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Public
router.get('/', kosCtl.listKos);
router.get('/:id', kosCtl.getKos);

// Owner actions
router.post('/', authenticate, requireRole('owner'), kosCtl.createKos);
router.put('/:id', authenticate, requireRole('owner'), kosCtl.updateKos);
router.delete('/:id', authenticate, requireRole('owner'), kosCtl.deleteKos);

// Facilities
router.post('/:kosId/facilities', authenticate, requireRole('owner'), kosCtl.addFacility);
router.delete('/:kosId/facilities/:facilityId', authenticate, requireRole('owner'), kosCtl.removeFacility);

module.exports = router;
