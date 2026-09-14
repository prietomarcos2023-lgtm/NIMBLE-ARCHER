// ============================================================
// CASHFLOW SYSTEM — SALA DE MÁQUINAS
// Dashboard de progresión de capital con engranajes steampunk
// ============================================================

// ---------- DATOS DE NODOS ----------
const NODES = [
  {
    id: 'n1', idLabel: 'NODO 1', title: 'Sistema inicial',
    total: 15000, teeth: 10,
    london: ['$5K', '$10K'],
    note: 'Se opera durante las semanas disponibles ejecutando el sistema correctamente. No existe objetivo obligatorio de ganancias — el objetivo es demostrar que la rotación funciona.',
    unlock: 'Ganancias de este nodo permiten adquirir <b>$10K adicional</b> + <b>$25K adicional</b>.',
  },
  {
    id: 'n2', idLabel: 'NODO 2', title: 'Primera rotación',
    total: 50000, teeth: 11,
    london: ['$5K', '$10K A', '$10K B', '$25K'],
    note: 'Bloque A ($10K A + $25K): primera rotación, luego preparadas para retiro. Bloque B ($10K B + $5K): segunda rotación. No hace falta operar todas las cuentas al mismo tiempo.',
    unlock: 'La cuenta $5K sale de rotación. Se consigue <b>$25K adicional</b> (CFD) + la primera cuenta de <b>Futuros $50K</b> (NY).',
  },
  {
    id: 'n3', idLabel: 'NODO 3', title: 'Separación CFD + Futuros',
    total: 120000, teeth: 12,
    london: ['$25K', '$25K', '$10K', '$10K'],
    ny: ['$50K Lucid Flex'],
    note: 'Primera vez que aparece la arquitectura: Londres → CFDs, New York → Futuros. Bloque A ($25K+$25K) y Bloque B ($10K+$10K) rotan en Londres; Futuros opera independiente.',
    unlock: 'Las dos cuentas $10K se reemplazan por <b>$50K + $50K</b> (CFD). Se consigue una segunda cuenta de <b>Futuros $50K</b> (NY).',
  },
  {
    id: 'n4', idLabel: 'NODO 4', title: 'Expansión',
    total: 250000, teeth: 13,
    london: ['$25K', '$25K', '$50K', '$50K'],
    ny: ['$50K', '$50K'],
    note: 'La estructura abandona progresivamente las cuentas pequeñas y aumenta el tamaño promedio por cuenta.',
    unlock: 'Las cuentas $25K se retiran de rotación. Se consiguen <b>$100K + $100K</b> (CFD). Futuros escala a <b>5×$50K</b> (NY).',
  },
  {
    id: 'n5', idLabel: 'NODO 5', title: 'Salto de escala',
    total: 550000, teeth: 14,
    london: ['$50K', '$50K', '$100K', '$100K'],
    ny: ['$50K', '$50K', '$50K', '$50K', '$50K'],
    note: 'Paso de una estructura de cuentas pequeñas/medianas a una estructura basada principalmente en cuentas grandes.',
    unlock: 'Las cuentas CFD escalan a <b>$100K×4</b>. Las 5 cuentas de Futuros escalan de $50K a <b>$100K cada una</b>.',
  },
  {
    id: 'n6', idLabel: 'NODO 6', title: 'Escala completa', final: true,
    total: 900000, teeth: 16,
    london: ['$100K', '$100K', '$100K', '$100K'],
    ny: ['$100K', '$100K', '$100K', '$100K', '$100K'],
    note: 'Capital gestionado dentro de la zona objetivo ($800K–$1M). La misma disciplina que administraba la primera cuenta de $5K administra esta estructura. La rotación sigue siendo el mecanismo principal — no aumenta la frecuencia de operación, aumenta la capacidad de capital.',
  },
];

const STORAGE_KEY = 'cashflow-steampunk-state';
let state = { active: {}, split: 90 };

// ---------- PERSISTENCIA (localStorage) ----------
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ state = JSON.parse(raw); }
  }catch(e){ /* sin datos guardados */ }
  if(!state.active) state.active = {};
  if(!state.split) state.split = 90;
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(e){ console.error('No se pudo guardar', e); }
}

// ---------- UTILIDADES ----------
function fmt(n){ return '$' + Math.round(n).toLocaleString('en-US'); }

function prevActive(index){
  if(index === 0) return true; // n1 solo depende del hub
  return !!state.active[NODES[index-1].id];
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> t.classList.remove('show'), 2200);
}

// ---------- GENERADOR DE ENGRANAJE (SVG) ----------
function polar(cx, cy, r, angle){
  return [ cx + r*Math.cos(angle), cy + r*Math.sin(angle) ];
}

function gearPolygonPoints(cx, cy, teeth, outerR, rootR){
  const step = (Math.PI*2)/teeth;
  const pts = [];
  for(let i=0;i<teeth;i++){
    const a0 = i*step;
    const tStart = a0 + step*0.16;
    const tEnd   = a0 + step*0.46;
    const rootEnd = a0 + step;
    pts.push(polar(cx,cy,rootR,a0));
    pts.push(polar(cx,cy,rootR,tStart));
    pts.push(polar(cx,cy,outerR,tStart));
    pts.push(polar(cx,cy,outerR,tEnd));
    pts.push(polar(cx,cy,rootR,tEnd));
  }
  return pts.map(p=>p.join(',')).join(' ');
}

