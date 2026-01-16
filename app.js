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
        <div class="bienvenida">
            <h1>FarmaStock</h1>
            <input id="email" placeholder="Email"><br>
            <input id="pass" type="password" placeholder="Contraseña"><br><br>
            <button class="btn" onclick="login()">Ingresar</button>
            <button class="btn" onclick="registrarse()">Registrarse</button>
        </div>
    `;
}

function login() {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("pass").value.trim();

    if (!email.includes("@")) {
        alert("Email inválido");
        return;
    }
    if (pass.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
    }

    auth.signInWithEmailAndPassword(email, pass)
        .catch(e => alert(e.message));
}

function registrarse() {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("pass").value.trim();

    if (!email.includes("@")) {
        alert("Email inválido");
        return;
    }
    if (pass.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
    }

    auth.createUserWithEmailAndPassword(email, pass)
        .catch(e => alert(e.message));
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
    db.collection("usuarios")
      .doc(usuario.uid)
      .collection("productos")
      .get()
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
            <button class="btn" onclick="agregarProducto()">Agregar</button>

            <table border="1">
                <tr><th>Producto</th><th>Cantidad</th><th>Mínimo</th><th>Vence</th></tr>
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
      })
      .then(() => mostrarProductos());
}

/* =====================
   VENTAS
===================== */
function mostrarVentas() {
    db.collection("usuarios")
      .doc(usuario.uid)
      .collection("productos")
      .get()
      .then(snapshot => {
        let opciones = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            opciones += `<option value="${doc.id}">${p.nombre} (Stock ${p.cantidad})</option>`;
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Ventas</h2>
            <select id="producto">${opciones}</select><br>
            <input id="cantidadVenta" type="number" placeholder="Cantidad"><br><br>
            <button class="btn" onclick="vender()">Vender</button>
        `;
      });
}

function vender() {
    const id = producto.value;
    const cant = Number(cantidadVenta.value);

    if (cant <= 0) {
        alert("Cantidad inválida");
        return;
    }

    const ref = db.collection("usuarios")
                  .doc(usuario.uid)
                  .collection("productos")
                  .doc(id);

    ref.get().then(doc => {
        const p = doc.data();
        if (p.cantidad < cant) {
            alert("Stock insuficiente");
            return;
        }

        ref.update({ cantidad: p.cantidad - cant });

        db.collection("usuarios")
          .doc(usuario.uid)
          .collection("ventas")
          .add({
            producto: p.nombre,
            cantidad: cant,
            fecha: firebase.firestore.FieldValue.serverTimestamp()
          });

        alert("Venta registrada");
        mostrarVentas();
    });
}

/* =====================
   ALERTAS
===================== */
function mostrarVencimientos() {
    db.collection("usuarios")
      .doc(usuario.uid)
      .collection("productos")
      .get()
      .then(snapshot => {
        let lista = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            const dias = Math.ceil((new Date(p.vencimiento) - new Date()) / 86400000);
            if (p.cantidad <= p.minimo || dias <= 7) {
                lista += `<li>⚠️ ${p.nombre} - Stock ${p.cantidad} - ${dias} días</li>`;
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
        <p>Disponible próximamente</p>
    `;
}
