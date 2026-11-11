# 💱 Casa de Cambio | Proyecto 4

Proyecto académico desarrollado para la asignatura **Diseño de Software II**.

🌐 **[Visitar página web](https://jhamesthread.github.io/proyecto-casa-de-cambio/)**

## 📌 Descripción

Sistema web para un negocio tipo casa de cambio. Permite simular operaciones de cambio de moneda entre pesos colombianos (COP), dólares estadounidenses (USD) y euros (EUR), utilizando la tasa representativa del sistema.

## 🚀 Funcionalidades

- **Simulador de cambio de moneda:**
  - Pesos colombianos a dólares.
  - Dólares a pesos colombianos.
  - Pesos colombianos a euros.
  - Euros a pesos colombianos.
- **Registro de clientes:** cédula, nombre, fecha de nacimiento, trabajo, dirección y celular.
- **Consulta de transacciones:** resúmenes diarios y mensuales por moneda.
- **Almacenamiento local:** conserva los datos utilizando `localStorage`.

## ⚙️ Restricciones del sistema

- Solo se aceptan transacciones de personas mayores de edad.
- Las operaciones están habilitadas de lunes a viernes, de 8:00 a. m. a 2:00 p. m.
- Límites de cambio por persona al día:
  - $30.000.000 COP.
  - $3.000 USD.
  - €2.000 EUR.

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage

## 📂 Estructura del proyecto

```text
proyecto-casa-de-cambio/
│
├── index.html
├── README.md
│
├── css/
│   └── estilos.css
│
├── js/
│   └── script.js
│
├── assets/
│   └── imagenes/
│       ├── Clientes.png
│       ├── Simulador.png
│       └── Transacciones.png
│
└── documentos/
    └── Proyecto_4_Casa_de_Cambio.pdf
```

## 💻 Cómo ejecutar el proyecto

**Opción 1. Página publicada**

Ingresa directamente desde el siguiente enlace:

[https://jhamesthread.github.io/proyecto-casa-de-cambio/](https://jhamesthread.github.io/proyecto-casa-de-cambio/)

**Opción 2. Ejecución local**

1. Descarga o clona este repositorio.
2. Conserva la estructura de carpetas del proyecto.
3. Abre el archivo `index.html` en tu navegador.

## 🖼️ Capturas del proyecto

### Módulo de clientes

![Módulo de clientes](assets/imagenes/Clientes.png)

### Simulador de cambio

![Simulador de cambio](assets/imagenes/Simulador.png)

### Módulo de transacciones

![Módulo de transacciones](assets/imagenes/Transacciones.png)

## 📄 Documentación

[Consultar documentación completa del proyecto (PDF)](documentos/Proyecto_4_Casa_de_Cambio.pdf)

## 🧪 Pruebas realizadas

| Prueba | Resultado esperado |
|---|---|
| Registrar un cliente menor de edad | El sistema impide su registro. |
| Realizar un cambio fuera del horario | El sistema informa el horario permitido. |
| Cambiar más de 3.000 USD | El sistema advierte que se supera el límite. |
| Ingresar una cédula no registrada | El sistema solicita registrar primero al cliente. |

## ⚠️ Consideraciones

- Los datos se almacenan localmente en el navegador mediante `localStorage`.
- La información no se sincroniza automáticamente entre diferentes dispositivos o navegadores.
- Si se eliminan los datos del navegador, se pueden perder los registros almacenados.

## 👨‍💻 Autor

Desarrollado por [@jhamesthread](https://github.com/jhamesthread).

---

**Proyecto académico | Diseño de Software II**
