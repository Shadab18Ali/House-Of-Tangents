(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var FOCUS='a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var saver=(navigator.connection&&navigator.connection.saveData)||false;
/* ---- header gains blur only after scrolling ---- */
var hdr=$('#site-header');
if(hdr){var onS=function(){hdr.classList.toggle('scrolled',window.scrollY>8)};onS();window.addEventListener('scroll',onS,{passive:true})}
/* ---- mobile menu ---- */
var btn=$('.menu-btn'),menu=$('#mobile-menu'),closeBtn=$('.menu-close');
function trap(e,box){if(e.key!=='Tab')return;var f=$$(FOCUS,box).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];
 if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
function openMenu(){menu.hidden=false;document.body.classList.add('lock');btn.setAttribute('aria-expanded','true');closeBtn.focus()}
function closeMenu(){menu.hidden=true;document.body.classList.toggle('lock',false);btn.setAttribute('aria-expanded','false');btn.focus()}
if(btn&&menu){btn.addEventListener('click',openMenu);closeBtn.addEventListener('click',closeMenu);
 menu.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();closeMenu()}else trap(e,menu)});
 $$('a',menu).forEach(function(a){a.addEventListener('click',function(){menu.hidden=true;document.body.classList.toggle('lock',false)})});
 window.matchMedia('(min-width:901px)').addEventListener('change',function(m){if(m.matches&&!menu.hidden){menu.hidden=true;document.body.classList.toggle('lock',false);btn.setAttribute('aria-expanded','false')}})}
/* ---- video dialog (Drive fallback): iframe loads only after user intent ---- */
var dlg=$('#vdialog'),last=null;
if(dlg){
 document.addEventListener('click',function(e){var b=e.target.closest('[data-video]');if(!b)return;last=b;
  $('#vtitle').textContent=b.dataset.title;$('#vsummary').textContent=b.dataset.summary;
  var f=document.createElement('iframe');f.src='https://drive.google.com/file/d/'+b.dataset.video+'/preview';f.title=b.dataset.title;f.allow='fullscreen';f.referrerPolicy='no-referrer';
  var fr=$('#vframe');fr.textContent='';fr.appendChild(f);dlg.showModal()});
 $('.vclose',dlg).addEventListener('click',function(){dlg.close()});
 dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
 dlg.addEventListener('close',function(){$('#vframe').textContent='';if(last)last.focus()});
}
/* ---- hero reel: muted loop, only when motion and data allow, with a pause control ---- */
var reel=$('[data-reel]'),tog=$('[data-reel-toggle]');
if(reel&&tog&&!reduce&&!saver){
 var pr=reel.play();if(pr&&pr.then)pr.then(function(){tog.hidden=false}).catch(function(){});
 tog.addEventListener('click',function(){if(reel.paused){reel.play();tog.textContent='Pause reel';tog.setAttribute('aria-pressed','false')}else{reel.pause();tog.textContent='Play reel';tog.setAttribute('aria-pressed','true')}});
 document.addEventListener('visibilitychange',function(){if(document.hidden)reel.pause();else if(tog.getAttribute('aria-pressed')!=='true')reel.play()});
}
/* ---- work filters: every project stays in the DOM; empty status groups are hidden ---- */
var chips=$$('.chip[data-filter]');
if(chips.length){chips.forEach(function(c){c.addEventListener('click',function(){
 chips.forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false')});var f=c.dataset.filter,n=0;
 $$('#work-grid .feat,#work-grid .row').forEach(function(el){var show=f==='all'||el.dataset.cats.split(' ').indexOf(f)>-1;el.hidden=!show;if(show)n++});
 $$('#work-grid .wgroup').forEach(function(g){var vis=$$('.feat:not([hidden]),.row:not([hidden])',g).length;g.hidden=!vis;var ct=$('.count',g);if(ct)ct.textContent=vis});
 $('.filter-status').textContent='Showing '+n+' project'+(n===1?'':'s')})})}
/* ---- enquiry form: honest states, server-validated ---- */
$$('form.form').forEach(function(form){
 var sum=$('.err-summary',form),status=$('.form-status',form);
 function fieldErr(){var errs=[];['name','contact','need'].forEach(function(n){var i=form.elements[n],e=$('#'+i.id+'-e');var v=i.value.trim(),msg='';
  if(!v)msg='Enter your '+(n==='need'?'brief':n==='contact'?'email or phone':'name')+'.';
  else if(n==='contact'&&!/^\S+@\S+\.\S+$/.test(v)&&!/^[+\d][\d\s()\-]{6,}$/.test(v))msg='Enter a valid email address or phone number.';
  i.setAttribute('aria-invalid',msg?'true':'false');e.textContent=msg;if(msg)errs.push([i,msg])});return errs}
 form.addEventListener('submit',function(ev){ev.preventDefault();status.textContent='';var errs=fieldErr();
  if(errs.length){sum.hidden=false;sum.textContent='';var p=document.createElement('p');p.textContent='Please fix '+errs.length+' field'+(errs.length>1?'s':'')+':';sum.appendChild(p);
   errs.forEach(function(x){var a=document.createElement('a');a.href='#'+x[0].id;a.textContent=x[1];a.style.display='block';a.addEventListener('click',function(e){e.preventDefault();x[0].focus()});sum.appendChild(a)});sum.focus();return}
  sum.hidden=true;var submit=$('button[type=submit]',form);submit.disabled=true;status.textContent='Sending…';
  var data={};new FormData(form).forEach(function(v,k){data[k]=v});
  fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
   .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{ok:r.ok,j:j}})})
   .then(function(res){submit.disabled=false;if(res.ok&&res.j.ok){status.textContent='Thank you. Your enquiry has been sent.';form.reset()}
     else status.textContent=(res.j&&res.j.error)||'We couldn’t send that just now. Please email or call us using the details below.'})
   .catch(function(){submit.disabled=false;status.textContent='We couldn’t send that just now. Please email or call us using the details below.'})});
});
/* ---- redirect old single-page anchors ---- */
if(location.pathname==='/'&&location.hash){var m={'#results':'/work','#media':'/work','#identities':'/work','#tangent':'/tangent-media','#team':'/about#team','#house':'/about','#contact':'/contact','#graphics':'/work'};if(m[location.hash])location.replace(m[location.hash])}
})();
