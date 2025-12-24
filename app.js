/* ========= IDIOMA ========= */
let idioma = localStorage.getItem("idioma") || "es";

const textos = {
    es: {
        login: "Ingreso a FarmaStock",
        email: "Email",
        pass: "Contraseña",
        ingresar: "Ingresar / Registrarse",
        resumen: "Resumen del negocio",
        productos: "Productos",
        ventas: "Ventas",
        alertas: "Alertas",
        config: "Configuración",
        pro: "Modo PRO activado"
    },
    en: {
        login: "FarmaStock Login",
        email: "Email",
        pass: "Password",
        ingresar: "Login / Register",
        resumen: "Business summary",
        productos: "Products",
        ventas: "Sales",
        alertas: "Alerts",
        config: "Settings",
        pro: "PRO Mode activated"
    }
};

/* ========= LOGIN ========= */
let usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    mostrarLogin();
} else {
    mostrarInicio();
}

function mostrarLogin() {
    document.getElementById("contenido").innerHTML = `
        <h2>${textos[idioma].login}</h2>
        <input id="email" placeholder="${textos[idioma].email}"><br>
        <input id="pass" type="password" placeholder="${textos[idioma].pass}"><br>
        <button class="btn" onclick="login()">${textos[idioma].ingresar}</button>
    `;
}

function login() {
    const email = email.value;
    const pass = document.getElementById("pass").value;

    if (!email || !pass) {
        alert("Completá email y contraseña");
        return;
    }

    usuario = { email, pass, pro: false };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    mostrarInicio();
}

function logout() {
    localStorage.removeItem("usuario");
    location.reload();
}

/* ========= DATOS ========= */
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

/* ========= INICIO ========= */
function mostrarInicio() {
    document.getElementById("contenido").innerHTML = `
        <h2>${textos[idioma].resumen}</h2>
        <div class="cards">
            <div class="card">📦 Productos: ${productos.length}</div>
            <div class="card">⚠️ Alertas: ${productos.filter(p => alertaVencimiento(p) || alertaStock(p)).length}</div>
            <div class="card">💰 Ventas: ${ventas.length}</div>
        </div>
    `;
}

/* ========= PRODUCTOS ========= */
function mostrarProductos() {
    let filas = productos.map((p, i) => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.cantidad}</td>
            <td>${p.minimo}</td>
            <td>${p.vencimiento}</td>
            <td><button onclick="eliminarProducto(${i})">❌</button></td>
        </tr>
    `).join("");

    document.getElementById("contenido").innerHTML = `
        <h2>📦 Stock</h2>
        <input id="nombre" placeholder="Nombre"><br>
        <input id="cantidad" type="number" placeholder="Cantidad"><br>
        <input id="minimo" type="number" placeholder="Stock mínimo"><br>
        <input id="vencimiento" type="date"><br>
        <button class="btn" onclick="agregarProducto()">Agregar</button>

        <table border="1">
            <tr>
                <th>Producto</th><th>Cantidad</th><th>Mínimo</th><th>Vence</th><th></th>
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
        vencimiento: vencimiento.value
    });
    guardar();
    mostrarProductos();
}

function eliminarProducto(i) {
    productos.splice(i, 1);
    guardar();
    mostrarProductos();
}

/* ========= ALERTAS ========= */
function diasParaVencer(fecha) {
    return Math.ceil((new Date(fecha) - new Date()) / 86400000);
}

function alertaVencimiento(p) {
    return diasParaVencer(p.vencimiento) <= 7;
}

function alertaStock(p) {
    return p.cantidad <= p.minimo;
}

function mostrarVencimientos() {
    let lista = productos
        .filter(p => alertaVencimiento(p) || alertaStock(p))
        .map(p => `
            <li>
                ${p.nombre} 
                ${alertaVencimiento(p) ? "⚠️ Vence pronto" : ""}
                ${alertaStock(p) ? "📉 Stock bajo" : ""}
            </li>
        `).join("");

    document.getElementById("contenido").innerHTML = `
        <h2>⚠️ Alertas</h2>
        <ul>${lista || "<li>Sin alertas</li>"}</ul>
    `;
}

/* ========= VENTAS ========= */
function mostrarVentas() {
    let lista = ventas.map(v => `<li>${v.fecha} - ${v.producto}</li>`).join("");

    document.getElementById("contenido").innerHTML = `
        <h2>💰 Ventas</h2>
        <select id="ventaProducto">
            ${productos.map((p, i) => `<option value="${i}">${p.nombre}</option>`).join("")}
        </select>
        <button class="btn" onclick="registrarVenta()">Vender</button>
        <ul>${lista}</ul>
    `;
}

function registrarVenta() {
    let i = ventaProducto.value;
    if (productos[i].cantidad <= 0) {
        alert("Sin stock");
        return;
    }

    productos[i].cantidad--;
    ventas.push({ producto: productos[i].nombre, fecha: new Date().toLocaleString() });
    guardar();
    mostrarVentas();
}

/* ========= PRO ========= */
function mostrarReportes() {
    if (!usuario.pro) {
        document.getElementById("contenido").innerHTML = `
            <h2>📊 Reportes PRO</h2>
            <p>Disponible solo en versión PRO</p>
            <button class="btn" onclick="activarPro()">Activar PRO</button>
        `;
        return;
    }

    document.getElementById("contenido").innerHTML = `
        <h2>📊 Reportes PRO</h2>
        <p>Productos: ${productos.length}</p>
        <p>Ventas: ${ventas.length}</p>
    `;
}

function activarPro() {
    usuario.pro = true;
    localStorage.setItem("usuario", JSON.stringify(usuario));
    mostrarReportes();
}

/* ========= CONFIG ========= */
function mostrarConfiguracion() {
    document.getElementById("contenido").innerHTML = `
        <h2>⚙️ Opciones</h2>
        <p>Usuario: ${usuario.email}</p>
        <select onchange="cambiarIdioma(this.value)">
            <option value="es" ${idioma==="es"?"selected":""}>Español</option>
            <option value="en" ${idioma==="en"?"selected":""}>English</option>
        </select>
    `;
}

function cambiarIdioma(id) {
    idioma = id;
    localStorage.setItem("idioma", idioma);
    mostrarInicio();
}

function guardar() {
    localStorage.setItem("productos", JSON.stringify(productos));
    localStorage.setItem("ventas", JSON.stringify(ventas));
    localStorage.setItem("proveedores", JSON.stringify(proveedores));
}

