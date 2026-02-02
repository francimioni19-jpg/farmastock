const auth = firebase.auth();
const db = firebase.firestore();
let usuario = null;

/* ================= AUTH ================= */
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

/* ================= LOGIN ================= */
function mostrarLogin() {
    document.getElementById("contenido").innerHTML = `
        <div class="login">
            <h1>FarmaStock</h1>
            <input id="email" placeholder="Email">
            <input id="pass" type="password" placeholder="Contraseña">
            <button onclick="login()">Ingresar</button>
            <button onclick="registrarse()">Registrarse</button>
        </div>
    `;
}

function login() {
    auth.signInWithEmailAndPassword(
        email.value,
        pass.value
    ).catch(e => alert(e.message));
}

function registrarse() {
    auth.createUserWithEmailAndPassword(
        email.value,
        pass.value
    ).catch(e => alert(e.message));
}

function logout() {
    auth.signOut();
}

/* ================= INICIO ================= */
function mostrarInicio() {
    document.getElementById("contenido").innerHTML = `
        <h2>Inicio</h2>
        <p>Bienvenido a FarmaStock</p>
    `;
}

/* ================= PRODUCTOS ================= */
function mostrarProductos() {
    db.collection("usuarios").doc(usuario.uid)
      .collection("productos").get()
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

            <input id="nombre" placeholder="Producto">
            <input id="cantidad" type="number" placeholder="Cantidad">
            <input id="minimo" type="number" placeholder="Stock mínimo">
            <input id="vencimiento" type="date">
            <button onclick="agregarProducto()">Agregar</button>

            <table>
                <tr>
                    <th>Producto</th><th>Cantidad</th><th>Mínimo</th><th>Vence</th>
                </tr>
                ${filas}
            </table>
        `;
    });
}

function agregarProducto() {
    db.collection("usuarios").doc(usuario.uid)
      .collection("productos").add({
        nombre: nombre.value,
        cantidad: Number(cantidad.value),
        minimo: Number(minimo.value),
        vencimiento: vencimiento.value
      }).then(mostrarProductos);
}

/* ================= VENTAS ================= */
function mostrarVentas() {
    db.collection("usuarios").doc(usuario.uid)
      .collection("productos").get()
      .then(snapshot => {

        let opciones = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            opciones += `<option value="${doc.id}">${p.nombre}</option>`;
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Ventas</h2>
            <select id="productoId">${opciones}</select>
            <input id="cantidadVendida" type="number" placeholder="Cantidad">
            <button onclick="registrarVenta()">Vender</button>
        `;
    });
}

function registrarVenta() {
    const id = productoId.value;
    const cant = Number(cantidadVendida.value);

    const ref = db.collection("usuarios")
                  .doc(usuario.uid)
                  .collection("productos")
                  .doc(id);

    ref.get().then(doc => {
        const p = doc.data();
        if (p.cantidad < cant) return alert("Stock insuficiente");

        ref.update({ cantidad: p.cantidad - cant });
        alert("Venta registrada");
        mostrarVentas();
    });
}

/* ================= ALERTAS ================= */
function mostrarVencimientos() {
    db.collection("usuarios").doc(usuario.uid)
      .collection("productos").get()
      .then(snapshot => {

        let lista = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            if (p.cantidad <= p.minimo) {
                lista += `<li>⚠️ ${p.nombre} stock bajo</li>`;
            }
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Alertas</h2>
            <ul>${lista || "<li>Sin alertas</li>"}</ul>
        `;
    });
}

/* ================= PRO ================= */
function mostrarReportes() {
    document.getElementById("contenido").innerHTML = `
        <h2>Modo PRO ⭐</h2>
        <p>Función disponible solo para cuentas PRO</p>
    `;
}
