[README (1).md](https://github.com/user-attachments/files/32218902/README.1.md)
# ⚙ CASHFLOW SYSTEM — Sala de Máquinas

Dashboard steampunk de progresión de capital. Cada etapa del sistema (Nodo 1 a Nodo 6) es un engranaje que orbita alrededor del engranaje central (`CASHFLOW SYSTEM`). Los nodos no se desbloquean por calendario — se activan a mano, cuando el capital real está listo para rotar.

---

## Estructura de archivos

```
cashflow-steampunk/
├── index.html     → estructura (barra superior, órbita, panel, ficha, pie)
├── style.css       → tema visual steampunk (latón, bronce, remaches)
├── script.js       → datos de nodos, generador de engranajes SVG, lógica
└── README.md       → este archivo
```

Sin build, sin dependencias, sin backend. Abrí `index.html` en el navegador y funciona.

---

## Cómo correrlo

**Opción 1 — directo:**
Doble click en `index.html`.

**Opción 2 — servidor local (recomendado):**
```bash
cd cashflow-steampunk
python3 -m http.server 8000
```
Abrir `http://localhost:8000`

---

## Cómo funciona

### El engranaje central (hub)

Está siempre visible y en movimiento. Al hacer click abre el **panel de control**: una lista de los 6 nodos con un interruptor (switch) por cada uno.

### Activar un nodo — ahora con 3 estados

Cada nodo del panel tiene un **status pill** que rotás con click:

| Estado | Qué significa | Efecto visual |
|---|---|---|
| 🔒 **LOCKED** | Las cuentas todavía no existen | Engranaje apagado/gris en la órbita |
| 🟡 **READY** | Cuentas conseguidas, esperando entrar a rotación | Engranaje dorado con pulso suave, quieto |
| 🟢 **ACTIVE** | Cuentas incorporadas a la rotación real | Engranaje girando, brillo cálido, cuenta para el capital |

Un nodo solo puede avanzar más allá de LOCKED si el nodo anterior está en ACTIVE. Si desactivás un nodo (lo bajás de ACTIVE), todo lo posterior cae en cascada a LOCKED — nunca queda un estado "huérfano" que no tenga sentido con la cadena real de capital.

Todos los nodos (incluso LOCKED) están siempre visibles en la órbita, para que veas el mapa completo del sistema aunque todavía no hayas llegado ahí — pero oscurecidos, sin girar, hasta que sean reales.

### Barra superior — 4 indicadores

| # | Indicador | Qué muestra |
|---|---|---|
| 01 | **Capital funded** | Capital del nodo ACTIVE más avanzado |
| 02 | **Capital después del split** | Capital funded × % de reward share (editable) |
| 03 | **Nodos activos** | Cuántos nodos están en ACTIVE, sobre el total |
| 04 | **Falta para el próximo nodo** | Diferencia entre el capital actual y el total del siguiente nodo, con su nombre |

Con el indicador 04 tu cerebro ve de una: *"estoy acá → el próximo objetivo estructural está a $X"* — sin pensar en qué mes del calendario estás.

---

## Persistencia

El estado (qué nodos están activos + el % de split configurado) se guarda en `localStorage` del navegador. Se mantiene aunque cierres la pestaña. Es local a ese navegador/dispositivo — no hay sincronización entre dispositivos sin backend.

Para resetear todo desde cero, abrí la consola del navegador (F12) y corré:
```js
localStorage.removeItem('cashflow-steampunk-state');
location.reload();
```

---

## Personalizar los nodos

Los 6 nodos base viven en el array `BASE_NODES` al principio de `script.js`. Pero **no hace falta tocar código** para seguir creciendo: en el panel de control hay un botón **"+ Nuevo nodo"** al final de la lista.

Completá:
- **Nombre del nodo** (ej. "Nodo 7 — Refuerzo Q1 2027")
- **Capital total gestionado** en esa etapa
- **Cuentas CFD · London** separadas por coma (ej. `100K, 100K, 100K`)
- **Cuentas Futuros · New York** separadas por coma
- **Nota** de qué representa la etapa

El nodo nuevo entra en **LOCKED** por defecto — lo marcás READY cuando consigas las cuentas reales, y ACTIVE cuando entren a rotación. Se guarda en tu navegador (localStorage) y queda enganchado en la cadena secuencial como cualquier otro nodo: no se activa si el anterior no está en ACTIVE.

Para borrar un nodo personalizado, usá la **×** que aparece al lado suyo en el panel (los 6 nodos base no se pueden borrar desde la UI, viven en el código).

---

## Integrar el indicador "Capital después de Split" en tu Mareblu Trading Journal

Este dashboard es un proyecto standalone, separado de tu `trading-dashboard` (Mareblu Trading Journal) en GitHub. Si querés el mismo indicador ahí (siguiendo el estilo de badge numerado que ya usás — ej. el "02 Retiros de trading"), la lógica que necesitás portar es esta:

```js
function capitalDespuesDeSplit(capitalActivo, splitPercent){
  return capitalActivo * (splitPercent / 100);
}
```

Con eso más un input numérico para el % de share, podés clonar el mismo badge visual que ya tenés en esa app (número en caja + título + valor) sin tener que traer todo este proyecto steampunk — la lógica es independiente del diseño.

---

## Filosofía

> No avanzo porque pasó un mes. Avanzo porque construí la siguiente unidad de capital y está lista para rotar.

**BUILD THE SYSTEM. ROTATE THE CAPITAL. PROTECT THE ACCOUNTS. SCALE THE CASHFLOW.**
