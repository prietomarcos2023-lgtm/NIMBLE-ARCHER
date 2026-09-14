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

### Activar un nodo

- Cada interruptor del panel enciende/apaga su nodo.
- Al encender un nodo, su engranaje **aparece en órbita** alrededor del hub, conectado por una varilla de bronce.
- Si el nodo anterior no está activo, el interruptor aparece bloqueado — no se puede "saltar" etapas. Esto refleja la regla central del sistema: **el capital manda, no el tiempo.**
- Apagar un nodo apaga en cascada todos los nodos posteriores (si no tenés el Nodo 3 activo, no puede seguir activo el Nodo 4).

### Ficha técnica

Al tocar un engranaje ya activo en la órbita, aparece abajo su ficha completa: capital total, desglose CFD (Londres) / Futuros (New York), nota de la etapa y qué hace falta conseguir para desbloquear el siguiente nodo.

### Barra superior — indicadores

| Indicador | Qué muestra |
|---|---|
| **01 · Capital activo** | Total gestionado según el nodo más avanzado que esté ACTIVO |
| **02 · Capital después de Split** | Capital activo × % de reward share configurado (campo editable, default 90%) |
| **03 · Nodos activos** | Cuántos de los 6 nodos están encendidos |

El campo de **% share** junto al indicador 02 es editable — ajustalo según el reward share real de la prop firm que estés usando en ese momento (Lucid Flex = 90%, FTMO hasta 95%, etc.).

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

Todo el contenido de cada etapa vive en el array `NODES` al principio de `script.js`:

```js
{
  id: 'n1', idLabel: 'NODO 1', title: 'Sistema inicial',
  total: 15000, teeth: 10,
  london: ['$5K', '$10K'],
  note: '...',
  unlock: 'Texto de qué hace falta para el siguiente nodo',
}
```

- `total`: capital total gestionado en esa etapa (define el indicador 01/02 de la barra superior)
- `teeth`: cantidad de dientes del engranaje (más dientes = engranajes más grandes se ven bien con 14-18)
- `london` / `ny`: listas de cuentas que se muestran como chips en la ficha
- `final: true`: agrega el badge "OBJETIVO ALCANZADO" en la ficha (usalo en el último nodo)

Para agregar un Nodo 7 en adelante, simplemente agregá un objeto más al array — la órbita, el panel y las varillas se recalculan solos según cuántos nodos haya.

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
