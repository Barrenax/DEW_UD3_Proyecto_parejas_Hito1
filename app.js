const MIN_PAREJAS = 4;
const MAX_PAREJAS = 12;
const CLAVE = 'parejas.partida.v1'; // única clave que usa la aplicación (v2: ignora las partidas guardadas en versiones anteriores)
let cartas = []; // las cartas de la partida actual

// Carta: avisa a sus observadores cuando pasa de boca abajo a boca arriba ( usando patron observador, ayuda con ia)
class Carta {
  #numero;
  #descubierta;
  #observadores = []; // funciones a las que se avisa

  constructor(numero, descubierta = false) {
    this.#numero = numero;
    this.#descubierta = descubierta;
  }

  get numero() {
    return this.#numero;
  }

  get descubierta() {
    return this.#descubierta;
  }

  set descubierta(valor) {
    const estabaOculta = !this.#descubierta;
    this.#descubierta = valor;
    if (estabaOculta && valor) {
      this.#avisar(); // ha pasado de false a true
    }
  }

  suscribir(funcion) {
    this.#observadores.push(funcion);
  }

  #avisar() {
    for (const funcion of this.#observadores) {
      funcion();
    }
  }

  // Así se guarda la carta en localStorage
  toJSON() {
    return { numero: this.#numero, descubierta: this.#descubierta };
  }
}

// Contador de volteos (patron Singleton osea que solo puede existir uno y le pedí a la ia, como hacer que fuese sigleton)
class Contador {
  static #instancia = null;
  #valor = 0;

  constructor() {
    if (Contador.#instancia !== null) {
      throw new Error('Ya existe un Contador');
    }
    Contador.#instancia = this;
  }

  get valor() {
    return this.#valor;
  }

  set valor(nuevo) {
    this.#valor = nuevo;
  }

  incrementar() {
    this.#valor += 1;
  }
}

// Temporizador (patron Singleton osea que solo puede existir uno)
class Temporizador {
  static #instancia = null;
  #segundos = 0;
  #enMarcha = false;

  constructor() {
    if (Temporizador.#instancia !== null) {
      throw new Error('Ya existe un Temporizador');
    }
    Temporizador.#instancia = this;
  }

  get segundos() {
    return this.#segundos;
  }

  set segundos(nuevo) {
    this.#segundos = nuevo;
  }

  // Arranca el tiempo (si ya está en marcha, no hace nada)
  iniciar() {
    if (!this.#enMarcha) {
      this.#enMarcha = true;
      setInterval(() => {
        this.#segundos += 1;
      }, 1000);
    }
  }
}

const contador = new Contador(); // el único contador
const temporizador = new Temporizador(); // el único temporizador

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
    if (texto == null) {
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
    cartas.push(new Carta(numero));
    cartas.push(new Carta(numero));
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


    // Al leer de localStorage las cartas son objetos normales osea se vuelven a crear como carta
    const cartasLeidas = [];
    for (const dato of partida.cartas) {
      cartasLeidas.push(new Carta(dato.numero, dato.descubierta));
    }
    partida.cartas = cartasLeidas;
  } else {
    const numParejas = pedirParejas();
    if (numParejas == null) {
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
  contador.valor = partida.volteos ?? 0;
  temporizador.segundos = partida.segundos ?? 0; // no arranca hasta que se muestee una carta
  for (const carta of cartas) {
    carta.suscribir(() => contador.incrementar());
    carta.suscribir(() => temporizador.iniciar());
  }
  mostrarTabla(cartas);
  mostrarMarcador();
}

// Guarda la partida con los volteos y el tiempo
function guardarPartida() {
  if (cartas.length == 0) {
    return;
  }
  guardar(CLAVE, {
    numParejas: cartas.length / 2,
    cartas: cartas,
    volteos: contador.valor,
    segundos: temporizador.segundos,
  });
}

// Muestra los volteos y el tiempo en la página
function mostrarMarcador() {
  document.getElementById('volteos').textContent = contador.valor;
  document.getElementById('tiempo').textContent = temporizador.segundos;
}

// Reinicia la partida. Uso desde la consola: reiniciar()
// Borra lo guardado y recarga la página: pregunta las parejas y todas las cartas salen con X
function reiniciar() {
  cartas = [];
  localStorage.removeItem(CLAVE);
  location.reload();
}

// Borra lo guardado desde la consola: borrarDatos()
// La siguiente vez que se recargue la página pedirá los datos de una partida nueva
function borrarDatos() {
  cartas = [];
  localStorage.removeItem(CLAVE);
  console.log('Datos borrados. Recarga la página.');
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

// Para poder usarlas desde la consola aunque el script se cargue como modulo
window.revelarCarta = revelarCarta;
window.borrarDatos = borrarDatos;
window.reiniciar = reiniciar;

// Cada medio segundo se actualiza el marcador y se guarda
setInterval(() => {
  mostrarMarcador();
  guardarPartida();
}, 500);








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
//agregar que cuando se revele la carta, que no se vuelva a ocultar cuando se inicie la partida otra vez




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