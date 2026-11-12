// Static generator: content/*.json + content/site.mjs -> HTML routes at the repo root.
// Run: node scripts/build.mjs
import fs from 'node:fs';import path from 'node:path';
import {SITE,STATUSES,CATEGORIES,TEAM,SERVICES,VIDEO_INFO,LOCAL_VIDEOS} from '../content/site.mjs';
const ROOT=path.resolve(import.meta.dirname,'..');
const projects=JSON.parse(fs.readFileSync(path.join(ROOT,'content/projects.json'),'utf8'));
const identityWork=JSON.parse(fs.readFileSync(path.join(ROOT,'content/identity-work.json'),'utf8'));
const MEDIA=JSON.parse(fs.readFileSync(path.join(ROOT,'content/media.json'),'utf8'));
const bySlug=Object.fromEntries(projects.map(p=>[p.slug,p]));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const exists=f=>fs.existsSync(path.join(ROOT,f));

// ---- validation ----
const REQUIRED=['slug','name','tag','status','period','categories','services','challenge','outcome','overview','chapters','related'];
for(const p of projects){
  for(const k of REQUIRED)if(p[k]===undefined||p[k]===null||(p[k]===''&&k!=='period'))throw new Error(`${p.slug}: missing ${k}`);
  if(!STATUSES.includes(p.status))throw new Error(`${p.slug}: bad status ${p.status}`);
  if(p.status==='Proposed')throw new Error(`${p.slug}: proposals belong on /tangent-media, not in projects`);
  for(const c of p.categories)if(!CATEGORIES[c])throw new Error(`${p.slug}: bad category ${c}`);
  for(const r of p.related)if(!bySlug[r])throw new Error(`${p.slug}: bad related ${r}`);
  for(const v of p.videos)if(!VIDEO_INFO[v.id])throw new Error(`${p.slug}: video ${v.id} has no VIDEO_INFO`);
}
if(projects.filter(p=>p.featured).length>6)throw new Error('more than six featured projects');
for(const [slug,m] of Object.entries(MEDIA)){
  if(!bySlug[slug])throw new Error('media for unknown project '+slug);
  for(const s of [m.poster,...(m.gallery||[]).map(g=>g.src)])for(const w of [420,720])for(const e of ['jpg','webp'])if(!exists(`assets/media/${s}-${w}.${e}`))throw new Error('missing asset '+s+'-'+w+'.'+e);
  if(!m.alt)throw new Error(slug+': media needs alt');
}
for(const [id,v] of Object.entries(LOCAL_VIDEOS))if(!exists(v.src.slice(1)))throw new Error('missing local video '+v.src);

// ---- helpers ----
const statusClass=s=>'st-'+s.split(' ')[0].toLowerCase().replace(/[^a-z]/g,'');
const status=s=>`<span class="status ${statusClass(s)}"><i aria-hidden="true"></i>${esc(s)}</span>`;
const paras=a=>a.map(t=>`<p>${esc(t)}</p>`).join('');
const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const pic=(src,alt,{sizes='(min-width:900px) 50vw,100vw',focus='50% 50%',eager=false}={})=>
 `<picture><source type="image/webp" srcset="/assets/media/${src}-420.webp 420w,/assets/media/${src}-720.webp 720w" sizes="${sizes}"><img src="/assets/media/${src}-720.jpg" srcset="/assets/media/${src}-420.jpg 420w,/assets/media/${src}-720.jpg 720w" sizes="${sizes}" width="720" height="1280" alt="${esc(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" style="object-position:${focus}"></picture>`;
const oneLine=s=>s.replace(/\.$/,'');
const arrow='<span aria-hidden="true"> →</span>';

// image-led feature (only for projects with approved media)
const feat=(p,{sizes,cls='',eager=false}={})=>{const m=MEDIA[p.slug];return `<article class="feat ${cls}" data-cats="${p.categories.join(' ')}" data-status="${esc(p.status)}"><a href="/work/${p.slug}">
 <div class="feat-img">${pic(m.poster,m.alt,{sizes:sizes||'(min-width:900px) 50vw,100vw',focus:m.focus,eager})}</div>
 <div class="feat-cap"><p class="meta">${esc(p.tag)}<span class="sep" aria-hidden="true">/</span>${status(p.status)}</p><h3>${esc(p.name)}</h3><p class="out">${esc(oneLine(p.outcome))}</p><span class="more">View case study${arrow}</span></div></a></article>`};
// ruled index row (works for every project, with or without imagery)
const row=(p,n)=>`<li class="row" data-cats="${p.categories.join(' ')}" data-status="${esc(p.status)}"><a href="/work/${p.slug}">
 <span class="r-no" aria-hidden="true">${String(n).padStart(2,'0')}</span><span class="r-tag">${esc(p.tag)}</span><span class="r-name">${esc(p.name)}</span><span class="r-out">${esc(oneLine(p.outcome))}</span><span class="r-status">${status(p.status)}</span></a></li>`;

