// ========================================================
// LISTA DE PLATOS DEL MENÚ
// ========================================================
const listaMenu = [
    {
        orden: 1,
        nombre: "Plato especial. Bandeja Paisa",
        imagen: "./Images/bandeja-paisa.webp",
        precio: "$ 16.200",
        ingredientes: ["Fríjoles rojos","Arroz blanco","Carne molida","Chicharrón","Chorizo","Huevo", "Plátano maduro", "Aguacate","Arepa","Hogao" ]
    },
    {
        orden: 2,
        nombre: "Mojarra Cartagenera",
        imagen: "./Images/Mojarra-arrozdecoco.webp",
        precio: "$ 15.600",
        ingredientes: ["Mojarra frita", "Arroz con coco", "Patacones", "Ensalada", "Limón", "Ajo", "Sal", "Pimienta"]
    },
    {
        orden: 3,
        nombre: "Arroz Paisa",
        imagen: "./Images/arroz-paisa.webp",
        precio: "$ 19.200",
        ingredientes: ["Arroz", "Carne de res", "Pollo", "Chorizo", "Tocineta", "Cebolla", "Pimentón", "Ajo", "Arvejas"]
    },
    {
        orden: 4,
        nombre: "Ajiaco Santafereño",
        imagen: "./Images/Ajiaco-Santafereño.webp",
        precio: "$ 20.000",
        ingredientes: ["Pechuga de pollo", "Papa criolla", "Papa pastusa", "Papa sabanera", "Mazorca", "Guascas", "Crema de leche", "Alcaparras", "Cebolla larga", "Ajo"]
    },
    {
        orden: 5,
        nombre: "Sancocho de Gallina",
        imagen: "./Images/sancocho-gallina.webp",
        precio: "$ 20.000",
        ingredientes: ["Gallina", "Yuca", "Plátano verde", "Papa", "Mazorca", "Cebolla larga", "Tomate", "Ajo", "Cilantro", "Sal"]
    },
    {
        orden: 6,
        nombre: "Lechona Tolimense",
        imagen: "./Images/Lechona-tolimense.webp",
        precio: "$ 20.000",
        ingredientes: ["Carne de cerdo", "Arvejas amarillas", "Arroz", "Cebolla larga", "Ajo", "Comino", "Sal", "Pimienta", "Cuero de cerdo"]
    },
    {
        orden: 7,
        nombre: "Posta Cartagenera",
        imagen: "./Images/posta.webp",
        precio: "$ 20.000",
        ingredientes: ["Posta de res", "Panela o azúcar","Cebolla", "Ajo", "Salsa inglesa (opcional)","Caldo de carne","Aceite","Sal y pimienta","Laurel y comino"]
    },
    {
        orden: 8,
        nombre: "Mute Santandereano",
        imagen: "./Images/Sopa-de-Mute.webp",
        precio: "$ 20.000",
        ingredientes: ["Maíz pelado", "Carne de res", "Costilla de cerdo", "Garbanzos", "Papa", "Ahuyama", "Zanahoria", "Cebolla", "Tomate", "Cilantro"]
    },
    {
        orden: 9,
        nombre: "Tamal Tolimense",
        imagen: "./Images/tamal-tolimense.webp",
        precio: "$ 20.000",
        ingredientes: ["Masa de maíz", "Carne de cerdo", "Pollo", "Arroz", "Arvejas", "Zanahoria", "Huevo cocido", "Cebolla larga", "Ajo", "Hojas de plátano"]
    },
];

// ========================================================
// MÁS VENDIDOS
// ventasBase = ventas históricas (edítalas con tus cifras reales).
// A ellas se suman los pedidos hechos desde el carrito y desde reservas.
// ========================================================
const ventasBase = {
    "Plato especial. Bandeja Paisa": 120,
    "Ajiaco Santafereño": 98,
    "Sancocho de Gallina": 85,
    "Mojarra Cartagenera": 70,
    "Arroz Paisa": 64,
    "Lechona Tolimense": 52,
    "Tamal Tolimense": 47,
    "Mute Santandereano": 33,
    "Posta Cartagenera": 29
};

function registrarVentas(items) {
    let ventas = JSON.parse(localStorage.getItem("ventas")) || {};
    items.forEach(it => {
        if (it.cantidad > 0) ventas[it.nombre] = (ventas[it.nombre] || 0) + it.cantidad;
    });
    localStorage.setItem("ventas", JSON.stringify(ventas));
}

