const auth = firebase.auth();
const db = firebase.firestore();
let usuario = null;

/* =====================
   AUTH
===================== */
auth.onAuthStateChanged(user => {
    if (user) {
        usuario = user;
        document.getElementById("menu").style.display = "block";
        mostrarInicio();
    } else {
        document.getElementById("menu").style.display = "none";
        mostrarLogin();
    }
});

/* =====================
   LOGIN
===================== */
function mostrarLogin() {
    document.getElementById("contenido").innerHTML = `
        <h1>FarmaStock</h1>
        <input id="email" type="email" placeholder="Email"><br>
        <input id="pass" type="password" placeholder="Contraseña"><br><br>
        <button onclick="login()">Ingresar</button>
        <button onclick="registrarse()">Registrarse</button>
    `;
}

function login() {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("pass").value.trim();

    if (!email || !pass) {
        alert("Completá email y contraseña");
        return;
    }

    auth.signInWithEmailAndPassword(email, pass)
        .catch(e => alert(mensajeHumano(e.code)));
}

function registrarse() {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("pass").value.trim();

    if (!email || !pass) {
        alert("Completá email y contraseña");
        return;
    }

    auth.createUserWithEmailAndPassword(email, pass)
        .catch(e => alert(mensajeHumano(e.code)));
}

function logout() {
    auth.signOut();
}

/* =====================
   INICIO
===================== */
function mostrarInicio() {
    document.getElementById("contenido").innerHTML = `
        <h2>Panel principal</h2>
        <p>Bienvenido a FarmaStock</p>
    `;
}

/* =====================
   PRODUCTOS
===================== */
function mostrarProductos() {
    db.collection("usuarios").doc(usuario.uid).collection("productos").get()
    .then(snapshot => {
        let filas = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            filas += `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.cantidad}</td>
                    <td>${p.minimo}</td>
                    <td>${p.vencimiento}</td>
                </tr>
            `;
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Stock</h2>
            <input id="nombre" placeholder="Producto"><br>
            <input id="cantidad" type="number" placeholder="Cantidad"><br>
            <input id="minimo" type="number" placeholder="Stock mínimo"><br>
            <input id="vencimiento" type="date"><br><br>
            <button onclick="agregarProducto()">Agregar</button>

            <table border="1">
                <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Mínimo</th>
                    <th>Vence</th>
                </tr>
                ${filas}
            </table>
        `;
    });
}

function agregarProducto() {
    db.collection("usuarios")
      .doc(usuario.uid)
      .collection("productos")
      .add({
          nombre: nombre.value,
          cantidad: Number(cantidad.value),
          minimo: Number(minimo.value),
          vencimiento: vencimiento.value
      }).then(mostrarProductos);
}

/* =====================
   VENTAS
===================== */
function mostrarVentas() {
    db.collection("usuarios").doc(usuario.uid).collection("productos").get()
    .then(snapshot => {
        let opciones = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            opciones += `<option value="${doc.id}">${p.nombre} (stock ${p.cantidad})</option>`;
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Ventas</h2>
            <select id="prod">${opciones}</select><br>
            <input id="cant" type="number" placeholder="Cantidad"><br><br>
            <button onclick="registrarVenta()">Vender</button>
        `;
    });
}

function registrarVenta() {
    const id = prod.value;
    const c = Number(cant.value);

    const ref = db.collection("usuarios")
                  .doc(usuario.uid)
                  .collection("productos")
                  .doc(id);

    ref.get().then(doc => {
        const p = doc.data();
        if (p.cantidad < c) {
            alert("Stock insuficiente");
            return;
        }
        ref.update({ cantidad: p.cantidad - c });
        alert("Venta registrada");
        mostrarVentas();
    });
}

/* =====================
   ALERTAS
===================== */
function mostrarVencimientos() {
    db.collection("usuarios").doc(usuario.uid).collection("productos").get()
    .then(snapshot => {
        let lista = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            if (p.cantidad <= p.minimo) {
                lista += `<li>⚠️ ${p.nombre} bajo stock</li>`;
            }
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Alertas</h2>
            <ul>${lista || "<li>Sin alertas</li>"}</ul>
        `;
    });
}

/* =====================
   PRO
===================== */
function mostrarReportes() {
    document.getElementById("contenido").innerHTML = `
        <h2>Modo PRO ⭐</h2>
        <p>Función disponible próximamente</p>
    `;
}

/* =====================
   MENSAJES
===================== */
function mensajeHumano(code) {
    switch (code) {
        case "auth/invalid-email": return "Email inválido";
        case "auth/email-already-in-use": return "Email ya registrado";
        case "auth/weak-password": return "Contraseña muy corta";
        default: return "Error al ingresar";
    }
}

