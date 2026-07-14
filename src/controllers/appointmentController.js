const appointmentService = require('../services/appointmentService');

function getAppointments(req, res) {
  try {
    const appointments = appointmentService.getAllAppointments();

    return res.status(200).json({
      success: true,
      total: appointments.length,
      data: appointments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

function getAppointment(req, res) {
  try {
    const appointment = appointmentService.getAppointmentById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

function createAppointment(req, res) {
  try {
    const appointment = appointmentService.createAppointment(req.body);

    return res.status(201).json({
      success: true,
      message: 'Cita creada correctamente.',
      data: appointment
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

function updateAppointment(req, res) {
  try {
    const appointment = appointmentService.updateAppointment(
      req.params.id,
      req.body
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cita actualizada correctamente.',
      data: appointment
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

function cancelAppointment(req, res) {
  try {
    const appointment = appointmentService.cancelAppointment(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cita cancelada correctamente.',
      data: appointment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

function checkAvailability(req, res) {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({
      success: false,
      message: 'Debe proporcionar una fecha y una hora.'
    });
  }

  const available = appointmentService.verifyAvailability(date, time);

  return res.status(200).json({
    success: true,
    date,
    time,
    available
  });
}

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  checkAvailability
};