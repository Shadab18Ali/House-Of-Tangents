(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var FOCUS='a[href],button:not([disabled]),input,textarea,select,summary,[tabindex]:not([tabindex="-1"])';
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var saver=(navigator.connection&&navigator.connection.saveData)||false;

/* ---- header gains its rule only after scrolling (no layout reads) ---- */
var hdr=$('#site-header');
if(hdr&&'IntersectionObserver' in window){var sentinel=document.createElement('div');sentinel.setAttribute('aria-hidden','true');sentinel.style.cssText='position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';document.body.insertBefore(sentinel,document.body.firstChild);
 new IntersectionObserver(function(es){hdr.classList.toggle('scrolled',!es[0].isIntersecting)}).observe(sentinel)}

/* ---- Work dropdown: click or keyboard to open, Escape and outside click to close ---- */
$$('[data-navgroup]').forEach(function(g){
 var b=$('.nav-btn',g);
 function set(open){g.classList.toggle('open',open);b.setAttribute('aria-expanded',open?'true':'false')}
 b.addEventListener('click',function(){set(!g.classList.contains('open'))});
 g.addEventListener('keydown',function(e){if(e.key==='Escape'&&g.classList.contains('open')){set(false);b.focus()}});
 g.addEventListener('focusout',function(e){if(!g.contains(e.relatedTarget))set(false)});
 document.addEventListener('click',function(e){if(!g.contains(e.target))set(false)});
});

/* ---- mobile menu ---- */
var btn=$('.menu-btn'),menu=$('#mobile-menu'),closeBtn=$('.menu-close');
function trap(e,box){if(e.key!=='Tab')return;var f=$$(FOCUS,box).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];
 if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
function shut(){menu.hidden=true;document.body.classList.toggle('lock',false);btn.setAttribute('aria-expanded','false')}
function openMenu(){menu.hidden=false;document.body.classList.add('lock');btn.setAttribute('aria-expanded','true');closeBtn.focus()}
function closeMenu(){shut();btn.focus()}
if(btn&&menu){btn.addEventListener('click',openMenu);closeBtn.addEventListener('click',closeMenu);
 menu.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();closeMenu()}else trap(e,menu)});
 $$('a',menu).forEach(function(a){a.addEventListener('click',shut)});
 window.matchMedia('(min-width:901px)').addEventListener('change',function(m){if(m.matches&&!menu.hidden)shut()})}

/* ---- video dialog: nothing loads until someone presses play ---- */
var dlg=$('#vdialog'),last=null;
if(dlg){
 var frame=$('#vframe');
 document.addEventListener('click',function(e){
  var b=e.target.closest('[data-video],[data-local]');if(!b)return;last=b;
  $('#vtitle').textContent=b.dataset.title;$('#vsummary').textContent=b.dataset.summary;frame.textContent='';
  if(b.dataset.local){var v=document.createElement('video');v.controls=true;v.playsInline=true;v.preload='metadata';v.poster=b.dataset.poster||'';v.src=b.dataset.local;v.setAttribute('aria-label',b.dataset.title);
   frame.className='vframe portrait';frame.appendChild(v);dlg.showModal();var p=v.play();if(p&&p.catch)p.catch(function(){})}
  else{var f=document.createElement('iframe');f.src='https://drive.google.com/file/d/'+b.dataset.video+'/preview';f.title=b.dataset.title;f.allow='fullscreen';f.referrerPolicy='no-referrer';
   frame.className='vframe';frame.appendChild(f);dlg.showModal()}
 });
 $('.vclose',dlg).addEventListener('click',function(){dlg.close()});
 dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
 dlg.addEventListener('close',function(){var v=$('video',frame);if(v)v.pause();frame.textContent='';if(last)last.focus()});
}

/* ---- hero reel: muted loop, only when motion and data allow, with a pause control ---- */
var reel=$('[data-reel]'),tog=$('[data-reel-toggle]');
if(reel&&tog&&!reduce&&!saver){
 var pr=reel.play();if(pr&&pr.then)pr.then(function(){tog.hidden=false}).catch(function(){});
 tog.addEventListener('click',function(){if(reel.paused){reel.play();tog.textContent='Pause reel';tog.setAttribute('aria-pressed','false')}else{reel.pause();tog.textContent='Play reel';tog.setAttribute('aria-pressed','true')}});
 document.addEventListener('visibilitychange',function(){if(document.hidden)reel.pause();else if(tog.getAttribute('aria-pressed')!=='true')reel.play()});
}

