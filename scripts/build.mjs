// Static generator: content/*.json + content/site.mjs -> HTML routes at the repo root.
// Run: node scripts/build.mjs
import fs from 'node:fs';import path from 'node:path';
import {SITE,STATUSES,CATEGORIES,TEAM,SERVICES,VIDEO_INFO} from '../content/site.mjs';
const ROOT=path.resolve(import.meta.dirname,'..');
const projects=JSON.parse(fs.readFileSync(path.join(ROOT,'content/projects.json'),'utf8'));
const identityWork=JSON.parse(fs.readFileSync(path.join(ROOT,'content/identity-work.json'),'utf8'));
const bySlug=Object.fromEntries(projects.map(p=>[p.slug,p]));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ---- validation ----
const REQUIRED=['slug','name','tag','status','period','categories','services','challenge','outcome','overview','chapters','related'];
for(const p of projects){
  for(const k of REQUIRED)if(p[k]===undefined||p[k]===null||p[k]==='' && k!=='period')throw new Error(`${p.slug}: missing ${k}`);
  if(!STATUSES.includes(p.status))throw new Error(`${p.slug}: bad status ${p.status}`);
  if(p.status==='Proposed')throw new Error(`${p.slug}: proposals belong on /tangent-media, not in projects`);
  for(const c of p.categories)if(!CATEGORIES[c])throw new Error(`${p.slug}: bad category ${c}`);
  for(const r of p.related)if(!bySlug[r])throw new Error(`${p.slug}: bad related ${r}`);
  for(const v of p.videos)if(!VIDEO_INFO[v.id])throw new Error(`${p.slug}: video ${v.id} has no VIDEO_INFO`);
}
if(projects.filter(p=>p.featured).length>6)throw new Error('more than six featured projects');

// ---- helpers ----
const statusClass=s=>'st-'+s.split(' ')[0].toLowerCase().replace(/[^a-z]/g,'');
const badge=s=>`<span class="badge ${statusClass(s)}">${esc(s)}</span>`;
const paras=a=>a.map(t=>`<p>${esc(t)}</p>`).join('');
const geo=i=>{const v=i%4;const parts=[
 '<circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="98" x2="112" y2="98" stroke="currentColor" stroke-width="1.5"/><circle cx="60" cy="98" r="4" fill="#e2502f"/>',
 '<line x1="14" y1="100" x2="106" y2="100" stroke="currentColor" stroke-width="1.5"/><line x1="60" y1="100" x2="60" y2="22" stroke="#e2502f" stroke-width="1.8"/><path d="M60 86h-12v14" fill="none" stroke="currentColor" stroke-width="1.5"/>',
 '<circle cx="46" cy="60" r="30" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="76" y1="14" x2="76" y2="106" stroke="currentColor" stroke-width="1.5"/><circle cx="76" cy="60" r="4" fill="#e2502f"/>',
 '<path d="M12 100 Q60 -10 108 100" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="26" y1="60" x2="94" y2="60" stroke="#e2502f" stroke-width="1.8"/>'][v];
 return `<svg class="geo-tile" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${parts}</svg>`};
const card=(p,i,extra='')=>`<article class="card" data-cats="${p.categories.join(' ')}" data-status="${esc(p.status)}">
  <div class="card-art">${geo(i)}<span class="card-cat">${esc(p.tag)}</span></div>
  <div class="card-body">
    <p class="card-meta">${badge(p.status)}</p>
    <h3><a href="/work/${p.slug}" class="stretch">${esc(p.name)}</a></h3>
    <p class="card-challenge">${esc(p.challenge)}</p>
    <p class="card-outcome"><b>Evidence:</b> ${esc(p.outcome)}</p>
    <ul class="tags">${p.services.slice(0,4).map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
    <span class="more" aria-hidden="true">View case study →</span>
  </div></article>`;
