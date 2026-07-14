const form = document.getElementById('appointment-form');
const appointmentsContainer = document.getElementById('appointments');
const message = document.getElementById('message');
const refreshButton = document.getElementById('refresh-button');

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

async function loadAppointments() {
  appointmentsContainer.innerHTML = '<p>Cargando citas...</p>';

  try {
    const response = await fetch('/api/appointments');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    if (result.data.length === 0) {
      appointmentsContainer.innerHTML =
        '<p>No existen citas registradas.</p>';
      return;
    }

    appointmentsContainer.innerHTML = result.data
      .map((appointment) => {
        const cancelledClass =
          appointment.status === 'cancelada' ? 'cancelled' : '';

        const cancelButton =
          appointment.status !== 'cancelada'
            ? `<button onclick="cancelAppointment('${appointment.id}')">
                 Cancelar
               </button>`
            : '';

        return `
          <div class="appointment ${cancelledClass}">
            <div>
              <h3>${appointment.clientName}</h3>
              <p><strong>Servicio:</strong> ${appointment.service}</p>
              <p>
                <strong>Fecha:</strong> ${appointment.date}
                a las ${appointment.time}
              </p>
              <p><strong>Estado:</strong> ${appointment.status}</p>
            </div>
            ${cancelButton}
          </div>
        `;
      })
      .join('');
  } catch (error) {
    appointmentsContainer.innerHTML =
      `<p>No se pudieron cargar las citas: ${error.message}</p>`;
  }
}

async function cancelAppointment(id) {
  const confirmed = window.confirm(
    '¿Está seguro de que desea cancelar esta cita?'
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `/api/appointments/${id}/cancel`,
      {
        method: 'PATCH'
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    await loadAppointments();
  } catch (error) {
    window.alert(error.message);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const appointment = {
    clientName: form.clientName.value,
    phone: form.phone.value,
    service: form.service.value,
    date: form.date.value,
    time: form.time.value
  };

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointment)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    showMessage('Cita registrada correctamente.', 'success');
    form.reset();
    await loadAppointments();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

refreshButton.addEventListener('click', loadAppointments);

window.cancelAppointment = cancelAppointment;

loadAppointments();