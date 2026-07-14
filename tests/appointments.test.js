const request = require('supertest');
const app = require('../src/app');

const appointmentService = require(
  '../src/services/appointmentService'
);

beforeEach(() => {
  appointmentService.clearAppointments();
});

describe('API de citas', () => {
  const validAppointment = {
    clientName: 'María López',
    phone: '0991234567',
    service: 'Tinturado',
    date: '2030-08-20',
    time: '10:00'
  };

  test('debe crear una cita válida', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.clientName).toBe('María López');
    expect(response.body.data.status).toBe('pendiente');
  });

  test('debe rechazar una cita incompleta', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({
        clientName: 'María'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      'Faltan campos obligatorios'
    );
  });

  test('debe rechazar un teléfono inválido', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({
        ...validAppointment,
        phone: 'abc'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      'número telefónico no es válido'
    );
  });

  test('debe rechazar una fecha inválida', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({
        ...validAppointment,
        date: 'fecha-invalida'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      'fecha o la hora no tiene un formato válido'
    );
  });

  test('debe impedir dos citas en el mismo horario', async () => {
    await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    const secondResponse = await request(app)
      .post('/api/appointments')
      .send({
        ...validAppointment,
        clientName: 'Ana Pérez',
        phone: '0987654321'
      });

    expect(secondResponse.statusCode).toBe(400);
    expect(secondResponse.body.message).toContain('ocupado');
  });

  test('debe devolver las citas registradas', async () => {
    await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    const response = await request(app).get('/api/appointments');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.total).toBe(1);
    expect(response.body.data).toHaveLength(1);
  });

  test('debe devolver una cita por su identificador', async () => {
    const creationResponse = await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    const id = creationResponse.body.data.id;

    const response = await request(app)
      .get(`/api/appointments/${id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(id);
    expect(response.body.data.clientName).toBe('María López');
  });

  test('debe devolver 404 cuando la cita no existe', async () => {
    const response = await request(app)
      .get('/api/appointments/id-inexistente');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Cita no encontrada.');
  });

  test('debe actualizar una cita existente', async () => {
    const creationResponse = await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    const id = creationResponse.body.data.id;

    const response = await request(app)
      .put(`/api/appointments/${id}`)
      .send({
        clientName: 'María López',
        phone: '0991234567',
        service: 'Manicure',
        date: '2030-08-21',
        time: '11:00'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe('Manicure');
    expect(response.body.data.date).toBe('2030-08-21');
    expect(response.body.data.time).toBe('11:00');
  });

  test('debe devolver 404 al actualizar una cita inexistente', async () => {
    const response = await request(app)
      .put('/api/appointments/id-inexistente')
      .send(validAppointment);

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Cita no encontrada.');
  });

  test('debe impedir actualizar una cita hacia un horario ocupado', async () => {
    const firstResponse = await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    await request(app)
      .post('/api/appointments')
      .send({
        ...validAppointment,
        clientName: 'Ana Pérez',
        phone: '0987654321',
        date: '2030-08-21',
        time: '11:00'
      });

    const firstId = firstResponse.body.data.id;

    const response = await request(app)
      .put(`/api/appointments/${firstId}`)
      .send({
        ...validAppointment,
        date: '2030-08-21',
        time: '11:00'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('ocupado');
  });

  test('debe cancelar una cita', async () => {
    const creationResponse = await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    const id = creationResponse.body.data.id;

    const cancellationResponse = await request(app)
      .patch(`/api/appointments/${id}/cancel`);

    expect(cancellationResponse.statusCode).toBe(200);
    expect(cancellationResponse.body.success).toBe(true);
    expect(cancellationResponse.body.data.status).toBe('cancelada');
  });

  test('debe devolver 404 al cancelar una cita inexistente', async () => {
    const response = await request(app)
      .patch('/api/appointments/id-inexistente/cancel');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Cita no encontrada.');
  });

  test('debe indicar que un horario está disponible', async () => {
    const response = await request(app)
      .get('/api/appointments/availability')
      .query({
        date: '2030-08-20',
        time: '10:00'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.available).toBe(true);
  });

  test('debe indicar que un horario está ocupado', async () => {
    await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    const response = await request(app)
      .get('/api/appointments/availability')
      .query({
        date: validAppointment.date,
        time: validAppointment.time
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.available).toBe(false);
  });

  test('debe rechazar una consulta de disponibilidad incompleta', async () => {
    const response = await request(app)
      .get('/api/appointments/availability')
      .query({
        date: '2030-08-20'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      'fecha y una hora'
    );
  });

  test('una cita cancelada debe liberar el horario', async () => {
    const creationResponse = await request(app)
      .post('/api/appointments')
      .send(validAppointment);

    const id = creationResponse.body.data.id;

    await request(app)
      .patch(`/api/appointments/${id}/cancel`);

    const newAppointmentResponse = await request(app)
      .post('/api/appointments')
      .send({
        ...validAppointment,
        clientName: 'Nueva Cliente',
        phone: '0976543210'
      });

    expect(newAppointmentResponse.statusCode).toBe(201);
    expect(newAppointmentResponse.body.success).toBe(true);
  });
});