/* ---- filters: independent groups combine; every item stays in the DOM and crawlable ---- */
$$('[data-filters]').forEach(function(bar){
 var target=document.getElementById(bar.dataset.filters),groups=$$('[data-fgroup]',bar),state={};
 var scope=bar.parentNode,status=$('.filter-status',scope),empty=$('.empty',scope);
 function apply(){var n=0;
  $$('[data-item]',target).forEach(function(el){
   var ok=groups.every(function(g){var k=g.dataset.fgroup,v=state[k]||'all';return v==='all'||(el.getAttribute('data-'+k)||'').split(' ').indexOf(v)>-1});
   el.hidden=!ok;if(ok)n++});
  $$('[data-group]',target).forEach(function(g){g.hidden=!$$('[data-item]',g).some(function(x){return !x.hidden})});
  if(status)status.textContent='Showing '+n+' '+(n===1?bar.dataset.one:bar.dataset.many);
  if(empty)empty.hidden=n>0}
 function pick(g,chip){state[g.dataset.fgroup]=chip.dataset.f;$$('.chip',g).forEach(function(x){x.setAttribute('aria-pressed',x===chip?'true':'false')})}
 groups.forEach(function(g){$$('.chip',g).forEach(function(c){c.addEventListener('click',function(){pick(g,c);apply()})})});
 var reset=empty&&$('[data-reset]',empty);
 if(reset)reset.addEventListener('click',function(){groups.forEach(function(g){pick(g,$('.chip[data-f="all"]',g))});apply();var first=$('.chip',bar);if(first)first.focus()});
});

/* ---- enquiry form: validated here and on the server; success only when delivery succeeds ---- */
$$('form.form').forEach(function(form){
 var sum=$('.err-summary',form),status=$('.form-status',form);
 var want=new URLSearchParams(location.search).get('service');
 if(want){var box=$('input[data-service="'+want.replace(/[^a-z]/g,'')+'"]',form);if(box)box.checked=true}
 var RULES=[['name','Enter your name.'],['email','Enter your work email.'],['brief','Tell us a little about the brief.']];
 function fieldErr(){var errs=[];RULES.forEach(function(r){var i=form.elements[r[0]],e=$('#'+i.id+'-e'),v=i.value.trim(),msg='';
  if(!v)msg=r[1];else if(r[0]==='email'&&!/^\S+@\S+\.\S+$/.test(v))msg='Enter a valid email address.';
  i.setAttribute('aria-invalid',msg?'true':'false');e.textContent=msg;if(msg)errs.push([i,msg])});return errs}
 form.addEventListener('submit',function(ev){ev.preventDefault();if(form.dataset.busy)return;status.textContent='';status.className='form-status';var errs=fieldErr();
  if(errs.length){sum.hidden=false;sum.textContent='';var p=document.createElement('p');p.textContent='Please fix '+errs.length+' field'+(errs.length>1?'s':'')+':';sum.appendChild(p);
   errs.forEach(function(x){var a=document.createElement('a');a.href='#'+x[0].id;a.textContent=x[1];a.style.display='block';a.addEventListener('click',function(e){e.preventDefault();x[0].focus()});sum.appendChild(a)});sum.focus();return}
  sum.hidden=true;var submit=$('button[type=submit]',form),label=submit.textContent;
  form.dataset.busy='1';form.setAttribute('aria-busy','true');submit.disabled=true;submit.textContent='Sending…';
  function done(){delete form.dataset.busy;form.removeAttribute('aria-busy');submit.disabled=false;submit.textContent=label}
  /* the email and phone fallback is only shown when a submission actually fails */
  function fail(){var em=$('a[href^="mailto:"]',form),ph=$('a[href^="tel:"]',form);status.className='form-status bad';status.textContent='We couldn’t send your brief. Please email ';
   if(em){var a1=document.createElement('a');a1.href=em.getAttribute('href');a1.textContent=em.textContent;status.appendChild(a1)}
   status.appendChild(document.createTextNode(' or call '));
   if(ph){var a2=document.createElement('a');a2.href=ph.getAttribute('href');a2.textContent=ph.textContent;status.appendChild(a2)}
   status.appendChild(document.createTextNode('.'))}
  var fd=new FormData(form),data={services:fd.getAll('services')};
  ['name','email','company','brief','timeline','budget','website'].forEach(function(k){data[k]=fd.get(k)||''});
  fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
   .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{ok:r.ok,s:r.status,j:j}})})
   .then(function(res){done();
    if(res.ok&&res.j.ok){status.className='form-status ok';status.textContent='Thank you. Your brief has been sent. We’ll be in touch soon.';form.reset()}
    else if(res.s===400||res.s===429){status.className='form-status bad';status.textContent=(res.j&&res.j.error)||'Please check the form and try again.'}
    else fail()})
   .catch(function(){done();fail()})});
});

/* ---- old single-page anchors still land somewhere useful ---- */
if(location.pathname==='/'&&location.hash){var m={'#results':'/hot-results','#media':'/hot-media','#identities':'/brand-identities','#tangent':'/tangent-media','#team':'/about#team','#house':'/about','#contact':'/contact','#graphics':'/hot-media','#origin':'/#why'};if(m[location.hash])location.replace(m[location.hash])}
})();
