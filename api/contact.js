// Vercel serverless function. Sends the enquiry by email via Resend when configured.
// Required env vars: RESEND_API_KEY, CONTACT_FROM (a sender verified in Resend), CONTACT_TO (recipient).
// If they are missing this returns 503 and the site shows direct-contact details. It never fakes success.
const hits=new Map();
const WINDOW=10*60*1000,LIMIT=5;
function limited(ip){const now=Date.now();const a=(hits.get(ip)||[]).filter(t=>now-t<WINDOW);a.push(now);hits.set(ip,a);return a.length>LIMIT}
const clean=(v,max)=>String(v==null?'':v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,max);
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Method not allowed.'})}
  const ip=String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||'unknown';
  if(limited(ip))return res.status(429).json({ok:false,error:'Too many enquiries from this connection. Please try again later or email us directly.'});
  let b=req.body;if(typeof b==='string'){try{b=JSON.parse(b)}catch{b={}}}b=b||{};
  if(b.website)return res.status(200).json({ok:true}); // honeypot: silently drop bots
  const name=clean(b.name,120),company=clean(b.company,160),contact=clean(b.contact,160),need=clean(b.need,4000),budget=clean(b.budget,120);
  const errs={};
  if(!name)errs.name='Name is required.';
  if(!need)errs.need='Please describe what you need.';
  if(!(/^\S+@\S+\.\S+$/.test(contact)||/^[+\d][\d\s()\-]{6,}$/.test(contact)))errs.contact='Enter a valid email address or phone number.';
  if(Object.keys(errs).length)return res.status(400).json({ok:false,error:'Please check the form: '+Object.values(errs).join(' '),fields:errs});
  const {RESEND_API_KEY,CONTACT_FROM,CONTACT_TO}=process.env;
  if(!RESEND_API_KEY||!CONTACT_FROM||!CONTACT_TO)return res.status(503).json({ok:false,error:'Online enquiries are not switched on yet. Please email farhafatima3686@gmail.com or call +91 70911 40333.'});
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  try{
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+RESEND_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({from:CONTACT_FROM,to:[CONTACT_TO],subject:'New enquiry via House of Tangents website',
        reply_to:/^\S+@\S+\.\S+$/.test(contact)?contact:undefined,
        html:`<p><b>Name:</b> ${esc(name)}</p><p><b>Company:</b> ${esc(company)||'-'}</p><p><b>Contact:</b> ${esc(contact)}</p><p><b>Budget:</b> ${esc(budget)||'-'}</p><p><b>Brief:</b><br>${esc(need).replace(/\n/g,'<br>')}</p>`})});
    if(!r.ok)return res.status(502).json({ok:false,error:'We couldn’t send that just now. Please email farhafatima3686@gmail.com or call +91 70911 40333.'});
    return res.status(200).json({ok:true});
  }catch{return res.status(502).json({ok:false,error:'We couldn’t send that just now. Please email farhafatima3686@gmail.com or call +91 70911 40333.'})}
};