function gearSVG({ teeth=12, active=false, isHub=false, socketColor }){
  const size = 200, c = 100;
  const outerR = 92, rootR = 74, holeR = isHub ? 30 : 24;
  const bodyFill = active
    ? 'url(#gradActive)'
    : (isHub ? 'url(#gradHub)' : 'url(#gradLocked)');
  const points = gearPolygonPoints(c, c, teeth, outerR, rootR);

  // remaches internos
  let rivets = '';
  const rivetCount = 6;
  for(let i=0;i<rivetCount;i++){
    const a = (Math.PI*2/rivetCount)*i;
    const [rx, ry] = polar(c, c, (rootR+holeR)/2 + 4, a);
    rivets += `<circle cx="${rx}" cy="${ry}" r="3.4" fill="#0000003a"/>`;
    rivets += `<circle cx="${rx-0.6}" cy="${ry-0.6}" r="2.1" fill="#ffffff30"/>`;
  }

  return `
  <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gradActive" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#8fd4b0"/>
        <stop offset="55%" stop-color="#3d5f4b"/>
        <stop offset="100%" stop-color="#233a2e"/>
      </radialGradient>
      <radialGradient id="gradHub" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#e8c674"/>
        <stop offset="55%" stop-color="#a9812f"/>
        <stop offset="100%" stop-color="#6b4e1f"/>
      </radialGradient>
      <radialGradient id="gradLocked" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#8a765a"/>
        <stop offset="55%" stop-color="#54452f"/>
        <stop offset="100%" stop-color="#332a1c"/>
      </radialGradient>
    </defs>
    <polygon points="${points}" fill="${bodyFill}" stroke="#00000055" stroke-width="1.5"/>
    <circle cx="${c}" cy="${c}" r="${rootR-6}" fill="${bodyFill}" stroke="#00000040" stroke-width="1"/>
    ${rivets}
    <circle cx="${c}" cy="${c}" r="${holeR}" fill="${socketColor}"/>
    <circle cx="${c}" cy="${c}" r="${holeR}" fill="none" stroke="#00000055" stroke-width="2"/>
  </svg>`;
}

// ---------- ÓRBITA: posiciones de satélites ----------
function orbitPositions(count, radius, cx, cy){
  const positions = [];
  const startAngle = -Math.PI/2; // arranca arriba (12 en punto)
  const step = (Math.PI*2)/count;
  for(let i=0;i<count;i++){
    const a = startAngle + step*i;
    positions.push({ x: cx + radius*Math.cos(a), y: cy + radius*Math.sin(a), angle:a });
  }
  return positions;
}

// ---------- RENDER: satélites + varillas ----------
function renderOrbit(){
  const stage = document.getElementById('orbitStage');
  const satWrap = document.getElementById('satellites');
  const rods = document.getElementById('rodsSvg');
  const rect = stage.getBoundingClientRect();
  const cx = rect.width/2, cy = rect.height/2;
  const radius = rect.width < 500 ? rect.width*0.36 : 250;

  const positions = orbitPositions(NODES.length, radius, cx, cy);

  rods.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  let rodsHtml = '';

  satWrap.innerHTML = '';

  NODES.forEach((node, i)=>{
    const pos = positions[i];
    const isActive = !!state.active[node.id];

    // varilla hub -> satélite
    rodsHtml += `<line x1="${cx}" y1="${cy}" x2="${pos.x}" y2="${pos.y}" class="${isActive?'rod-active':''}" />`;
    if(isActive){
      rodsHtml += `<circle class="rivet-svg" cx="${pos.x}" cy="${pos.y}" r="4"/>`;
    }
    // varilla de cadena secuencial satélite(i-1) -> satélite(i)
    if(i>0){
      const prevPos = positions[i-1];
      const prevOn = !!state.active[NODES[i-1].id];
      if(isActive && prevOn){
        rodsHtml += `<line x1="${prevPos.x}" y1="${prevPos.y}" x2="${pos.x}" y2="${pos.y}" class="rod-active" stroke-width="2.4" />`;
      }
    }

    const satEl = document.createElement('div');
    satEl.className = 'satellite' + (isActive ? ' is-on' : '');
    satEl.style.left = pos.x + 'px';
    satEl.style.top = pos.y + 'px';
    satEl.dataset.id = node.id;

    const spinClass = i % 2 === 0 ? 'gear-spin' : 'gear-spin-rev';

    satEl.innerHTML = `
      <div class="gear-socket">
        <div class="gear-wrap ${isActive ? spinClass : ''}">
          ${gearSVG({ teeth: node.teeth, active:isActive, socketColor:'#1E1610' })}
        </div>
        <span class="sat-id">${node.idLabel}</span>
      </div>
      ${isActive ? `<div class="sat-total">${fmt(node.total)}</div>` : ''}
    `;

    if(isActive){
      satEl.addEventListener('click', ()=> renderDetail(node));
    }

    satWrap.appendChild(satEl);
  });

  rods.innerHTML = rodsHtml;
}