function obtenerMasVendidos(n) {
    const ventas = JSON.parse(localStorage.getItem("ventas")) || {};
    return listaMenu
        .map((plato, indice) => ({ plato, indice, total: (ventasBase[plato.nombre] || 0) + (ventas[plato.nombre] || 0) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, n);
}

function cargarMasVendidos() {
    const contenedor = document.getElementById("contenedor-mas-vendidos");
    if (!contenedor) return;
    contenedor.innerHTML = obtenerMasVendidos(3).map((item, pos) => `
        <div class="tarjeta-plato tarjeta-top">
            <div class="top-imagen">
                <img src="${item.plato.imagen}" alt="${item.plato.nombre}" class="plato-imagen">
                <span class="top-insignia">#${pos + 1} más vendido</span>
            </div>
            <div class="plato-cuerpo">
                <div class="plato-cabecera">
                    <h3 class="plato-nombre">${item.plato.nombre}</h3>
                    <span class="plato-precio">${item.plato.precio}</span>
                </div>
                <p class="top-ventas">${item.total} platos vendidos</p>
                <button class="btn-primary" onclick="agregarAlCarrito(${item.indice})">Agregar al carrito 🛒</button>
            </div>
        </div>
    `).join("");
}

// ========================================================
// FUNCIONES DE APOYO
// ========================================================
function precioANumero(precio) {
    return parseFloat(precio.replace('$', '').replace(/\./g, '').trim()) || 0;
}

function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function leerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

function calcularTotal(carrito) {
    return carrito.reduce((acc, item) => acc + precioANumero(item.precio) * item.cantidad, 0);
}

// ========================================================
// FUNCIÓN PARA CARGAR LOS PLATOS EN EL HTML DEL MENÚ
// ========================================================
function cargarMenu() {
    const contenedor = document.getElementById("contenedor-menu");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    for (let i = 0; i < listaMenu.length; i++) {
        const plato = listaMenu[i];
        const listaIngredientes = plato.ingredientes.map(ing => `<li>${ing}</li>`).join("");
        const estaAbierto = (i === 0);
        const estiloDisplay = estaAbierto ? "display: block;" : "display: none;";
        const textoBoton = estaAbierto ? "Ocultar ingredientes" : "Ver ingredientes";
        const flechaIcono = estaAbierto ? "⌃" : "⌵";

        contenedor.innerHTML += `
            <div class="tarjeta-plato" onmouseenter="mostrarIngredientes(this, true)" onmouseleave="mostrarIngredientes(this, false)">
                <img src="${plato.imagen}" alt="${plato.nombre}" class="plato-imagen">
                <div class="plato-cuerpo">
                    <div class="plato-cabecera">
                        <h3 class="plato-nombre">${plato.nombre}</h3>
                        <span class="plato-precio">${plato.precio}</span>
                    </div>
                    <button class="btn-desplegable" onclick="alternarIngredientes(this)">
                        <span class="texto-boton">${textoBoton}</span>
                        <span class="icono-flecha">${flechaIcono}</span>
                    </button>
                    <div class="caja-ingredientes" style="${estiloDisplay}">
                        <ul class="lista-ingredientes">${listaIngredientes}</ul>
                    </div>
                    <button class="btn-primary" onclick="agregarAlCarrito(${i})">
                        Agregar al carrito 🛒
                    </button>
                </div>
            </div>
        `;
    }
}

// ========================================================
// DESPLEGABLE DE INGREDIENTES (clic y cursor)
// ========================================================
function establecerIngredientes(tarjeta, abrir) {
    const caja = tarjeta.querySelector(".caja-ingredientes");
    const texto = tarjeta.querySelector(".texto-boton");
    const icono = tarjeta.querySelector(".icono-flecha");

    caja.style.display = abrir ? "block" : "none";
    texto.textContent = abrir ? "Ocultar ingredientes" : "Ver ingredientes";
    icono.textContent = abrir ? "⌃" : "⌵";
}

// Se abre solo al pasar el cursor (solo en dispositivos con mouse)
function mostrarIngredientes(tarjeta, abrir) {
    if (!window.matchMedia("(hover: hover)").matches) return;
    establecerIngredientes(tarjeta, abrir);
}

// Se abre/cierra con el botón (celular o clic)
function alternarIngredientes(boton) {
    const tarjeta = boton.closest(".tarjeta-plato");
    const caja = tarjeta.querySelector(".caja-ingredientes");
    establecerIngredientes(tarjeta, caja.style.display !== "block");
}

// ========================================================
// FUNCIÓN PARA AGREGAR AL CARRITO (SIN ALERTAS)
// ========================================================
function agregarAlCarrito(indice) {
    const plato = listaMenu[indice];
    let carrito = leerCarrito();

    const existente = carrito.find(item => item.nombre === plato.nombre);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            nombre: plato.nombre,
            imagen: plato.imagen,
            precio: plato.precio,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// ========================================================
// ACTUALIZAR CONTADOR Y VISTA DEL CARRITO
// ========================================================
function actualizarContadorCarrito() {
    const totalItems = leerCarrito().reduce((acc, item) => acc + item.cantidad, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function renderizarCarrito() {
    const carrito = leerCarrito();
    const contenedorItems = document.getElementById('productos-carrito');
    const precioTotalElemento = document.getElementById('total-carrito');

    if (!contenedorItems) return;

    if (carrito.length === 0) {
        contenedorItems.innerHTML = `<p class="vacio">Tu carrito está vacío. <a href="Menu.html">Mira el menú</a> y elige tus platos.</p>`;
        if (precioTotalElemento) precioTotalElemento.textContent = "$ 0";
        return;
    }

    let html = "";

    carrito.forEach((item, index) => {
        const subtotal = precioANumero(item.precio) * item.cantidad;

        html += `
            <div class="producto-carrito">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="producto-info">
                    <h3>${item.nombre}</h3>
                    <p>${item.precio} c/u</p>
                    <div class="cantidad-control">
                        <button onclick="cambiarCantidad(${index}, -1)" aria-label="Quitar uno">−</button>
                        <span>${item.cantidad}</span>
                        <button onclick="cambiarCantidad(${index}, 1)" aria-label="Agregar uno">+</button>
                    </div>
                </div>
                <p class="producto-subtotal">$ ${subtotal.toLocaleString('es-CO')}</p>
                <button onclick="eliminarDelCarrito(${index})" class="eliminar">🗑️</button>
            </div>
        `;
    });

    contenedorItems.innerHTML = html;
    if (precioTotalElemento) {
        precioTotalElemento.textContent = "$ " + calcularTotal(carrito).toLocaleString('es-CO');
    }
}

function cambiarCantidad(index, cambio) {
    let carrito = leerCarrito();
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad < 1) carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarrito();
}

function eliminarDelCarrito(index) {
    let carrito = leerCarrito();
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarrito();
}

// ========================================================
// INICIALIZACIÓN AUTOMÁTICA AL CARGAR LA PÁGINA
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarMenu();                // Carga las tarjetas si estás en el menú
    cargarMasVendidos();         // Carga los 3 más vendidos
    renderizarCarrito();         // Dibuja los productos si estás en el carrito
    actualizarContadorCarrito(); // Actualiza el número del badge en el header

    const checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;

    const formulario = document.getElementById('formulario-pedido');
    const metodoPago = document.getElementById('metodo-pago');
    const infoPago = document.getElementById('info-pago');

    const instrucciones = {
        Nequi: "Transfiere el total a Nequi 300 123 4567 (Sazones del Mundo) y envía el comprobante por WhatsApp. Preparamos tu pedido al confirmar el pago.",
        Bancolombia: "Transfiere el total a la cuenta de ahorros Bancolombia 123-456789-00 y envía el comprobante por WhatsApp. Preparamos tu pedido al confirmar el pago.",
        Efectivo: "Pagas en efectivo al recibir tu pedido. Ten el valor total a la mano."
    };

    const mostrarInfoPago = () => { infoPago.textContent = instrucciones[metodoPago.value]; };
    metodoPago.addEventListener('change', mostrarInfoPago);
    mostrarInfoPago();

    checkoutBtn.addEventListener('click', () => {
        const carrito = leerCarrito();
        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        // El pedido NO se confirma solo: primero se validan los datos de entrega
        if (!formulario.reportValidity()) return;

        const nombre = escaparHtml(document.getElementById('nombre-cliente').value);
        const telefono = escaparHtml(document.getElementById('telefono-cliente').value);
        const barrio = escaparHtml(document.getElementById('barrio-cliente').value);
        const direccion = escaparHtml(document.getElementById('direccion-cliente').value);
        const indicaciones = escaparHtml(document.getElementById('indicaciones-cliente').value || "—");
        const metodo = metodoPago.value;
        const estado = metodo === "Efectivo" ? "Pago contra entrega" : "Pendiente de pago";
        const numeroPedido = "SZ-" + Date.now().toString().slice(-6);

        const lista = carrito.map(item => {
            const subtotal = precioANumero(item.precio) * item.cantidad;
            return `<li>${item.cantidad} × ${item.nombre} — $ ${subtotal.toLocaleString('es-CO')}</li>`;
        }).join("");

        document.getElementById('resumen-pedido').innerHTML = `
            <p style="color:#666; margin-bottom:10px;">Pedido <strong>${numeroPedido}</strong> · <strong style="color:#631728;">${estado}</strong></p>
            <div class="datos-pedido">
                <strong>Nombre:</strong> ${nombre}<br>
                <strong>Teléfono:</strong> ${telefono}<br>
                <strong>Barrio:</strong> ${barrio}<br>
                <strong>Dirección:</strong> ${direccion}<br>
                <strong>Indicaciones:</strong> ${indicaciones}<br>
                <strong>Método de pago:</strong> ${metodo}
            </div>
            <h3 style="color:#631728;">Tu pedido</h3>
            <ul class="lista-pedido">${lista}</ul>
            <p style="font-size:20px; font-weight:bold; color:#631728;">Total: $ ${calcularTotal(carrito).toLocaleString('es-CO')}</p>
            <p class="info-pago" style="margin-top:15px; text-align:left;">${instrucciones[metodo]}</p>
        `;

        // Ocultar lista, formulario, resumen y título; mostrar confirmación
        ['productos-carrito', 'formulario-pedido'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const resumenSeccion = document.querySelector('.resumen');
        const tituloCarrito = document.querySelector('.carrito h1');
        if (resumenSeccion) resumenSeccion.style.display = 'none';
        if (tituloCarrito) tituloCarrito.style.display = 'none';
        document.getElementById('mensaje-exito').style.display = 'block';

        // Registrar las ventas para el ranking de más vendidos
        registrarVentas(carrito);

        // Vaciar el carrito y poner el contador en 0
        localStorage.removeItem("carrito");
        actualizarContadorCarrito();
    });
});