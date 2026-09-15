// ============================================================
// CASHFLOW SYSTEM — SALA DE MÁQUINAS
// Dashboard de progresión de capital con engranajes steampunk
// Estados por nodo: LOCKED (no existen las cuentas) / READY
// (cuentas conseguidas, esperando activación) / ACTIVE (en rotación)
// ============================================================

// ---------- NODOS BASE (roadmap original) ----------
const BASE_NODES = [
  {
    id: 'n1', idLabel: 'NODO 1', title: 'Sistema inicial',
    total: 15000, teeth: 10,
    london: ['$5K', '$10K'],
    note: 'Se opera durante las semanas disponibles ejecutando el sistema correctamente. No existe objetivo obligatorio de ganancias — el objetivo es demostrar que la rotación funciona.',
    requires: 'Cuentas $5K y $10K conseguidas y listas para operar.',
  },
  {
    id: 'n2', idLabel: 'NODO 2', title: 'Primera rotación',
    total: 50000, teeth: 11,
    london: ['$5K', '$10K A', '$10K B', '$25K'],
    note: 'Bloque A ($10K A + $25K): primera rotación, luego preparadas para retiro. Bloque B ($10K B + $5K): segunda rotación. No hace falta operar todas las cuentas al mismo tiempo.',
    requires: 'Ganancias de Nodo 1 permiten adquirir $10K adicional + $25K adicional.',
  },
  {
    id: 'n3', idLabel: 'NODO 3', title: 'Separación CFD + Futuros',
    total: 120000, teeth: 12,
    london: ['$25K', '$25K', '$10K', '$10K'],
    ny: ['$50K Lucid Flex'],
    note: 'Primera vez que aparece la arquitectura: Londres → CFDs, New York → Futuros. Bloque A ($25K+$25K) y Bloque B ($10K+$10K) rotan en Londres; Futuros opera independiente.',
    requires: 'La cuenta $5K sale de rotación. Se consigue $25K adicional (CFD) + la primera cuenta de Futuros $50K (NY).',
  },
  {
    id: 'n4', idLabel: 'NODO 4', title: 'Expansión',
    total: 250000, teeth: 13,
    london: ['$25K', '$25K', '$50K', '$50K'],
    ny: ['$50K', '$50K'],
    note: 'La estructura abandona progresivamente las cuentas pequeñas y aumenta el tamaño promedio por cuenta.',
    requires: 'Las dos cuentas $10K se reemplazan por $50K + $50K (CFD). Se consigue una segunda cuenta de Futuros $50K (NY).',
  },
  {
    id: 'n5', idLabel: 'NODO 5', title: 'Salto de escala',
    total: 550000, teeth: 14,
    london: ['$50K', '$50K', '$100K', '$100K'],
    ny: ['$50K', '$50K', '$50K', '$50K', '$50K'],
    note: 'Paso de una estructura de cuentas pequeñas/medianas a una estructura basada principalmente en cuentas grandes.',
    requires: 'Las cuentas $25K se retiran de rotación. Se consiguen $100K + $100K (CFD). Futuros escala a 5×$50K (NY).',
  },
  {
    id: 'n6', idLabel: 'NODO 6', title: 'Escala completa', milestone: true,
    total: 900000, teeth: 16,
    london: ['$100K', '$100K', '$100K', '$100K'],
    ny: ['$100K', '$100K', '$100K', '$100K', '$100K'],
    note: 'Capital gestionado dentro de la zona objetivo ($800K–$1M) del roadmap original. La misma disciplina que administraba la primera cuenta de $5K administra esta estructura.',
    requires: 'Las cuentas CFD escalan a $100K×4. Las 5 cuentas de Futuros escalan de $50K a $100K cada una.',
  },
];

