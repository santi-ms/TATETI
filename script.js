const LINEAS_GANADORAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const tableroEl = document.getElementById("tablero");
const estadoEl = document.getElementById("estado");
const modoEl = document.getElementById("modo");
const puntosEls = {
  X: document.getElementById("puntosX"),
  O: document.getElementById("puntosO"),
  E: document.getElementById("puntosE"),
};

let tablero = Array(9).fill(null);
let turno = "X";
let terminado = false;
let bloqueado = false; // evita clicks mientras juega la CPU
const puntos = { X: 0, O: 0, E: 0 };

// Crear las 9 celdas
const celdas = tablero.map((_, i) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "celda";
  btn.setAttribute("aria-label", `Casilla ${i + 1}`);
  btn.addEventListener("click", () => jugarHumano(i));
  tableroEl.appendChild(btn);
  return btn;
});

function calcularGanador(t) {
  for (const linea of LINEAS_GANADORAS) {
    const [a, b, c] = linea;
    if (t[a] && t[a] === t[b] && t[a] === t[c]) {
      return { jugador: t[a], linea };
    }
  }
  return null;
}

function colocar(i) {
  tablero[i] = turno;
  celdas[i].textContent = turno;
  celdas[i].classList.add(turno.toLowerCase());
  celdas[i].disabled = true;

  const ganador = calcularGanador(tablero);
  if (ganador) {
    terminado = true;
    ganador.linea.forEach((k) => celdas[k].classList.add("ganadora"));
    puntos[ganador.jugador]++;
    estadoEl.textContent = `¡Ganó ${ganador.jugador}!`;
    actualizarMarcador();
    deshabilitarTodo();
    return;
  }
  if (tablero.every(Boolean)) {
    terminado = true;
    puntos.E++;
    estadoEl.textContent = "¡Empate!";
    actualizarMarcador();
    return;
  }
  turno = turno === "X" ? "O" : "X";
  estadoEl.textContent = `Turno de ${turno}`;
}

function jugarHumano(i) {
  if (terminado || bloqueado || tablero[i]) return;
  colocar(i);
  if (!terminado && modoEl.value === "cpu" && turno === "O") {
    bloqueado = true;
    setTimeout(() => {
      if (!terminado) colocar(mejorJugadaCPU());
      bloqueado = false;
    }, 400);
  }
}

// CPU con minimax: nunca pierde
function mejorJugadaCPU() {
  let mejor = -Infinity;
  let jugada = -1;
  tablero.forEach((v, i) => {
    if (v) return;
    tablero[i] = "O";
    const valor = minimax(tablero, false, 0);
    tablero[i] = null;
    if (valor > mejor) {
      mejor = valor;
      jugada = i;
    }
  });
  return jugada;
}

function minimax(t, esCPU, profundidad) {
  const g = calcularGanador(t);
  if (g) return g.jugador === "O" ? 10 - profundidad : profundidad - 10;
  if (t.every(Boolean)) return 0;

  let mejor = esCPU ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (t[i]) continue;
    t[i] = esCPU ? "O" : "X";
    const valor = minimax(t, !esCPU, profundidad + 1);
    t[i] = null;
    mejor = esCPU ? Math.max(mejor, valor) : Math.min(mejor, valor);
  }
  return mejor;
}

function deshabilitarTodo() {
  celdas.forEach((c) => (c.disabled = true));
}

function actualizarMarcador() {
  puntosEls.X.textContent = puntos.X;
  puntosEls.O.textContent = puntos.O;
  puntosEls.E.textContent = puntos.E;
}

function nuevaPartida() {
  tablero = Array(9).fill(null);
  turno = "X";
  terminado = false;
  bloqueado = false;
  celdas.forEach((c) => {
    c.textContent = "";
    c.disabled = false;
    c.className = "celda";
  });
  estadoEl.textContent = "Turno de X";
}

document.getElementById("btnReiniciar").addEventListener("click", nuevaPartida);
document.getElementById("btnResetPuntos").addEventListener("click", () => {
  puntos.X = puntos.O = puntos.E = 0;
  actualizarMarcador();
  nuevaPartida();
});
modoEl.addEventListener("change", () => {
  puntos.X = puntos.O = puntos.E = 0;
  actualizarMarcador();
  nuevaPartida();
});
