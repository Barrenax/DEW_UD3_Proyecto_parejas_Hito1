const MIN_PAREJAS = 4;
const MAX_PAREJAS = 12;
const CLAVE = 'parejas.partida.hito2'; // única clave que usa la aplicación (nueva: no mezcla partidas de versiones anteriores)
const cartas = []; // las cartas de la partida actual

// Carta: avisa a sus observadores cuando pasa de boca abajo a boca arriba ( usando patron observador, ayuda con ia)
class Carta {
  #numero;
  #descubierta;
  #observadores = []; // funciones a las que se avisa

  constructor(numero, descubierta = false) {
    this.#numero = numero;
    this.#descubierta = descubierta;
  }

  get numero() { return this.#numero; }
  get descubierta() { return this.#descubierta; }

  set descubierta(valor) {
    const estabaOculta = !this.#descubierta;
    this.#descubierta = valor;
    if (estabaOculta & valor) {
      for (const funcion of this.#observadores) funcion(); // ha pasado de false a true
    }
  }

  suscribir(funcion) { this.#observadores.push(funcion); }

  // Así se guarda la carta en localStorage
  toJSON() { return { numero: this.#numero, descubierta: this.#descubierta }; }
}

// Contador de volteos (patron Singleton osea que solo puede existir uno y le pedí a la ia, como hacer que fuese sigleton)
class Contador {
  static #instancia = null;
  #valor = 0;

  constructor() {
    if (Contador.#instancia) throw new Error('Ya existe un Contador');
    Contador.#instancia = this;
  }

  get valor() { return this.#valor; }
  set valor(nuevo) { this.#valor = nuevo; }
  incrementar() { this.#valor += 1; }
}

// Temporizador (patron Singleton osea que solo puede existir uno)
class Temporizador {
  static #instancia = null;
  #segundos = 0;
  #enMarcha = false;

  constructor() {
    if (Temporizador.#instancia) throw new Error('Ya existe un Temporizador');
    Temporizador.#instancia = this;
  }

  get segundos() { return this.#segundos; }
  set segundos(nuevo) { this.#segundos = nuevo; }

  // Arranca el tiempo (si ya está en marcha, no hace nada)
  iniciar() {
    if (!this.#enMarcha) {
      this.#enMarcha = true;
      setInterval(() => { this.#segundos += 1; }, 1000);
    }
  }
}

const contador = new Contador(); // el único contador
const temporizador = new Temporizador(); // el único temporizador

// Baraja el array con el algoritmo fisher yates (ayuda con ia porque no entendia lo de fisher yates)
function barajar(array) {
  for (let i = array.length - 1; i >= 1; i--) {
    const pos = Math.floor(Math.random() * (i + 1));
    const temporal = array[i];
    array[i] = array[pos];
    array[pos] = temporal;
  }
}

// Dibuja las cartas en una tabla dentro de <main id="tablero"> y muestra los volteos y el tiempo (Ayuda con Ia)
function mostrar() {
  const columnas = Math.floor(Math.sqrt(cartas.length));
  let html = '<table border="1" cellpadding="8"><tr>';
  for (let i = 0; i < cartas.length; i++) {
    if (i > 0 & i % columnas == 0) html += '</tr><tr>'; // fila nueva
    html += `<td>${cartas[i].descubierta ? cartas[i].numero : 'X'}</td>`; // X = carta oculta
  }
  document.getElementById('tablero').innerHTML = html + '</tr></table>';
  document.getElementById('volteos').textContent = contador.valor;
  document.getElementById('tiempo').textContent = temporizador.segundos;
}

// Recupera la ultima partida o crea una nueva y la muestra (Uso de ia)
function iniciarPartida() {
  const guardada = JSON.parse(localStorage.getItem(CLAVE)); // null si no hay nada guardado

  if (guardada !== null) {
    // Al leer de localStorage las cartas son objetos normales osea se vuelven a crear como carta
    for (const dato of guardada.cartas) cartas.push(new Carta(dato.numero, dato.descubierta));
    contador.valor = guardada.volteos;
    temporizador.segundos = guardada.segundos; // no arranca hasta que se descubra una carta
  } else {
    let n = 0;
    while (!(Number.isInteger(n) & n >= MIN_PAREJAS & n <= MAX_PAREJAS)) {
      n = Number(prompt(`¿Cuantas parejas quieres? entre ${MIN_PAREJAS} y ${MAX_PAREJAS}`));
    }
    for (let numero = 1; numero <= n; numero++) cartas.push(new Carta(numero), new Carta(numero));
    barajar(cartas);
  }

  for (const carta of cartas) {
    carta.suscribir(() => contador.incrementar());
    carta.suscribir(() => temporizador.iniciar());
  }
  mostrar();
}

// Función que, eligiendo la fila y la columna, revela la carta (en la tabla y por consola)
// Uso desde la consola: revelarCarta(2, 3)
function revelarCarta(fila, columna) {
  const columnas = Math.floor(Math.sqrt(cartas.length));
  const carta = cartas[(fila - 1) * columnas + (columna - 1)];
  carta.descubierta = true;
  console.log(carta.numero);
  mostrar();
}

// Borra lo guardado y recarga la página: pregunta las parejas y todas las cartas salen con X
// Uso desde la consola: reiniciar()
function reiniciar() {
  cartas.length = 0; // así el guardado automático no vuelve a guardar la partida vieja
  localStorage.removeItem(CLAVE);
  location.reload();
}

iniciarPartida();
window.revelarCarta = revelarCarta; // el script es un módulo: se ponen en window para usarlas desde la consola
window.reiniciar = reiniciar;


// Cada medio segundo se actualiza la pantalla y se guarda la partida
setInterval(() => {
  mostrar();
  if (cartas.length > 0) {
    localStorage.setItem(CLAVE, JSON.stringify({ cartas: cartas, volteos: contador.valor, segundos: temporizador.segundos }));
  }
}, 500);