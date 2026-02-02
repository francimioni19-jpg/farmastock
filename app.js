const auth = firebase.auth();
const db = firebase.firestore();

let usuario = null;

/* ================= AUTH ================= */
auth.onAuthStateChanged(user => {
    if (user) {
        usuario = user;
        mostrarInicio();
    } else {
        mostrarLogin();
    }
});

/* ================= LOGIN ================= */
function mostrarLogin() {
    contenido.innerHTML = `
        <h1>FarmaStock</h1>
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
        .catch(e => alert(e.message));
}

function logout() {
    auth.signOut();
}

/* ================= INICIO ================= */
function mostrarInicio() {
    contenido.innerHTML = `
        <h2>Inicio</h2>
        <button onclick="mostrarStock()">📦 Stock</button>
        <button onclick="mostrarVentas()">💰 Ventas</button>
        <button onclick="mostrarAlertas()">⚠️ Alertas</button>
        <button onclick="mostrarPro()">⭐ PRO</button>
        <button onclick="logout()">Salir</button>
    `;
}

/* ================= STOCK ================= */
function mostrarStock() {
    db.collection("usuarios").doc(usuario.uid)
      .collection("productos").get()
      .then(snap => {
        let filas = "";
        snap.forEach(doc => {
            const p = doc.data();
            filas += `
              <tr>
                <td>${p.nombre}</td>
                <td>${p.cantidad}</td>
                <td>${p.minimo}</td>
                <td>${p.vencimiento}</td>
                <td>
                  <button onclick="eliminarProducto('${doc.id}')">❌</button>
                </td>
              </tr>`;
        });

        contenido.innerHTML = `
          <h2>Stock</h2>
          <input id="nombre" placeholder="Producto">
          <input id="cantidad" type="number" placeholder="Cantidad">
          <input id="minimo" type="number" placeholder="Mínimo">
          <input id="vencimiento" type="date"><br><br>
          <button onclick="guardarProducto()">Guardar</button>
          <button onclick="mostrarInicio()">Volver</button>

          <table border="1">
            <tr><th>Producto</th><th>Cantidad</th><th>Mínimo</th><th>Vence</th><th></th></tr>
            ${filas}
          </table>
        `;
      });
}

function guardarProducto() {
    const ref = db.collection("usuarios")
        .doc(usuario.uid)
        .collection("productos");

    ref.where("nombre", "==", nombre.value).get()
      .then(snap => {
        if (!snap.empty) {
            const docu = snap.docs[0];
            ref.doc(docu.id).update({
                cantidad: docu.data().cantidad + Number(cantidad.value)
            }).then(mostrarStock);
        } else {
            ref.add({
                nombre: nombre.value,
                cantidad: Number(cantidad.value),
                minimo: Number(minimo.value),
                vencimiento: vencimiento.value
            }).then(mostrarStock);
        }
      });
}

function eliminarProducto(id) {
    db.collection("usuarios").doc(usuario.uid)
      .collection("productos").doc(id).delete()
      .then(mostrarStock);
}

/* ================= VENTAS ================= */
function mostrarVentas() {
    db.collection("usuarios").doc(usuario.uid)
      .collection("productos").get()
      .then(snap => {
        let opciones = "";
        snap.forEach(doc => {
            const p = doc.data();
            opciones += `<option value="${doc.id}">${p.nombre} (${p.cantidad})</option>`;
        });

        contenido.innerHTML = `
          <h2>Ventas</h2>
          <select id="producto">${opciones}</select>
          <input id="vendido" type="number" placeholder="Cantidad"><br><br>
          <button onclick="vender()">Vender</button>
          <button onclick="mostrarInicio()">Volver</button>
        `;
      });
}

function vender() {
    const ref = db.collection("usuarios")
        .doc(usuario.uid)
        .collection("productos")
        .doc(producto.value);

    ref.get().then(doc => {
        if (doc.data().cantidad < vendido.value) {
            alert("Stock insuficiente");
            return;
        }
        ref.update({
            cantidad: doc.data().cantidad - Number(vendido.value)
        }).then(() => {
            alert("Venta registrada");
            mostrarVentas();
        });
    });
}

/* ================= ALERTAS ================= */
function mostrarAlertas() {
    db.collection("usuarios").doc(usuario.uid)
      .collection("productos").get()
      .then(snap => {
        let lista = "";
        snap.forEach(doc => {
            const p = doc.data();
            if (p.cantidad <= p.minimo) {
                lista += `<li>⚠️ ${p.nombre} stock bajo</li>`;
            }
        });
        contenido.innerHTML = `
          <h2>Alertas</h2>
          <ul>${lista || "<li>Sin alertas</li>"}</ul>
          <button onclick="mostrarInicio()">Volver</button>
        `;
      });
}

/* ================= PRO ================= */
function mostrarPro() {
    contenido.innerHTML = `
      <h2>Modo PRO ⭐</h2>
      <p>Función premium – próximamente</p>
      <button onclick="mostrarInicio()">Volver</button>
    `;
}
