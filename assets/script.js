
async function fetchJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('Failed to load '+path);
  return await res.json();
}
function qs(id){return document.getElementById(id)}
function renderList(container, items, renderer){
  container.innerHTML = '';
  items.forEach(i => container.appendChild(renderer(i)));
}
function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  for(const k in attrs){
    if(k==='html') e.innerHTML = attrs[k];
    else if(k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  if(typeof children === 'string') e.textContent = children;
  else children.forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
}
function searchFilter(items, q, fields){
  const s = (q||'').trim().toLowerCase();
  if(!s) return items;
  return items.filter(it => fields.some(f => (String(it[f]||'').toLowerCase().includes(s))));
}