const STATE_KEY  = 'cashflow-steampunk-state';
const CUSTOM_KEY = 'cashflow-steampunk-custom-nodes';
const STATUS_ORDER = ['locked', 'ready', 'active'];
const STATUS_META = {
  locked: { icon: '🔒', label: 'LOCKED' },
  ready:  { icon: '🟡', label: 'READY' },
  active: { icon: '🟢', label: 'ACTIVE' },
};

let state = { status: {}, split: 90 };
let customNodes = [];
let NODES = [];

// ---------- PERSISTENCIA (localStorage) ----------
function loadState(){
  try{
    const raw = localStorage.getItem(STATE_KEY);
    if(raw){ state = JSON.parse(raw); }
  }catch(e){ /* sin datos guardados */ }
  if(!state.status) state.status = {};
  if(!state.split) state.split = 90;

  try{
    const rawCustom = localStorage.getItem(CUSTOM_KEY);
    if(rawCustom){ customNodes = JSON.parse(rawCustom); }
  }catch(e){ customNodes = []; }

  rebuildNodes();
}
function saveState(){
  try{ localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
  catch(e){ console.error('No se pudo guardar estado', e); }
}
function saveCustomNodes(){
  try{ localStorage.setItem(CUSTOM_KEY, JSON.stringify(customNodes)); }
  catch(e){ console.error('No se pudo guardar nodos nuevos', e); }
}

function rebuildNodes(){
  NODES = [...BASE_NODES, ...customNodes];
}

function statusOf(node){ return state.status[node.id] || 'locked'; }

// ---------- CREAR / BORRAR NODOS PERSONALIZADOS ----------
function parseAccountList(raw){
  return raw.split(',')
    .map(s=>s.trim())
    .filter(Boolean)
    .map(s => s.startsWith('$') ? s : '$' + s);
}

function addCustomNode({ title, total, london, ny, note, requires }){
  const index = NODES.length;
  const newNode = {
    id: 'custom-' + Date.now(),
    idLabel: 'NODO ' + (index + 1),
    title: title || ('Nodo ' + (index + 1)),
    total: Number(total) || 0,
    teeth: 12 + (index % 6),
    custom: true,
    note: note || 'Nodo agregado manualmente.',
    requires: requires || 'Definido a mano por vos — marcalo READY cuando consigas las cuentas.',
  };
  if(london) newNode.london = parseAccountList(london);
  if(ny) newNode.ny = parseAccountList(ny);

  customNodes.push(newNode);
  saveCustomNodes();
  rebuildNodes();
}

function deleteCustomNode(id){
  customNodes = customNodes.filter(n => n.id !== id);
  delete state.status[id];
  saveCustomNodes();
  saveState();
  rebuildNodes();
}

// ---------- UTILIDADES ----------
function fmt(n){ return '$' + Math.round(n).toLocaleString('en-US'); }

function prevActive(index){
  if(index === 0) return true; // el primer nodo solo depende del hub
  return statusOf(NODES[index-1]) === 'active';
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> t.classList.remove('show'), 2200);
}

// ---------- CICLO DE ESTADO DE UN NODO ----------
function cycleStatus(id){
  const idx = NODES.findIndex(n=>n.id===id);
  const cur = statusOf(NODES[idx]);

  if(idx>0 && !prevActive(idx) && cur === 'locked'){
    showToast('Bloqueado — activá ' + NODES[idx-1].idLabel + ' primero');
    return;
  }

  const next = STATUS_ORDER[(STATUS_ORDER.indexOf(cur)+1) % STATUS_ORDER.length];
  state.status[id] = next;

  // si este nodo deja de estar ACTIVO, todo lo posterior vuelve a LOCKED
  if(next !== 'active'){
    for(let j=idx+1;j<NODES.length;j++){
      state.status[NODES[j].id] = 'locked';
    }
  }
  saveState();
}

// ---------- GENERADOR DE ENGRANAJE (SVG) — satélites ----------
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
    pts.push(polar(cx,cy,rootR,a0));
    pts.push(polar(cx,cy,rootR,tStart));
    pts.push(polar(cx,cy,outerR,tStart));
    pts.push(polar(cx,cy,outerR,tEnd));
    pts.push(polar(cx,cy,rootR,tEnd));
  }
  return pts.map(p=>p.join(',')).join(' ');
}