const videoBlock=v=>{const info=VIDEO_INFO[v.id],loc=LOCAL_VIDEOS[v.id];
 if(loc){return `<figure class="vfig"><div class="vwrap"><video controls preload="none" playsinline width="${loc.w}" height="${loc.h}" poster="/assets/media/${loc.poster}-720.jpg" aria-label="${esc(info.title)}"><source src="${loc.src}" type="video/mp4"></video></div><figcaption><b>${esc(info.title)}</b>${esc(info.summary)}</figcaption></figure>`}
 return `<figure class="vfig vdrive"><button class="vbtn" type="button" data-video="${v.id}" data-title="${esc(info.title)}" data-summary="${esc(info.summary)}"><span class="vlabel">Play film</span><span class="vsub">${esc(info.title)}</span></button><figcaption><b>${esc(info.title)}</b>${esc(info.summary)} <a href="https://drive.google.com/file/d/${v.id}/view" target="_blank" rel="noopener">Open original file</a></figcaption></figure>`};
const cta=(h='Start a project',p='Let’s work out what your brief needs, then get it made.')=>`<section class="band charcoal cta-band"><div class="wrap"><h2>${h}</h2><p class="lead">${p}</p><div class="actions"><a class="btn peach" href="/contact">Start a project</a><a class="btn ghost-l" href="mailto:${SITE.email}">${SITE.email}</a></div></div></section>`;

