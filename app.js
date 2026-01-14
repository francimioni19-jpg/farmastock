const auth = firebase.auth();
const db = firebase.firestore();
let usuario = null;

/* =====================
   AUTH
===================== */
auth.onAuthStateChanged(user => {
    if (user) {
        usuario = user;
        mostrarInicio();
    } else {
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
            <p>Gestión de stock simple</p><br>

            <input id="email" placeholder="Email"><br>
            <input id="pass" type="password" placeholder="Contraseña"><br><br>

            <button class="btn" onclick="login()">Ingresar</button>
            <button class="btn" onclick="registrarse()">Registrarse</button>
        </div>
    `;
}

function login() {
    auth.signInWithEmailAndPassword(
        document.getElementById("email").value,
        document.getElementById("pass").value
    ).catch(e => alert(e.message));
}

function registrarse() {
    auth.createUserWithEmailAndPassword(
        document.getElementById("email").value,
        document.getElementById("pass").value
    ).catch(e => alert(e.message));
}

function logout() {
    auth.signOut();
}

/* =====================
   INICIO
===================== */
function mostrarInicio() {
    document.getElementById("contenido").innerHTML = `
        <h2>Resumen</h2>
        <div class="cards">
            <div class="card">📦 Stock</div>
            <div class="card">💰 Ventas</div>
            <div class="card">⚠️ Alertas</div>
        </div>
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
                    <td>${p.vencimiento}</td>
                    <td>${p.minimo}</td>
                </tr>
            `;
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Productos</h2>

            <input id="nombre" placeholder="Nombre"><br>
            <input id="cantidad" type="number" placeholder="Cantidad"><br>
            <input id="minimo" type="number" placeholder="Stock mínimo"><br>
            <input id="vencimiento" type="date"><br><br>

            <button class="btn" onclick="agregarProducto()">Agregar</button>

            <table border="1" cellpadding="5">
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Vence</th>
                    <th>Mínimo</th>
                </tr>
                ${filas}
            </table>
        `;
      });
}

function agregarProducto() {
    const nombreNuevo = nombre.value.trim().toLowerCase();
    const cantidadNueva = Number(cantidad.value);
    const minimoNuevo = Number(minimo.value);
    const vencimientoNuevo = vencimiento.value;

    if (!nombreNuevo || !cantidadNueva) {
        alert("Completá nombre y cantidad");
        return;
    }

    const refProductos = db
        .collection("usuarios")
        .doc(usuario.uid)
        .collection("productos");

    // 🔍 Buscar si el producto ya existe
    refProductos
        .where("nombre_normalizado", "==", nombreNuevo)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                // ✅ EXISTE → SUMA STOCK
                const docExistente = snapshot.docs[0];
                const p = docExistente.data();

                refProductos.doc(docExistente.id).update({
                    cantidad: Number(p.cantidad) + cantidadNueva,
                    minimo: minimoNuevo || p.minimo,
                    vencimiento: vencimientoNuevo || p.vencimiento
                }).then(() => mostrarProductos());

            } else {
                // 🆕 NO EXISTE → CREA PRODUCTO
                refProductos.add({
                    nombre: nombre.value.trim(),
                    nombre_normalizado: nombreNuevo,
                    cantidad: cantidadNueva,
                    minimo: minimoNuevo,
                    vencimiento: vencimientoNuevo,
                    creado: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => mostrarProductos());
            }
        });
}


/* =====================
   VENTAS (FUNCIONA)
===================== */
function mostrarVentas() {
    db.collection("usuarios")
      .doc(usuario.uid)
      .collection("productos")
      .get()
      .then(snapshot => {

        if (snapshot.empty) {
            document.getElementById("contenido").innerHTML = `
                <h2>Ventas</h2>
                <p>No hay productos</p>
            `;
            return;
        }

        let opciones = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            opciones += `<option value="${doc.id}">${p.nombre} (Stock ${p.cantidad})</option>`;
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Registrar venta</h2>

            <select id="productoId">${opciones}</select><br><br>
            <input id="cantidadVendida" type="number" min="1" placeholder="Cantidad"><br><br>

            <button class="btn" onclick="registrarVenta()">Vender</button>
        `;
      });
}

function registrarVenta() {
    const productoId = document.getElementById("productoId").value;
    const cantidad = Number(document.getElementById("cantidadVendida").value);

    if (cantidad <= 0) {
        alert("Cantidad inválida");
        return;
    }

    const ref = db.collection("usuarios")
        .doc(usuario.uid)
        .collection("productos")
        .doc(productoId);

    ref.get().then(doc => {
        const p = doc.data();

        if (p.cantidad < cantidad) {
            alert("Stock insuficiente");
            return;
        }

        ref.update({ cantidad: p.cantidad - cantidad });

        db.collection("usuarios")
          .doc(usuario.uid)
          .collection("ventas")
          .add({
              producto: p.nombre,
              cantidad: cantidad,
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

            const cantidad = Number(p.cantidad || 0);
            const minimo = Number(p.minimo || 0);

            let dias = 999;
            if (p.vencimiento) {
                dias = Math.ceil(
                    (new Date(p.vencimiento) - new Date()) / 86400000
                );
            }

            // 🔴 ALERTA STOCK BAJO
            if (cantidad <= minimo) {
                lista += `
                    <li class="alerta-roja">
                        🚨 STOCK BAJO: <b>${p.nombre}</b>
                        (Stock: ${cantidad} / Mínimo: ${minimo})
                    </li>
                `;
            }
            // 🟡 ALERTA VENCIMIENTO
            else if (dias <= 7) {
                lista += `
                    <li class="alerta-amarilla">
                        ⏳ VENCE PRONTO: <b>${p.nombre}</b>
                        (${dias} días)
                    </li>
                `;
            }
        });

        document.getElementById("contenido").innerHTML = `
            <h2>Alertas</h2>
            <ul>${lista || "<li>✅ Sin alertas</li>"}</ul>
            <button class="btn" onclick="mostrarInicio()">Volver</button>
        `;
      });
}


/* =====================
   SECCIONES VACÍAS (NO ROMPEN)
===================== */
function mostrarEmpleado() {
    document.getElementById("contenido").innerHTML = `
        <h2>Empleados</h2>
        <p>Disponible en versión PRO</p>
    `;
}

function mostrarConfiguracion() {
    document.getElementById("contenido").innerHTML = `
        <h2>Opciones</h2>
        <p>Configuración general</p>
    `;
}

function mostrarReportes() {
    document.getElementById("contenido").innerHTML = `
        <h2>⭐ PRO</h2>
        <p>Reportes avanzados próximamente</p>
    `;
}


