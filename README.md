Juego de parejas: qué hace el código

1. Qué hace el programa

Pregunta cuántas parejas quieres (de 4 a 12).

Crea las cartas (dos de cada número) y las baraja.

Las muestra en una tabla con una X (como si estuviesen boca abajo).

Con revelarCarta(fila, columna) en la consola, se revela la carta seleccionada.

Cuenta los volteos y el tiempo, y lo guarda todo en el navegador.

2. Las clases


Carta: Guarda el número y si está boca arriba o boca abajo. Avisa cuando se descubre.
Contador: Cuenta cuántas cartas se han descubierto.
Temporizador: Cuenta los segundos. Empieza al descubrir la primera carta.

Observador: cada Carta avisa al contador y al temporizador cuando pasa de boca abajo a boca arriba.
Singleton: solo puede existir un contador y un temporizador. Si intentas crear otro, da error.


3.Las funciones principales

pedirParejas: Pregunta el número de parejas hasta que sea válido.
generarCartas: Crea dos cartas por cada número.
barajar: Mezcla las cartas (algoritmo Fisher-Yates).
mostrarTabla: Dibuja la tabla: la X o el número de cada carta.
mostrarMarcador: Muestra los volteos y el tiempo.
guardarPartida: Guarda las cartas, los volteos y el tiempo.
iniciarPartida: Recupera la partida guardada o crea una nueva, y la muestra.

4. Cómo se guarda
Se usa localStorage, con la clave parejas.partida.v2.
Se guarda cada medio segundo.
Al recargar la página, todo sigue igual: las cartas, los volteos y el tiempo.


5.Comandos de la consola


revelarCarta(1, 1): Descubre la carta de la fila 1, columna 1 (empiezan en 1).
reiniciar(): Empieza una partida nueva, con todas las cartas con X.
borrarDatos(): Borra lo guardado. Después hay que recargar la página.
