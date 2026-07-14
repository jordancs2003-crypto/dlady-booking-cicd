const express = require('express');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

router.get(
  '/availability',
  appointmentController.checkAvailability
);

router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointment);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.patch(
  '/:id/cancel',
  appointmentController.cancelAppointment
);

module.exports = router;