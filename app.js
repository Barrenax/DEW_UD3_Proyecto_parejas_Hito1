const MIN_PAREJAS = 4;
const MAX_PAREJAS = 12;
const CLAVE = 'parejas.partida'; // única clave que usa la aplicación
let cartas = []; // las cartas de la partida actual (global, para usarlas desde la consola)

/**

//Comprueba que el número esté entre 4 y 12 y sea entero.

* @param {number} n
 * @returns {boolean}
 */
function esNumeroValido(n) {
  return Number.isInteger(n) && n >= MIN_PAREJAS && n <= MAX_PAREJAS;
}

/**

// Pregunta el numero de parejas hasta que sea valido

* @returns {number} 
 */
function pedirParejas() {
  while (true) {
    const texto = prompt(`¿Cuantas parejas quieres? (entre ${MIN_PAREJAS} y ${MAX_PAREJAS})`);
    if (texto === null) {
      return null;
    }
    const numero = Number(texto.trim());
    if (esNumeroValido(numero)) {
      return numero;
    }
    console.error(`"${texto}" no es valido.`);
  }
}

/**
 * Crea dos cartas por cada pareja.
 * @param {number} numParejas
 * @returns {object[]} Las cartas, en orden.
 */
function generarCartas(numParejas) {
  const cartas = [];
  for (let numero = 1; numero <= numParejas; numero++) {
    cartas.push({ numero: numero, descubierta: true });
    cartas.push({ numero: numero, descubierta: true });
  }
  return cartas;
}

/**
 * Baraja el array con el algoritmo fisher yates (ayuda con ia porque no entendia lo de fisher yates)
 * @param {Array} array
 * @returns {Array} El mismo array, barajado.
 */
function barajar(array) {
  for (let i = array.length - 1; i >= 1; i--) {
    const pos = Math.floor(Math.random() * (i + 1));
    const temporal = array[i];
    array[i] = array[pos];
    array[pos] = temporal;
  }
  return array;
}



/**
  
 //Dibuja las cartas en una tabla dentro de <main id="tablero"> (Ayuda con Ia)
 
 * @param {object[]} cartas
 */
function mostrarTabla(cartas) {
  const columnas = Math.floor(Math.sqrt(cartas.length));
  const filas = Math.ceil(cartas.length / columnas);

  let html = '<table border="1" cellpadding="8">';
  for (let fila = 0; fila < filas; fila++) {
    html += '<tr>';
    for (let columna = 0; columna < columnas; columna++) {
      const posicion = fila * columnas + columna;
      if (posicion < cartas.length) {
        if (cartas[posicion].descubierta) {
          html += `<td>${cartas[posicion].numero}</td>`;
        } else {
          html += '<td>X</td>';  //para ocultar la carta por una x
        }
      }
    }
    html += '</tr>';
  }
  html += '</table>';

  document.getElementById('tablero').innerHTML = html;
}



/**

//Recupera la ultima partida o crea una nueva y la muestra (Uso de ia)

*/
function iniciarPartida() {
  let partida = cargar(CLAVE, null);

  if (partida !== null) {
    console.log('Partida recuperada.');
  } else {
    const numParejas = pedirParejas();
    if (numParejas === null) {
      console.warn('Partida cancelada.');
      return;
    }
    partida = { numParejas: numParejas, cartas: barajar(generarCartas(numParejas)) };
    guardar(CLAVE, partida);
    console.log('Partida nueva guardada.');
  }

  let secuencia = '';
  for (const carta of partida.cartas) {
    secuencia += carta.numero + ' ';
  }
  console.log(`${partida.numParejas} parejas, ${partida.cartas.length} cartas`);
  console.log(secuencia.trim());

  cartas = partida.cartas;
  ocultarCartas(cartas);
  mostrarTabla(cartas);
}


// Función ocultar la carta con una x 


function ocultarCartas(cartas) {
  for (const carta of cartas) {
    carta.descubierta = false;
  }
}


// Función que, eligiendo la fila y la columna, revela la carta (en la tabla y por consola)
// Uso desde la consola: revelarCarta(2, 3)
function revelarCarta(fila, columna) {
  const columnas = Math.floor(Math.sqrt(cartas.length));
  const posicion = (fila - 1) * columnas + (columna - 1);
  cartas[posicion].descubierta = true;
  console.log(cartas[posicion].numero);
  mostrarTabla(cartas);
}

//Iniciar parida y ocultar las cartas o mostar la tabla
iniciarPartida();












// almacenar la ultima partida con un json (uso de ia)

/**
 * @param {string} clave - Nombre con el que se guarda.
 * @param {unknown} valor - Lo que se quiere guardar.
 * @returns {boolean} true si se ha guardado.
 */
function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.error('No se pudo guardar', clave, error);
    return false;
  }
}



/**
 * Lee el valor guardado.
 * @param {string} clave - clave con la que se guardó.
 * @param {unknown} porDefecto - Valor que se devuelve si no hay nada guardado.
 * @returns {unknown}
 */
function cargar(clave, porDefecto) {
  const texto = localStorage.getItem(clave);
  return texto == null ? porDefecto : JSON.parse(texto);
}
