function cargarDatos(clave) {
  try {
    var datos = JSON.parse(localStorage.getItem(clave));
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    return [];
  }
}

var clientes = cargarDatos("clientes");
var transacciones = cargarDatos("transacciones");

var limitePesos = 30000000;
var limiteDolares = 3000;
var limiteEuros = 2000;

var margen = 200;

function guardar() {
  try {
    localStorage.setItem("clientes", JSON.stringify(clientes));
    localStorage.setItem("transacciones", JSON.stringify(transacciones));
    return true;
  } catch (error) {
    alert("No fue posible guardar los datos en este navegador. Revise el espacio disponible.");
    return false;
  }
}

function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, function (caracter) {
    var entidades = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entidades[caracter];
  });
}

function fechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }
  var partes = fecha.split("-");
  var fechaIngresada = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  return fechaIngresada.getFullYear() == Number(partes[0]) &&
    fechaIngresada.getMonth() == Number(partes[1]) - 1 &&
    fechaIngresada.getDate() == Number(partes[2]);
}

function verPagina(pagina, boton) {
  var paginas = ["pSimulador", "pClientes", "pResumenes"];
  var botones = ["bSimulador", "bClientes", "bResumenes"];

  for (var i = 0; i < paginas.length; i++) {
    document.getElementById(paginas[i]).style.display = "none";
    document.getElementById(botones[i]).className = "";
  }

  document.getElementById(pagina).style.display = "block";
  document.getElementById(boton).className = "activo";
}

function fechaHoy() {
  var hoy = new Date();
  var mes = hoy.getMonth() + 1;
  var dia = hoy.getDate();
  if (mes < 10) { mes = "0" + mes; }
  if (dia < 10) { dia = "0" + dia; }
  return hoy.getFullYear() + "-" + mes + "-" + dia;
}

function edad(fecha) {
  if (!fechaValida(fecha)) {
    return -1;
  }
  var partes = fecha.split("-");
  var hoy = new Date();
  var anio = Number(partes[0]);
  var mes = Number(partes[1]) - 1;
  var dia = Number(partes[2]);
  var e = hoy.getFullYear() - anio;
  if (hoy.getMonth() < mes || (hoy.getMonth() == mes && hoy.getDate() < dia)) {
    e = e - 1;
  }
  return e;
}

