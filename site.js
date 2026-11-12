(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var FOCUS='a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';
/* ---- mobile menu ---- */
var btn=$('.menu-btn'),menu=$('#mobile-menu'),closeBtn=$('.menu-close');
function trap(e,box){if(e.key!=='Tab')return;var f=$$(FOCUS,box).filter(function(x){return x.offsetParent!==null||x===document.activeElement});if(!f.length)return;var a=f[0],z=f[f.length-1];
 if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
function openMenu(){menu.hidden=false;document.body.classList.add('lock');btn.setAttribute('aria-expanded','true');closeBtn.focus()}
function closeMenu(){menu.hidden=true;document.body.classList.remove('lock');btn.setAttribute('aria-expanded','false');btn.focus()}
if(btn&&menu){btn.addEventListener('click',openMenu);closeBtn.addEventListener('click',closeMenu);
 menu.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();closeMenu()}else trap(e,menu)});
 $$('a',menu).forEach(function(a){a.addEventListener('click',function(){menu.hidden=true;document.body.classList.remove('lock')})});
 window.matchMedia('(min-width:901px)').addEventListener('change',function(m){if(m.matches&&!menu.hidden){menu.hidden=true;document.body.classList.remove('lock');btn.setAttribute('aria-expanded','false')}})}
/* ---- video dialog: iframe loads only after user intent ---- */
var dlg=$('#vdialog'),last=null;
function closeV(){if(dlg.open)dlg.close()}
if(dlg){
 document.addEventListener('click',function(e){var b=e.target.closest('[data-video]');if(!b)return;last=b;
  $('#vtitle').textContent=b.dataset.title;$('#vsummary').textContent=b.dataset.summary;
  var f=document.createElement('iframe');f.src='https://drive.google.com/file/d/'+b.dataset.video+'/preview';f.title=b.dataset.title;f.allow='fullscreen';f.referrerPolicy='no-referrer';
  var fr=$('#vframe');fr.textContent='';fr.appendChild(f);dlg.showModal()});
 $('.vclose',dlg).addEventListener('click',closeV);
 dlg.addEventListener('click',function(e){if(e.target===dlg)closeV()});
 dlg.addEventListener('close',function(){$('#vframe').textContent='';if(last)last.focus()});
}
/* ---- work filters (all cards stay in the DOM and crawlable) ---- */
var chips=$$('.chip[data-filter]');
if(chips.length){chips.forEach(function(c){c.addEventListener('click',function(){
 chips.forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false')});var f=c.dataset.filter,n=0;
 $$('#work-grid .card').forEach(function(card){var show=f==='all'||card.dataset.cats.split(' ').indexOf(f)>-1;card.hidden=!show;if(show)n++});
 $('.filter-status').textContent='Showing '+n+' project'+(n===1?'':'s')})})}
/* ---- enquiry form: honest states, server-validated ---- */
$$('form.form').forEach(function(form){
 var sum=$('.err-summary',form),status=$('.form-status',form);
 function fieldErr(){var errs=[];['name','contact','need'].forEach(function(n){var i=form.elements[n],e=$('#'+i.id+'-e');var bad=!i.value.trim();
  if(n==='contact'&&!bad&&!/^\S+@\S+\.\S+$/.test(i.value.trim())&&!/^[+\d][\d\s()\-]{6,}$/.test(i.value.trim()))bad='Enter a valid email address or phone number.';
  var msg=bad===true?'Enter your '+(n==='need'?'brief':n==='contact'?'email or phone':'name')+'.':bad;
  i.setAttribute('aria-invalid',msg?'true':'false');e.textContent=msg||'';if(msg)errs.push([i,msg])});return errs}
 form.addEventListener('submit',function(ev){ev.preventDefault();status.textContent='';var errs=fieldErr();
  if(errs.length){sum.hidden=false;sum.innerHTML='';var p=document.createElement('p');p.textContent='Please fix '+errs.length+' field'+(errs.length>1?'s':'')+':';sum.appendChild(p);
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
