const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const databasePath = path.join(
  __dirname,
  '../../data/appointments.json'
);

function readAppointments() {
  try {
    const content = fs.readFileSync(databasePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`No se pudieron leer las citas: ${error.message}`);
  }
}

function saveAppointments(appointments) {
  try {
    fs.writeFileSync(
      databasePath,
      JSON.stringify(appointments, null, 2),
      'utf8'
    );
  } catch (error) {
    throw new Error(`No se pudieron guardar las citas: ${error.message}`);
  }
}

function getAllAppointments() {
  return readAppointments();
}

function getAppointmentById(id) {
  const appointments = readAppointments();
  return appointments.find((appointment) => appointment.id === id);
}

function validateAppointment(data) {
  const requiredFields = [
    'clientName',
    'phone',
    'service',
    'date',
    'time'
  ];

  const missingFields = requiredFields.filter(
    (field) => !data[field] || String(data[field]).trim() === ''
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Faltan campos obligatorios: ${missingFields.join(', ')}`
    );
  }

  const phonePattern = /^[0-9+]{7,15}$/;

  if (!phonePattern.test(data.phone)) {
    throw new Error('El número telefónico no es válido.');
  }

  const appointmentDate = new Date(`${data.date}T${data.time}:00`);

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new Error('La fecha o la hora no tiene un formato válido.');
  }
}

function verifyAvailability(date, time, ignoredId = null) {
  const appointments = readAppointments();

  return !appointments.some(
    (appointment) =>
      appointment.date === date &&
      appointment.time === time &&
      appointment.status !== 'cancelada' &&
      appointment.id !== ignoredId
  );
}

function createAppointment(data) {
  validateAppointment(data);

  if (!verifyAvailability(data.date, data.time)) {
    throw new Error('El horario seleccionado ya está ocupado.');
  }

  const appointments = readAppointments();

  const newAppointment = {
    id: crypto.randomUUID(),
    clientName: data.clientName.trim(),
    phone: data.phone.trim(),
    service: data.service.trim(),
    date: data.date,
    time: data.time,
    status: 'pendiente',
    createdAt: new Date().toISOString()
  };

  appointments.push(newAppointment);
  saveAppointments(appointments);

  return newAppointment;
}

function updateAppointment(id, data) {
  const appointments = readAppointments();
  const index = appointments.findIndex(
    (appointment) => appointment.id === id
  );

  if (index === -1) {
    return null;
  }

  const updatedData = {
    ...appointments[index],
    ...data,
    id,
    updatedAt: new Date().toISOString()
  };

  validateAppointment(updatedData);

  if (!verifyAvailability(updatedData.date, updatedData.time, id)) {
    throw new Error('El horario seleccionado ya está ocupado.');
  }

  appointments[index] = updatedData;
  saveAppointments(appointments);

  return updatedData;
}

function cancelAppointment(id) {
  const appointments = readAppointments();
  const index = appointments.findIndex(
    (appointment) => appointment.id === id
  );

  if (index === -1) {
    return null;
  }

  appointments[index] = {
    ...appointments[index],
    status: 'cancelada',
    updatedAt: new Date().toISOString()
  };

  saveAppointments(appointments);

  return appointments[index];
}

function clearAppointments() {
  saveAppointments([]);
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  verifyAvailability,
  clearAppointments
};