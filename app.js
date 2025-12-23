/* ================= LOGIN REAL ================= */
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

if (!usuarioActual) {
    mostrarLogin();
} else {
    mostrarInicio();
}

function mostrarLogin() {
    document.getElementById("contenido").innerHTML = `
        <h2>Ingreso a FarmaStock</h2>
        <input id="email" placeholder="Email"><br>
        <input id="pass" type="password" placeholder="Contraseña"><br>
        <button class="btn" onclick="login()">Ingresar / Registrarse</button>
    `;
}

function login() {
    const email = emailInput.value = document.getElementById("email").value;
    const pass = document.getElementById("pass").value;

    if (!email || !pass) {
        alert("Completá email y contraseña");
        return;
    }

    let user = usuarios.find(u => u.email === email);

    if (!user) {
        user = { email, pass, pro: false };
        usuarios.push(user);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    } else if (user.pass !== pass) {
        alert("Contraseña incorrecta");
        return;
    }

    usuarioActual = user;
    localStorage.setItem("usuarioActual", JSON.stringify(user));
    mostrarInicio();
}

function logout() {
    localStorage.removeItem("usuarioActual");
    location.reload();
}

/* ================= DATOS ================= */
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

/* ================= INICIO ================= */
function mostrarInicio() {
    document.getElementById("contenido").innerHTML = `
        <h2>Resumen del negocio</h2>
        <div class="cards">
            <div class="card">
                <h3>Productos</h3>
                <p>${productos.length}</p>
            </div>
            <div class="card">
                <h3>Stock Bajo</h3>
                <p>${productos.filter(p => p.cantidad <= p.minimo).length}</p>
            </div>
            <div class="card">
                <h3>Por vencer</h3>
                <p>${productos.filter(p => diasParaVencer(p.vencimiento) <= 7).length}</p>
            </div>
        </div>
    `;
}

/* ================= PRODUCTOS ================= */
function mostrarProductos() {
    let filas = productos.map((p, i) => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.cantidad}</td>
            <td>${p.minimo}</td>
            <td>${p.vencimiento}</td>
            <td>${p.codigo}</td>
        </tr>
    `).join("");

    document.getElementById("contenido").innerHTML = `
        <h2>Productos</h2>
        <input id="nombre" placeholder="Nombre"><br>
        <input id="cantidad" type="number" placeholder="Cantidad"><br>
        <input id="minimo" type="number" placeholder="Stock mínimo"><br>
        <input id="vencimiento" type="date"><br>
        <input id="codigo" placeholder="Código de barras"><br>
        <button class="btn" onclick="agregarProducto()">Agregar</button>

        <table border="1" cellpadding="5">
            <tr>
                <th>Producto</th><th>Cantidad</th><th>Mínimo</th><th>Vence</th><th>Código</th>
            </tr>
            ${filas}
        </table>
    `;
}

function agregarProducto() {
    productos.push({
        nombre: nombre.value,
        cantidad: Number(cantidad.value),
        minimo: Number(minimo.value),
        vencimiento: vencimiento.value,
        codigo: codigo.value
    });
    localStorage.setItem("productos", JSON.stringify(productos));
    mostrarProductos();
}

/* ================= ALERTAS ================= */
function diasParaVencer(fecha) {
    return Math.ceil((new Date(fecha) - new Date()) / 86400000);
}

function mostrarVencimientos() {
    let lista = productos.map(p => {
        if (p.cantidad <= p.minimo)
            return `<li>⚠️ Stock bajo: ${p.nombre}</li>`;
        if (diasParaVencer(p.vencimiento) <= 7)
            return `<li>⏰ Por vencer: ${p.nombre}</li>`;
        return "";
    }).join("");

    document.getElementById("contenido").innerHTML = `
        <h2>Alertas</h2>
        <ul>${lista || "<li>No hay alertas</li>"}</ul>
    `;
}

/* ================= VENTAS (DESCUENTA STOCK) ================= */
function mostrarVentas() {
    let opciones = productos.map((p, i) =>
        `<option value="${i}">${p.nombre}</option>`
    ).join("");

    document.getElementById("contenido").innerHTML = `
        <h2>Ventas</h2>
        <select id="prod">${opciones}</select><br>
        <input id="cantVenta" type="number" placeholder="Cantidad"><br>
        <button class="btn" onclick="registrarVenta()">Registrar venta</button>
    `;
}

function registrarVenta() {
    let i = prod.value;
    let c = Number(cantVenta.value);

    if (productos[i].cantidad < c) {
        alert("Stock insuficiente");
        return;
    }

    productos[i].cantidad -= c;
    ventas.push({ producto: productos[i].nombre, cantidad: c, fecha: new Date() });

    localStorage.setItem("productos", JSON.stringify(productos));
    localStorage.setItem("ventas", JSON.stringify(ventas));
    mostrarVentas();
}

/* ================= PROVEEDORES ================= */
function mostrarProveedores() {
    let lista = proveedores.map(p => `<li>${p.nombre} - ${p.tel}</li>`).join("");

    document.getElementById("contenido").innerHTML = `
        <h2>Proveedores</h2>
        <input id="pn" placeholder="Nombre"><br>
        <input id="pt" placeholder="Teléfono"><br>
        <button class="btn" onclick="agregarProveedor()">Agregar</button>
        <ul>${lista}</ul>
    `;
}

function agregarProveedor() {
    proveedores.push({ nombre: pn.value, tel: pt.value });
    localStorage.setItem("proveedores", JSON.stringify(proveedores));
    mostrarProveedores();
}

/* ================= PRO BLOQUEADO ================= */
function mostrarReportes() {
    if (!usuarioActual.pro) {
        document.getElementById("contenido").innerHTML = `
            <h2>Modo PRO</h2>
            <p>🔒 Función solo para usuarios PRO</p>
        `;
        return;
    }

    document.getElementById("contenido").innerHTML = `
        <h2>Reportes PRO</h2>
        <p>Ventas: ${ventas.length}</p>
    `;
}

/* ================= CONFIG ================= */
function mostrarConfiguracion() {
    document.getElementById("contenido").innerHTML = `
        <h2>Configuración</h2>
        <p>Usuario: ${usuarioActual.email}</p>
        <p>Plan: ${usuarioActual.pro ? "PRO" : "Gratis"}</p>
    `;
}
