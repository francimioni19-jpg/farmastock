const auth = firebase.auth();
const db = firebase.firestore();
let usuario = null;
let rol = "admin";

/* ========= AUTH ========= */
auth.onAuthStateChanged(user => {
    if (user) {
        usuario = user;
        cargarRol();
    } else {
        mostrarLogin();
    }
});

function mostrarLogin() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("contenido").innerHTML = `
        <h2>FarmaStock</h2>
        <input id="email" placeholder="Email"><br>
        <input id="pass" type="password" placeholder="Contraseña"><br><br>
        <button onclick="login()">Ingresar</button>
        <button onclick="registrarse()">Registrarse</button>
    `;
}

function login() {
    auth.signInWithEmailAndPassword(email.value, pass.value)
        .catch(e => alert(e.message));
}

function registrarse() {
    auth.createUserWithEmailAndPassword(email.value, pass.value)
        .then(res => {
            db.collection("usuarios").doc(res.user.uid).set({
                rol: "admin",
                pro: false
            });
        })
        .catch(e => alert(e.message));
}

function logout() {
    auth.signOut();
}

/* ========= ROLES ========= */
function cargarRol() {
    db.collection("usuarios").doc(usuario.uid).get().then(doc => {
        rol = doc.data().rol;
        document.getElementById("menu").style.display = "block";
        mostrarInicio();
    });
}

/* ========= INICIO ========= */
function mostrarInicio() {
    document.getElementById("contenido").innerHTML = `
        <h2>Bienvenido a FarmaStock</h2>
        <p>Gestión de stock profesional</p>
    `;
}

/* ========= STOCK ========= */
function mostrarProductos() {
    db.collection("usuarios").doc(usuario.uid).collection("productos").get()
    .then(snap => {
        let filas = "";
        snap.forEach(d => {
            const p = d.data();
            filas += `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.cantidad}</td>
                    <td>${p.minimo}</td>
                    <td>${p.vencimiento}</td>
                    <td>
                        <button onclick="editarProducto('${d.id}')">✏️</button>
                        ${rol === "admin" ? `<button onclick="eliminarProducto('${d.id}')">🗑️</button>` : ""}
                    </td>
                </tr>
            `;
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Stock</h2>
            <input id="nombre" placeholder="Producto">
            <input id="cantidad" type="number" placeholder="Cantidad">
            <input id="minimo" type="number" placeholder="Mínimo">
            <input id="vencimiento" type="date">
            <button onclick="agregarProducto()">Agregar</button>
            <table border="1">
                <tr><th>Producto</th><th>Cant</th><th>Min</th><th>Vence</th><th></th></tr>
                ${filas}
            </table>
        `;
    });
}

function agregarProducto() {
    const ref = db.collection("usuarios").doc(usuario.uid).collection("productos");
    ref.where("nombre", "==", nombre.value).get().then(snap => {
        if (!snap.empty) {
            const d = snap.docs[0];
            d.ref.update({ cantidad: d.data().cantidad + Number(cantidad.value) });
        } else {
            ref.add({
                nombre: nombre.value,
                cantidad: Number(cantidad.value),
                minimo: Number(minimo.value),
                vencimiento: vencimiento.value
            });
        }
        mostrarProductos();
    });
}

function eliminarProducto(id) {
    if (confirm("Eliminar producto?")) {
        db.collection("usuarios").doc(usuario.uid)
        .collection("productos").doc(id).delete()
        .then(mostrarProductos);
    }
}

function editarProducto(id) {
    const ref = db.collection("usuarios").doc(usuario.uid)
        .collection("productos").doc(id);

    ref.get().then(d => {
        const p = d.data();
        document.getElementById("contenido").innerHTML = `
            <h2>Editar Producto</h2>
            <input id="cantidad" type="number" value="${p.cantidad}">
            <input id="minimo" type="number" value="${p.minimo}">
            <input id="vencimiento" type="date" value="${p.vencimiento}">
            <button onclick="guardarEdicion('${id}')">Guardar</button>
        `;
    });
}

function guardarEdicion(id) {
    db.collection("usuarios").doc(usuario.uid)
    .collection("productos").doc(id).update({
        cantidad: Number(cantidad.value),
        minimo: Number(minimo.value),
        vencimiento: vencimiento.value
    }).then(mostrarProductos);
}

/* ========= VENTAS ========= */
function mostrarVentas() {
    db.collection("usuarios").doc(usuario.uid).collection("productos").get()
    .then(snap => {
        let ops = "";
        snap.forEach(d => {
            const p = d.data();
            ops += `<option value="${d.id}">${p.nombre} (${p.cantidad})</option>`;
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Ventas</h2>
            <select id="producto">${ops}</select>
            <input id="cantidad" type="number">
            <button onclick="vender()">Vender</button>
        `;
    });
}

function vender() {
    const ref = db.collection("usuarios").doc(usuario.uid)
        .collection("productos").doc(producto.value);

    ref.get().then(d => {
        const p = d.data();
        if (p.cantidad < Number(cantidad.value)) {
            alert("Stock insuficiente");
            return;
        }
        ref.update({ cantidad: p.cantidad - Number(cantidad.value) });
        alert("Venta registrada");
        mostrarVentas();
    });
}

/* ========= ALERTAS ========= */
function mostrarAlertas() {
    db.collection("usuarios").doc(usuario.uid).collection("productos").get()
    .then(snap => {
        let l = "";
        snap.forEach(d => {
            const p = d.data();
            const dias = (new Date(p.vencimiento) - new Date()) / 86400000;
            if (p.cantidad <= p.minimo || dias <= 7) {
                l += `<li>⚠️ ${p.nombre}</li>`;
            }
        });
        document.getElementById("contenido").innerHTML = `
            <h2>Alertas</h2>
            <ul>${l || "<li>Sin alertas</li>"}</ul>
        `;
    });
}

/* ========= EMPLEADOS ========= */
function mostrarEmpleados() {
    if (rol !== "admin") {
        alert("Solo admin");
        return;
    }
    document.getElementById("contenido").innerHTML = `
        <h2>Empleados</h2>
        <p>Función activa (roles ya implementados)</p>
    `;
}

/* ========= PRO ========= */
function mostrarPro() {
    document.getElementById("contenido").innerHTML = `
        <h2>⭐ Modo PRO</h2>
        <p>Reportes avanzados</p>
        <p>🔒 Bloqueado – Activar con pago</p>
    `;
}