const videoBtn=v=>{const info=VIDEO_INFO[v.id];return `<article class="vcard"><button class="vbtn" type="button" data-video="${v.id}" data-title="${esc(info.title)}" data-summary="${esc(info.summary)}"><span class="vplay" aria-hidden="true"></span><span class="vlabel">Play film</span></button><h4>${esc(info.title)}</h4><p>${esc(info.summary)}</p><a class="fine" href="https://drive.google.com/file/d/${v.id}/view" target="_blank" rel="noopener">Open original file</a></article>`};
const ctaBlock=(h='Start a project',p='Let’s work out what your brief needs, then get it made.')=>`<section class="band dark"><div class="wrap"><div class="rule"></div><h2>${h}</h2><p class="lead serif">${p}</p><div class="actions"><a class="btn primary" href="/contact">Start a project</a><a class="btn ghost" href="mailto:${SITE.email}">${SITE.email}</a></div></div></section>`;

const NAV=[['Work','/work'],['Services','/services'],['About','/about'],['Tangent Media','/tangent-media'],['Contact','/contact']];
function layout({path:p,title,desc,body,jsonld=[],og}){
  const url=SITE.url+(p==='/'?'/':p);
  const t=title.includes('House of Tangents')?title:`${title} | House of Tangents`;
  const nav=NAV.map(([l,h])=>`<a href="${h}"${p===h||(h!=='/'&&p.startsWith(h+'/'))?' aria-current="page"':''}>${l}</a>`).join('');
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
<meta name="theme-color" content="#1f1f1d">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${jsonld.map(j=>`<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="bar">
 <a class="brand" href="/" aria-label="House of Tangents, home">HOUSE OF TANGENTS</a>
 <nav class="nav" aria-label="Primary">${nav}</nav>
 <a class="btn primary sm head-cta" href="/contact">Start a project</a>
 <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu"><span>Menu</span></button>
</div></header>
<div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
 <button class="menu-close" type="button">Close</button>
 <nav aria-label="Mobile">${NAV.map(([l,h])=>`<a href="${h}">${l}</a>`).join('')}<a class="btn primary" href="/contact">Start a project</a></nav>
</div>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer"><div class="wrap foot">
 <div><p class="brand">HOUSE OF TANGENTS</p><p class="serif">${SITE.tagline}</p></div>
 <nav aria-label="Footer"><a href="/work">Work</a><a href="/services">Services</a><a href="/about">About</a><a href="/tangent-media">Tangent Media</a><a href="/contact">Contact</a><a href="/credits">Credits &amp; notes</a></nav>
 <p><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p>
</div></footer>
<dialog class="vdialog" id="vdialog" aria-labelledby="vtitle"><div class="vhead"><h2 id="vtitle"></h2><button type="button" class="vclose">Close</button></div><div class="vframe" id="vframe"></div><p id="vsummary" class="vsum"></p><p class="fine">Interim playback from the client’s shared Google Drive folder. Videos are loaded only after you press play.</p></dialog>
<script src="/site.js" defer></script>
</body></html>`;
}
const crumbs=items=>({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map(([n,u],i)=>({'@type':'ListItem',position:i+1,name:n,item:SITE.url+u}))});
const org={'@context':'https://schema.org','@type':'ProfessionalService',name:SITE.name,url:SITE.url,email:SITE.email,telephone:SITE.phone,description:'Branding, strategy, creative and marketing. Tangent thinking. Perpendicular commitment.',slogan:SITE.tagline};
const out=(p,html)=>{const f=p==='/'?'index.html':path.join(p.slice(1),'index.html');const fp=path.join(ROOT,f);fs.mkdirSync(path.dirname(fp),{recursive:true});fs.writeFileSync(fp,html)};
const hero=(eyebrow,h1,lead)=>`<section class="page-hero dark"><div class="wrap"><p class="eyebrow">${eyebrow}</p><h1>${h1}</h1>${lead?`<p class="lead serif">${lead}</p>`:''}</div></section>`;

// ================= HOME =================
const featured=projects.filter(p=>p.featured).sort((a,b)=>a.featured-b.featured);
const home=`
<section class="hero dark"><div class="wrap hero-grid">
 <div>
  <div class="rule"></div>
  <h1>Good ideas rarely move in straight lines.</h1>
  <p class="lead serif">We find a different angle, then do the work to make it happen.</p>
  <p class="offer">Branding / Strategy / Creative / Marketing</p>
  <div class="actions"><a class="btn primary" href="/contact">Start a project</a><a class="btn ghost" href="#featured">View selected work</a></div>
 </div>
 <svg class="hero-geo" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g class="spin"><circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="200" cy="340" r="7" fill="#e2502f"/></g><line x1="20" y1="340" x2="380" y2="340" stroke="currentColor" stroke-width="1.5"/><line x1="200" y1="340" x2="200" y2="200" stroke="#e2502f" stroke-width="1.5" stroke-dasharray="4 7"/><path d="M200 322h-18v18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
</div></section>

<section class="band light" id="origin"><div class="wrap narrow">
 <p class="eyebrow red">Why “Tangents”</p>
 <h2>A line that touches a circle once, then moves on.</h2>
 <p>The name comes from a scene in <i>Gangs of Wasseypur Part II</i>, where Guddu explains the difference between a perpendicular and a tangent. It stayed with us because it made the angle matter. We’ve given that geometry a different, nonviolent job.</p>
 <p class="platform serif">Tangent thinking. Perpendicular commitment.</p>
 <p>The first means finding an unexpected but relevant way into a familiar brief. The second means staying with the work it takes to produce it. <a href="/about#name">Read the full story</a>.</p>
</div></section>

<section class="band alt" aria-labelledby="proof-h"><div class="wrap">
 <p class="eyebrow red">Evidence</p>
 <h2 id="proof-h">Results, with the context they belong to.</h2>
 <div class="proof">
  <figure><b>800%+</b><figcaption>organic account reach growth in the first two months. <a href="/work/capitol-hill">Capitol Hill</a></figcaption></figure>
  <figure><b>700K–800K</b><figcaption>organic views on selected reels. Paid lead campaigns were separate. <a href="/work/majestic-india">Majestic India</a></figcaption></figure>
  <figure><b>2 videos</b><figcaption>above one million views on a personal profile, with no boosted posts or ads. <a href="/work/shambhavi">Shambhavi Shiva</a></figcaption></figure>
  <figure><b>832</b><figcaption>followers in 20 days without paid follower acquisition. <a href="/work/santhal-strikers">JT20 / Santhal Strikers</a></figcaption></figure>
 </div>
 <p class="fine">Figures come from the team’s project records and supplied case studies, and views or followers are not sales. Reporting periods and qualifications are stated on each case study. As of ${SITE.asOf}.</p>
</div></section>

<section class="band light" id="featured" aria-labelledby="feat-h"><div class="wrap">
 <p class="eyebrow red">Selected work</p>
 <h2 id="feat-h">Six projects, six different angles.</h2>
 <div class="grid">${featured.map((p,i)=>card(p,i)).join('')}</div>
 <p class="center"><a class="btn dark-btn" href="/work">Browse all work</a></p>
</div></section>

<section class="band dark" aria-labelledby="serv-h"><div class="wrap">
 <p class="eyebrow">Services</p>
 <h2 id="serv-h">From the first idea to the final file.</h2>
 <div class="services">${SERVICES.map((s,i)=>`<article><span class="num">0${i+1}</span><h3>${s.title}</h3><p>${s.short}</p></article>`).join('')}</div>
 <p><a class="textlink" href="/services">All services →</a></p>
</div></section>

<section class="band light" aria-labelledby="method-h"><div class="wrap">
 <p class="eyebrow red">The Tangent Method</p>
 <h2 id="method-h">We look for the angle, then work through the details.</h2>
 <ol class="steps">
  <li><h3>Find the angle</h3><p>We look at what the business needs, who it wants to reach and what its audience is used to seeing. Then we look for a useful detail that gives the brief a different way in.</p></li>
  <li><h3>Make the work</h3><p>We plan, write, design, shoot, build, edit and publish, including the less visible details that decide whether an idea makes sense when people meet it.</p></li>
  <li><h3>Review the response</h3><p>We look at the response available to us and let it shape the next version. For FluffyPet, that meant changing the product experience itself.</p></li>
 </ol>
</div></section>

<section class="band alt" aria-labelledby="team-h"><div class="wrap">
 <p class="eyebrow red">The team</p>
 <h2 id="team-h">Four people, sharing the work.</h2>
 <div class="team">${TEAM.map(t=>`<article><h3>${t.name}</h3><p class="role">${t.role}</p><p>${t.short}</p></article>`).join('')}</div>
 <p><a class="textlink" href="/about#team">Meet the team →</a></p>
 <figure class="quote"><blockquote class="serif">“Guests appreciate the work, and many even ask who handles our marketing.”</blockquote><figcaption>Narendra Singh, General Manager, Capitol Hill <span class="fine">Excerpt from a testimonial published on our earlier agency website.</span></figcaption></figure>
</div></section>

<section class="band dark" id="contact-home" aria-labelledby="c-h"><div class="wrap contact-grid">
 <div>
  <div class="rule"></div>
  <h2 id="c-h">We can look at your brief from another angle.</h2>
  <p class="lead serif">Let’s work out what it needs, then get it made.</p>
  <p class="direct"><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p>
 </div>
 __FORM__
</div></section>`;

const formHTML=(id)=>`<form class="form" id="${id}" method="post" action="/api/contact" novalidate>
 <div class="err-summary" role="alert" tabindex="-1" hidden></div>
 <div class="field"><label for="${id}-name">Name <span aria-hidden="true">*</span></label><input id="${id}-name" name="name" autocomplete="name" required><span class="err" id="${id}-name-e"></span></div>
 <div class="field"><label for="${id}-company">Company or brand</label><input id="${id}-company" name="company" autocomplete="organization"></div>
 <div class="field"><label for="${id}-contact">Email or phone <span aria-hidden="true">*</span></label><input id="${id}-contact" name="contact" autocomplete="email" required aria-describedby="${id}-contact-e"><span class="err" id="${id}-contact-e"></span></div>
 <div class="field"><label for="${id}-need">What do you need help with? <span aria-hidden="true">*</span></label><textarea id="${id}-need" name="need" rows="4" required></textarea><span class="err" id="${id}-need-e"></span></div>
 <div class="field"><label for="${id}-budget">Approximate budget (optional)</label><input id="${id}-budget" name="budget"></div>
 <div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>
 <button class="btn primary" type="submit">Send enquiry</button>
 <p class="form-status" role="status" aria-live="polite"></p>
 <p class="fine">If sending doesn’t work, email <a href="mailto:${SITE.email}">${SITE.email}</a> or call <a href="${SITE.phoneHref}">${SITE.phone}</a>.</p>
</form>`;
const homeHtml=home.replace('__FORM__',formHTML('hf'));
out('/',layout({path:'/',title:'House of Tangents — Branding, Strategy, Creative, Marketing',desc:'Good ideas rarely move in straight lines. House of Tangents finds a different angle, then does the work to make it happen across branding, strategy, creative and marketing.',body:homeHtml,jsonld:[org]}));

// ================= WORK INDEX =================
const filterBtns=`<div class="filters" role="group" aria-label="Filter projects by type"><button type="button" class="chip" data-filter="all" aria-pressed="true">All</button>${Object.entries(CATEGORIES).map(([k,v])=>`<button type="button" class="chip" data-filter="${k}" aria-pressed="false">${v}</button>`).join('')}</div>`;
out('/work',layout({path:'/work',title:'Work',desc:'Selected House of Tangents work across hospitality, personal branding, sport, product launches and brand identities, with results shown alongside their reporting context.',
 body:hero('Work','Work, with the evidence beside it.','Delivered, ongoing and unpublished projects from 2023 to 2026. Each case study keeps its numbers next to the project, channel and period they belong to.')+
 `<section class="band light"><div class="wrap">${filterBtns}<p class="fine filter-status" role="status" aria-live="polite"></p><div class="grid" id="work-grid">${projects.map((p,i)=>card(p,i)).join('')}</div></div></section>`+ctaBlock(),
 jsonld:[crumbs([['Home','/'],['Work','/work']])]}));

// ================= CASE STUDIES =================
for(const p of projects){
  const results=[...(p.metrics||[])];
  const chap=p.chapters.map(ch=>`<section class="chapter"><h3 class="serif red">${esc(ch.h)}</h3><div>${paras(ch.p)}${ch.stats&&ch.stats.length?`<div class="metrics" role="list" aria-label="Results">${ch.stats.map(s=>`<div class="metric" role="listitem"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div><p class="metric-ctx fine">${esc(p.name)}${p.period?' · '+esc(p.period.split('·')[0].trim()):''}</p>`:''}${ch.note?`<p class="note"><b>Note:</b> ${esc(ch.note)}</p>`:''}</div></section>`).join('');
  const rel=p.related.map(r=>bySlug[r]);
  const statusNote={'Unpublished / under review':'This work remained unpublished and under management review in November 2026.','Status to confirm':'The delivery status of this engagement is being confirmed with the client.','Proposed':''}[p.status]||'';
  const body=`<section class="page-hero dark case-hero"><div class="wrap">
   <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/work">Work</a> / <span aria-current="page">${esc(p.name)}</span></nav>
   <p class="eyebrow">${esc(p.tag)}</p><h1>${esc(p.name)}</h1><p class="lead serif">${esc(p.title)}</p>
   <p class="meta">${badge(p.status)} <span>${esc(p.period||'Timeframe to confirm')}</span></p>
  </div></section>
  <section class="band light"><div class="wrap case">
   <aside class="case-side" aria-label="Project facts"><h2 class="mini">Scope</h2><ul class="tags">${p.services.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><h2 class="mini">Status</h2><p>${badge(p.status)}</p>${statusNote?`<p class="fine">${esc(statusNote)}</p>`:''}<h2 class="mini">Credits</h2><p class="fine">Collective work by the House of Tangents team and specialist collaborators, according to the engagement’s scope.</p></aside>
   <div class="case-main">
    <section><h2>Overview</h2>${paras(p.overview)}</section>
    <section class="two-up"><div><h2>The challenge</h2><p>${esc(p.challenge)}</p></div>${p.tangent?`<div><h2>The tangent</h2><p>${esc(p.tangent)}</p></div>`:''}</section>
    <section><h2>Execution and results</h2>${chap}${results.length?`<div class="metrics" role="list" aria-label="Results">${results.map(s=>`<div class="metric" role="listitem"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div><p class="metric-ctx fine">${esc(p.name)}${p.period?' · '+esc(p.period.split('·')[0].trim()):''}</p>`:''}</section>
    ${p.videos.length?`<section><h2>Selected media</h2><div class="vgrid">${p.videos.map(videoBtn).join('')}</div></section>`:''}
    <section class="method"><h2>Methodology and qualifications</h2><p>Figures come from the team’s project records and supplied case studies. Reporting periods are stated where that information is available, and numbers such as views, followers, enquiries or address taps are not presented as sales or confirmed visits. Status as of ${SITE.asOf}. <a href="/credits">Full reporting notes</a>.</p></section>
   </div>
  </div></section>
  <section class="band alt"><div class="wrap"><h2>Related work</h2><div class="grid">${rel.map((r,i)=>card(r,i+1)).join('')}</div></div></section>`+ctaBlock();
  out('/work/'+p.slug,layout({path:'/work/'+p.slug,title:p.name+' case study',desc:`${p.name}: ${p.challenge} ${p.outcome}.`.slice(0,300),body,jsonld:[crumbs([['Home','/'],['Work','/work'],[p.name,'/work/'+p.slug]])]}));
}

// ================= SERVICES =================
out('/services',layout({path:'/services',title:'Services',desc:'Brand strategy and identity, content and production, marketing and campaigns, and websites and digital journeys from House of Tangents.',
 body:hero('Services','We work from the first idea to the final file.','We can start with what your business has today: a new account, an unfinished app, a property still on a plan, or an established business whose online presence needs to catch up.')+
 `<section class="band light"><div class="wrap">${SERVICES.map((s,i)=>`<article class="svc" id="${s.id}"><div><span class="num">0${i+1}</span><h2>${s.title}</h2></div><div>${paras(s.long)}<p class="proof-links"><b>See it in</b> ${s.proof.map(k=>`<a href="/work/${k}">${esc(bySlug[k].name)}</a>`).join(', ')}</p></div></article>`).join('')}</div></section>
 <section class="band alt"><div class="wrap narrow"><h2>Identity work beyond the logo</h2>${paras(identityWork)}</div></section>`+ctaBlock(),
 jsonld:[crumbs([['Home','/'],['Services','/services']])]}));

// ================= ABOUT =================
out('/about',layout({path:'/about',title:'About',desc:'The story behind the name House of Tangents, the four-person core team, and how we choose an approach by understanding the brief.',
 body:hero('About','Our name has a story behind it.','Tangent thinking. Perpendicular commitment.')+
 `<section class="band light" id="name"><div class="wrap narrow">
  <h2>Wasseypur made geometry hard to forget.</h2>
  <blockquote class="hindi" lang="hi">“अगर जान से मरा, तो ब्लेड परपेंडीकुलर गया था…और अगर सिर्फ चमड़ी कटा, तो समझो टेंजेण्ट था.”</blockquote>
  <p class="cite">Guddu, <i>Gangs of Wasseypur Part II</i></p>
  <p>Guddu’s dialogue made the angle matter. We’ve given that thought a different job at House of Tangents. Our creative platform is “Tangent thinking. Perpendicular commitment.” We look for an approach people haven’t seen coming, then stay with the work it takes to produce it.</p>
  <p class="fine">The dialogue is a brief excerpt from the published <i>Gangs of Wasseypur Part II</i> dubbing script, pp. 42–43. Our agency interpretation is our own. This website uses no film footage, stills or other film assets and does not claim or imply any endorsement, affiliation or collaboration with the film or its rights holders.</p>
 </div></section>
 <section class="band alt"><div class="wrap two"><div><h2>We think in tangents.</h2><p>For Navdurga, we imagined a visitor’s journey before there was a finished business park to film. For Santhal Strikers, a conversation with a player became a film about the dream that brought him to cricket.</p></div><div><h2>We commit to the execution.</h2><p>An idea still needs someone to plan the shoot and write the script. It needs prompt writing, footage selection, editing, design and a publishing plan. We work through those details, including the less visible ones.</p></div></div></section>
 <section class="band light" id="team"><div class="wrap"><p class="eyebrow red">The team</p><h2>We share the work across a four-person team.</h2><div class="team full">${TEAM.map(t=>`<article><h3>${t.name}</h3><p class="role">${t.role}</p>${paras(t.bio)}</article>`).join('')}</div><p class="fine">Our core team has four people. We work with specialist production collaborators when a project calls for them. The projects here represent collective work, and team members and collaborators contributed according to each engagement’s scope.</p></div></section>
 <section class="band dark"><div class="wrap two"><div><p class="eyebrow">Behind the HOT</p><h2>A few seconds on screen can contain days of work.</h2><p>The script comes after research. A shoot depends on preparation, and a useful edit starts with footage selection. We review the work before it goes out.</p><p>Our team crosses between roles because a brief rarely divides itself neatly into departments. We stay involved in the parts the work needs.</p></div><div><h3 class="serif red">We choose the approach by understanding the brief.</h3><p>We look at what the business needs and who it wants to reach, then assess the material already available. That helps us decide whether the useful next step is an identity or a story, a digital journey or a more consistent content rhythm.</p><p>We plan production and build the assets, then publish or hand over the work and review the response available to us. Feedback informs the next version.</p></div></div></section>`+ctaBlock(),
 jsonld:[crumbs([['Home','/'],['About','/about']])]}));

// ================= TANGENT MEDIA =================
const rv=bySlug['majestic-india'].videos.find(v=>v.id==='1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R');
const nv=bySlug['navdurga'].videos;
const prop=(t,body)=>`<article class="proposal"><p class="prop-flag"><span class="badge st-proposed">Proposed</span> Proposal — not yet produced</p><h3>${t}</h3>${body}</article>`;
out('/tangent-media',layout({path:'/tangent-media',title:'Tangent Media',desc:'Where the brief took a turn: unconventional approaches House of Tangents delivered, and clearly labelled proposals for new formats.',
 body:hero('Tangent Media','Tangent Media shows where the brief took a turn.','We explain the observation behind a concept and how we made it. When an idea is new, we show what it would take to put it into production.')+
 `<section class="band light"><div class="wrap"><p class="eyebrow red">Delivered</p><h2>Concepts we made and published.</h2>
  <article class="tm"><div><h3>We filmed the reveal before the logo was ready.</h3><p>Majestic India’s logo was still in development, but the shoot couldn’t wait for the final artwork. We filmed the performance and blank-paper interaction first. Once the logo was complete, we used masking to place it in the footage.</p><p>That let production continue while design work was still underway. The reveal campaign was completed and published. <a href="/work/majestic-india">Majestic India case study</a></p></div><div class="vgrid">${videoBtn(rv)}</div></article>
  <article class="tm"><div><h3>We turned the planned site into a visit people could follow.</h3><p>Navdurga had no completed site to film, so we created an airport-to-location film and a separate AI-generated FPV-style facilities walkthrough. We planned scenes, wrote the prompts, generated the sequences, and added sound and editing.</p><p>Both films were published organically on the page we managed. They are AI visualisations of planned facilities, rather than filmed tours of completed construction. <a href="/work/navdurga">Navdurga case study</a></p></div><div class="vgrid">${nv.map(videoBtn).join('')}</div></article>
 </div></section>
 <section class="band alt"><div class="wrap"><p class="eyebrow red">Proposals</p><h2>New ideas, clearly labelled.</h2><p class="lead">Nothing below has been produced or published. These are proposed formats based on decisions from our delivered work.</p>
  <div class="two">
  ${prop('A proposed HOT agency film',`<p>The film opens on a screen that says, “Show the business park.” The camera reaches an empty site. A cursor changes the question to, “What would the first visit feel like?” An imagined journey opens up.</p><p>A blank sheet then waits for a logo. A cricket scorecard opens into a player’s childhood dream, and a salon chair turns towards a finished haircut. The close returns to the team at the desk: “The angle is the beginning. We stay for the work.”</p><p class="fine">Production would use team footage, original graphics, approved work samples and labelled AI sequences.</p>`)}
  ${prop('The Brief Took a Turn',`<p>A proposed short-form series showing the original brief and the assumption that limited it, followed by the alternative question and finished work.</p><p>The first episode could use Navdurga. Later episodes could cover Majestic’s reveal or Pratyush’s story. Black’s decision to keep the approach simple would be another useful episode.</p>`)}
  ${prop('Angle / Execution',`<p>A proposed carousel or website format that places an observation beside a production plan: the scene and production method, the assets, and the intended audience response.</p><p>We could use the same approach in proposals so a new idea arrives with a clear route into production.</p>`)}
  </div></div></section>`+ctaBlock(),
 jsonld:[crumbs([['Home','/'],['Tangent Media','/tangent-media']])]}));

// ================= CONTACT =================
out('/contact',layout({path:'/contact',title:'Contact',desc:'Start a project with House of Tangents. Email farhafatima3686@gmail.com or call +91 70911 40333.',
 body:hero('Contact','We can look at your brief from another angle.','Let’s work out what it needs, then get it made.')+
 `<section class="band light"><div class="wrap contact-grid light-form"><div><h2>Talk to Farha</h2><p class="direct"><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p><p>Farha Fatima, Founder, Brand &amp; Creative Director.</p><p class="fine">Tell us about the brief, the business and what you have today. We’ll come back with how we’d approach it.</p></div>${formHTML('cf')}</div></section>`,
 jsonld:[org,crumbs([['Home','/'],['Contact','/contact']])]}));

// ================= CREDITS =================
out('/credits',layout({path:'/credits',title:'Credits and notes',desc:'Source notes, attribution, reporting qualifications and archive context for the House of Tangents portfolio.',
 body:hero('Credits & notes','Our project credits preserve the original context.')+
 `<section class="band light"><div class="wrap narrow">
  <h2>Film reference</h2><p>The Wasseypur dialogue is a brief excerpt from the published <i>Gangs of Wasseypur Part II</i> dubbing script, on pages 42–43, attributed to the character Guddu. Our agency interpretation is original. This website includes no film footage, stills, posters, soundtrack or other film assets, and makes no claim of endorsement, affiliation or collaboration.</p>
  <h2>Reporting qualifications</h2>
  <ul class="list"><li>Figures come from the team’s project records and supplied case studies, with reporting periods stated where available.</li>
  <li>Capitol Hill: address taps and profile interactions are not confirmed visits or bookings. The two Google Business Profile figures cover different reporting periods.</li>
  <li>Black: the zero-ad-spend result belongs only to the second-anniversary activity. Separate paid campaigns ran at other points. Booking and enquiry figures are client-reported.</li>
  <li>Majestic India: reel results were organic. Paid contestant lead-generation campaigns were separate. Enquiry figures come from the team’s records.</li>
  <li>Shambhavi Shiva: all personal-profile results were organic, with no boosted posts or paid ads.</li>
  <li>ZOI: the earlier published case-study figures (200K+ reach, 150+ creatives, 4K+ monthly engagement, 60%+ footfall growth) don’t share a single defined reporting window.</li>
  <li>Sanatni: the download figure covers the wider campaign and launch activity, not a single reel.</li>
  <li>Navdurga: the films are AI visualisations of proposed facilities, not footage of completed construction.</li>
  <li>Saregama Music: unpublished and under management review as of November 2026. The two-day figure describes the initial edit only.</li></ul>
  <h2>Sources</h2><p>Earlier project records appear on the Brand Thinker website. Capitol Hill material appears in the earlier project portfolio and the digital-presence case study. The earlier Black and ZOI cases provide additional project context. The Capitol Hill testimonial from Narendra Singh, General Manager, is an excerpt from the testimonial published on the earlier agency website.</p>
  <h2>Additional engagements</h2><ul class="list"><li><b>Cyclist Café</b>: pet-friendly café script and collaboration planning.</li><li><b>Street Dogs of Ranchi</b>: the FluffyPet adoption-event collaboration.</li><li><b>Shaadi Essentials</b>: gifting communication and a deck, as well as proposal and copy development.</li><li><b>ABS College</b> and <b>Shri Anandam Dham</b>: earlier website work.</li><li><b>Chai Bubble</b>: part of our hospitality engagement history.</li><li><b>Pi Studio</b> and <b>Brand Thinker</b>: earlier agency experiences covering the offer, pitches and client delivery.</li></ul><p class="fine">Scope varies by project.</p>
  <h2>Product communication archive</h2><p>DIM12/DIM-12 and RadiologyGPT appear in earlier product and ecosystem discussions, alongside Pi Social, Pi Learn, Pi Path and Pi Enroll. They belong in the supporting experience inventory rather than separate completed-campaign case studies.</p>
  <h2>Team credit</h2><p>The projects represent collective work. Team members and specialist collaborators contributed according to each engagement’s scope.</p>
 </div></section>`+ctaBlock(),
 jsonld:[crumbs([['Home','/'],['Credits','/credits']])]}));

// ================= 404 =================
fs.writeFileSync(path.join(ROOT,'404.html'),layout({path:'/404',title:'Page not found',desc:'This page could not be found.',body:hero('404','This line went off at an angle.','The page you wanted isn’t here.')+`<section class="band light"><div class="wrap"><p><a class="btn primary" href="/">Back to the homepage</a> <a class="btn dark-btn" href="/work">Browse work</a></p></div></section>`}));

// ================= sitemap / robots =================
const urls=['/','/work','/services','/about','/tangent-media','/contact','/credits',...projects.map(p=>'/work/'+p.slug)];
fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${SITE.url}${u==='/'?'/':u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log('built',urls.length,'routes');
