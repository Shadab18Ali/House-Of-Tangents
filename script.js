(function(){
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const thumb=id=>`https://drive.google.com/thumbnail?id=${id}&sz=w800`;
function caseHTML(c){
  const stats=(c.stats||[]).map(s=>`<div class="stat"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join('');
  const chaps=c.chapters.map(ch=>`<div class="chap"><h3>${esc(ch.h)}</h3><div>${ch.p.map(p=>`<p>${esc(p)}</p>`).join('')}${ch.note?`<p class="note">${esc(ch.note)}</p>`:''}${ch.stats?`<div class="stats">${ch.stats.map(s=>`<div class="stat"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join('')}</div>`:''}</div></div>`).join('');
  const vids=(c.videos||[]).map(v=>`<button class="vid" data-id="${v[0]}" style="background-image:url('${thumb(v[0])}')" aria-label="Play ${esc(v[1])}"><i></i><span>${esc(v[1])}</span></button>`).join('');
  return `<article class="case reveal" id="${c.id}"><div class="wrap">
    <div class="case-head"><h2>${esc(c.name)}</h2><span class="tag">${esc(c.tag||'')}</span></div>
    <p class="serif lead">${esc(c.title)}</p>
    ${c.intro.map(p=>`<p>${esc(p)}</p>`).join('')}
    <p class="when">${esc(c.when||'')}</p>
    ${stats?`<div class="stats">${stats}</div>`:''}
    ${chaps}
    ${vids?`<div class="videos">${vids}</div>`:''}
  </div></article>`;
}
for(const [key,el] of [['results','results-list'],['media','media-list'],['identities','identity-list'],['tangent','tangent-list']]){
  document.getElementById(el).innerHTML=(window.HOT[key]||[]).map(caseHTML).join('');
}
document.getElementById('gallery').innerHTML=window.HOT.graphics.map(id=>`<a href="https://drive.google.com/file/d/${id}/view" target="_blank" rel="noopener" style="background-image:url('${thumb(id)}')" aria-label="Open graphic"></a>`).join('');
document.addEventListener('click',e=>{
  const b=e.target.closest('.vid');
  if(b&&b.tagName==='BUTTON'){
    const f=document.createElement('iframe');f.className='vid';f.allow='autoplay;fullscreen';f.allowFullscreen=true;
    f.src=`https://drive.google.com/file/d/${b.dataset.id}/preview`;b.replaceWith(f);
  }
});
const btn=document.querySelector('.menu-btn'),menu=document.getElementById('menu');
btn.onclick=()=>{const o=menu.classList.toggle('open');btn.setAttribute('aria-expanded',o)};
menu.onclick=e=>{if(e.target.tagName==='A')menu.classList.remove('open')};
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();
