const ORDERS=[
 {id:30785,dep:'CESAR',st:'grn',cause:'',est:0,apr:0},
 {id:30784,dep:'CESAR',st:'pe',cause:'Falta de documentación',est:250000,apr:0},
 {id:30783,dep:'RUTA CARIBE',st:'re',cause:'Información inconsistente',est:180000,apr:0},
 {id:30782,dep:'RUTA CARIBE',st:'ok',cause:'',est:420000,apr:420000},
 {id:30781,dep:'CESAR',st:'grn',cause:'',est:300000,apr:300000}
];
const LABEL={grn:['ok','GRN/BTS/RVST'],pe:['pe','PENDIENTE'],re:['re','RECHAZADA'],ok:['ok','APROBADA']};
const ICON={
 ok:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
 pe:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4"/></svg>',
 re:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'};
const DOC='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E0334C" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M10 11l4 4M14 11l-4 4"/></svg>';
const money=n=>'$ '+n.toLocaleString('es-CO');
function bars(seed,color){
  const h=[.35,.55,.3,.7,.45,.9,.6].map((v,i)=>Math.max(.15,Math.abs(Math.sin(seed*(i+2)))*.8+.15));
  return '<svg viewBox="0 0 70 26" aria-hidden="true">'+h.map((v,i)=>`<rect x="${i*10}" y="${26-v*24}" width="6" height="${v*24}" rx="1.5" fill="${color}"/>`).join('')+'</svg>';
}
const state={q:'',f:'todas'};
const FILTERS=['todas','pendientes','rechazadas','aprobadas'];
function render(){
  const tb=document.getElementById('rows');
  const q=state.q.trim().toLowerCase();
  const list=ORDERS.filter(o=>{
    const [cls,txt]=LABEL[o.st];
    const hay=(o.id+' '+o.dep+' '+txt+' '+o.cause).toLowerCase();
    const okF=state.f==='todas'||(state.f==='pendientes'&&o.st==='pe')||(state.f==='rechazadas'&&o.st==='re')||(state.f==='aprobadas'&&(o.st==='ok'||o.st==='grn'));
    return okF&&(!q||hay.includes(q));
  });
  tb.innerHTML=list.map(o=>{
    const [cls,txt]=LABEL[o.st];
    return `<tr><td><span class="ot">${o.id}</span></td><td>${o.dep}</td>
    <td><span class="st ${cls}">${ICON[cls]}${txt}</span></td>
    <td>${o.cause?`<span class="cause">${DOC}${o.cause}</span>`:'<span style="color:#9AA4BF">—</span>'}</td>
    <td><span class="amt">${money(o.est)}${bars(o.id%7+1,'#2F5BC8')}</span></td>
    <td><span class="amt">${money(o.apr)}${bars(o.id%5+2,o.apr?'#12A15F':'#9FB2E8')}</span></td>
    <td><button class="dots" aria-label="Acciones de la orden ${o.id}">⋮</button></td></tr>`;
  }).join('');
  document.getElementById('empty').hidden=list.length>0;
}
document.getElementById('q').addEventListener('input',e=>{state.q=e.target.value;render()});
document.getElementById('fs').addEventListener('click',e=>{
  const i=(FILTERS.indexOf(state.f)+1)%FILTERS.length;state.f=FILTERS[i];
  document.getElementById('fl').textContent='Filtrar: '+state.f;
  e.currentTarget.setAttribute('aria-pressed',state.f!=='todas');render();
});
render();