function gearSVG({ teeth=12, status='locked', uid }){
  const size = 200, c = 100;
  const outerR = 92, rootR = 74, holeR = 24;
  const gradId = 'grad-' + status + '-' + uid;
  const points = gearPolygonPoints(c, c, teeth, outerR, rootR);

  const grads = {
    active: ['#ffdf9e', '#c79a44', '#7a5f2e'],
    ready:  ['#c8ad78', '#7a6540', '#4a3a28'],
    locked: ['#5c5040', '#3a3226', '#221d16'],
  };
  const [g0,g1,g2] = grads[status] || grads.locked;

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
      <radialGradient id="${gradId}" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="${g0}"/>
        <stop offset="55%" stop-color="${g1}"/>
        <stop offset="100%" stop-color="${g2}"/>
      </radialGradient>
    </defs>
    <polygon points="${points}" fill="url(#${gradId})" stroke="#00000055" stroke-width="1.5"/>
    <circle cx="${c}" cy="${c}" r="${rootR-6}" fill="url(#${gradId})" stroke="#00000040" stroke-width="1"/>
    ${rivets}
    <circle cx="${c}" cy="${c}" r="${holeR}" fill="#1E1610"/>
    <circle cx="${c}" cy="${c}" r="${holeR}" fill="none" stroke="#00000055" stroke-width="2"/>
  </svg>`;
}

// ---------- HUB ORNAMENTAL (núcleo central) ----------
function hubSVG(){
  return `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="hubBrass" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#f0d68a"/>
        <stop offset="50%" stop-color="#c79a44"/>
        <stop offset="100%" stop-color="#6b4e1f"/>
      </radialGradient>
      <radialGradient id="hubCore" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#eafff6"/>
        <stop offset="35%" stop-color="#6fe3c9"/>
        <stop offset="75%" stop-color="#0f5c52"/>
        <stop offset="100%" stop-color="#0a2e2a"/>
      </radialGradient>
      <filter id="hubGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="4.2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- anillo exterior fijo -->
    <circle cx="100" cy="100" r="96" fill="none" stroke="#120d08" stroke-width="3"/>
    <circle cx="100" cy="100" r="90" fill="url(#hubBrass)" stroke="#000" stroke-opacity="0.35" stroke-width="2"/>
    <circle cx="100" cy="100" r="78" fill="#1c150e" stroke="#000" stroke-opacity="0.4" stroke-width="1"/>

    <!-- anillo giratorio de remaches + marcas -->
    <g class="hub-rotate-ring">
      ${Array.from({length:16}).map((_,i)=>{
        const a = (Math.PI*2/16)*i;
        const [x,y] = [100 + 84*Math.cos(a), 100 + 84*Math.sin(a)];
        return `<circle cx="${x}" cy="${y}" r="3.2" fill="#3a2c1c" stroke="#f0d68a" stroke-width="0.6"/>`;
      }).join('')}
      ${Array.from({length:32}).map((_,i)=>{
        const a = (Math.PI*2/32)*i;
        const [x1,y1] = [100 + 82*Math.cos(a), 100 + 82*Math.sin(a)];
        const [x2,y2] = [100 + 87*Math.cos(a), 100 + 87*Math.sin(a)];
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3a2c1c" stroke-width="1.4"/>`;
      }).join('')}
    </g>

    <!-- núcleo interior -->
    <circle cx="100" cy="100" r="70" fill="url(#hubCore)"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="#0a2e2a" stroke-width="2"/>

    <g filter="url(#hubGlow)" opacity="0.95">
      <polygon points="100,42 128,90 72,90" fill="none" stroke="#bfffe9" stroke-width="1.6"/>
      <polygon points="100,158 72,110 128,110" fill="none" stroke="#bfffe9" stroke-width="1.6"/>
      <circle cx="100" cy="100" r="10" fill="#eafff6"/>
    </g>
  </svg>`;
}

// ---------- ÓRBITA: posiciones de satélites ----------
function orbitPositions(count, radius, cx, cy){
  const positions = [];
  const startAngle = -Math.PI/2;
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
    const status = statusOf(node);
    const rodClass = 'rod-' + status;

    rodsHtml += `<line x1="${cx}" y1="${cy}" x2="${pos.x}" y2="${pos.y}" class="${rodClass}" />`;
    if(status !== 'locked'){
      rodsHtml += `<circle class="rivet-svg rivet-${status}" cx="${pos.x}" cy="${pos.y}" r="4"/>`;
    }
    if(i>0){
      const prevPos = positions[i-1];
      const prevStatus = statusOf(NODES[i-1]);
      if(status==='active' && prevStatus==='active'){
        rodsHtml += `<line x1="${prevPos.x}" y1="${prevPos.y}" x2="${pos.x}" y2="${pos.y}" class="rod-active" stroke-width="2.4" />`;
      }
    }

    const satEl = document.createElement('div');
    satEl.className = 'satellite status-' + status;
    satEl.style.left = pos.x + 'px';
    satEl.style.top = pos.y + 'px';
    satEl.dataset.id = node.id;

    const spinClass = status === 'active' ? (i % 2 === 0 ? 'gear-spin' : 'gear-spin-rev') : '';
    const badge = status === 'locked' ? '🔒' : (status === 'ready' ? '🟡' : '');

    satEl.innerHTML = `
      <div class="gear-socket">
        <div class="gear-wrap ${spinClass}">
          ${gearSVG({ teeth: node.teeth, status, uid: node.id })}
        </div>
        <span class="sat-id">${node.idLabel}</span>
        ${badge ? `<span class="sat-badge">${badge}</span>` : ''}
      </div>
      <div class="sat-total">${fmt(node.total)}</div>
    `;

    satEl.addEventListener('click', ()=> renderDetail(node));
    satWrap.appendChild(satEl);
  });

  rods.innerHTML = rodsHtml;
}

function renderHub(){
  const hubGear = document.getElementById('hubGear');
  hubGear.innerHTML = hubSVG();
}

// ---------- PANEL DE CONTROL ----------
function renderPanel(){
  const list = document.getElementById('panelList');
  list.innerHTML = '';

  NODES.forEach((node, i)=>{
    const status = statusOf(node);
    const canAdvance = prevActive(i) || status !== 'locked';
    const meta = STATUS_META[status];

    const li = document.createElement('li');
    li.className = 'panel-item';
    li.innerHTML = `
      <div class="status-pill status-${status} ${!canAdvance?'is-blocked':''}" data-id="${node.id}">
        <span>${meta.icon}</span><span>${meta.label}</span>
      </div>
      <div class="panel-item-body">
        <div class="panel-item-title">${node.idLabel} — ${node.title}</div>
        <div class="panel-item-total">${fmt(node.total)} capital total gestionado</div>
        ${status === 'locked' ? `<div class="panel-item-note">${!canAdvance ? ('Activá ' + NODES[i-1].idLabel + ' primero') : node.requires}</div>` : ''}
      </div>
      ${node.custom ? `<button class="panel-item-delete" data-delete="${node.id}" title="Borrar este nodo">×</button>` : ''}
    `;
    list.appendChild(li);
  });

  list.querySelectorAll('.status-pill').forEach(pill=>{
    pill.addEventListener('click', ()=>{
      cycleStatus(pill.dataset.id);
      renderAll();
      renderDetail(node_by_id(pill.dataset.id));
    });
  });

  list.querySelectorAll('[data-delete]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      deleteCustomNode(btn.dataset.delete);
      renderAll();
      renderDetail(null);
      showToast('Nodo eliminado');
    });
  });
}

function node_by_id(id){ return NODES.find(n=>n.id===id); }

// ---------- FICHA DE NODO ----------
function renderDetail(node){
  const box = document.getElementById('nodeDetail');
  if(!node){
    box.innerHTML = '<p class="detail-placeholder">Tocá un engranaje para ver su ficha técnica.</p>';
    return;
  }
  const status = statusOf(node);
  const meta = STATUS_META[status];

  box.innerHTML = `
    <div class="detail-card status-${status}">
      <div class="detail-top">
        <div>
          <div class="detail-id">${node.idLabel}${node.milestone && status==='active' ? ' · OBJETIVO ALCANZADO' : ''}${node.custom ? ' · PERSONALIZADO' : ''}</div>
          <div class="detail-title">${node.title}</div>
        </div>
        <div class="detail-total">${fmt(node.total)}</div>
        <div class="detail-status-tag status-${status}">${meta.icon} ${meta.label}</div>
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
      <div class="detail-unlock"><b>${status === 'locked' ? 'Para activar hace falta:' : 'Requisito de esta etapa:'}</b> ${node.requires}</div>
    </div>
  `;
}

// ---------- GAUGES (barra superior) ----------
function currentActiveIndex(){
  for(let i=NODES.length-1;i>=0;i--){
    if(statusOf(NODES[i]) === 'active') return i;
  }
  return -1;
}

function renderGauges(){
  const activeIdx = currentActiveIndex();
  const activeTotal = activeIdx >= 0 ? NODES[activeIdx].total : 0;
  const activeCount = NODES.filter(n=>statusOf(n)==='active').length;
  const split = Math.min(100, Math.max(1, Number(state.split) || 90));

  document.getElementById('statActiveCapital').textContent = fmt(activeTotal);
  document.getElementById('statSplitCapital').textContent = fmt(activeTotal * (split/100));
  document.getElementById('statNodesActive').textContent = `${activeCount} / ${NODES.length}`;
  document.getElementById('splitPercent').value = split;

  const nextNode = NODES[activeIdx+1];
  const pendingEl = document.getElementById('statPendingCapital');
  const nextLabelEl = document.getElementById('statNextNodeLabel');
  if(nextNode){
    pendingEl.textContent = fmt(nextNode.total - activeTotal);
    nextLabelEl.textContent = 'Próximo: ' + nextNode.idLabel + ' — ' + fmt(nextNode.total);
  }else{
    pendingEl.textContent = '$0';
    nextLabelEl.textContent = 'Sistema completo';
  }
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

// ---------- FORMULARIO "+ NUEVO NODO" ----------
function initAddNodeForm(){
  const toggleBtn = document.getElementById('addNodeToggle');
  const form = document.getElementById('addNodeForm');
  const saveBtn = document.getElementById('addNodeSave');
  const cancelBtn = document.getElementById('addNodeCancel');

  const fTitle  = document.getElementById('newNodeTitle');
  const fTotal  = document.getElementById('newNodeTotal');
  const fLondon = document.getElementById('newNodeLondon');
  const fNY     = document.getElementById('newNodeNY');
  const fNote   = document.getElementById('newNodeNote');

  function closeForm(){
    form.classList.remove('open');
    fTitle.value = ''; fTotal.value = ''; fLondon.value = ''; fNY.value = ''; fNote.value = '';
  }

  toggleBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    form.classList.toggle('open');
  });

  cancelBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    closeForm();
  });

  saveBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(!fTitle.value.trim() || !fTotal.value){
      showToast('Poné al menos nombre y capital total');
      return;
    }
    addCustomNode({
      title: fTitle.value.trim(),
      total: fTotal.value,
      london: fLondon.value,
      ny: fNY.value,
      note: fNote.value.trim(),
    });
    closeForm();
    renderAll();
    showToast('Nodo creado en LOCKED — marcalo READY cuando consigas las cuentas');
  });

  form.addEventListener('click', (e)=> e.stopPropagation());
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
initAddNodeForm();