function renderHub(){
  const hubGear = document.getElementById('hubGear');
  hubGear.className = 'gear-wrap gear-spin';
  hubGear.innerHTML = gearSVG({ teeth: 18, active:false, isHub:true, socketColor:'#1E1610' });
}

// ---------- PANEL DE CONTROL ----------
function renderPanel(){
  const list = document.getElementById('panelList');
  list.innerHTML = '';

  NODES.forEach((node, i)=>{
    const isActive = !!state.active[node.id];
    const canToggle = prevActive(i) || isActive;

    const li = document.createElement('li');
    li.className = 'panel-item';
    li.innerHTML = `
      <div class="toggle ${isActive?'checked':''} ${!canToggle?'locked':''}" data-id="${node.id}"></div>
      <div class="panel-item-body">
        <div class="panel-item-title">${node.idLabel} — ${node.title}</div>
        <div class="panel-item-total">${fmt(node.total)} capital total gestionado</div>
        ${!canToggle ? `<div class="panel-item-note">Activá ${NODES[i-1].idLabel} primero</div>` : ''}
      </div>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll('.toggle').forEach(toggle=>{
    toggle.addEventListener('click', ()=>{
      const id = toggle.dataset.id;
      const idx = NODES.findIndex(n=>n.id===id);
      if(!prevActive(idx) && !state.active[id]){
        showToast('Bloqueado — activá el nodo anterior primero');
        return;
      }
      const turningOn = !state.active[id];
      state.active[id] = turningOn;

      // si se apaga un nodo, apagar en cascada los siguientes
      if(!turningOn){
        for(let j=idx+1;j<NODES.length;j++){
          state.active[NODES[j].id] = false;
        }
      }
      saveState();
      renderAll();
      if(turningOn) renderDetail(node_by_id(id));
    });
  });
}

function node_by_id(id){ return NODES.find(n=>n.id===id); }

// ---------- FICHA DE NODO ----------
function renderDetail(node){
  const box = document.getElementById('nodeDetail');
  if(!node){
    box.innerHTML = '<p class="detail-placeholder">Tocá un engranaje activo para ver su ficha técnica.</p>';
    return;
  }
  box.innerHTML = `
    <div class="detail-card">
      <div class="detail-top">
        <div>
          <div class="detail-id">${node.idLabel}${node.final ? ' · OBJETIVO ALCANZADO' : ''}</div>
          <div class="detail-title">${node.title}</div>
        </div>
        <div class="detail-total">${fmt(node.total)}</div>
      </div>
      <div class="detail-blocks">
        ${node.london ? `<div class="detail-col">
          <div class="detail-col-label">CFD · LONDON</div>
          <div class="detail-chip-row">${node.london.map(a=>`<span class="detail-chip">${a}</span>`).join('')}</div>
        </div>` : ''}
        ${node.ny ? `<div class="detail-col ny">
          <div class="detail-col-label">FUTUROS · NEW YORK</div>
          <div class="detail-chip-row">${node.ny.map(a=>`<span class="detail-chip">${a}</span>`).join('')}</div>
        </div>` : ''}
      </div>
      <div class="detail-note">${node.note}</div>
      ${node.unlock ? `<div class="detail-unlock">Para desbloquear el siguiente nodo: ${node.unlock}</div>` : ''}
    </div>
  `;
}

// ---------- GAUGES (barra superior) ----------
function currentActiveTotal(){
  let val = 0;
  for(let i=NODES.length-1;i>=0;i--){
    if(state.active[NODES[i].id]){ val = NODES[i].total; break; }
  }
  return val;
}

function renderGauges(){
  const activeTotal = currentActiveTotal();
  const activeCount = NODES.filter(n=>state.active[n.id]).length;
  const split = Math.min(100, Math.max(1, Number(state.split) || 90));

  document.getElementById('statActiveCapital').textContent = fmt(activeTotal);
  document.getElementById('statSplitCapital').textContent = fmt(activeTotal * (split/100));
  document.getElementById('statNodesActive').textContent = `${activeCount} / ${NODES.length}`;
  document.getElementById('splitPercent').value = split;
}

// ---------- PANEL TOGGLE (hub click) ----------
function initHubToggle(){
  const hubBtn = document.getElementById('hubButton');
  const panel = document.getElementById('controlPanel');
  hubBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', (e)=>{
    if(!panel.contains(e.target) && e.target !== hubBtn){
      panel.classList.remove('open');
    }
  });
}

function initSplitInput(){
  const input = document.getElementById('splitPercent');
  input.addEventListener('input', ()=>{
    state.split = Number(input.value) || 90;
    saveState();
    renderGauges();
  });
}

// ---------- RENDER TOTAL ----------
function renderAll(){
  renderHub();
  renderOrbit();
  renderPanel();
  renderGauges();
}

window.addEventListener('resize', renderOrbit);

loadState();
renderAll();
initHubToggle();
initSplitInput();
