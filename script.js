// Datos base de películas con nombre, horario, precio en quetzales y poster
const movies = [
  {
    id: 1,
    title: 'Duna: Parte Dos',
    schedule: '18:30',
    priceGTQ: 55,
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 2,
    title: 'Spider-Man: Across the Spider-Verse',
    schedule: '20:00',
    priceGTQ: 48,
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 3,
    title: 'Oppenheimer',
    schedule: '21:15',
    priceGTQ: 60,
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'
  }
];

// Tipo de cambio fijo para mostrar precios en dólares (puedes ajustarlo)
const GTQ_TO_USD = 0.128;

// Referencias a elementos del DOM para mantener código limpio
const movieSelect = document.getElementById('movieSelect');
const currencySelect = document.getElementById('currencySelect');
const themeToggle = document.getElementById('themeToggle');
const movieInfo = document.getElementById('movieInfo');
const moviePoster = document.getElementById('moviePoster');
const posterCaption = document.getElementById('posterCaption');
const seatsContainer = document.getElementById('seatsContainer');
const summaryMovie = document.getElementById('summaryMovie');
const summarySeats = document.getElementById('summarySeats');
const summaryTotal = document.getElementById('summaryTotal');
const paymentForm = document.getElementById('paymentForm');
const cancelBtn = document.getElementById('cancelBtn');
const pdfBtn = document.getElementById('pdfBtn');
const paymentMethod = document.getElementById('paymentMethod');
const customerName = document.getElementById('customerName');
const customerEmail = document.getElementById('customerEmail');

// Estado global de la reserva actual
let selectedMovieId = movies[0].id;
let selectedSeats = new Set();

// Asientos ocupados simulados para hacer más real la interacción
const occupiedSeats = new Set([2, 3, 9, 15, 18, 23, 29, 32]);

// Inicialización principal al cargar la página
init();

function init() {
  renderMovies();
  renderSeats();
  refreshUI();

  // Eventos de controles principales
  movieSelect.addEventListener('change', onMovieChange);
  currencySelect.addEventListener('change', refreshUI);
  themeToggle.addEventListener('click', toggleTheme);
  paymentForm.addEventListener('submit', onPayReservation);
  cancelBtn.addEventListener('click', cancelReservation);
  pdfBtn.addEventListener('click', generatePDF);
}

// Llena el select de películas con texto descriptivo
function renderMovies() {
  movieSelect.innerHTML = '';

  movies.forEach((movie) => {
    const option = document.createElement('option');
    option.value = movie.id;
    option.textContent = `${movie.title} - ${movie.schedule}`;
    movieSelect.appendChild(option);
  });

  movieSelect.value = selectedMovieId;
}

// Dibuja una grilla de 40 asientos (8 columnas x 5 filas)
function renderSeats() {
  seatsContainer.innerHTML = '';

  for (let seatNumber = 1; seatNumber <= 40; seatNumber += 1) {
    const seat = document.createElement('button');
    seat.type = 'button';
    seat.className = 'seat';
    seat.dataset.seat = String(seatNumber);
    seat.title = `Asiento ${seatNumber}`;
    seat.setAttribute('aria-label', `Asiento ${seatNumber}`);

    // Marcamos asientos ocupados que no se pueden seleccionar
    if (occupiedSeats.has(seatNumber)) {
      seat.classList.add('occupied');
      seat.disabled = true;
    }

    // Al hacer clic se selecciona/deselecciona el asiento
    seat.addEventListener('click', () => toggleSeat(seatNumber));

    seatsContainer.appendChild(seat);
  }
}

// Selecciona o quita un asiento del conjunto de compra
function toggleSeat(seatNumber) {
  if (selectedSeats.has(seatNumber)) {
    selectedSeats.delete(seatNumber);
  } else {
    selectedSeats.add(seatNumber);
  }

  refreshUI();
}

// Ejecuta cambios al elegir película y reinicia asientos para evitar confusiones
function onMovieChange() {
  selectedMovieId = Number(movieSelect.value);
  selectedSeats = new Set();
  refreshUI();

  Swal.fire({
    icon: 'info',
    title: 'Película actualizada',
    text: 'Selecciona nuevamente tus asientos para esta función.',
    confirmButtonColor: '#14b8a6'
  });
}

// Alterna entre modo claro y oscuro
function toggleTheme() {
  document.body.classList.toggle('light');

  Swal.fire({
    icon: 'success',
    title: 'Tema cambiado',
    text: document.body.classList.contains('light')
      ? 'Modo claro activado.'
      : 'Modo oscuro activado.',
    timer: 1200,
    showConfirmButton: false
  });
}

// Devuelve la película actualmente seleccionada
function currentMovie() {
  return movies.find((movie) => movie.id === selectedMovieId);
}

