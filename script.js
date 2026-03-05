// Datos base de películas con nombre, horario, precio en quetzales y poster
const movies = [
  {
    id: 1,
    title: 'Duna: Parte Dos',
    schedule: '18:30',
    priceGTQ: 55,
    releaseDate: '2024-03-01',
    rating: 'PG-13',
    poster: 'https://images.tokopedia.net/img/cache/500-square/VqbcmM/2024/6/11/617d072a-62ce-49ff-8998-4323278499e1.jpg'
  },
  {
    id: 2,
    title: 'Spider-Man: Across the Spider-Verse',
    schedule: '20:00',
    priceGTQ: 48,
    releaseDate: '2023-06-02',
    rating: 'PG',
    poster: 'https://image.tmdb.org/t/p/original/nGxUxi3PfXDRm7Vg95VBNgNM8yc.jpg'
  },
  {
    id: 3,
    title: 'Oppenheimer',
    schedule: '21:15',
    priceGTQ: 60,
    releaseDate: '2023-07-21',
    rating: 'R',
    poster: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2023/05/oppenheimer-poster.jpg'
  },
  {
    id: 4,
    title: 'Transformers: El despertar de las bestias',
    schedule: '1:15',
    priceGTQ: 60,
    releaseDate: '2023-06-09',
    rating: 'PG-13',
    poster: 'https://tse1.mm.bing.net/th/id/OIP.SvQm3rTDo_5l149vw7lNEwHaK-?rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    id: 5,
    title: 'It 2: Capítulo Dos',
    schedule: '1:15',
    priceGTQ: 60,
    releaseDate: '2019-09-06',
    rating: 'R',
    poster: 'https://image.tmdb.org/t/p/original/7Kg3QHaL0RCgwx0TppjGisFETAI.jpg'
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
const summaryRelease = document.getElementById('summaryRelease');
const summaryRating = document.getElementById('summaryRating');
const summarySeats = document.getElementById('summarySeats');
const summaryTotal = document.getElementById('summaryTotal');
const paymentForm = document.getElementById('paymentForm');
const cancelBtn = document.getElementById('cancelBtn');
const pdfBtn = document.getElementById('pdfBtn');
const paymentMethod = document.getElementById('paymentMethod');
const customerName = document.getElementById('customerName');
const customerEmail = document.getElementById('customerEmail');
const cardFields = document.getElementById('cardFields');
const transferFields = document.getElementById('transferFields');
const cardFullName = document.getElementById('cardFullName');
const cardNumber = document.getElementById('cardNumber');
const cardExpiry = document.getElementById('cardExpiry');
const cardCvv = document.getElementById('cardCvv');
const bankName = document.getElementById('bankName');
const transferReceipt = document.getElementById('transferReceipt');
const transferAmount = document.getElementById('transferAmount');

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
  paymentMethod.addEventListener('change', updatePaymentMethodUI);
  paymentForm.addEventListener('submit', onPayReservation);
  cancelBtn.addEventListener('click', cancelReservation);
  pdfBtn.addEventListener('click', generatePDF);
  customerName.addEventListener('input', sanitizeNameInput);
  cardNumber.addEventListener('input', sanitizeCardNumberInput);
  cardExpiry.addEventListener('input', sanitizeCardExpiryInput);
  cardCvv.addEventListener('input', () => {
    cardCvv.value = cardCvv.value.replace(/\D/g, '');
  });
  transferReceipt.addEventListener('input', () => {
    transferReceipt.value = transferReceipt.value.replace(/\D/g, '');
  });

  // Fallback visual si alguna URL de poster falla
  moviePoster.addEventListener('error', onPosterError);
  // Al hacer clic se abre el poster en un modal de tamaño completo
  moviePoster.addEventListener('click', openPosterModal);
  updatePaymentMethodUI();
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

  showAlert({
    icon: 'info',
    title: 'Película actualizada',
    text: 'Selecciona nuevamente tus asientos para esta función.',
    confirmButtonColor: '#14b8a6'
  });
}

// Alterna entre modo claro y oscuro
function toggleTheme() {
  document.body.classList.toggle('light');

  showAlert({
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
  return movies.find((movie) => movie.id === selectedMovieId) || movies[0];
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

// Convierte un monto en GTQ al valor numérico de la moneda seleccionada
function convertFromGTQ(gtqValue) {
  return currencySelect.value === 'USD' ? gtqValue * GTQ_TO_USD : gtqValue;
}

// Formatea fechas ISO a un formato legible en español
function formatReleaseDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Limpia caracteres numéricos en tiempo real para el campo de nombre
function sanitizeNameInput() {
  customerName.value = customerName.value.replace(/[0-9]/g, '');
}

// Verifica que el nombre tenga solo letras, espacios y separadores comunes
function isValidCustomerName(value) {
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;
  return nameRegex.test(value.trim());
}

// Total actual en quetzales según película y asientos seleccionados
function getCurrentTotalGTQ() {
  const movie = currentMovie();
  return selectedSeats.size * movie.priceGTQ;
}

// Identifica si el método de pago seleccionado es tarjeta
function isCardPayment(method) {
  return method === 'Tarjeta de crédito' || method === 'Tarjeta de débito';
}

// Ajusta visibilidad y requisitos de campos según método de pago
function updatePaymentMethodUI() {
  const method = paymentMethod.value;
  const showCard = isCardPayment(method);
  const showTransfer = method === 'Transferencia';

  cardFields.classList.toggle('is-hidden', !showCard);
  transferFields.classList.toggle('is-hidden', !showTransfer);

  cardFullName.required = showCard;
  cardNumber.required = showCard;
  cardExpiry.required = showCard;
  cardCvv.required = showCard;
  bankName.required = showTransfer;
  transferReceipt.required = showTransfer;

  if (showCard && !cardFullName.value.trim() && customerName.value.trim()) {
    cardFullName.value = customerName.value.trim();
  }

  updateTransferAmountField();
}

// Actualiza el monto de transferencia automáticamente desde el total
function updateTransferAmountField() {
  transferAmount.value = formatPrice(getCurrentTotalGTQ());
}

// Aplica formato 0000 0000 0000 0000 en número de tarjeta
function sanitizeCardNumberInput() {
  const digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
  cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

// Aplica formato MM/AA y valida caracteres permitidos
function sanitizeCardExpiryInput() {
  const digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    cardExpiry.value = digits;
    return;
  }
  cardExpiry.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// Valida datos mínimos de tarjeta antes de aprobar la reserva
function validateCardFields() {
  const cleanNumber = cardNumber.value.replace(/\s/g, '');
  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(cardExpiry.value);

  if (!isValidCustomerName(cardFullName.value)) {
    return 'Ingresa un nombre válido del titular de la tarjeta.';
  }

  if (cleanNumber.length !== 16) {
    return 'El número de tarjeta debe tener 16 dígitos.';
  }

  if (!expiryMatch) {
    return 'La fecha de expiración debe estar en formato MM/AA.';
  }

  const month = Number(expiryMatch[1]);
  if (month < 1 || month > 12) {
    return 'El mes de expiración no es válido.';
  }

  if (!/^\d{3,4}$/.test(cardCvv.value)) {
    return 'El CVV debe tener 3 o 4 dígitos.';
  }

  return '';
}

// Valida datos mínimos requeridos para transferencia
function validateTransferFields() {
  if (!bankName.value.trim()) return 'Ingresa el nombre del banco.';
  if (!/^\d{4,20}$/.test(transferReceipt.value)) {
    return 'El número de boleta debe contener entre 4 y 20 dígitos.';
  }
  return '';
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
  const totalGTQ = getCurrentTotalGTQ();

  // Actualiza zona informativa de la película
  movieInfo.innerHTML = `
    <strong>${movie.title}</strong><br>
    Horario: ${movie.schedule}<br>
    Estreno: ${formatReleaseDate(movie.releaseDate)}<br>
    Clasificación: ${movie.rating}<br>
    Precio por boleto: ${formatPrice(movie.priceGTQ)}
  `;

  // Muestra poster e identificación de la película
  moviePoster.src = movie.poster;
  moviePoster.alt = `Poster de ${movie.title}`;
  posterCaption.textContent = `Poster: ${movie.title}`;

  // Actualiza resumen de reserva
  summaryMovie.textContent = `Película: ${movie.title} (${movie.schedule})`;
  summaryRelease.textContent = `Estreno: ${formatReleaseDate(movie.releaseDate)}`;
  summaryRating.textContent = `Clasificación: ${movie.rating}`;
  summarySeats.textContent = `Asientos: ${selectedSeats.size} [${Array.from(selectedSeats).sort((a, b) => a - b).join(', ') || '-'}]`;
  summaryTotal.textContent = `Total: ${formatPrice(totalGTQ)}`;

  // Mantiene sincronizado el monto cuando el pago es por transferencia
  updateTransferAmountField();
}

// Valida datos y simula pago de reserva
function onPayReservation(event) {
  event.preventDefault();

  const movie = currentMovie();
  const totalGTQ = getCurrentTotalGTQ();

  // Validación: debe existir al menos un asiento seleccionado
  if (selectedSeats.size === 0) {
    showAlert({
      icon: 'warning',
      title: 'Sin asientos seleccionados',
      text: 'Debes seleccionar al menos un asiento para reservar.'
    });
    return;
  }

  // Validación básica de campos del formulario
  if (!paymentMethod.value || !customerName.value.trim() || !customerEmail.value.trim()) {
    showAlert({
      icon: 'error',
      title: 'Datos incompletos',
      text: 'Completa método de pago, nombre y correo.'
    });
    return;
  }

  // Validación para impedir nombres con números o caracteres inválidos
  if (!isValidCustomerName(customerName.value)) {
    showAlert({
      icon: 'error',
      title: 'Nombre inválido',
      text: 'El nombre solo puede contener letras y espacios.'
    });
    return;
  }

  // Validación condicional por tipo de pago seleccionado
  if (isCardPayment(paymentMethod.value)) {
    const cardError = validateCardFields();
    if (cardError) {
      showAlert({
        icon: 'error',
        title: 'Tarjeta inválida',
        text: cardError
      });
      return;
    }
  }

  if (paymentMethod.value === 'Transferencia') {
    const transferError = validateTransferFields();
    if (transferError) {
      showAlert({
        icon: 'error',
        title: 'Transferencia inválida',
        text: transferError
      });
      return;
    }
  }

  let paymentDetail = '';
  if (isCardPayment(paymentMethod.value)) {
    paymentDetail = `Titular: <b>${escapeHtml(cardFullName.value.trim())}</b><br>Tarjeta: <b>**** **** **** ${cardNumber.value.replace(/\s/g, '').slice(-4)}</b>`;
  } else if (paymentMethod.value === 'Transferencia') {
    paymentDetail = `Banco: <b>${escapeHtml(bankName.value.trim())}</b><br>Boleta: <b>${escapeHtml(transferReceipt.value)}</b><br>Monto transferido: <b>${escapeHtml(transferAmount.value)}</b>`;
  }

  showAlert({
    icon: 'success',
    title: 'Pago aprobado',
    html: `
      Cliente: <b>${escapeHtml(customerName.value.trim())}</b><br>
      Película: <b>${movie.title}</b><br>
      Método: <b>${escapeHtml(paymentMethod.value)}</b><br>
      ${paymentDetail ? `${paymentDetail}<br>` : ''}
      Asientos: <b>${Array.from(selectedSeats).sort((a, b) => a - b).join(', ')}</b><br>
      Total pagado: <b>${formatPrice(totalGTQ)}</b>
    `,
    confirmButtonColor: '#14b8a6'
  });
}

// Permite cancelar toda la reserva con confirmación
function cancelReservation() {
  if (selectedSeats.size === 0 && !customerName.value && !customerEmail.value && !paymentMethod.value) {
    showAlert({
      icon: 'info',
      title: 'Nada que cancelar',
      text: 'No hay datos de reserva para limpiar.'
    });
    return;
  }

  showConfirm({
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
    updatePaymentMethodUI();
    refreshUI();

    showAlert({
      icon: 'success',
      title: 'Reserva cancelada',
      text: 'Los datos fueron limpiados correctamente.',
      timer: 1300,
      showConfirmButton: false
    });
  });
}

// Genera un boleto PDF con datos actuales de la reserva
async function generatePDF() {
  const movie = currentMovie();
  const seats = Array.from(selectedSeats).sort((a, b) => a - b);
  const totalGTQ = selectedSeats.size * movie.priceGTQ;

  // Se requiere una reserva válida para exportar el boleto
  if (selectedSeats.size === 0) {
    showAlert({
      icon: 'warning',
      title: 'Sin datos para PDF',
      text: 'Selecciona asientos y realiza una reserva primero.'
    });
    return;
  }

  // Se valida disponibilidad de la librería antes de usarla
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showAlert({
      icon: 'error',
      title: 'Error al generar PDF',
      text: 'No se cargó la librería jsPDF. Revisa tu conexión e inténtalo de nuevo.'
    });
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let y = 14;

  // Fondo y marco principal con estilo de factura
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1.2);
  doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

  // Franja superior de color
  doc.setFillColor(22, 163, 74);
  doc.rect(6, 6, pageWidth - 12, 10, 'F');

  // Imagen del poster en la parte superior (si está disponible)
  const posterDataUrl = await loadImageAsDataUrl(moviePoster.src || movie.poster);
  if (posterDataUrl) {
    try {
      const imageFormat = detectImageFormat(posterDataUrl);
      doc.addImage(posterDataUrl, imageFormat, margin, y, pageWidth - margin * 2, 60);
      y += 66;
    } catch (error) {
      y += 8;
    }
  } else {
    y += 8;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FACTURA DE RESERVA DE CINE', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, margin, y);
  doc.text(`N° Factura: CINE-${Date.now().toString().slice(-6)}`, pageWidth - 72, y);
  y += 8;

  // Bloque de datos del cliente
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 24);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del cliente', margin + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${customerName.value.trim() || 'N/D'}`, margin + 3, y + 13);
  doc.text(`Correo: ${customerEmail.value.trim() || 'N/D'}`, margin + 3, y + 19);
  doc.text(`Pago: ${paymentMethod.value || 'N/D'}`, pageWidth / 2 + 5, y + 13);
  y += 30;

  // Bloque de datos de la película
  doc.rect(margin, y, pageWidth - margin * 2, 28);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de función', margin + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Película: ${movie.title}`, margin + 3, y + 13);
  doc.text(`Horario: ${movie.schedule}`, margin + 3, y + 19);
  doc.text(`Estreno: ${formatReleaseDate(movie.releaseDate)}`, pageWidth / 2 + 5, y + 13);
  doc.text(`Clasificación: ${movie.rating}`, pageWidth / 2 + 5, y + 19);
  y += 36;

  // Tabla tipo factura
  const unitPrice = convertFromGTQ(movie.priceGTQ);
  const subtotal = unitPrice * selectedSeats.size;
  const symbol = currencySelect.value === 'USD' ? '$' : 'Q';
  const totalText = `${symbol}${subtotal.toFixed(2)}`;
  const seatsText = seats.join(', ');

  doc.setFillColor(22, 163, 74);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Descripción', margin + 3, y + 5.5);
  doc.text('Cant.', 128, y + 5.5);
  doc.text('P. Unit.', 146, y + 5.5);
  doc.text('Subtotal', 172, y + 5.5);
  y += 8;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.rect(margin, y, pageWidth - margin * 2, 16);
  doc.text(`Boletos - Asientos: ${seatsText}`, margin + 3, y + 6);
  doc.text(`Clasificación ${movie.rating} | Estreno ${formatReleaseDate(movie.releaseDate)}`, margin + 3, y + 12);
  doc.text(String(selectedSeats.size), 130, y + 9);
  doc.text(`${symbol}${unitPrice.toFixed(2)}`, 146, y + 9);
  doc.text(totalText, 172, y + 9);
  y += 22;

  // Totales
  doc.setFont('helvetica', 'bold');
  doc.setDrawColor(15, 23, 42);
  doc.rect(pageWidth - 72, y, 60, 18);
  doc.text('TOTAL', pageWidth - 68, y + 7);
  doc.setFontSize(13);
  doc.text(totalText, pageWidth - 32, y + 14, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Gracias por tu compra. Presenta esta factura al ingresar.', margin, pageHeight - 20);

  doc.save(`factura-${movie.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);

  showAlert({
    icon: 'success',
    title: 'PDF generado',
    text: 'Tu boleto fue descargado correctamente.'
  });
}

// Fallback para poster principal cuando la imagen no se puede cargar
function onPosterError() {
  const movie = currentMovie();
  moviePoster.src = buildFallbackPoster(movie.title);
}

// Abre el poster actual en un modal con vista ampliada
function openPosterModal() {
  const movie = currentMovie();
  const imageSrc = moviePoster.src || movie.poster;

  if (window.Swal && typeof window.Swal.fire === 'function') {
    window.Swal.fire({
      title: movie.title,
      imageUrl: imageSrc,
      imageAlt: `Poster ampliado de ${movie.title}`,
      showCloseButton: true,
      showConfirmButton: false,
      width: 'min(92vw, 900px)',
      background: '#0f172a',
      color: '#f8fafc'
    });
    return;
  }

  window.open(imageSrc, '_blank', 'noopener,noreferrer');
}

// Descarga una imagen y la convierte a DataURL para incrustarla en el PDF
async function loadImageAsDataUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return null;
  }
}

// Detecta el formato de una imagen DataURL para usarlo con jsPDF
function detectImageFormat(dataUrl) {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
}

// Crea una imagen SVG embebida para usar como poster de respaldo
function buildFallbackPoster(title) {
  const safeTitle = escapeXml(title);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='700' height='1000'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='#1f2937'/><stop offset='100%' stop-color='#0f766e'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='38'>Poster no disponible</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='#bbf7d0' font-family='Arial' font-size='32'>${safeTitle}</text></svg>`)}`;
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

// Escapa caracteres XML para incrustarlos de forma segura en SVG
function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

// Muestra alertas con SweetAlert2 y usa fallback si la librería no carga
function showAlert(config) {
  if (window.Swal && typeof window.Swal.fire === 'function') {
    return window.Swal.fire(config);
  }

  const message = config.text || config.title || 'Mensaje';
  window.alert(message);
  return Promise.resolve({});
}

// Diálogo de confirmación con fallback para evitar romper la ejecución
function showConfirm(config) {
  if (window.Swal && typeof window.Swal.fire === 'function') {
    return window.Swal.fire(config);
  }

  const message = config.text || config.title || 'Confirmar acción';
  const accepted = window.confirm(message);
  return Promise.resolve({ isConfirmed: accepted });
}
