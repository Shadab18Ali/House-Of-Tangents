// Vercel serverless function. Sends the brief by email via Resend when configured.
// Required env vars: RESEND_API_KEY, CONTACT_FROM (a sender verified in Resend), CONTACT_TO (recipient).
// If they are missing this returns 503 and the page shows the email and phone details. It never fakes success.
const hits=new Map();
const WINDOW=10*60*1000,LIMIT=5;
function limited(ip){const now=Date.now();const a=(hits.get(ip)||[]).filter(t=>now-t<WINDOW);a.push(now);hits.set(ip,a);return a.length>LIMIT}
const clean=(v,max)=>String(v==null?'':v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,max);
const SERVICES=['Brand strategy and identity','Content and production','Marketing and campaigns','Websites and digital journeys','I’m still working that out'];
const FALLBACK='We couldn’t send your brief just now. Please email farhafatima3686@gmail.com or call +91 70911 40333.';
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Method not allowed.'})}
  const ip=String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||'unknown';
  if(limited(ip))return res.status(429).json({ok:false,error:'Too many briefs from this connection. Please try again later or email us directly.'});
  let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch{b={}}}b=b||{};
  if(b.website)return res.status(200).json({ok:true}); // honeypot: silently drop bots
  const name=clean(b.name,120),email=clean(b.email,160),company=clean(b.company,160),brief=clean(b.brief,4000),timeline=clean(b.timeline,160),budget=clean(b.budget,160);
  // only the options offered on the form are accepted
  const services=(Array.isArray(b.services)?b.services:[b.services]).map(s=>clean(s,80)).filter(s=>SERVICES.includes(s));
  const errs={};
  if(!name)errs.name='Name is required.';
  if(!/^\S+@\S+\.\S+$/.test(email))errs.email='Enter a valid email address.';
  if(!brief)errs.brief='Please describe the brief.';
  if(Object.keys(errs).length)return res.status(400).json({ok:false,error:'Please check the form: '+Object.values(errs).join(' '),fields:errs});
  const {RESEND_API_KEY,CONTACT_FROM,CONTACT_TO}=process.env;
  if(!RESEND_API_KEY||!CONTACT_FROM||!CONTACT_TO)return res.status(503).json({ok:false,error:FALLBACK});
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  try{
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+RESEND_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({from:CONTACT_FROM,to:[CONTACT_TO],subject:'New brief via the House of Tangents website',reply_to:email,
        html:`<p><b>Name:</b> ${esc(name)}</p><p><b>Work email:</b> ${esc(email)}</p><p><b>Company or project:</b> ${esc(company)||'-'}</p><p><b>Needs help with:</b> ${services.map(esc).join(', ')||'-'}</p><p><b>Timeline:</b> ${esc(timeline)||'-'}</p><p><b>Budget range:</b> ${esc(budget)||'-'}</p><p><b>Brief:</b><br>${esc(brief).replace(/\n/g,'<br>')}</p>`})});
    if(!r.ok)return res.status(502).json({ok:false,error:FALLBACK});
    return res.status(200).json({ok:true});
  }catch{return res.status(502).json({ok:false,error:FALLBACK})}
};