// Formatea montos según la moneda elegida
function formatPrice(gtqValue) {
  const currency = currencySelect.value;

  if (currency === 'USD') {
    const usd = gtqValue * GTQ_TO_USD;
    return `$${usd.toFixed(2)}`;
  }

  return `Q${gtqValue.toFixed(2)}`;
}

// Recalcula y pinta toda la interfaz relacionada al estado actual
function refreshUI() {
  const movie = currentMovie();
  const seatElements = seatsContainer.querySelectorAll('.seat');

  // Refresca estilos de asientos seleccionados
  seatElements.forEach((seat) => {
    const number = Number(seat.dataset.seat);
    seat.classList.toggle('selected', selectedSeats.has(number));
  });

  // Cálculo de total según número de boletos
  const totalGTQ = selectedSeats.size * movie.priceGTQ;

  // Actualiza zona informativa de la película
  movieInfo.innerHTML = `
    <strong>${movie.title}</strong><br>
    Horario: ${movie.schedule}<br>
    Precio por boleto: ${formatPrice(movie.priceGTQ)}
  `;

  // Muestra poster e identificación de la película
  moviePoster.src = movie.poster;
  posterCaption.textContent = `Poster: ${movie.title}`;

  // Actualiza resumen de reserva
  summaryMovie.textContent = `Película: ${movie.title} (${movie.schedule})`;
  summarySeats.textContent = `Asientos: ${selectedSeats.size} [${Array.from(selectedSeats).sort((a, b) => a - b).join(', ') || '-'}]`;
  summaryTotal.textContent = `Total: ${formatPrice(totalGTQ)}`;
}

// Valida datos y simula pago de reserva
function onPayReservation(event) {
  event.preventDefault();

  const movie = currentMovie();
  const totalGTQ = selectedSeats.size * movie.priceGTQ;

  // Validación: debe existir al menos un asiento seleccionado
  if (selectedSeats.size === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin asientos seleccionados',
      text: 'Debes seleccionar al menos un asiento para reservar.'
    });
    return;
  }

  // Validación básica de campos del formulario
  if (!paymentMethod.value || !customerName.value.trim() || !customerEmail.value.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Datos incompletos',
      text: 'Completa método de pago, nombre y correo.'
    });
    return;
  }

  Swal.fire({
    icon: 'success',
    title: 'Pago aprobado',
    html: `
      Cliente: <b>${escapeHtml(customerName.value.trim())}</b><br>
      Película: <b>${movie.title}</b><br>
      Asientos: <b>${Array.from(selectedSeats).sort((a, b) => a - b).join(', ')}</b><br>
      Total pagado: <b>${formatPrice(totalGTQ)}</b>
    `,
    confirmButtonColor: '#14b8a6'
  });
}

// Permite cancelar toda la reserva con confirmación
function cancelReservation() {
  if (selectedSeats.size === 0 && !customerName.value && !customerEmail.value && !paymentMethod.value) {
    Swal.fire({
      icon: 'info',
      title: 'Nada que cancelar',
      text: 'No hay datos de reserva para limpiar.'
    });
    return;
  }

  Swal.fire({
    icon: 'question',
    title: 'Cancelar reserva',
    text: 'Se perderá la selección de asientos y datos del formulario.',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No'
  }).then((result) => {
    if (!result.isConfirmed) return;

    selectedSeats = new Set();
    paymentForm.reset();
    refreshUI();

    Swal.fire({
      icon: 'success',
      title: 'Reserva cancelada',
      text: 'Los datos fueron limpiados correctamente.',
      timer: 1300,
      showConfirmButton: false
    });
  });
}

// Genera un boleto PDF con datos actuales de la reserva
function generatePDF() {
  const movie = currentMovie();
  const seats = Array.from(selectedSeats).sort((a, b) => a - b);
  const totalGTQ = selectedSeats.size * movie.priceGTQ;

  // Se requiere una reserva válida para exportar el boleto
  if (selectedSeats.size === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin datos para PDF',
      text: 'Selecciona asientos y realiza una reserva primero.'
    });
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Boleto de Cine', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Cliente: ${customerName.value.trim() || 'N/D'}`, 20, 35);
  doc.text(`Correo: ${customerEmail.value.trim() || 'N/D'}`, 20, 44);
  doc.text(`Pelicula: ${movie.title}`, 20, 53);
  doc.text(`Horario: ${movie.schedule}`, 20, 62);
  doc.text(`Asientos: ${seats.join(', ')}`, 20, 71);
  doc.text(`Metodo de pago: ${paymentMethod.value || 'N/D'}`, 20, 80);
  doc.text(`Total: ${formatPrice(totalGTQ)}`, 20, 89);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 98);

  doc.save(`boleto-${movie.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);

  Swal.fire({
    icon: 'success',
    title: 'PDF generado',
    text: 'Tu boleto fue descargado correctamente.'
  });
}

// Escapa caracteres peligrosos para evitar inyección en HTML de alertas
function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