function formato(numero) {
  return numero.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function mensaje(id, texto, clase) {
  var div = document.getElementById(id);
  div.innerHTML = texto;
  div.className = "mensaje " + clase;
}

function monedaOrigen(tipo) {
  if (tipo == 1 || tipo == 3) { return "COP"; }
  if (tipo == 2) { return "USD"; }
  return "EUR";
}

function monedaDestino(tipo) {
  if (tipo == 2 || tipo == 4) { return "COP"; }
  if (tipo == 1) { return "USD"; }
  return "EUR";
}

function limiteDe(moneda) {
  if (moneda == "COP") { return limitePesos; }
  if (moneda == "USD") { return limiteDolares; }
  return limiteEuros;
}

function mostrarTasas() {
  var dolar = Number(document.getElementById("tasaDolar").value);
  var euro = Number(document.getElementById("tasaEuro").value);
  var info = document.getElementById("infoTasas");

  if (!isFinite(dolar) || !isFinite(euro) || dolar <= margen || euro <= margen) {
    info.textContent = "Ingrese tasas mayores al margen de la casa de cambio ($" + margen + " COP).";
    return;
  }

  info.innerHTML =
    "Dólar: la casa compra a $" + formato(dolar - margen) + " y vende a $" + formato(dolar + margen) + "<br>" +
    "Euro: la casa compra a $" + formato(euro - margen) + " y vende a $" + formato(euro + margen);
}

fetch("https://open.er-api.com/v6/latest/USD")
  .then(function (respuesta) {
    if (!respuesta.ok) {
      throw new Error("No fue posible consultar las tasas.");
    }
    return respuesta.json();
  })
  .then(function (datos) {
    var cop = Number(datos && datos.rates && datos.rates.COP);
    var eur = Number(datos && datos.rates && datos.rates.EUR);

    if (!isFinite(cop) || !isFinite(eur) || cop <= 0 || eur <= 0) {
      throw new Error("La respuesta de tasas no es válida.");
    }

    document.getElementById("tasaDolar").value = cop.toFixed(2);
    document.getElementById("tasaEuro").value = (cop / eur).toFixed(2);
    document.getElementById("notaTasas").textContent = "Tasas de referencia actualizadas desde internet. Verifique su vigencia antes de operar.";
    mostrarTasas();
  })
  .catch(function () {
    document.getElementById("notaTasas").textContent = "No fue posible actualizar las tasas. Se conservan los valores ingresados o de ejemplo.";
    mostrarTasas();
  });

function calcular() {
  var tipo = Number(document.getElementById("tipo").value);
  var monto = Number(document.getElementById("monto").value);

  if (!isFinite(monto) || monto <= 0) {
    mensaje("mensajeOp", "Escriba un monto mayor a 0.", "error");
    return null;
  }

  var origen = monedaOrigen(tipo);
  var destino = monedaDestino(tipo);

  var referencia = Number(document.getElementById("tasaDolar").value);
  if (tipo == 3 || tipo == 4) {
    referencia = Number(document.getElementById("tasaEuro").value);
  }
  if (!isFinite(referencia) || referencia <= margen) {
    mensaje("mensajeOp", "Escriba una tasa válida.", "error");
    return null;
  }

  var c = {};
  c.tipo = tipo;
  c.origen = origen;
  c.destino = destino;
  c.referencia = referencia;

  if (origen == "COP") {
    c.operacion = "VENTA";
    c.moneda = destino;
    c.tasa = referencia + margen;
    c.pesos = monto;
    c.divisa = monto / c.tasa;
    c.montoOrigen = monto;
    c.montoDestino = c.divisa;
  } else {
    c.operacion = "COMPRA";
    c.moneda = origen;
    c.tasa = referencia - margen;
    c.divisa = monto;
    c.pesos = monto * c.tasa;
    c.montoOrigen = monto;
    c.montoDestino = c.pesos;
  }

  return c;
}

function simular() {
  document.getElementById("mensajeOp").innerHTML = "";
  var c = calcular();
  if (c == null) {
    return null;
  }

  var texto = "";
  if (c.origen == "COP") {
    texto = "Entrega: $" + formato(c.pesos) + " COP<br>Recibe: <b>" + formato(c.divisa) + " " + c.moneda + "</b>";
  } else {
    texto = "Entrega: " + formato(c.divisa) + " " + c.moneda + "<br>Recibe: <b>$" + formato(c.pesos) + " COP</b>";
  }
  texto = texto + "<br>Tasa aplicada: $" + formato(c.tasa) + " (referencia $" + formato(c.referencia) + ")";

  var div = document.getElementById("resultado");
  div.style.display = "block";
  div.innerHTML = texto;
  return c;
}

function cambiadoHoy(cedula, moneda) {
  var total = 0;
  for (var i = 0; i < transacciones.length; i++) {
    var t = transacciones[i];
    if (t.cedula == cedula && t.fecha == fechaHoy()) {
      if (t.origen == moneda) { total = total + t.montoOrigen; }
      if (t.destino == moneda) { total = total + t.montoDestino; }
    }
  }
  return total;
}

function hacerTransaccion() {
  var c = simular();
  if (c == null) {
    return;
  }

  var ahora = new Date();
  var diaSemana = ahora.getDay();
  var hora = ahora.getHours();

  if (document.getElementById("ignorar").checked == false) {
    if (diaSemana == 0 || diaSemana == 6) {
      mensaje("mensajeOp", "Solo se atiende de lunes a viernes.", "error");
      return;
    }
    if (hora < 8 || hora >= 14) {
      mensaje("mensajeOp", "Solo se atiende de 8:00 a.m. a 2:00 p.m.", "error");
      return;
    }
  }

  var cedula = document.getElementById("cedulaOp").value.trim();
  if (cedula == "") {
    mensaje("mensajeOp", "Ingrese la cédula del cliente.", "error");
    return;
  }
  var cliente = null;
  for (var i = 0; i < clientes.length; i++) {
    if (clientes[i].cedula == cedula) {
      cliente = clientes[i];
    }
  }
  if (cliente == null) {
    mensaje("mensajeOp", "El cliente no está registrado. Regístrelo primero en la pestaña Clientes.", "error");
    return;
  }

  if (edad(cliente.nacimiento) < 18) {
    mensaje("mensajeOp", "Solo se permiten transacciones de mayores de edad.", "error");
    return;
  }

  var yaOrigen = cambiadoHoy(cedula, c.origen);
  if (yaOrigen + c.montoOrigen > limiteDe(c.origen)) {
    mensaje("mensajeOp", "Se pasa del límite por persona en " + c.origen + " (" + formato(limiteDe(c.origen)) +
      "). Hoy ya cambió " + formato(yaOrigen) + ".", "error");
    return;
  }

  var yaDestino = cambiadoHoy(cedula, c.destino);
  if (yaDestino + c.montoDestino > limiteDe(c.destino)) {
    mensaje("mensajeOp", "Se pasa del límite por persona en " + c.destino + " (" + formato(limiteDe(c.destino)) +
      "). Hoy ya cambió " + formato(yaDestino) + ".", "error");
    return;
  }

  if (confirm("¿Confirmar la transacción de " + cliente.nombre + "?") == false) {
    return;
  }

  var minutos = ahora.getMinutes();
  if (minutos < 10) { minutos = "0" + minutos; }

  var transaccion = {
    fecha: fechaHoy(),
    hora: ahora.getHours() + ":" + minutos,
    cedula: cedula,
    nombre: cliente.nombre,
    operacion: c.operacion,
    moneda: c.moneda,
    origen: c.origen,
    destino: c.destino,
    montoOrigen: c.montoOrigen,
    montoDestino: c.montoDestino,
    divisa: c.divisa,
    pesos: c.pesos,
    tasa: c.tasa
  };
  transacciones.push(transaccion);
  guardar();

  document.getElementById("monto").value = "";
  mensaje("mensajeOp", "Transacción registrada correctamente.", "bien");
}

function guardarCliente() {
  var cedula = document.getElementById("cedula").value.trim();
  var nombre = document.getElementById("nombre").value.trim();
  var nacimiento = document.getElementById("nacimiento").value;
  var trabajo = document.getElementById("trabajo").value.trim();
  var direccion = document.getElementById("direccion").value.trim();
  var celular = document.getElementById("celular").value.trim();

  if (cedula == "" || nombre == "" || nacimiento == "" || trabajo == "" || direccion == "" || celular == "") {
    mensaje("mensajeCli", "Debe llenar todos los campos.", "error");
    return;
  }

  if (!/^\d+$/.test(cedula)) {
    mensaje("mensajeCli", "La cédula debe tener solo números.", "error");
    return;
  }

  if (!/^\d{10}$/.test(celular)) {
    mensaje("mensajeCli", "El celular debe tener 10 dígitos.", "error");
    return;
  }

  if (!fechaValida(nacimiento) || edad(nacimiento) < 18) {
    mensaje("mensajeCli", "Solo se pueden registrar personas mayores de edad.", "error");
    return;
  }

  var cliente = {
    cedula: cedula,
    nombre: nombre,
    nacimiento: nacimiento,
    trabajo: trabajo,
    direccion: direccion,
    celular: celular
  };

  var existe = false;
  for (var i = 0; i < clientes.length; i++) {
    if (clientes[i].cedula == cedula) {
      clientes[i] = cliente;
      existe = true;
    }
  }
  if (existe == false) {
    clientes.push(cliente);
  }

  guardar();
  mostrarClientes();
  limpiarCampos();
  mensaje("mensajeCli", "Cliente guardado correctamente.", "bien");
}

function buscarCliente() {
  var cedula = document.getElementById("cedula").value.trim();

  for (var i = 0; i < clientes.length; i++) {
    if (clientes[i].cedula == cedula) {
      document.getElementById("nombre").value = clientes[i].nombre;
      document.getElementById("nacimiento").value = clientes[i].nacimiento;
      document.getElementById("trabajo").value = clientes[i].trabajo;
      document.getElementById("direccion").value = clientes[i].direccion;
      document.getElementById("celular").value = clientes[i].celular;
      document.getElementById("mensajeCli").innerHTML = "";
      return;
    }
  }
  mensaje("mensajeCli", "No existe un cliente con esa cédula.", "error");
}

function limpiarCampos() {
  document.getElementById("cedula").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("nacimiento").value = "";
  document.getElementById("trabajo").value = "";
  document.getElementById("direccion").value = "";
  document.getElementById("celular").value = "";
}

function mostrarClientes() {
  var tabla = "<tr><th>Cédula</th><th>Nombre</th><th>Nacimiento</th><th>Trabajo</th><th>Dirección</th><th>Celular</th></tr>";
  for (var i = 0; i < clientes.length; i++) {
    tabla = tabla + "<tr><td>" + escaparHTML(clientes[i].cedula) + "</td><td>" + escaparHTML(clientes[i].nombre) + "</td><td>" +
      escaparHTML(clientes[i].nacimiento) + "</td><td>" + escaparHTML(clientes[i].trabajo) + "</td><td>" +
      escaparHTML(clientes[i].direccion) + "</td><td>" + escaparHTML(clientes[i].celular) + "</td></tr>";
  }
  document.getElementById("tablaClientes").innerHTML = tabla;
}

function cambiarPeriodo() {
  var campo = document.getElementById("periodo");
  if (document.getElementById("tipoResumen").value == "diario") {
    campo.type = "date";
    campo.value = fechaHoy();
  } else {
    campo.type = "month";
    campo.value = fechaHoy().substring(0, 7);
  }
}

function resumen() {
  var periodo = document.getElementById("periodo").value;
  if (periodo == "") {
    mensaje("mensajeRes", "Seleccione un periodo.", "error");
    return;
  }

  var grupos = [
    { moneda: "USD", operacion: "COMPRA", cantidad: 0, divisa: 0, pesos: 0 },
    { moneda: "USD", operacion: "VENTA", cantidad: 0, divisa: 0, pesos: 0 },
    { moneda: "EUR", operacion: "COMPRA", cantidad: 0, divisa: 0, pesos: 0 },
    { moneda: "EUR", operacion: "VENTA", cantidad: 0, divisa: 0, pesos: 0 }
  ];

  var total = 0;
  for (var i = 0; i < transacciones.length; i++) {
    var t = transacciones[i];
    var inicio = t.fecha.substring(0, periodo.length);

    if (inicio == periodo) {
      total = total + 1;
      for (var j = 0; j < grupos.length; j++) {
        if (grupos[j].moneda == t.moneda && grupos[j].operacion == t.operacion) {
          grupos[j].cantidad = grupos[j].cantidad + 1;
          grupos[j].divisa = grupos[j].divisa + t.divisa;
          grupos[j].pesos = grupos[j].pesos + t.pesos;
        }
      }
    }
  }

  if (total == 0) {
    mensaje("mensajeRes", "No hay transacciones en ese periodo.", "error");
    document.getElementById("tablaResumen").innerHTML = "";
    return;
  }

  mensaje("mensajeRes", "Total de transacciones: " + total, "bien");

  var tabla = "<tr><th>Moneda</th><th>Operación</th><th>Cantidad</th><th>Total divisa</th><th>Total en pesos</th></tr>";
  for (var k = 0; k < grupos.length; k++) {
    var g = grupos[k];
    var nombreOp = "Compra de divisa";
    if (g.operacion == "VENTA") { nombreOp = "Venta de divisa"; }
    tabla = tabla + "<tr><td>" + g.moneda + "</td><td>" + nombreOp + "</td><td>" + g.cantidad +
      "</td><td>" + formato(g.divisa) + "</td><td>$" + formato(g.pesos) + "</td></tr>";
  }
  document.getElementById("tablaResumen").innerHTML = tabla;
}

document.getElementById("periodo").value = fechaHoy();
mostrarTasas();
mostrarClientes();
