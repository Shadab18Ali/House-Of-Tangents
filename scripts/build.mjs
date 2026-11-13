// Static generator: content/* -> HTML routes at the repo root.
// Run: node scripts/build.mjs   (edit content/, rebuild, commit the generated HTML)
import fs from 'node:fs';import path from 'node:path';
import {SITE,STATUSES,SECTORS,CHAPTERS,TEAM,SERVICES,MEDIA_TYPES,VIDEO_INFO,LOCAL_VIDEOS} from '../content/site.mjs';
import {WASSEYPUR,HOME,MEDIA_ITEMS,IDENTITIES,RESULT_GROUPS,STORIES,IDEAS,PROCESS,ADDITIONAL,NOTES} from '../content/pages.mjs';
const ROOT=path.resolve(import.meta.dirname,'..');
const load=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8'));
const projects=load('content/projects.json'),MEDIA=load('content/media.json'),ASSETS=load('content/assets.json');
const bySlug=Object.fromEntries(projects.map(p=>[p.slug,p]));
const itemById=Object.fromEntries(MEDIA_ITEMS.map(m=>[m.id,m]));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const exists=f=>fs.existsSync(path.join(ROOT,f));
const fail=m=>{throw new Error(m)};
const creativeBySrc={};for(const m of Object.values(MEDIA))for(const c of m.creatives||[])creativeBySrc[c.src]=c;
const stillAlt={};for(const m of Object.values(MEDIA)){stillAlt[m.poster]=m.alt;for(const g of m.gallery||[])stillAlt[g.src]=g.alt}