const NAV=[['Work','/work'],['Services','/services'],['About','/about'],['Tangent Media','/tangent-media']];
function layout({path:p,title,desc,body,jsonld=[],preload=''}){
  const url=SITE.url+(p==='/'?'/':p);
  const t=title.includes('House of Tangents')?title:`${title} | House of Tangents`;
  const nav=NAV.map(([l,h])=>`<a href="${h}"${p===h||p.startsWith(h+'/')?' aria-current="page"':''}>${l}</a>`).join('');
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="House of Tangents">
<meta property="og:title" content="${esc(t)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE.url}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#E9E8F8">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/PlayfairDisplay-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Inter-normal.woff2" as="font" type="font/woff2" crossorigin>
${preload}<link rel="stylesheet" href="/styles.css">
<script>document.documentElement.classList.add('js')</script>
${jsonld.map(j=>`<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" id="site-header"><div class="bar">
 <a class="brand" href="/" aria-label="House of Tangents, home">House of Tangents</a>
 <nav class="nav" aria-label="Primary">${nav}</nav>
 <a class="btn primary sm head-cta" href="/contact">Start a project</a>
 <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu">Menu</button>
</div></header>
<div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
 <div class="mm-top"><span class="brand">House of Tangents</span><button class="menu-close" type="button">Close</button></div>
 <nav aria-label="Mobile">${NAV.map(([l,h])=>`<a href="${h}">${l}</a>`).join('')}<a href="/contact">Contact</a></nav>
 <a class="btn peach mm-cta" href="/contact">Start a project</a>
</div>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer"><div class="wrap">
 <div class="foot">
  <div><p class="foot-brand">House of Tangents</p><p class="foot-line">${SITE.tagline}</p></div>
  <nav aria-label="Footer"><a href="/work">Work</a><a href="/services">Services</a><a href="/about">About</a><a href="/tangent-media">Tangent Media</a><a href="/contact">Contact</a><a href="/credits">Credits &amp; notes</a></nav>
  <p><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p>
 </div>
 <p class="copy">© 2026 House of Tangents. Project status and figures as of ${SITE.asOf}.</p>
</div></footer>
<dialog class="vdialog" id="vdialog" aria-labelledby="vtitle"><div class="vhead"><h2 id="vtitle"></h2><button type="button" class="vclose">Close</button></div><div class="vframe" id="vframe"></div><p id="vsummary" class="vsum"></p><p class="fine">Interim playback from the client’s shared Google Drive folder, loaded only after you press play.</p></dialog>
<script src="/site.js" defer></script>
</body></html>`;
}
const crumbs=items=>({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map(([n,u],i)=>({'@type':'ListItem',position:i+1,name:n,item:SITE.url+u}))});
const org={'@context':'https://schema.org','@type':'ProfessionalService',name:SITE.name,url:SITE.url,email:SITE.email,telephone:SITE.phone,description:'Branding, strategy, creative and marketing. Tangent thinking. Perpendicular commitment.',slogan:SITE.tagline};
const out=(p,html)=>{const f=p==='/'?'index.html':path.join(p.slice(1),'index.html');const fp=path.join(ROOT,f);fs.mkdirSync(path.dirname(fp),{recursive:true});fs.writeFileSync(fp,html)};
const phero=(eyebrow,h1,lead,tone='')=>`<section class="phero ${tone}"><div class="wrap"><p class="label">${eyebrow}</p><h1>${h1}</h1>${lead?`<p class="lead">${lead}</p>`:''}</div></section>`;
const formHTML=(id)=>`<form class="form" id="${id}" method="post" action="/api/contact" novalidate>
 <div class="err-summary" role="alert" tabindex="-1" hidden></div>
 <div class="field"><label for="${id}-name">Name <span aria-hidden="true">*</span></label><input id="${id}-name" name="name" autocomplete="name" required aria-describedby="${id}-name-e"><span class="err" id="${id}-name-e"></span></div>
 <div class="field"><label for="${id}-company">Company or brand</label><input id="${id}-company" name="company" autocomplete="organization"></div>
 <div class="field"><label for="${id}-contact">Email or phone <span aria-hidden="true">*</span></label><input id="${id}-contact" name="contact" autocomplete="email" required aria-describedby="${id}-contact-e"><span class="err" id="${id}-contact-e"></span></div>
 <div class="field"><label for="${id}-need">What do you need help with? <span aria-hidden="true">*</span></label><textarea id="${id}-need" name="need" rows="4" required aria-describedby="${id}-need-e"></textarea><span class="err" id="${id}-need-e"></span></div>
 <div class="field"><label for="${id}-budget">Approximate budget (optional)</label><input id="${id}-budget" name="budget"></div>
 <div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>
 <button class="btn submit" type="submit">Send enquiry</button>
 <p class="form-status" role="status" aria-live="polite"></p>
 <p class="fine">If sending doesn’t work, email <a href="mailto:${SITE.email}">${SITE.email}</a> or call <a href="${SITE.phoneHref}">${SITE.phone}</a>.</p>
</form>`;

// ================= HOME =================
const featured=projects.filter(p=>p.featured).sort((a,b)=>a.featured-b.featured);
const withMedia=featured.filter(p=>MEDIA[p.slug]),noMedia=featured.filter(p=>!MEDIA[p.slug]);
const svcExamples=s=>s.proof.map(k=>bySlug[k]);
const home=`
<section class="hero"><div class="wrap hero-grid">
 <div class="hero-copy">
  <p class="label">Branding / Strategy / Creative / Marketing</p>
  <h1>Good ideas rarely move in straight lines.</h1>
  <p class="lead">We find a different angle, then do the work to make it happen.</p>
  <div class="actions"><a class="btn primary" href="/contact">Start a project</a><a class="btn ghost" href="#work">Explore the work</a></div>
 </div>
 <figure class="hero-media">
  <div class="reel-frame"><video class="reel" data-reel muted loop playsinline preload="none" poster="/assets/media/home/hero-poster.jpg" aria-label="Looping silent reel of House of Tangents work: the Majestic India logo reveal and the Navdurga Business Park visualisation" width="540" height="960"><source src="/assets/media/home/hero-reel.mp4" type="video/mp4"></video>
  <button class="reel-toggle" type="button" data-reel-toggle aria-pressed="false" hidden>Pause reel</button></div>
  <figcaption>Majestic India reveal and Navdurga Business Park visualisation</figcaption>
 </figure>
</div></section>

<section class="band white" id="work" aria-labelledby="feat-h"><div class="wrap">
 <div class="sec-head"><div><p class="label">Selected work</p><h2 id="feat-h">Six projects, six different angles.</h2></div><a class="link" href="/work">Browse all work${arrow}</a></div>
 <div class="feat-pair">${withMedia.map((p,i)=>feat(p,{cls:i===0?'feat-tall':'feat-wide',sizes:'(min-width:900px) 45vw,100vw',eager:true})).join('')}</div>
 <ol class="rows" start="${withMedia.length+1}">${noMedia.map((p,i)=>row(p,withMedia.length+i+1)).join('')}</ol>
</div></section>

<section class="band" aria-labelledby="proof-h"><div class="wrap results">
 <div class="res-intro"><p class="label">Results</p><h2 id="proof-h">Results, with the context they belong to.</h2><p>Each figure stays with its project, channel and reporting period. Views and followers are not sales.</p></div>
 <ol class="res-list">
  <li><span class="fig">800%+</span><div><p>Organic account reach growth in the first two months.</p><a class="link" href="/work/capitol-hill">Capitol Hill</a></div></li>
  <li><span class="fig">700K–800K</span><div><p>Organic views on selected reels. Paid lead campaigns were separate.</p><a class="link" href="/work/majestic-india">Majestic India</a></div></li>
  <li><span class="fig">2 videos</span><div><p>Above one million views on a personal profile, with no boosted posts or paid ads.</p><a class="link" href="/work/shambhavi">Shambhavi Shiva</a></div></li>
  <li><span class="fig">832</span><div><p>Followers in 20 days, without paid follower acquisition.</p><a class="link" href="/work/santhal-strikers">JT20 / Santhal Strikers</a></div></li>
 </ol>
 <p class="fine res-note">Figures come from the team’s project records and supplied case studies, as of ${SITE.asOf}. Reporting periods and qualifications are on each case study.</p>
</div></section>

<section class="band white" aria-labelledby="serv-h"><div class="wrap">
 <div class="sec-head"><div><p class="label">Services</p><h2 id="serv-h">From the first idea to the final file.</h2></div><a class="link" href="/services">All services${arrow}</a></div>
 <ol class="svc-list">${SERVICES.map((s,i)=>`<li><span class="svc-no" aria-hidden="true">0${i+1}</span><h3>${s.title}</h3><div><p>${s.short}</p><p class="eg"><span>Examples</span> ${svcExamples(s).slice(0,3).map(p=>`<a class="link" href="/work/${p.slug}">${esc(p.name)}</a>`).join(', ')}</p></div></li>`).join('')}</ol>
</div></section>

<section class="band blue origin" id="origin" aria-labelledby="origin-h"><div class="wrap two">
 <div><p class="label">Why “Tangents”</p><h2 id="origin-h">A line that touches a circle once, then moves on.</h2></div>
 <div class="origin-copy"><p>The name comes from a scene in <i>Gangs of Wasseypur Part II</i>, where Guddu explains the difference between a perpendicular and a tangent. It stayed with us because it made the angle matter. We’ve given that geometry its own nonviolent creative meaning.</p><p class="platform">Tangent thinking. Perpendicular commitment.</p><p><a class="link" href="/about#name">Read the full story${arrow}</a></p></div>
</div></section>

<section class="band" aria-labelledby="method-h"><div class="wrap two method">
 <div><p class="label">The Tangent Method</p><h2 id="method-h">We look for the angle, then work through the details.</h2></div>
 <ol class="steps">
  <li><h3><span>1</span>Find the angle</h3><p>We look at what the business needs, who it wants to reach and what its audience is used to seeing. Then we look for a useful detail that gives the brief a different way in.</p></li>
  <li><h3><span>2</span>Make the work</h3><p>We plan, write, design, shoot, build, edit and publish, including the less visible details that decide whether an idea makes sense when people meet it.</p></li>
  <li><h3><span>3</span>Review the response</h3><p>We look at the response available to us and let it shape the next version. For FluffyPet, that meant changing the product experience itself.</p></li>
 </ol>
</div></section>

<section class="band white" aria-labelledby="team-h"><div class="wrap">
 <div class="sec-head"><div><p class="label">The team</p><h2 id="team-h">Four people, sharing the work.</h2></div><a class="link" href="/about#team">Meet the team${arrow}</a></div>
 <ul class="roster">${TEAM.map(t=>`<li><b>${t.name}</b><span class="role">${t.role}</span><span class="what">${t.short}</span></li>`).join('')}</ul>
</div></section>

<section class="band peach testimonial" aria-label="Testimonial"><div class="wrap narrow"><figure><blockquote>“Guests appreciate the work, and many even ask who handles our marketing.”</blockquote><figcaption>Narendra Singh, General Manager, Capitol Hill<span class="fine">An excerpt from the testimonial published on our earlier agency website.</span></figcaption></figure></div></section>

<section class="band charcoal contact-band" id="contact-home" aria-labelledby="c-h"><div class="wrap contact-grid">
 <div>
  <h2 id="c-h">We can look at your brief from another angle.</h2>
  <p class="lead">Let’s work out what it needs, then get it made.</p>
  <p class="direct"><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p>
 </div>
 ${formHTML('hf')}
</div></section>`;
out('/',layout({path:'/',title:'House of Tangents — Branding, Strategy, Creative, Marketing',desc:'Good ideas rarely move in straight lines. House of Tangents finds a different angle, then does the work to make it happen across branding, strategy, creative and marketing.',body:home,jsonld:[org],preload:'<link rel="preload" as="image" href="/assets/media/home/hero-poster.webp" type="image/webp" fetchpriority="high">\n'}));

// ================= WORK INDEX =================
const GROUPS=[['Delivered','Delivered work',['Delivered']],['Ongoing','Ongoing engagements',['Ongoing']],['Confirm','Awaiting status confirmation or under review',['Status to confirm','Unpublished / under review']]];
let counter=0;
const groupHTML=GROUPS.map(([id,title,sts])=>{const list=projects.filter(p=>sts.includes(p.status));const feats=list.filter(p=>MEDIA[p.slug]);const rows=list.filter(p=>!MEDIA[p.slug]);
 return `<section class="wgroup" data-group="${id}" aria-labelledby="g-${id}"><div class="wg-head"><h2 id="g-${id}">${title}</h2><span class="count">${list.length}</span></div>${feats.length?`<div class="feat-pair">${feats.map((p,i)=>feat(p,{cls:i%2===0?'feat-tall':'feat-wide',sizes:'(min-width:900px) 45vw,100vw'})).join('')}</div>`:''}<ol class="rows">${rows.map(p=>row(p,++counter)).join('')}</ol></section>`}).join('');
const filterBtns=`<div class="filters" role="group" aria-label="Filter projects by type"><button type="button" class="chip" data-filter="all" aria-pressed="true">All</button>${Object.entries(CATEGORIES).map(([k,v])=>`<button type="button" class="chip" data-filter="${k}" aria-pressed="false">${v}</button>`).join('')}</div>`;
out('/work',layout({path:'/work',title:'Work',desc:'Selected House of Tangents work across hospitality, personal branding, sport, product launches and brand identities, with results shown alongside their reporting context.',
 body:phero('Work','Work, with the evidence beside it.',`${projects.length} projects from 2023 to 2026, grouped by status. Each case study keeps its numbers next to the project, channel and period they belong to.`)+
 `<section class="band tight"><div class="wrap">${filterBtns}<p class="fine filter-status" role="status" aria-live="polite">Showing ${projects.length} projects</p><div id="work-grid">${groupHTML}</div></div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['Work','/work']])]}));

// ================= CASE STUDIES =================
const TONES=['blue','peach','white'];
for(const [pi,p] of projects.entries()){
  const m=MEDIA[p.slug];const h=hash(p.slug);const tone=TONES[h%3];const variant=m?'media':'type';const layoutB=h%2===1;
  const ctx=p.name+(p.period?' · '+p.period.split('·')[0].trim():'');
  const groups=p.chapters.filter(c=>c.stats&&c.stats.length).map(c=>({h:c.h,stats:c.stats,note:c.note}));
  if(p.metrics&&p.metrics.length)groups.push({h:'Reported results',stats:p.metrics,note:null});
  const prose=p.chapters.map(ch=>`<section class="chapter"><h3>${esc(ch.h)}</h3><div>${paras(ch.p)}${(!ch.stats||!ch.stats.length)&&ch.note?`<p class="note"><b>Note:</b> ${esc(ch.note)}</p>`:''}</div></section>`).join('');
  const resultsHTML=groups.length?`<section class="blk" id="results"><h2 class="label">Results and measurable impact</h2><p class="fine ctx">${esc(ctx)}</p>${groups.map(g=>`<div class="res-group"><h3>${esc(g.h)}</h3><ol class="res-list tight">${g.stats.map(s=>`<li><span class="fig">${esc(s.value)}</span><div><p>${esc(s.label)}</p></div></li>`).join('')}</ol>${g.note?`<p class="note"><b>Note:</b> ${esc(g.note)}</p>`:''}</div>`).join('')}</section>`:'';
  const statusNote={'Unpublished / under review':'This work remained unpublished and under management review in November 2026.','Status to confirm':'The delivery status of this engagement is being confirmed with the client.'}[p.status]||'';
  const rel=p.related.map(r=>bySlug[r]);
  const next=projects[(pi+1)%projects.length];
  const vids=p.videos.map(videoBlock).join('');
  const gallery=m&&m.gallery?`<div class="gal gal-${Math.min(m.gallery.length,4)}">${m.gallery.map(g=>`<figure>${pic(g.src,g.alt,{sizes:'(min-width:900px) 25vw,50vw'})}</figure>`).join('')}</div>`:'';
  const hero=variant==='media'
   ?`<section class="case-hero media"><div class="wrap case-hero-grid"><div><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/work">Work</a> / <span aria-current="page">${esc(p.name)}</span></nav><p class="label">${esc(p.tag)}</p><h1>${esc(p.name)}</h1><p class="lead">${esc(p.title)}</p></div><figure class="case-hero-fig">${pic(m.poster,m.alt,{sizes:'(min-width:900px) 40vw,100vw',focus:m.focus,eager:true})}</figure></div></section>`
   :`<section class="case-hero type ${tone}"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/work">Work</a> / <span aria-current="page">${esc(p.name)}</span></nav><p class="label">${esc(p.tag)}</p><h1>${esc(p.name)}</h1><p class="lead">${esc(p.title)}</p></div></section>`;
  const facts=`<dl class="facts"><div><dt>Client</dt><dd>${esc(p.name)}</dd></div><div><dt>Industry</dt><dd>${esc(p.tag)}</dd></div><div><dt>Status</dt><dd>${status(p.status)}${statusNote?`<small>${esc(statusNote)}</small>`:''}</dd></div><div><dt>Timeframe</dt><dd>${esc((p.period||'To confirm').split('·')[0].trim())}</dd></div></dl>`;
  const deliver=`<section class="blk"><h2 class="label">Deliverables</h2><ul class="deliver">${p.services.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>`;
  const main=`<section class="blk intro"><h2 class="label">Introduction</h2><div class="prose-lead">${paras(p.overview)}</div></section>
   <section class="blk angle"><div><h2 class="label">The challenge</h2><p>${esc(p.challenge)}</p></div>${p.tangent?`<div><h2 class="label">The strategy</h2><p>${esc(p.tangent)}</p></div>`:''}</section>
   <section class="blk"><h2 class="label">Creative execution</h2>${prose}</section>
   ${deliver}
   ${vids||gallery?`<section class="blk visuals"><h2 class="label">Project visuals</h2><div class="vgrid">${vids}</div>${gallery}</section>`:''}
   ${resultsHTML}
   <section class="blk method"><h2 class="label">Methodology and credits</h2><p>Figures come from the team’s project records and supplied case studies. Reporting periods are stated where that information is available. Views, followers, enquiries and address taps are not presented as sales or confirmed visits. Status as of ${SITE.asOf}. <a class="link" href="/credits">Full reporting notes</a>.</p><p>Collective work by the House of Tangents team and specialist collaborators, according to the engagement’s scope.</p></section>`;
  const body=`${hero}<section class="band tight case-body ${layoutB?'case-b':'case-a'}"><div class="wrap">${layoutB?`<div class="case-grid"><aside class="case-side">${facts}</aside><div class="case-main">${main}</div></div>`:`${facts}<div class="case-main">${main}</div>`}</div></section>
  <section class="band white"><div class="wrap"><h2>Related work</h2><ol class="rows">${rel.map((r,i)=>row(r,i+1)).join('')}</ol></div></section>
  <section class="band charcoal cta-band next"><div class="wrap"><p class="label">Next project</p><a class="next-link" href="/work/${next.slug}">${esc(next.name)}${arrow}</a><div class="actions"><a class="btn peach" href="/contact">Start a project</a><a class="btn ghost-l" href="/work">All work</a></div></div></section>`;
  out('/work/'+p.slug,layout({path:'/work/'+p.slug,title:p.name+' case study',desc:`${p.name}: ${p.challenge} ${p.outcome}.`.slice(0,300),body,preload:m?`<link rel="preload" as="image" href="/assets/media/${m.poster}-720.webp" type="image/webp" fetchpriority="high">\n`:'',jsonld:[crumbs([['Home','/'],['Work','/work'],[p.name,'/work/'+p.slug]])]}));
}

// ================= SERVICES =================
const svcRow=p=>`<li class="svc-ex"><a href="/work/${p.slug}">${MEDIA[p.slug]?`<span class="ex-img">${pic(MEDIA[p.slug].poster,MEDIA[p.slug].alt,{sizes:'160px',focus:MEDIA[p.slug].focus})}</span>`:''}<span class="ex-text"><b>${esc(p.name)}</b><span>${esc(p.tag)} · ${esc(p.services.slice(0,3).join(', '))}</span></span><span class="ex-out">${esc(oneLine(p.outcome))}</span></a></li>`;
const SVC_LEAD={brand:'Identity systems, logos, guidelines and the applications around them.',content:'Films, photography, scripts, shoots and AI visualisation.',marketing:'Campaigns, launches and everyday publishing, with the results beside them.',digital:'Websites, e-commerce, onboarding, email flows and automation.'};
out('/services',layout({path:'/services',title:'Services',desc:'Brand strategy and identity, content and production, marketing and campaigns, and websites and digital journeys from House of Tangents.',
 body:phero('Services','We work from the first idea to the final file.','We can start with what your business has today: a new account, an unfinished app, a property still on a plan, or an established business whose online presence needs to catch up.')+
 `<section class="band tight"><div class="wrap">${SERVICES.map((s,i)=>`<article class="svc-block" id="${s.id}"><header><span class="svc-no" aria-hidden="true">0${i+1}</span><h2>${s.title}</h2><p class="svc-lead">${SVC_LEAD[s.id]}</p></header><div class="svc-body">${paras(s.long)}<h3 class="label">Where we’ve done it</h3><ul class="svc-exs">${svcExamples(s).map(svcRow).join('')}</ul></div></article>`).join('')}</div></section>
 <section class="band blue"><div class="wrap two"><div><p class="label">Identity work</p><h2>Beyond the logo</h2></div><div>${paras(identityWork)}</div></div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['Services','/services']])]}));

// ================= ABOUT =================
out('/about',layout({path:'/about',title:'About',desc:'The story behind the name House of Tangents, the four-person core team, and how we choose an approach by understanding the brief.',
 body:phero('About','An agency that finds the angle, then does the work.','House of Tangents works across branding, strategy, creative and marketing. Our experience comes from client work and product engagements, as well as earlier agency roles, and we bring what we’ve learned into the House.')+
 `<section class="band blue" id="name"><div class="wrap two"><div><p class="label">Our name</p><h2>Wasseypur made geometry hard to forget.</h2></div><div>
  <blockquote class="hindi" lang="hi">“अगर जान से मरा, तो ब्लेड परपेंडीकुलर गया था…और अगर सिर्फ चमड़ी कटा, तो समझो टेंजेण्ट था.”</blockquote>
  <p class="cite">Guddu, <i>Gangs of Wasseypur Part II</i></p>
  <p>Guddu’s dialogue made the angle matter. We’ve given that thought a different job at House of Tangents. Our creative platform is “Tangent thinking. Perpendicular commitment.” We look for an approach people haven’t seen coming, then stay with the work it takes to produce it.</p>
  <p class="fine">The dialogue is a brief excerpt from the published <i>Gangs of Wasseypur Part II</i> dubbing script, pp. 42–43. Our agency interpretation is our own. This website uses no film footage, stills or other film assets and does not claim or imply any endorsement, affiliation or collaboration with the film or its rights holders.</p></div></div></section>
 <section class="band white"><div class="wrap two"><div><p class="label">Philosophy</p><h2>Two ideas, one discipline.</h2></div><div class="ph"><div><h3>We think in tangents.</h3><p>For Navdurga, we imagined a visitor’s journey before there was a finished business park to film. For Santhal Strikers, a conversation with a player became a film about the dream that brought him to cricket.</p></div><div><h3>We commit to the execution.</h3><p>An idea still needs someone to plan the shoot and write the script. It needs prompt writing, footage selection, editing, design and a publishing plan. We work through those details, including the less visible ones.</p></div></div></div></section>
 <section class="band" id="team"><div class="wrap"><p class="label">The team</p><h2>We share the work across a four-person team.</h2><div class="team-full">${TEAM.map((t,i)=>`<article><span class="svc-no" aria-hidden="true">0${i+1}</span><div><h3>${t.name}</h3><p class="role">${t.role}</p></div><div>${paras(t.bio)}</div></article>`).join('')}</div><p class="fine">Our core team has four people. We work with specialist production collaborators when a project calls for them. The projects here represent collective work, and team members and collaborators contributed according to each engagement’s scope.</p></div></section>
 <section class="band white"><div class="wrap two"><div><p class="label">How we work</p><h2>A few seconds on screen can contain days of work.</h2></div><div><p>The script comes after research. A shoot depends on preparation, and a useful edit starts with footage selection. We review the work before it goes out.</p><p>We look at what the business needs and who it wants to reach, then assess the material already available. That helps us decide whether the useful next step is an identity or a story, a digital journey or a more consistent content rhythm.</p><p>We plan production and build the assets, then publish or hand over the work and review the response available to us. Feedback informs the next version. Our team crosses between roles because a brief rarely divides itself neatly into departments.</p></div></div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['About','/about']])]}));

// ================= TANGENT MEDIA =================
const rv=bySlug['majestic-india'].videos.find(v=>v.id==='1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R');
const nv=bySlug['navdurga'].videos;
const prop=(t,body)=>`<article class="proposal"><p class="prop-flag"><span class="status st-proposed"><i aria-hidden="true"></i>Proposal — not yet produced</span></p><h3>${t}</h3>${body}</article>`;
out('/tangent-media',layout({path:'/tangent-media',title:'Tangent Media',desc:'Where the brief took a turn: unconventional approaches House of Tangents delivered, and clearly labelled proposals for new formats.',
 body:phero('Tangent Media','Tangent Media shows where the brief took a turn.','We explain the observation behind a concept and how we made it. When an idea is new, we show what it would take to put it into production.')+
 `<section class="band tight"><div class="wrap"><div class="wg-head"><h2>Delivered</h2><span class="count">2</span></div>
  <article class="tm"><div><h3>We filmed the reveal before the logo was ready.</h3><p>Majestic India’s logo was still in development, but the shoot couldn’t wait for the final artwork. We filmed the performance and blank-paper interaction first. Once the logo was complete, we used masking to place it in the footage.</p><p>That let production continue while design work was still underway. The reveal campaign was completed and published. <a class="link" href="/work/majestic-india">Majestic India case study</a></p></div><div>${videoBlock(rv)}</div></article>
  <article class="tm"><div><h3>We turned the planned site into a visit people could follow.</h3><p>Navdurga had no completed site to film, so we created an airport-to-location film and a separate AI-generated FPV-style facilities walkthrough. We planned scenes, wrote the prompts, generated the sequences, and added sound and editing.</p><p>Both films were published organically on the page we managed. They are AI visualisations of planned facilities, rather than filmed tours of completed construction. <a class="link" href="/work/navdurga">Navdurga case study</a></p></div><div class="tm-pair">${nv.map(videoBlock).join('')}</div></article>
 </div></section>
 <section class="band peach"><div class="wrap"><div class="wg-head"><h2>Proposals</h2><span class="count">3</span></div><p class="lead">Nothing below has been produced or published. These are proposed formats based on decisions from our delivered work.</p>
  <div class="prop-grid">
  ${prop('A proposed HOT agency film',`<p>The film opens on a screen that says, “Show the business park.” The camera reaches an empty site. A cursor changes the question to, “What would the first visit feel like?” An imagined journey opens up.</p><p>A blank sheet then waits for a logo. A cricket scorecard opens into a player’s childhood dream, and a salon chair turns towards a finished haircut. The close returns to the team at the desk: “The angle is the beginning. We stay for the work.”</p><p class="fine">Production would use team footage, original graphics, approved work samples and labelled AI sequences.</p>`)}
  ${prop('The Brief Took a Turn',`<p>A proposed short-form series showing the original brief and the assumption that limited it, followed by the alternative question and finished work.</p><p>The first episode could use Navdurga. Later episodes could cover Majestic’s reveal or Pratyush’s story. Black’s decision to keep the approach simple would be another useful episode.</p>`)}
  ${prop('Angle / Execution',`<p>A proposed carousel or website format that places an observation beside a production plan: the scene and production method, the assets, and the intended audience response.</p><p>We could use the same approach in proposals so a new idea arrives with a clear route into production.</p>`)}
  </div></div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['Tangent Media','/tangent-media']])]}));

// ================= CONTACT =================
out('/contact',layout({path:'/contact',title:'Contact',desc:'Start a project with House of Tangents. Email farhafatima3686@gmail.com or call +91 70911 40333.',
 body:`<section class="band contact-page"><div class="wrap contact-grid"><div><p class="label">Contact</p><h1>We can look at your brief from another angle.</h1><p class="lead">Let’s work out what it needs, then get it made.</p><p class="direct"><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p><p>Farha Fatima, Founder, Brand &amp; Creative Director.</p><p class="fine">Tell us about the brief, the business and what you have today. We’ll come back with how we’d approach it.</p></div><div class="form-panel">${formHTML('cf')}</div></div></section>`,
 jsonld:[org,crumbs([['Home','/'],['Contact','/contact']])]}));

// ================= CREDITS =================
out('/credits',layout({path:'/credits',title:'Credits and notes',desc:'Source notes, attribution, reporting qualifications and archive context for the House of Tangents portfolio.',
 body:phero('Credits & notes','Our project credits preserve the original context.')+
 `<section class="band tight"><div class="wrap narrow prose">
  <h2>Film reference</h2><p>The Wasseypur dialogue is a brief excerpt from the published <i>Gangs of Wasseypur Part II</i> dubbing script, on pages 42–43, attributed to the character Guddu. Our agency interpretation is original. This website includes no film footage, stills, posters, soundtrack or other film assets, and makes no claim of endorsement, affiliation or collaboration.</p>
  <h2>Reporting qualifications</h2>
  <ul class="list"><li>Figures come from the team’s project records and supplied case studies, with reporting periods stated where available.</li>
  <li>Capitol Hill: address taps and profile interactions are not confirmed visits or bookings. The two Google Business Profile figures cover different reporting periods.</li>
  <li>Black: the zero-ad-spend result belongs only to the second-anniversary activity. Separate paid campaigns ran at other points. Booking and enquiry figures are client-reported.</li>
  <li>Majestic India: reel results were organic. Paid contestant lead-generation campaigns were separate. Enquiry figures come from the team’s records.</li>
  <li>Shambhavi Shiva: all personal-profile results were organic, with no boosted posts or paid ads.</li>
  <li>ZOI: the earlier published case-study figures (200K+ reach, 150+ creatives, 4K+ monthly engagement, 60%+ footfall growth) don’t share a single defined reporting window.</li>
  <li>Sanatni: the download figure covers the wider campaign and launch activity, not a single reel.</li>
  <li>Navdurga: the films and stills are AI visualisations of proposed facilities, not footage of completed construction.</li>
  <li>Saregama Music: unpublished and under management review as of November 2026. The two-day figure describes the initial edit only.</li></ul>
  <h2>Sources</h2><p>Earlier project records appear on the Brand Thinker website. Capitol Hill material appears in the earlier project portfolio and the digital-presence case study. The earlier Black and ZOI cases provide additional project context. The Capitol Hill testimonial from Narendra Singh, General Manager, is an excerpt from the testimonial published on the earlier agency website.</p>
  <h2>Additional engagements</h2><ul class="list"><li><b>Cyclist Café</b>: pet-friendly café script and collaboration planning.</li><li><b>Street Dogs of Ranchi</b>: the FluffyPet adoption-event collaboration.</li><li><b>Shaadi Essentials</b>: gifting communication and a deck, as well as proposal and copy development.</li><li><b>ABS College</b> and <b>Shri Anandam Dham</b>: earlier website work.</li><li><b>Chai Bubble</b>: part of our hospitality engagement history.</li><li><b>Pi Studio</b> and <b>Brand Thinker</b>: earlier agency experiences covering the offer, pitches and client delivery.</li></ul><p class="fine">Scope varies by project.</p>
  <h2>Product communication archive</h2><p>DIM12/DIM-12 and RadiologyGPT appear in earlier product and ecosystem discussions, alongside Pi Social, Pi Learn, Pi Path and Pi Enroll. They belong in the supporting experience inventory rather than separate completed-campaign case studies.</p>
  <h2>Team credit</h2><p>The projects represent collective work. Team members and specialist collaborators contributed according to each engagement’s scope.</p>
 </div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['Credits','/credits']])]}));

// ================= 404 =================
fs.writeFileSync(path.join(ROOT,'404.html'),layout({path:'/404',title:'Page not found',desc:'This page could not be found.',body:phero('404','This page isn’t here.','Try the homepage or browse the work.')+`<section class="band tight"><div class="wrap actions"><a class="btn primary" href="/">Back to the homepage</a><a class="btn ghost" href="/work">Browse work</a></div></section>`}));

// ================= sitemap / robots =================
const urls=['/','/work','/services','/about','/tangent-media','/contact','/credits',...projects.map(p=>'/work/'+p.slug)];
fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${SITE.url}${u==='/'?'/':u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log('built',urls.length,'routes');
