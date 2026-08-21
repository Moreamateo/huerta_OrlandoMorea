// ---- Funcionalidad 1: checklist de cronograma con barra de progreso ----
const tareas = document.querySelectorAll('#listaTareas .tarea');
const progresoFill = document.getElementById('progresoFill');
const progresoTxt = document.getElementById('progresoTxt');
const progresoPct = document.getElementById('progresoPct');

function actualizarProgreso(){
  const total = tareas.length;
  const completas = document.querySelectorAll('#listaTareas .tarea.done').length;
  const pct = Math.round((completas / total) * 100);
  progresoFill.style.width = pct + '%';
  progresoTxt.textContent = completas + ' / ' + total + ' tareas completadas';
  progresoPct.textContent = pct + '%';
}

tareas.forEach(tarea => {
  tarea.addEventListener('click', () => {
    tarea.classList.toggle('done');
    actualizarProgreso();
  });
});

actualizarProgreso();

// ---- Funcionalidad 2 y 3: humedad simulada en el tiempo + cronograma de riego ----
// Variable propia del grupo: se arma leyendo lo cargado en las tarjetas
// de "Especies cultivadas" (punto 1), no un cronograma inventado aparte.
const bitacoraCultivosMiramar = Array.from(document.querySelectorAll('.cultivo')).map(card => {
  const diasEntreRiegos = parseInt(card.dataset.riegoDias, 10);
  const hoy = new Date();
  const proximaFecha = new Date(hoy);
  proximaFecha.setDate(hoy.getDate() + diasEntreRiegos);

  return {
    card,
    zona: card.querySelector('.zona-tag').textContent.trim(),
    nombre: card.querySelector('h3').textContent.trim(),
    diasEntreRiegos,
    humedad: parseInt(card.dataset.humedad, 10),
    regando: false,        // si está subiendo porque se activó el riego
    objetivoRiego: 0,      // hasta dónde sube antes de cortar (cerca del 90%)
    proximaFecha
  };
});

function pintarHumedad(cultivo) {
  const fill = cultivo.card.querySelector('.humedad-fill');
  const texto = cultivo.card.querySelector('.valor');
  fill.style.width = cultivo.humedad + '%';
  fill.style.background = cultivo.humedad < 40 ? '#c9683f' : 'var(--water)';
  texto.textContent = cultivo.humedad + '%';
}

function renderCronograma() {
  const riegoLista = document.getElementById('riegoLista');
  if (!riegoLista) return;
  riegoLista.innerHTML = '';
  bitacoraCultivosMiramar.forEach(cultivo => {
    const fecha = cultivo.proximaFecha.toLocaleDateString('es-AR');
    const item = document.createElement('li');
    item.innerHTML =
      '<span class="zona">' + cultivo.zona + '</span>' +
      '<strong>' + cultivo.nombre + '</strong>' +
      '<span class="detalle">Cada <b>' + cultivo.diasEntreRiegos + ' día(s)</b> · próximo riego: <b>' + fecha + '</b></span>';
    riegoLista.appendChild(item);
  });
}

function regarHuerta() {
  console.log('=== Cronograma de riego · Huerta Escolar Inteligente y Solidaria ===');
  bitacoraCultivosMiramar.forEach(cultivo => {
    console.log(
      cultivo.zona + ' · ' + cultivo.nombre +
      ': regar cada ' + cultivo.diasEntreRiegos + ' día(s)' +
      ' → próximo riego: ' + cultivo.proximaFecha.toLocaleDateString('es-AR')
    );
  });
  renderCronograma();
}

// Cada zona cambia su humedad "cada tanto" (intervalo aleatorio, no fijo).
// Cuando baja de 40% arranca el riego simulado, sube hasta un objetivo
// cercano al 90% y ahí se corta: en ese momento el cronograma avanza a
// la siguiente fecha de riego de esa zona.
function simularZona(cultivo) {
  if (cultivo.regando) {
    cultivo.humedad = Math.min(95, cultivo.humedad + (4 + Math.floor(Math.random() * 5)));
    if (cultivo.humedad >= cultivo.objetivoRiego) {
      cultivo.regando = false; // se corta el riego al llegar al objetivo
      cultivo.proximaFecha = new Date(cultivo.proximaFecha);
      cultivo.proximaFecha.setDate(cultivo.proximaFecha.getDate() + cultivo.diasEntreRiegos);
      regarHuerta(); // el cronograma pasa a su siguiente fecha
    }
  } else {
    cultivo.humedad = Math.max(15, cultivo.humedad - (2 + Math.floor(Math.random() * 4)));
    if (cultivo.humedad < 40) {
      cultivo.regando = true;
      cultivo.objetivoRiego = 85 + Math.floor(Math.random() * 6); // llega hasta ~85-90%
    }
  }
  pintarHumedad(cultivo);
  const proximaEspera = 3500 + Math.random() * 3000; // "cada tanto": nunca el mismo intervalo
  setTimeout(() => simularZona(cultivo), proximaEspera);
}

bitacoraCultivosMiramar.forEach(cultivo => {
  pintarHumedad(cultivo);
  // click manual: fuerza el inicio de un riego en esa zona
  cultivo.card.addEventListener('click', () => {
    if (!cultivo.regando) {
      cultivo.regando = true;
      cultivo.objetivoRiego = 85 + Math.floor(Math.random() * 6);
    }
  });
  setTimeout(() => simularZona(cultivo), 1500 + Math.random() * 2500);
});

regarHuerta();