// ---------- validation: the build fails rather than publish a broken or unsupported claim ----------
const REQUIRED=['slug','name','tag','chapters','status','title','overview','challenge','approach','story','services','deliverables','results','qualitative','context','credits','videos','related','outcome'];
for(const p of projects){
  for(const k of REQUIRED)if(p[k]===undefined||p[k]===null||p[k]==='')fail(`${p.slug}: missing ${k}`);
  if(!STATUSES.includes(p.status))fail(`${p.slug}: bad status ${p.status}`);
  if(p.status==='Pending'&&!(p.statusShort&&p.statusText))fail(`${p.slug}: a pending project needs statusShort and statusText`);
  if(p.sector!==null&&!SECTORS[p.sector])fail(`${p.slug}: bad sector ${p.sector}`);
  for(const c of p.chapters)if(!['results','media','identities'].includes(c))fail(`${p.slug}: bad chapter ${c}`);
  for(const r of p.related)if(!bySlug[r])fail(`${p.slug}: bad related ${r}`);
  if(p.partOf&&!bySlug[p.partOf])fail(`${p.slug}: bad partOf`);
  for(const v of p.videos)if(!VIDEO_INFO[v.id])fail(`${p.slug}: video ${v.id} has no VIDEO_INFO`);
  for(const r of p.results)for(const k of ['value','metric','source'])if(!r[k])fail(`${p.slug}: a result record needs ${k}`);
}
for(const [slug,m] of Object.entries(MEDIA)){
  if(!bySlug[slug])fail('media for unknown project '+slug);
  if(!m.alt)fail(slug+': media needs alt');
  for(const s of [m.poster,...(m.gallery||[]).map(g=>g.src)])for(const w of [420,720])for(const e of ['jpg','webp'])if(!exists(`assets/media/${s}-${w}.${e}`))fail('missing asset '+s+'-'+w+'.'+e);
  for(const g of m.creatives||[]){for(const w of [420,720,1080])for(const e of ['jpg','webp'])if(!exists(`assets/media/${g.src}-${w}.${e}`))fail('missing creative '+g.src);if(!g.alt||!g.caption||!g.w||!g.h)fail('creative needs alt, caption, w, h: '+g.src)}
}
for(const v of Object.values(LOCAL_VIDEOS)){if(!exists(v.src.slice(1)))fail('missing local video '+v.src);if(!stillAlt[v.poster])fail('poster has no alt text: '+v.poster)}
for(const m of MEDIA_ITEMS){
  if(!bySlug[m.project])fail('media item for unknown project: '+m.id);if(!MEDIA_TYPES[m.type])fail('bad media type: '+m.id);
  if(m.video&&!VIDEO_INFO[m.video])fail('media item video missing: '+m.id);if(m.image&&!creativeBySrc[m.image])fail('media item image missing: '+m.id);
}
for(const id of HOME.media)if(!itemById[id])fail('home media item missing: '+id);
for(const r of [...HOME.results,...HOME.strip,...STORIES])if(!bySlug[r.slug])fail('unknown project on a page: '+r.slug);
for(const g of RESULT_GROUPS)for(const it of g.items)for(const s of typeof it==='string'?[it]:it.links)if(!bySlug[s])fail('unknown project in results: '+s);
for(const s of SERVICES)for(const e of s.examples)if(!bySlug[typeof e==='string'?e:e.slug])fail('unknown service example');
for(const e of IDENTITIES){if(!ASSETS.logos[e.logo])fail('identity has no logo slot in assets.json: '+e.logo);if(e.image&&!creativeBySrc[e.image])fail('identity image missing: '+e.image)}
const checkAsset=(a,n)=>{if(a.src&&(!exists(a.src.replace(/^\//,''))||!a.w||!a.h||!a.alt))fail(`asset ${n}: src is set but the file, size or alt text is missing`)};
checkAsset(ASSETS.homepageBanner,'homepageBanner');checkAsset(ASSETS.wasseypurArtwork,'wasseypurArtwork');checkAsset(ASSETS.teamGroup,'teamGroup');
for(const [k,a] of Object.entries(ASSETS.teamPortraits))checkAsset(a,'portrait '+k);for(const [k,a] of Object.entries(ASSETS.logos))checkAsset(a,'logo '+k);

// ---------- helpers ----------
const paras=a=>a.map(t=>`<p>${esc(t)}</p>`).join('');
const arrow='<span aria-hidden="true"> →</span>';
const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const pic=(src,alt,{sizes='(min-width:900px) 50vw,100vw',focus='50% 50%',eager=false,w=720,h=1280,widths=[420,720]}={})=>
 `<picture><source type="image/webp" srcset="${widths.map(x=>`/assets/media/${src}-${x}.webp ${x}w`).join(',')}" sizes="${sizes}"><img src="/assets/media/${src}-720.jpg" srcset="${widths.map(x=>`/assets/media/${src}-${x}.jpg ${x}w`).join(',')}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" style="object-position:${focus}"></picture>`;
const asset=(a,{eager=false}={})=>`<img src="${a.src}" width="${a.w}" height="${a.h}" alt="${esc(a.alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
const logo=(tone,eager=false)=>`<picture><source type="image/webp" srcset="/assets/brand/logo-${tone}.webp"><img src="/assets/brand/logo-${tone}.png" alt="House of Tangents" width="1200" height="340" decoding="async"${eager?'':' loading="lazy"'}></picture>`;
const statusShort=p=>({Delivered:'Delivered',Ongoing:'Ongoing (Nov 2026)',Pending:p.statusShort})[p.status]||'';
const statusFull=p=>p.status==='Not recorded'?'':p.statusText||(p.status==='Ongoing'?`Ongoing in the ${SITE.snapshot} record.`:'Delivered.');
const status=p=>{const s=statusShort(p);return s?`<span class="status st-${p.status.toLowerCase()}"><i aria-hidden="true"></i>${esc(s)}</span>`:''};
const meta=p=>{const s=status(p);return `<p class="meta">${esc(p.tag)}${s?`<span class="sep" aria-hidden="true">/</span>${s}`:''}</p>`};
const row=(p,n)=>`<li class="row"><a href="/work/${p.slug}"><span class="r-no" aria-hidden="true">${String(n).padStart(2,'0')}</span><span class="r-name">${esc(p.name)}</span><span class="r-tag">${esc(p.tag)}</span><span class="r-out">${esc(p.outcome)}</span><span class="r-status">${status(p)}</span></a></li>`;
// A result always travels with its period, its paid/organic basis and its source.
const records=rs=>`<ol class="records">${rs.map(r=>`<li><span class="fig">${esc(r.value)}</span><div><p class="rec-metric">${esc(r.metric)}</p><p class="rec-meta">${[r.period,r.basis,'Source: '+r.source.toLowerCase()].filter(Boolean).map(esc).join(' · ')}</p></div></li>`).join('')}</ol>`;
const quals=q=>q.length?`<ul class="quals">${q.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:'';
const tq=t=>`<figure class="tq"><blockquote>“${esc(t.quote)}”</blockquote><figcaption><b>${esc(t.name)}</b><span>${esc(t.role)}</span></figcaption></figure>`;
const videoBlock=id=>{const info=VIDEO_INFO[id],loc=LOCAL_VIDEOS[id];
 if(loc)return `<figure class="vfig"><div class="vwrap"><video controls preload="none" playsinline width="${loc.w}" height="${loc.h}" poster="/assets/media/${loc.poster}-720.jpg" aria-label="${esc(info.title)}"><source src="${loc.src}" type="video/mp4"></video></div><figcaption><b>${esc(info.title)}</b>${esc(info.summary)}</figcaption></figure>`;
 return `<figure class="vfig"><button class="vbtn" type="button" data-video="${id}" data-title="${esc(info.title)}" data-summary="${esc(info.summary)}"><span class="vlabel">Play film</span><span class="vsub">${esc(info.title)}</span></button><figcaption><b>${esc(info.title)}</b>${esc(info.summary)}</figcaption></figure>`};
// One media tile, used on the homepage and in the HOT Media archive.
function tile(m,{line,sizes='(min-width:1000px) 30vw,(min-width:600px) 50vw,100vw'}={}){
  const p=bySlug[m.project],href=m.link||`/work/${p.slug}`,type=MEDIA_TYPES[m.type];let top;
  if(m.video){const info=VIDEO_INFO[m.video],loc=LOCAL_VIDEOS[m.video],d=`data-title="${esc(info.title)}" data-summary="${esc(info.summary)}" aria-label="Play ${esc(info.title)}"`;
    top=loc?`<button type="button" class="mt-top mt-play has-img" data-local="${loc.src}" data-poster="/assets/media/${loc.poster}-720.jpg" ${d}>${pic(loc.poster,stillAlt[loc.poster],{sizes})}<span class="mt-badge">Play film</span></button>`
       :`<button type="button" class="mt-top mt-play mt-plate dark" data-video="${m.video}" ${d}><span class="plate-tag">${esc(type)}</span><span class="mt-name">${esc(m.title)}</span><span class="mt-badge">Play film</span></button>`}
  else if(m.image){const c=creativeBySrc[m.image];top=`<a class="mt-top mt-img" href="${href}">${pic(c.src,c.alt,{sizes,w:c.w,h:c.h,widths:[420,720,1080]})}</a>`}
  else top=`<a class="mt-top mt-plate" href="${href}"><span class="plate-tag">${esc(type)}</span><span class="mt-name">${esc(m.title)}</span></a>`;
  return `<article class="mt" data-item data-type="${m.type}">${top}<div class="mt-cap"><p class="meta">${esc(type)}</p><h3><a href="${href}">${esc(p.name)}</a></h3><p class="mt-title">${esc(m.title)}</p><p class="mt-did">${esc(line||m.did)}</p>${m.note?`<p class="mt-note">${esc(m.note)}</p>`:''}</div></article>`;
}
const whyBlock=(h)=>{const art=ASSETS.wasseypurArtwork;
 return `<section class="band blue why" id="why" aria-labelledby="why-h"><div class="wrap why-grid">
 <figure class="why-art">${art.src?asset(art):`<blockquote class="hindi" lang="hi">${WASSEYPUR.dialogue}</blockquote>`}<figcaption>Guddu, <i>Gangs of Wasseypur Part II</i></figcaption></figure>
 <div><p class="label">Why this House has tangents</p><${h} id="why-h">${WASSEYPUR.heading}</${h}><p>${WASSEYPUR.body}</p><p class="platform">${WASSEYPUR.closing}</p><p class="fine">This is our own interpretation of the reference. <a class="link" href="/credits#film">Source and credit</a></p></div>
</div></section>`};
const invite=()=>`<section class="band indigo invite" aria-labelledby="inv-h"><div class="wrap"><h2 id="inv-h">Tell us what you’re trying to change.</h2><p class="lead">You don’t need a finished brief. Tell us about the business and where you’re getting stuck.</p><div class="actions"><a class="btn peach" href="/contact">Start a project</a></div></div></section>`;

// ---------- shell ----------
const WORK_LINKS=[['All work','/work'],['HOT Results','/hot-results'],['HOT Media','/hot-media'],['Brand identities','/brand-identities']];
const NAV=[['Services','/services'],['About','/about'],['Tangent Media','/tangent-media']];
function layout({path:p,title,desc,body,jsonld=[],preload=''}){
  const url=SITE.url+(p==='/'?'/':p);
  const t=title.includes('House of Tangents')?title:`${title} | House of Tangents`;
  const inWork=p==='/work'||p.startsWith('/work/')||WORK_LINKS.some(w=>w[1]===p);
  const cur=h=>p===h||(h==='/work'&&p.startsWith('/work/'))?' aria-current="page"':'';
  const workLinks=WORK_LINKS.map(([l,h])=>`<a href="${h}"${cur(h)}>${l}</a>`).join('');
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
 <a class="brand" href="/" aria-label="House of Tangents, home">${logo('indigo',true)}</a>
 <nav class="nav" aria-label="Primary">
  <div class="nav-group${inWork?' is-current':''}" data-navgroup><button type="button" class="nav-btn" aria-expanded="false" aria-controls="work-menu">Work<i aria-hidden="true"></i></button><div class="submenu" id="work-menu">${workLinks}</div></div>
  ${NAV.map(([l,h])=>`<a href="${h}"${cur(h)}>${l}</a>`).join('')}
 </nav>
 <a class="btn primary sm head-cta" href="/contact">Start a project</a>
 <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu">Menu</button>
</div></header>
<div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
 <div class="mm-top"><a class="brand" href="/" aria-label="House of Tangents, home">${logo('lavender',true)}</a><button class="menu-close" type="button">Close</button></div>
 <nav aria-label="Mobile"><details class="mm-group"${inWork?' open':''}><summary>Work</summary>${workLinks}</details>${NAV.map(([l,h])=>`<a href="${h}"${cur(h)}>${l}</a>`).join('')}<a href="/contact"${cur('/contact')}>Contact</a></nav>
 <a class="btn peach mm-cta" href="/contact">Start a project</a>
</div>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer"><div class="wrap">
 <div class="foot">
  <div><p class="foot-brand">${logo('lavender')}</p><p class="foot-line">${SITE.tagline}</p></div>
  <nav class="foot-col" aria-label="Work"><p class="foot-h">Work</p>${WORK_LINKS.map(([l,h])=>`<a href="${h}">${l}</a>`).join('')}</nav>
  <nav class="foot-col" aria-label="The House"><p class="foot-h">The House</p><a href="/services">Services</a><a href="/about">About</a><a href="/tangent-media">Tangent Media</a><a href="/credits">Credits &amp; notes</a></nav>
  <div class="foot-col"><p class="foot-h">Contact</p><a href="/contact">Start a project</a><a href="mailto:${SITE.email}">${SITE.email}</a><a href="${SITE.phoneHref}">${SITE.phone}</a></div>
 </div>
 <p class="copy">© 2026 House of Tangents.</p>
</div></footer>
<dialog class="vdialog" id="vdialog" aria-labelledby="vtitle"><div class="vhead"><h2 id="vtitle"></h2><button type="button" class="vclose">Close</button></div><div class="vframe" id="vframe"></div><p id="vsummary" class="vsum"></p><p class="fine">Video loads when you press play.</p></dialog>
<script src="/site.js" defer></script>
</body></html>`;
}
const crumbs=items=>({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map(([n,u],i)=>({'@type':'ListItem',position:i+1,name:n,item:SITE.url+u}))});
const org={'@context':'https://schema.org','@type':'ProfessionalService',name:SITE.name,url:SITE.url,email:SITE.email,telephone:SITE.phone,description:'A branding and marketing team working across identity, production, campaigns, websites and digital journeys.',slogan:SITE.tagline};
const out=(p,html)=>{const f=p==='/'?'index.html':path.join(p.slice(1),'index.html');const fp=path.join(ROOT,f);fs.mkdirSync(path.dirname(fp),{recursive:true});fs.writeFileSync(fp,html)};
const phero=(label,h1,lead,support,trail='')=>`<section class="phero"><div class="wrap">${trail}<p class="label">${label}</p><h1>${h1}</h1>${lead?`<p class="lead">${lead}</p>`:''}${support?`<p class="support">${support}</p>`:''}</div></section>`;
const chap=(k,id)=>`<header class="chap"><h2 id="${id}">${CHAPTERS[k].name}</h2><p class="lead">${CHAPTERS[k].explain}</p><p class="support">${CHAPTERS[k].support}</p></header>`;
const trail=(items)=>`<nav class="crumbs" aria-label="Breadcrumb">${items.map(([n,u],i)=>i<items.length-1?`<a href="${u}">${esc(n)}</a> / `:`<span aria-current="page">${esc(n)}</span>`).join('')}</nav>`;
const chips=(group,label,all,entries)=>`<div class="fgroup" role="group" aria-labelledby="fl-${group}" data-fgroup="${group}"><p class="fg-label" id="fl-${group}">${label}</p><button type="button" class="chip" data-f="all" aria-pressed="true">${all}</button>${entries.map(([k,v])=>`<button type="button" class="chip" data-f="${k}" aria-pressed="false">${v}</button>`).join('')}</div>`;

// ================= HOME (order fixed by the brief: A to H) =================
const banner=ASSETS.homepageBanner;
const heroText=`<p class="label">HOUSE OF TANGENTS</p><h1>${SITE.tagline}</h1><p class="lead">We find a different angle, then do the work to make it happen. House of Tangents brings brand thinking into the same room as the people making and marketing the work.</p><div class="actions"><a class="btn primary" href="/work">Explore our work</a><a class="btn ghost" href="/contact">Tell us your brief</a></div>`;
const hero=banner.src
 ?`<section class="hero has-banner"><div class="banner">${asset(banner,{eager:true})}</div><div class="wrap hero-text">${heroText}</div></section>`
 :`<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">${heroText}</div>
 <figure class="hero-media"><div class="reel-frame"><video class="reel" data-reel muted loop playsinline preload="none" poster="/assets/media/home/hero-poster.webp" aria-label="Looping silent reel of House of Tangents work: the Majestic India logo reveal and the Navdurga Business Park visualisation" width="540" height="960"><source src="/assets/media/home/hero-reel.mp4" type="video/mp4"></video><button class="reel-toggle" type="button" data-reel-toggle aria-pressed="false" hidden>Pause reel</button></div><figcaption>Majestic India reveal and Navdurga Business Park visualisation</figcaption></figure>
</div></section>`;
const home=`${hero}
${whyBlock('h2')}
<section class="band white" id="hot-results" aria-labelledby="res-h"><div class="wrap">
 ${chap('results','res-h')}
 <div class="ev-grid">${HOME.results.map(r=>{const p=bySlug[r.slug];return `<article class="ev"><a href="/work/${p.slug}"><p class="ev-proj">${esc(p.name)}</p><p class="ev-claim">${esc(r.claim)}</p><p class="ev-label">${esc(r.label)}</p><p class="ev-did">${esc(r.did)}</p><span class="more">Read the case study${arrow}</span></a></article>`}).join('')}</div>
 <ul class="ev-strip">${HOME.strip.map(r=>`<li><a href="/work/${r.slug}"><b>${esc(bySlug[r.slug].name)}</b><span>${esc(r.line)}</span></a></li>`).join('')}</ul>
 <p class="fine">Each figure belongs to its own project and period. Paid campaigns and organic results are kept apart on every case study.</p>
 <div class="actions"><a class="btn ghost" href="/hot-results">Explore HOT Results</a></div>
</div></section>
<section class="band" id="hot-media" aria-labelledby="med-h"><div class="wrap">
 ${chap('media','med-h')}
 <div class="mgrid">${HOME.media.map(id=>tile(itemById[id],{line:itemById[id].home})).join('')}</div>
 <div class="actions"><a class="btn ghost" href="/hot-media">Explore HOT Media</a></div>
</div></section>
<section class="band white needs" aria-labelledby="needs-h"><div class="wrap two">
 <div><p class="label">What your brief might need</p><h2 id="needs-h">We can start with what your business has today.</h2><p>That might be a business with years of trust, a new product or a place that hasn’t opened yet. We work out what needs to change, then build the right scope around it.</p></div>
 <ol class="svc-links">${SERVICES.map((s,i)=>`<li><a href="/services#${s.id}"><span class="svc-no" aria-hidden="true">0${i+1}</span><b>${s.title}</b><span>${s.one}</span></a></li>`).join('')}</ol>
</div></section>
<section class="band peach" id="tangent-media" aria-labelledby="tm-h"><div class="wrap">
 ${chap('tangent','tm-h')}
 <div class="tm-feature">
  <article class="tm-main"><p class="meta">Navdurga Business Park</p><h3>The brief was to show a business park. The park wasn’t built.</h3><p>We imagined the first visit instead. AI-generated sequences took the viewer from arrival towards the location, while a separate FPV-style film introduced the proposed facilities.</p><p><a class="link" href="/tangent-media#navdurga">See where the brief took a turn${arrow}</a></p></article>
  <article class="tm-side"><p class="meta">Black Salon</p><h3>Sometimes, the right angle is to keep it simple.</h3><p>At Black, regular transformations and client testimonials gave people the evidence they needed before booking. The thinking was in choosing what to repeat.</p><p><a class="link" href="/tangent-media#black">See the thinking behind Black${arrow}</a></p></article>
 </div>
</div></section>
<section class="band" aria-labelledby="team-h"><div class="wrap">
 <div class="sec-head"><div><p class="label">The people in the House</p><h2 id="team-h">Four people. Shared responsibility for the work.</h2><p>The roles give you a starting point. Our involvement crosses over because the brief usually does.</p></div></div>
 <ul class="people">${TEAM.map(t=>{const ph=ASSETS.teamPortraits[t.id];return `<li>${ph.src?`<div class="portrait">${asset(ph)}</div>`:''}<h3>${t.name}</h3><p class="role">${esc(t.role)}</p><p>${t.bio}</p></li>`}).join('')}</ul>
 <div class="actions"><a class="btn ghost" href="/about#team">Meet the team</a></div>
</div></section>
${invite()}`;
out('/',layout({path:'/',title:'House of Tangents: branding, strategy, creative and marketing',desc:'Good ideas rarely move in straight lines. House of Tangents finds a different angle, then does the work to make it happen across identity, production, campaigns and websites.',body:home,jsonld:[org],preload:banner.src?'':'<link rel="preload" as="image" href="/assets/media/home/hero-poster.webp" type="image/webp" fetchpriority="high">\n'}));

// ================= WORK INDEX =================
const TONES=['tone-blue','tone-white','tone-peach'];let toneI=0;
const went=p=>{const m=MEDIA[p.slug],tone=p.lead&&!m?TONES[toneI++%3]:'';
 return `<li class="went${p.lead?' lead':''}${tone?' '+tone:''}" data-item data-chapter="${p.chapters.join(' ')}" data-sector="${p.sector||''}"><a href="/work/${p.slug}">${p.lead&&m?`<div class="went-img">${pic(m.poster,m.alt,{sizes:'(min-width:900px) 45vw,100vw',focus:m.focus})}</div>`:''}<div class="went-body">${meta(p)}<h3>${esc(p.name)}</h3><p class="went-brief">${esc(p.challenge)}</p>${p.partOf?`<p class="went-part">Part of the ${esc(bySlug[p.partOf].name)} engagement</p>`:''}<ul class="tags">${p.services.slice(0,4).map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div></a></li>`};
out('/work',layout({path:'/work',title:'Work',desc:'Explore House of Tangents work by chapter or sector: hospitality, beauty, sport, personal branding, products, property, jewellery and consumer brands.',
 body:phero('Work','Different businesses. Different starting points.','Some needed their first identity. Others needed an online presence that reflected what they’d already built. Explore the work by the problem, the output or the kind of business.')+
 `<section class="band tight"><div class="wrap">
  <div class="filterbar" data-filters="work-grid" data-one="project" data-many="projects">${chips('chapter','Explore by chapter','All work',[['results','HOT Results'],['media','HOT Media'],['identities','Brand identities']])}${chips('sector','Explore by sector','All sectors',Object.entries(SECTORS))}</div>
  <p class="fine filter-status" role="status" aria-live="polite">Showing ${projects.length} projects</p>
  <ul class="wgrid" id="work-grid">${projects.map(went).join('')}</ul>
  <p class="empty" hidden>No projects match both filters. <button type="button" class="link-btn" data-reset>Clear the filters</button></p>
 </div></section>
 <section class="band white"><div class="wrap two"><div><p class="label">Additional experience</p><h2>Smaller engagements, with a narrower scope.</h2><p>These were limited pieces of work or earlier records, not full-service engagements. We list them for context and describe only what was done.</p></div>
  <ul class="add-list">${ADDITIONAL.map(a=>`<li><b>${esc(a.name)}</b><span>${esc(a.scope)}</span></li>`).join('')}</ul></div></section>`+invite(),
 jsonld:[crumbs([['Home','/'],['Work','/work']])]}));

// ================= HOT RESULTS =================
const rstory=it=>{
 if(typeof it==='string'){const p=bySlug[it];
  return `<article class="rstory" id="r-${p.slug}"><header>${meta(p)}<h3><a href="/work/${p.slug}">${esc(p.name)}</a></h3></header>
   <dl class="rs-dl"><div><dt>The starting point</dt><dd>${esc(p.challenge)}</dd></div><div><dt>The decision we made</dt><dd>${esc(p.approach)}</dd></div><div><dt>What our team delivered</dt><dd>${esc(p.services.join(', '))}.</dd></div></dl>
   <div class="rs-resp"><h4>The reported response</h4>${p.results.length?records(p.results):''}${quals(p.qualitative)}</div>
   ${p.context.length?`<p class="note"><b>Context:</b> ${p.context.slice(0,2).map(esc).join(' ')}</p>`:''}${p.testimonial?tq(p.testimonial):''}
   <p><a class="link" href="/work/${p.slug}">Read the ${esc(p.name)} case study${arrow}</a></p></article>`}
 return `<article class="rstory" id="r-${it.id}"><header><p class="meta">Hospitality</p><h3>${esc(it.title)}</h3></header>
   <dl class="rs-dl"><div><dt>The starting point</dt><dd>${esc(it.start)}</dd></div><div><dt>The decision we made</dt><dd>${esc(it.decision)}</dd></div><div><dt>What our team delivered</dt><dd>${esc(it.delivered)}</dd></div></dl>
   <div class="rs-resp"><h4>The reported response</h4>${quals(it.response)}</div>
   <p class="note"><b>Context:</b> ${esc(it.note)}</p>
   <p class="rs-links">${it.links.map(s=>`<a class="link" href="/work/${s}">${esc(bySlug[s].name)}</a>`).join(' ')}</p></article>`};
out('/hot-results',layout({path:'/hot-results',title:'HOT Results',desc:'What happened after the work went out: project results from House of Tangents, each with its channel, reporting period and source beside the number.',
 body:phero(CHAPTERS.results.name,'The work went out. People responded.',CHAPTERS.results.explain,CHAPTERS.results.support,trail([['Home','/'],['Work','/work'],['HOT Results','/hot-results']]))+
 `<section class="band tight"><div class="wrap">
  <ul class="jump" aria-label="Result categories">${RESULT_GROUPS.map(g=>`<li><a class="link" href="#g-${g.id}">${g.title}</a></li>`).join('')}</ul>
  ${RESULT_GROUPS.map(g=>`<section class="rgroup" id="g-${g.id}" aria-labelledby="gh-${g.id}"><div class="rg-head"><h2 id="gh-${g.id}">${g.title}</h2></div><div class="rg-body">${g.items.map(rstory).join('')}</div></section>`).join('')}
  <p class="fine">${NOTES.results} <a class="link" href="/credits">Credits &amp; notes</a></p>
 </div></section>`+invite(),
 jsonld:[crumbs([['Home','/'],['Work','/work'],['HOT Results','/hot-results']])]}));

// ================= HOT MEDIA =================
const withAsset=MEDIA_ITEMS.filter(m=>m.video||m.image),plain=MEDIA_ITEMS.filter(m=>!m.video&&!m.image);
out('/hot-media',layout({path:'/hot-media',title:'HOT Media',desc:'Films, AI visualisation, campaign creative, websites, print and brand applications made by the team at House of Tangents.',
 body:phero(CHAPTERS.media.name,'The idea has to become something.',CHAPTERS.media.explain,CHAPTERS.media.support,trail([['Home','/'],['Work','/work'],['HOT Media','/hot-media']]))+
 `<section class="band tight"><div class="wrap">
  <div class="filterbar" data-filters="media-arch" data-one="item" data-many="items">${chips('type','Filter by output','All media',Object.entries(MEDIA_TYPES))}</div>
  <p class="fine filter-status" role="status" aria-live="polite">Showing ${MEDIA_ITEMS.length} items</p>
  <div id="media-arch">
   <div class="arch" data-group>${withAsset.map(m=>tile(m)).join('')}</div>
   <section class="arch-more" data-group aria-labelledby="more-h"><h2 id="more-h">Also in the archive</h2>
    <ul class="alist">${plain.map(m=>{const p=bySlug[m.project];return `<li class="arow" data-item data-type="${m.type}"><a href="${m.link||'/work/'+p.slug}"><span class="a-type">${esc(MEDIA_TYPES[m.type])}</span><span class="a-name">${esc(p.name)}</span><span class="a-did"><b>${esc(m.title)}.</b> ${esc(m.did)}${m.note?` <em>${esc(m.note)}</em>`:''}</span></a></li>`}).join('')}</ul>
   </section>
  </div>
  <p class="empty" hidden>Nothing matches that filter. <button type="button" class="link-btn" data-reset>Show all media</button></p>
 </div></section>`+invite(),
 jsonld:[crumbs([['Home','/'],['Work','/work'],['HOT Media','/hot-media']])]}));

// ================= BRAND IDENTITIES =================
const idEntry=e=>{const lg=ASSETS.logos[e.logo],c=e.image?creativeBySrc[e.image]:null;
 return `<article class="id-entry${c?' has-img':''}"><div class="id-mark"><p class="meta">${esc(e.kind)}</p><h2 class="id-name"><a href="${e.href}">${lg.src?asset(lg)+`<span class="sr-only">${esc(e.name)}</span>`:esc(e.name)}</a></h2></div>
  ${c?`<figure class="id-app">${pic(c.src,c.alt,{sizes:'(min-width:900px) 24vw,70vw',w:c.w,h:c.h,widths:[420,720,1080]})}<figcaption>The identity in use on a social creative.</figcaption></figure>`:''}
  <dl class="id-dl"><div><dt>Our scope</dt><dd>${esc(e.scope)}</dd></div><div><dt>Applications</dt><dd>${esc(e.apps)}</dd></div>${e.explored?`<div class="id-exp"><dt>Design explorations</dt><dd>${esc(e.explored)}</dd></div>`:''}${e.note?`<div><dt>Note</dt><dd>${esc(e.note)}</dd></div>`:''}</dl>
  <p class="id-link"><a class="link" href="${e.href}">See the work${arrow}</a></p></article>`};
out('/brand-identities',layout({path:'/brand-identities',title:'Brand identities',desc:'Original identity work from House of Tangents, from first logos and guidelines to packaging and menus, with design explorations kept separate from approved work.',
 body:phero(CHAPTERS.identities.name,'The logo is where the identity begins.',CHAPTERS.identities.explain,CHAPTERS.identities.support,trail([['Home','/'],['Work','/work'],['Brand identities','/brand-identities']]))+
 `<section class="band tight"><div class="wrap"><div class="id-grid">${IDENTITIES.map(idEntry).join('')}</div>
  <p class="fine">Scope is listed as recorded. A design credit doesn’t mean packaging was printed or a venue has opened.</p></div></section>`+invite(),
 jsonld:[crumbs([['Home','/'],['Work','/work'],['Brand identities','/brand-identities']])]}));

// ================= CASE STUDIES =================
const HERO_TONES=['blue','peach','white'];
for(const [pi,p] of projects.entries()){
  const m=MEDIA[p.slug],h=hash(p.slug),layoutB=h%2===1,first=p.chapters[0];
  const tr=trail([['Home','/'],['Work','/work'],[p.name,'/work/'+p.slug]]);
  const head=`${tr}<p class="label">${esc(p.tag)}</p><h1>${esc(p.name)}</h1><p class="lead">${esc(p.title)}</p>`;
  // three hero compositions: project image, headline result, or type only
  const r0=p.results[0];
  const hero=m?`<section class="case-hero media"><div class="wrap case-hero-grid"><div>${head}</div><figure class="case-hero-fig">${pic(m.poster,m.alt,{sizes:'(min-width:900px) 40vw,100vw',focus:m.focus,eager:true})}</figure></div></section>`
   :r0?`<section class="case-hero evidence ${HERO_TONES[h%3]}"><div class="wrap case-hero-grid"><div>${head}</div><aside class="hero-ev" aria-label="Headline result"><p class="fig">${esc(r0.value)}</p><p class="rec-metric">${esc(r0.metric)}</p><p class="rec-meta">${[r0.period,r0.basis,'Source: '+r0.source.toLowerCase()].filter(Boolean).map(esc).join(' · ')}</p></aside></div></section>`
   :`<section class="case-hero type ${HERO_TONES[h%3]}"><div class="wrap">${head}</div></section>`;
  const sf=statusFull(p),sfNote=p.status==='Delivered'&&!p.statusText?'':sf;
  const facts=`<dl class="facts"><div><dt>Client</dt><dd>${esc(p.name)}</dd></div><div><dt>Sector</dt><dd>${esc(p.tag)}</dd></div>${p.dates?`<div><dt>Dates</dt><dd>${esc(p.dates)}</dd></div>`:''}${sf?`<div><dt>Status</dt><dd>${status(p)}${sfNote?`<small>${esc(sfNote)}</small>`:''}</dd></div>`:''}${p.partOf?`<div><dt>Part of</dt><dd><a class="link" href="/work/${p.partOf}">${esc(bySlug[p.partOf].name)}</a></dd></div>`:''}</dl>`;
  const vids=p.videos.map(v=>videoBlock(v.id)).join('');
  const gallery=m&&m.gallery?`<div class="gal gal-${Math.min(m.gallery.length,4)}">${m.gallery.map(g=>`<figure>${pic(g.src,g.alt,{sizes:'(min-width:900px) 25vw,50vw'})}</figure>`).join('')}</div>`:'';
  const creatives=m&&m.creatives&&m.creatives.length?`<div class="creatives"><h3 class="sub">Social creatives</h3><ul class="cgrid ${m.creatives.length===1?'one':''}">${m.creatives.map(g=>`<li><figure>${pic(g.src,g.alt,{sizes:'(min-width:900px) 28vw,(min-width:560px) 45vw,100vw',w:g.w,h:g.h,widths:[420,720,1080]})}<figcaption>${esc(g.caption)}</figcaption></figure></li>`).join('')}</ul></div>`:'';
  const S={
   intro:`<section class="blk intro"><h2 class="label">Introduction</h2><div class="prose-lead">${paras(p.overview)}</div></section>`,
   angle:`<section class="blk angle"><div><h2 class="label">The challenge</h2><p>${esc(p.challenge)}</p></div><div><h2 class="label">Our approach</h2><p>${esc(p.approach)}</p></div></section>`,
   story:p.story.length?`<section class="blk"><h2 class="label">How it came together</h2><div>${p.story.map(ch=>`<section class="chapter"><h3>${esc(ch.h)}</h3><div>${paras(ch.p)}</div></section>`).join('')}</div></section>`:'',
   parts:p.parts.length?`<section class="blk"><h2 class="label">${esc(p.partsTitle)}</h2><div class="part-grid">${p.parts.map(x=>`<article class="part" id="${x.id}"><p class="meta">${esc(x.kind)}</p><h3>${esc(x.name)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div></section>`:'',
   scope:`<section class="blk"><h2 class="label">Delivered scope</h2><ul class="deliver">${p.deliverables.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>`,
   media:vids||gallery||creatives?`<section class="blk visuals"><h2 class="label">Project media</h2>${vids?`<div class="vgrid">${vids}</div>`:''}${gallery}${creatives}</section>`:'',
   outcome:`<section class="blk" id="outcome"><h2 class="label">Outcome and status</h2><div>${p.results.length?records(p.results):''}${quals(p.qualitative)}${sf?`<p class="status-line"><b>Status:</b> ${esc(sf)}</p>`:''}${p.context.map(c=>`<p class="note">${esc(c)}</p>`).join('')}${p.testimonial?tq(p.testimonial):''}</div></section>`,
   credits:`<section class="blk"><h2 class="label">Credits and notes</h2><div>${paras(p.credits)}<p>Collective work by the House of Tangents team and specialist collaborators, according to the engagement’s scope.</p><p class="fine">Results come from team records, supplied case studies and client-reported feedback. Historical results are not guarantees of future performance. <a class="link" href="/credits">Credits &amp; notes</a></p></div></section>`
  };
  // the order follows the kind of project: media-led work shows the work first, identity-led work shows the identities first
  const order=first==='media'?['intro','media','angle','story','parts','scope','outcome','credits']:first==='identities'?['intro','parts','angle','story','scope','media','outcome','credits']:['intro','angle','story','parts','scope','media','outcome','credits'];
  const main=order.map(k=>S[k]).join('\n');
  const next=projects[(pi+1)%projects.length];
  const body=`${hero}<section class="band tight case-body ${layoutB?'case-b':'case-a'}"><div class="wrap">${layoutB?`<div class="case-grid"><aside class="case-side" aria-label="Project facts">${facts}</aside><div class="case-main">${main}</div></div>`:`${facts}<div class="case-main">${main}</div>`}</div></section>
  <section class="band white"><div class="wrap"><h2>Related work</h2><ol class="rows">${p.related.map((r,i)=>row(bySlug[r],i+1)).join('')}</ol></div></section>
  <section class="band indigo next"><div class="wrap"><p class="label">Next project</p><a class="next-link" href="/work/${next.slug}">${esc(next.name)}${arrow}</a><div class="actions"><a class="btn peach" href="/contact">Start a project</a><a class="btn ghost-l" href="/work">All work</a></div></div></section>`;
  out('/work/'+p.slug,layout({path:'/work/'+p.slug,title:p.name+' case study',desc:`${p.name}: ${p.challenge}`.slice(0,300),body,preload:m?`<link rel="preload" as="image" href="/assets/media/${m.poster}-720.webp" type="image/webp" fetchpriority="high">\n`:'',jsonld:[crumbs([['Home','/'],['Work','/work'],[p.name,'/work/'+p.slug]])]}));
}

// ================= SERVICES =================
const exLink=e=>typeof e==='string'?`<a class="link" href="/work/${e}">${esc(bySlug[e].name)}</a>`:`<a class="link" href="/work/${e.slug}#${e.hash}">${esc(e.label)}</a>`;
out('/services',layout({path:'/services',title:'Services',desc:'Brand strategy and identity, content and production, marketing and campaigns, and websites and digital journeys from House of Tangents, with the projects behind each.',
 body:phero('Services','We work from the first idea to the final file.','We can start with what your business has today. We help decide what it needs to communicate, then build the work and the next step around that.')+
 `<section class="band tight"><div class="wrap svc-layout">
  <nav class="svc-index" aria-label="Services on this page">${SERVICES.map((s,i)=>`<a href="#${s.id}"><span aria-hidden="true">0${i+1}</span>${s.title}</a>`).join('')}</nav>
  <details class="svc-jump"><summary>Jump to a service</summary>${SERVICES.map(s=>`<a href="#${s.id}">${s.title}</a>`).join('')}</details>
  <div class="svc-main">${SERVICES.map((s,i)=>`<article class="svc-sec" id="${s.id}"><p class="svc-no" aria-hidden="true">0${i+1}</p><h2>${s.title}</h2><p class="svc-one">${s.one}</p><p>${s.body}</p>
   <div class="svc-cols"><div><h3 class="sub">When you need it</h3><p>${s.when}</p><h3 class="sub">Project examples</h3><p class="svc-ex">${s.examples.map(exLink).join(' ')}</p></div>
   <div><h3 class="sub">What we handle</h3><ul class="scope">${s.scope.map(x=>`<li>${x}</li>`).join('')}</ul>${s.scopeNote?`<p class="fine">${s.scopeNote}</p>`:''}</div></div>
   <div class="actions"><a class="btn ghost" href="/contact?service=${s.id}">${s.cta}</a></div></article>`).join('')}
   <p class="fine">Scope varies by engagement. Not every project includes every deliverable, and we don’t promise search rankings or advertising results in advance.</p></div>
 </div></section>`+invite(),
 jsonld:[crumbs([['Home','/'],['Services','/services']])]}));

// ================= ABOUT =================
const tg=ASSETS.teamGroup;
out('/about',layout({path:'/about',title:'About',desc:'A small team with a wider view of the work. Meet the four people at House of Tangents and see how a brief moves from understanding to delivery.',
 body:phero('About','A small team with a wider view of the work.','House of Tangents brings together people who think about the business and stay involved in making the work. We research and write, build and shoot, then work through the details that help an idea make sense outside the meeting.')+
 `${tg.src?`<section class="about-photo"><div class="wrap">${asset(tg,{eager:true})}</div></section>`:''}
 <section class="band white"><div class="wrap two"><div><p class="label">How the House started</p><h2>A business problem first. Then the communication.</h2></div><div><p class="founder">Farha Fatima founded House of Tangents with experience across technology consulting, sales and marketing. That background shapes how we connect a business problem with communication people can understand. Our wider experience includes client work and product engagements, as well as earlier agency roles.</p></div></div></section>
 <section class="band" id="team" aria-labelledby="team-h"><div class="wrap"><p class="label">The team</p><h2 id="team-h">Four people. Shared responsibility for the work.</h2>
  <div class="profiles">${TEAM.map(t=>{const ph=ASSETS.teamPortraits[t.id];return `<article class="profile">${ph.src?`<div class="portrait">${asset(ph)}</div>`:''}<div><h3>${t.name}</h3><p class="role">${esc(t.role)}</p><p>${t.bio}</p></div></article>`}).join('')}</div>
  <p class="fine">${NOTES.collaborators}</p></div></section>
 <section class="band white" aria-labelledby="proc-h"><div class="wrap"><p class="label">How we work</p><h2 id="proc-h">Four stages, in this order.</h2>
  <ol class="process">${PROCESS.map(s=>`<li><h3>${s.title}</h3><p>${s.text}</p></li>`).join('')}</ol>
  <p class="fine">${NOTES.collective}</p></div></section>`+invite(),
 jsonld:[crumbs([['Home','/'],['About','/about']])]}));

// ================= TANGENT MEDIA =================
const sdl=(rows)=>`<dl class="sdl">${rows.map(([dt,dd,cls])=>`<div${cls?` class="${cls}"`:''}><dt>${dt}</dt><dd>${dd}</dd></div>`).join('')}</dl>`;
const story=(s,i)=>{const p=bySlug[s.slug];
 return `<article class="story" id="${s.id}"><div class="story-head"><p class="story-no" aria-hidden="true">${String(i+1).padStart(2,'0')}</p><p class="meta">${esc(p.name)}<span class="sep" aria-hidden="true">/</span>Delivered story</p><h2>${esc(s.title)}</h2>${s.videos?`<div class="story-media${s.videos.length>1?' pair':''}">${s.videos.map(videoBlock).join('')}</div>`:''}</div>
  <div>${sdl([['The brief',esc(s.brief)],['What was getting in the way',esc(s.block)],['The turn in the thinking',esc(s.turn),'is-turn'],['How we made it',esc(s.made)],['The finished work',esc(s.result)+(s.label?`<span class="s-label">${esc(s.label)}</span>`:'')]])}
  <p><a class="link" href="/work/${p.slug}">Read the ${esc(p.name)} case study${arrow}</a></p></div></article>`};
out('/tangent-media',layout({path:'/tangent-media',title:'Tangent Media',desc:'Where the brief took a turn: the thinking behind delivered House of Tangents work, with proposed formats shown separately and labelled as proposals.',
 body:phero(CHAPTERS.tangent.name,'Here’s where the brief took a turn.',CHAPTERS.tangent.explain,CHAPTERS.tangent.support)+whyBlock('h2')+
 `<section class="band tight"><div class="wrap"><p class="label">Delivered stories</p>${STORIES.map(story).join('')}</div></section>
 <section class="band white" id="ideas" aria-labelledby="ideas-h"><div class="wrap"><p class="label">Proposed formats</p><h2 id="ideas-h">Ideas we’re developing</h2><p class="lead">Nothing in this section has been produced, published or commissioned by a client. These are formats we’re proposing, based on decisions from the delivered work above.</p>
  <div class="ideas">${IDEAS.map(d=>`<article class="idea"><p class="prop-flag">Proposed format</p><h3>${esc(d.title)}</h3><p>${esc(d.what)}</p>${sdl([['Required footage',esc(d.footage)],['Production approach',esc(d.approach)],['Intended placement',esc(d.placement)]])}</article>`).join('')}</div></div></section>`+invite(),
 jsonld:[crumbs([['Home','/'],['Tangent Media','/tangent-media']])]}));

// ================= CONTACT =================
const field=(id,label,{req=false,type='text',ac='',area=false}={})=>`<div class="field"><label for="cf-${id}">${label}${req?' <span aria-hidden="true">*</span>':''}</label>${area?`<textarea id="cf-${id}" name="${id}" rows="5"${req?' required aria-required="true"':''} aria-describedby="cf-${id}-e"></textarea>`:`<input id="cf-${id}" name="${id}" type="${type}"${ac?` autocomplete="${ac}"`:''}${req?' required aria-required="true"':''} aria-describedby="cf-${id}-e">`}<span class="err" id="cf-${id}-e"></span></div>`;
const form=`<form class="form" id="cf" method="post" action="/api/contact" novalidate>
 <div class="err-summary" role="alert" tabindex="-1" hidden></div>
 ${field('name','Name',{req:true,ac:'name'})}${field('email','Work email',{req:true,type:'email',ac:'email'})}${field('company','Company or project',{ac:'organization'})}
 <fieldset class="checks"><legend>What do you need help with?</legend>${SERVICES.map(s=>`<label class="check"><input type="checkbox" name="services" value="${s.title}" data-service="${s.id}"><span>${s.title}</span></label>`).join('')}<label class="check"><input type="checkbox" name="services" value="I’m still working that out"><span>I’m still working that out</span></label></fieldset>
 ${field('brief','Brief description',{req:true,area:true})}${field('timeline','Timeline (optional)')}${field('budget','Budget range (optional)')}
 <div class="hp" aria-hidden="true" inert><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>
 <button class="btn submit" type="submit">Send your brief</button>
 <p class="form-status" role="status" aria-live="polite"></p>
 <p class="fine">Prefer email or a call? <a href="mailto:${SITE.email}">${SITE.email}</a> · <a href="${SITE.phoneHref}">${SITE.phone}</a></p>
</form>`;
out('/contact',layout({path:'/contact',title:'Contact',desc:'Start a project with House of Tangents. Tell us what you’re working on, what needs to change and when you need to move.',
 body:`<section class="band contact-page"><div class="wrap contact-grid"><div><p class="label">Contact</p><h1>Start with the business. We’ll help shape the brief.</h1><p class="lead">Tell us what you’re working on, what needs to change and when you need to move.</p><p class="direct"><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p><p>Farha Fatima, Founder, Brand &amp; Creative Director.</p></div><div class="form-panel">${form}</div></div></section>`,
 jsonld:[org,crumbs([['Home','/'],['Contact','/contact']])]}));

// ================= CREDITS =================
out('/credits',layout({path:'/credits',title:'Credits and notes',desc:'How House of Tangents presents its experience and results: sources, reporting context, project statuses and the Gangs of Wasseypur Part II reference.',
 body:phero('Credits &amp; notes','How to read the work on this site.')+
 `<section class="band tight"><div class="wrap narrow prose">
  <h2>Experience and scope</h2><p>${NOTES.collective}</p>
  <h2>Results</h2><p>${NOTES.results}</p><p>Each figure sits beside its project, with its period, its paid or organic basis and its source where those are recorded. Views, followers, enquiries, address taps and profile interactions are reported as what they are. They aren’t presented as sales or confirmed visits.</p>
  <h2>Project status</h2><p>Statuses are a snapshot from the ${SITE.snapshot} project record. Work described as ongoing or pending was ongoing or pending in that record, and may have moved on since.</p>
  <h2 id="film">The film reference</h2><p>The tangent and perpendicular reference comes from a scene in <i>Gangs of Wasseypur Part II</i>, spoken by the character Guddu. The dialogue shown on this site is a brief excerpt from the published dubbing script, pages 42 to 43. What we’ve made of it is our own interpretation, not the film’s message.</p><p>House of Tangents has no association with the film, its makers or its rights holders, and claims no endorsement or ownership of their material. This site uses no film footage, stills, posters or soundtrack.</p>
  <h2>Sources</h2><p>Earlier project records appear on the Brand Thinker website. Capitol Hill material appears in the earlier project portfolio and the digital-presence case study. The earlier Black and ZOI cases provide additional project context.</p>
  <h2>Earlier product conversations</h2><p>DIM12/DIM-12 and RadiologyGPT appear in earlier product and ecosystem discussions, alongside Pi Social, Pi Learn, Pi Path and Pi Enroll. They were discussions, not delivered client case studies.</p>
 </div></section>`+invite(),
 jsonld:[crumbs([['Home','/'],['Credits','/credits']])]}));

// ================= 404 =================
fs.writeFileSync(path.join(ROOT,'404.html'),layout({path:'/404',title:'Page not found',desc:'This page could not be found.',body:phero('404','This page isn’t here.','Try the homepage or browse the work.')+`<section class="band tight"><div class="wrap actions"><a class="btn primary" href="/">Back to the homepage</a><a class="btn ghost" href="/work">Browse work</a></div></section>`}));

// ================= sitemap / robots =================
const urls=['/','/work','/hot-results','/hot-media','/brand-identities','/services','/about','/tangent-media','/contact','/credits',...projects.map(p=>'/work/'+p.slug)];
fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${SITE.url}${u==='/'?'/':u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log('built',urls.length,'routes');
