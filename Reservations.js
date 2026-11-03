// ========================================================
// RESERVAS DE MESAS Y PEDIDO POR MESA
// Requiere menu.js (listaMenu, registrarVentas)
// ========================================================

// Mesas del restaurante: edita aquí números y capacidades
const MESAS = [
    { n: 1, cap: 2 }, { n: 2, cap: 2 }, { n: 3, cap: 2 },
    { n: 4, cap: 4 }, { n: 5, cap: 4 }, { n: 6, cap: 4 }, { n: 7, cap: 4 },
    { n: 8, cap: 6 }, { n: 9, cap: 6 }, { n: 10, cap: 8 }
];
const HORAS = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const DURACION_HORAS = 2;      // cada reserva bloquea la mesa este tiempo
const CLAVE = "reservas";

let mesaElegida = null;
let reservaActiva = null;      // id de la reserva a la que se le toma pedido
let pedidoTemp = {};           // { indiceDelMenu: cantidad }

const $ = id => document.getElementById(id);

// ---------- Utilidades ----------
function leerReservas() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; }
}
function guardarReservas(lista) { localStorage.setItem(CLAVE, JSON.stringify(lista)); }
function horaNum(h) { return parseInt(h.split(":")[0], 10); }
function precioNum(p) { return parseFloat(String(p).replace("$", "").replace(/\./g, "").trim()) || 0; }
function dinero(n) { return "$ " + n.toLocaleString("es-CO"); }
function esc(t) {
    return String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function hoyISO() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function fechaLarga(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    return new Date(a, m - 1, d).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}
function mesaOcupada(n, fecha, hora) {
    return leerReservas().some(r => r.mesa === n && r.fecha === fecha &&
        Math.abs(horaNum(r.hora) - horaNum(hora)) < DURACION_HORAS);
}
function mostrarAviso(el, texto, tipo) {
    el.textContent = texto;
    el.className = "aviso " + tipo;
    el.hidden = false;
}

// ---------- Filtros ----------
function llenarHoras() {
    const hoy = $("fecha").value === hoyISO();
    const ahora = new Date().getHours();
    const previa = $("hora").value;
    const disponibles = HORAS.filter(h => !hoy || horaNum(h) > ahora);
    $("hora").innerHTML = disponibles.length
        ? disponibles.map(h => `<option value="${h}">${h}</option>`).join("")
        : `<option value="">Sin horas hoy</option>`;
    if (disponibles.includes(previa)) $("hora").value = previa;
}

function iniciarFiltros() {
    $("fecha").min = hoyISO();
    $("fecha").value = hoyISO();
    const maxCap = Math.max(...MESAS.map(m => m.cap));
    let op = "";
    for (let i = 1; i <= maxCap; i++) op += `<option value="${i}">${i} ${i === 1 ? "persona" : "personas"}</option>`;
    $("personas").innerHTML = op;
    $("personas").value = "2";
    llenarHoras();
    ["fecha", "hora", "personas"].forEach(id => $(id).addEventListener("change", () => {
        if (id === "fecha") llenarHoras();
        mesaElegida = null;
        dibujarMesas();
    }));
}

// ---------- Mesas ----------
function dibujarMesas() {
    const fecha = $("fecha").value, hora = $("hora").value, personas = parseInt($("personas").value, 10);
    const grilla = $("grilla-mesas");
    if (!fecha || !hora) {
        grilla.innerHTML = `<p class="vacio">Elige una fecha y una hora disponibles.</p>`;
        $("contador-libres").textContent = "";
        actualizarBotonReservar();
        return;
    }
    let libres = 0;
    grilla.innerHTML = MESAS.map(m => {
        const ocupada = mesaOcupada(m.n, fecha, hora);
        const chica = m.cap < personas;
        if (!ocupada) libres++;
        let clase = "libre", estado = "Libre", dis = "";
        if (ocupada) { clase = "ocupada"; estado = "Ocupada"; dis = "disabled"; }
        else if (chica) { clase = "pequena"; estado = "Muy pequeña"; dis = "disabled"; }
        if (mesaElegida === m.n) { clase = "elegida"; estado = "Tu mesa"; }
        return `<button type="button" class="mesa ${clase}" ${dis} data-mesa="${m.n}"
                    aria-label="Mesa ${m.n}, ${m.cap} puestos, ${estado}">
                    <span class="mesa-num">${m.n}</span>
                    <span class="mesa-cap">${m.cap} puestos</span>
                    <span class="mesa-est">${estado}</span>
                </button>`;
    }).join("");
    $("contador-libres").textContent = `${libres} de ${MESAS.length} mesas libres a las ${hora}`;
    grilla.querySelectorAll(".mesa:not([disabled])").forEach(b =>
        b.addEventListener("click", () => {
            mesaElegida = parseInt(b.dataset.mesa, 10);
            dibujarMesas();
        }));
    actualizarBotonReservar();
}

function actualizarBotonReservar() {
    const b = $("btn-reservar");
    b.disabled = mesaElegida === null;
    b.textContent = mesaElegida === null ? "Elige una mesa para reservar" : `Reservar mesa ${mesaElegida}`;
}

// ---------- Crear reserva ----------
function reservar() {
    const aviso = $("aviso-reserva");
    const nombre = $("nombre").value.trim();
    const telefono = $("telefono").value.trim();
    const fecha = $("fecha").value, hora = $("hora").value;

    if (!nombre || telefono.replace(/\D/g, "").length < 7) {
        mostrarAviso(aviso, "Escribe tu nombre y un teléfono válido para reservar.", "error");
        return;
    }
    if (mesaOcupada(mesaElegida, fecha, hora)) {
        mostrarAviso(aviso, "Esa mesa acaba de ocuparse. Elige otra.", "error");
        mesaElegida = null; dibujarMesas();
        return;
    }
    const reserva = {
        id: Date.now(), mesa: mesaElegida, fecha, hora,
        personas: parseInt($("personas").value, 10), nombre, telefono, pedido: []
    };
    const lista = leerReservas();
    lista.push(reserva);
    guardarReservas(lista);

    mostrarAviso(aviso, `Reserva confirmada: mesa ${reserva.mesa}, ${fechaLarga(fecha)} a las ${hora}. Ahora puedes dejar el pedido de la mesa.`, "ok");
    mesaElegida = null;
    dibujarMesas();
    dibujarReservas();
    abrirPedido(reserva.id);
}

// ---------- Pedido por mesa ----------
function abrirPedido(id) {
    const r = leerReservas().find(x => x.id === id);
    if (!r) return;
    reservaActiva = id;
    pedidoTemp = {};
    r.pedido.forEach(it => {
        const idx = listaMenu.findIndex(p => p.nombre === it.nombre);
        if (idx >= 0) pedidoTemp[idx] = it.cantidad;
    });
    $("t-pedido").textContent = `Pedido de la mesa ${r.mesa} · ${r.nombre}`;
    $("aviso-pedido").hidden = true;
    $("panel-pedido").hidden = false;
    dibujarPlatos();
    $("panel-pedido").scrollIntoView({ behavior: "smooth", block: "start" });
}

function dibujarPlatos() {
    $("lista-platos").innerHTML = listaMenu.map((p, i) => `
        <div class="plato-fila">
            <img src="${p.imagen}" alt="${esc(p.nombre)}">
            <div class="info"><strong>${esc(p.nombre)}</strong><span>${p.precio}</span></div>
            <div class="cantidad">
                <button type="button" aria-label="Quitar uno de ${esc(p.nombre)}" data-i="${i}" data-d="-1">−</button>
                <output aria-live="polite">${pedidoTemp[i] || 0}</output>
                <button type="button" aria-label="Agregar uno de ${esc(p.nombre)}" data-i="${i}" data-d="1">+</button>
            </div>
        </div>`).join("");
    $("lista-platos").querySelectorAll("button").forEach(b =>
        b.addEventListener("click", () => {
            const i = b.dataset.i;
            pedidoTemp[i] = Math.max(0, (pedidoTemp[i] || 0) + parseInt(b.dataset.d, 10));
            dibujarPlatos();
            // devolver el foco al botón pulsado tras redibujar
            const nuevo = $("lista-platos").querySelector(`button[data-i="${i}"][data-d="${b.dataset.d}"]`);
            if (nuevo) nuevo.focus();
        }));
    $("total-pedido").textContent = dinero(totalTemp());
}

function totalTemp() {
    return Object.entries(pedidoTemp).reduce((t, [i, c]) => t + precioNum(listaMenu[i].precio) * c, 0);
}

function guardarPedido() {
    const lista = leerReservas();
    const r = lista.find(x => x.id === reservaActiva);
    if (!r) return;
    const nuevo = Object.entries(pedidoTemp)
        .filter(([, c]) => c > 0)
        .map(([i, c]) => ({ nombre: listaMenu[i].nombre, precio: listaMenu[i].precio, cantidad: c }));

    // Sumar al ranking de más vendidos solo lo que se agregó respecto al pedido anterior
    const delta = nuevo.map(it => {
        const antes = (r.pedido.find(p => p.nombre === it.nombre) || {}).cantidad || 0;
        return { nombre: it.nombre, cantidad: it.cantidad - antes };
    });
    registrarVentas(delta);

    r.pedido = nuevo;
    guardarReservas(lista);
    dibujarReservas();
    mostrarAviso($("aviso-pedido"),
        nuevo.length ? `Pedido guardado para la mesa ${r.mesa}. Total: ${dinero(totalTemp())}.` : `La mesa ${r.mesa} quedó sin pedido.`, "ok");
}

function cerrarPedido() {
    reservaActiva = null;
    $("panel-pedido").hidden = true;
}

// ---------- Lista de reservas ----------
function dibujarReservas() {
    const lista = leerReservas()
        .filter(r => r.fecha >= hoyISO())
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    const cont = $("lista-reservas");
    if (!lista.length) {
        cont.innerHTML = `<p class="vacio">Aún no hay reservas. Elige una mesa libre para crear la primera.</p>`;
        return;
    }
    cont.innerHTML = lista.map(r => {
        const total = r.pedido.reduce((t, it) => t + precioNum(it.precio) * it.cantidad, 0);
        const detalle = r.pedido.length
            ? r.pedido.map(it => `${it.cantidad} × ${esc(it.nombre)}`).join(", ") + ` — <strong>${dinero(total)}</strong>`
            : "Sin pedido todavía";
        return `
        <article class="reserva-item">
            <div>
                <h3>Mesa ${r.mesa} · ${r.hora}</h3>
                <p>${fechaLarga(r.fecha)} · ${r.personas} ${r.personas === 1 ? "persona" : "personas"}<br>
                   ${esc(r.nombre)} · ${esc(r.telefono)}<br>
                   Pedido: ${detalle}</p>
            </div>
            <div class="acciones">
                <button class="btn-sec" data-pedido="${r.id}">${r.pedido.length ? "Editar pedido" : "Tomar pedido"}</button>
                <button class="btn-sec btn-peligro" data-cancelar="${r.id}">Cancelar</button>
            </div>
        </article>`;
    }).join("");
    cont.querySelectorAll("[data-pedido]").forEach(b => b.addEventListener("click", () => abrirPedido(parseInt(b.dataset.pedido, 10))));
    cont.querySelectorAll("[data-cancelar]").forEach(b => b.addEventListener("click", () => {
        const id = parseInt(b.dataset.cancelar, 10);
        if (!confirm("¿Cancelar esta reserva? La mesa quedará libre.")) return;
        guardarReservas(leerReservas().filter(r => r.id !== id));
        if (reservaActiva === id) cerrarPedido();
        dibujarMesas();
        dibujarReservas();
    }));
}

// ---------- Inicio ----------
document.addEventListener("DOMContentLoaded", () => {
    iniciarFiltros();
    dibujarMesas();
    dibujarReservas();
    $("btn-reservar").addEventListener("click", reservar);
    $("btn-guardar-pedido").addEventListener("click", guardarPedido);
    $("btn-omitir").addEventListener("click", cerrarPedido);
});
