// Importar: Bootstrap 6 no crea window.bootstrap
import { Toast } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";

// ---------- Funciones de la semana 10 ----------
const soles = (monto) => `S/ ${monto.toFixed(2)}`;                      // flecha
const sumar = (...numeros) => numeros.reduce((a, n) => a + n, 0);       // rest
const aplicarDescuento = (total, porcentaje = 10) => total * (1 - porcentaje / 100); // por defecto

function contarUnidades(lista) {                                        // recursividad
  if (lista.length === 0) return 0;
  const [primero, ...resto] = lista;
  return primero.cantidad + contarUnidades(resto);
}

function crearCarrito(itemsIniciales = []) {                            // closure
  let items = itemsIniciales;
  return {
    agregar(producto, cantidad = 1) {
      const existe = items.find((it) => it.id === producto.id);
      if (existe) existe.cantidad += cantidad;
      else items.push({ ...producto, cantidad });
    },
    quitar(id) { items = items.filter((it) => it.id !== id); },
    vaciar() { items = []; },
    lista: () => items,
    subtotal: () => sumar(...items.map((it) => it.precio * it.cantidad)),
    unidades: () => contarUnidades(items),
  };
}

// ---------- Datos ----------
const productos = [
  { id: 1, nombre: "Torta de chocolate", precio: 55, categoria: "Tortas" },
  { id: 2, nombre: "Torta tres leches", precio: 48, categoria: "Tortas" },
  { id: 3, nombre: "Pan de yema", precio: 1.5, categoria: "Panes" },
  { id: 4, nombre: "Pan integral", precio: 1, categoria: "Panes" },
  { id: 5, nombre: "Alfajores (docena)", precio: 18, categoria: "Dulces" },
  { id: 6, nombre: "Cheesecake de fresa", precio: 40, categoria: "Dulces" },
  // Práctica: categoría nueva "Salados"
  { id: 7, nombre: "Empanada de carne", precio: 4.5, categoria: "Salados" },
  { id: 8, nombre: "Pan con chicharrón", precio: 8, categoria: "Salados" },
  { id: 9, nombre: "Empanada de queso", precio: 4, categoria: "Salados" },
  { id: 10, nombre: "Tamal pequeño", precio: 6, categoria: "Salados" },
];

// ---------- Estado ----------
const carrito = crearCarrito(JSON.parse(localStorage.getItem("carrito-delicia") || "[]"));
let categoria = "Todos";
let texto = "";

const $ = (s) => document.querySelector(s);

// ---------- Vistas ----------
const tarjetaProducto = (p) => `
  <div class="col">
    <article class="card card-body h-100">
      <span class="badge theme-primary mb-3">${p.categoria}</span>
      <h3 class="fs-lg">${p.nombre}</h3>
      <p class="precio">${soles(p.precio)}</p>
      <button class="btn btn-solid theme-primary" data-id="${p.id}">Agregar</button>
    </article>
  </div>`;

function pintarFiltros() {
  const cats = ["Todos", ...new Set(productos.map((p) => p.categoria))];
  $("#filtros").innerHTML = cats.map((c) => `
    <li class="nav-item"><button class="nav-link ${c === categoria ? "active" : ""}" data-cat="${c}">${c}</button></li>`).join("");
}

function pintarProductos() {
  const visibles = productos.filter((p) =>
    (categoria === "Todos" || p.categoria === categoria) &&
    p.nombre.toLowerCase().includes(texto.toLowerCase()));
  $("#productos").innerHTML = visibles.length
    ? visibles.map(tarjetaProducto).join("")
    : `<p class="fg-secondary">No hay productos con ese filtro.</p>`;
}

function pintarCarrito() {
  const sub = carrito.subtotal();
  const conDescuento = sub > 100;                       // más de S/ 100 → 10 %
  const total = conDescuento ? aplicarDescuento(sub) : sub;
  $("#listaCarrito").innerHTML = carrito.lista().map((it) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <span>${it.nombre} × ${it.cantidad}</span>
      <span>${soles(it.precio * it.cantidad)}
        <button class="btn btn-text theme-danger" data-quitar="${it.id}" aria-label="Quitar ${it.nombre}">✕</button>
      </span>
    </li>`).join("") || `<li class="list-group-item fg-secondary">Aún no agregas productos.</li>`;
  $("#subtotal").textContent = soles(sub);
  $("#descuento").textContent = conDescuento ? "Descuento del 10 % aplicado" : "";
  $("#total").textContent = soles(total);
  $("#contador").textContent = carrito.unidades();
  localStorage.setItem("carrito-delicia", JSON.stringify(carrito.lista()));
}

function avisar(mensaje) {
  $("#avisoTexto").textContent = mensaje;
  Toast.getOrCreateInstance($("#aviso")).show();
}

// ---------- Eventos ----------
$("#productos").addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  const p = productos.find((x) => x.id === Number(id));
  carrito.agregar(p);
  pintarCarrito();
  avisar(`${p.nombre} agregado al carrito`);
});
$("#filtros").addEventListener("click", (e) => {
  if (!e.target.dataset.cat) return;
  categoria = e.target.dataset.cat;
  pintarFiltros(); pintarProductos();
});
$("#buscar").addEventListener("input", (e) => { texto = e.target.value; pintarProductos(); });
$("#listaCarrito").addEventListener("click", (e) => {
  if (!e.target.dataset.quitar) return;
  carrito.quitar(Number(e.target.dataset.quitar));
  pintarCarrito();
});
$("#vaciar").addEventListener("click", () => { carrito.vaciar(); pintarCarrito(); });
$("#formPedido").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#alertaPedido").hidden = false;
  e.target.reset();
});

pintarFiltros(); pintarProductos(); pintarCarrito();
