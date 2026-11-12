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
const badge=s=>`<span class="status ${statusClass(s)}"><i aria-hidden="true"></i>${esc(s)}</span>`;
const paras=a=>a.map(t=>`<p>${esc(t)}</p>`).join('');
const pic=(src,alt,{sizes='(min-width:900px) 50vw,100vw',focus='50% 50%',eager=false,cls=''}={})=>
 `<picture><source type="image/webp" srcset="/assets/media/${src}-420.webp 420w,/assets/media/${src}-720.webp 720w" sizes="${sizes}"><img class="${cls}" src="/assets/media/${src}-720.jpg" srcset="/assets/media/${src}-420.jpg 420w,/assets/media/${src}-720.jpg 720w" sizes="${sizes}" width="720" height="1280" alt="${esc(alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" style="object-position:${focus}"></picture>`;
const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const GEO=[
 '<circle cx="60" cy="62" r="34" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="6" y1="96" x2="114" y2="96" stroke="currentColor" stroke-width="1.6"/><circle cx="60" cy="96" r="4.5" class="pt"/>',
 '<line x1="12" y1="98" x2="108" y2="98" stroke="currentColor" stroke-width="1.6"/><line x1="60" y1="98" x2="60" y2="20" stroke="currentColor" stroke-width="1.6"/><path d="M60 84h-14v14" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="60" cy="20" r="4.5" class="pt"/>',
 '<circle cx="44" cy="60" r="30" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="74" y1="10" x2="74" y2="110" stroke="currentColor" stroke-width="1.6"/><circle cx="74" cy="60" r="4.5" class="pt"/>',
 '<path d="M10 100 Q60 -14 110 100" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="24" y1="58" x2="96" y2="58" stroke="currentColor" stroke-width="1.6"/><circle cx="60" cy="58" r="4.5" class="pt"/>'];
// Typographic poster used where no approved media exists. Figures here repeat verified, already-qualified outcomes.
const ART_STAT={'capitol-hill':['800%+','organic account reach growth in the first two months'],'black':['4.8/5','Google rating by November 2026'],'santhal-strikers':['832','followers in 20 days, no paid follower acquisition'],'shambhavi':['2 × 1M+','two videos above one million views, organic'],'sanatni':['~900','app downloads across campaign and launch work'],'the-pi':['~300','downloads reported from the XISS launch activity'],'dimechain':['584','LinkedIn followers in about three to three and a half months']};
const art=(p)=>{const h=hash(p.slug);const st=ART_STAT[p.slug];const main=st?`<b class="art-stat">${esc(st[0])}</b><small>${esc(st[1])}</small>`:`<b class="art-name">${esc(p.name)}</b>`;
 return `<div class="art art-${'abc'[h%3]}" role="img" aria-label="${esc(p.name+(st?': '+st[0]+' '+st[1]:' project artwork'))}"><span class="art-tag">${esc(p.tag)}</span><svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${GEO[(h>>3)%4]}</svg><div class="art-main" aria-hidden="true">${main}</div></div>`};
const mediaOf=(p,opts)=>{const m=MEDIA[p.slug];return m?pic(m.poster,m.alt,{...opts,focus:m.focus}):art(p)};
const oneLine=s=>s.replace(/\.$/,'');
const pcard=(p,{span,h,sizes,eager=false}={})=>`<article class="pcard" data-cats="${p.categories.join(' ')}"${span?` style="--s:${span};--h:${h}px"`:''}>
 <a class="pcard-link" href="/work/${p.slug}" aria-label="${esc(p.name)}: view case study">
  <div class="pcard-media">${mediaOf(p,{sizes:sizes||'(min-width:900px) 50vw,100vw',eager})}<span class="pcard-go" aria-hidden="true">View case study</span></div>
  <div class="pcard-info"><p class="pcard-meta">${badge(p.status)}<span>${esc(p.tag)}</span></p><h3>${esc(p.name)}</h3><p class="pcard-out">${esc(oneLine(p.outcome))}</p></div>
 </a></article>`;
const miniCard=p=>`<a class="mini-card" href="/work/${p.slug}"><div class="mini-media">${mediaOf(p,{sizes:'160px'})}</div><span><b>${esc(p.name)}</b><br><small>${esc(oneLine(p.outcome))}</small></span></a>`;

const videoBlock=v=>{const info=VIDEO_INFO[v.id],loc=LOCAL_VIDEOS[v.id];
 if(loc){const pm=loc.poster;return `<figure class="vfig"><div class="vwrap"><video controls preload="none" playsinline width="${loc.w}" height="${loc.h}" poster="/assets/media/${pm}-720.jpg" aria-label="${esc(info.title)}"><source src="${loc.src}" type="video/mp4"></video></div><figcaption><b>${esc(info.title)}</b>${esc(info.summary)}</figcaption></figure>`}
 return `<figure class="vfig vdrive"><button class="vbtn" type="button" data-video="${v.id}" data-title="${esc(info.title)}" data-summary="${esc(info.summary)}"><span class="vplay" aria-hidden="true"></span><span class="vlabel">Play: ${esc(info.title)}</span></button><figcaption><b>${esc(info.title)}</b>${esc(info.summary)} <a href="https://drive.google.com/file/d/${v.id}/view" target="_blank" rel="noopener">Open original file</a></figcaption></figure>`};
const cta=(h='Start a project',p='Let’s work out what your brief needs, then get it made.')=>`<section class="band cobalt cta-band"><div class="wrap"><div class="tangent-line" aria-hidden="true"></div><h2>${h}</h2><p class="lead">${p}</p><div class="actions"><a class="btn lime" href="/contact">Start a project</a><a class="btn outline-w" href="mailto:${SITE.email}">${SITE.email}</a></div></div></section>`;

const NAV=[['Work','/work'],['Services','/services'],['About','/about'],['Tangent Media','/tangent-media']];
const MARK='<svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="14" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><line x1="2" y1="26" x2="30" y2="26" stroke="currentColor" stroke-width="2.4"/><circle cx="16" cy="26" r="3.4" class="pt"/></svg>';
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
<meta name="theme-color" content="#F7F8FA">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/BricolageGrotesque-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/Manrope-normal.woff2" as="font" type="font/woff2" crossorigin>
${preload}<link rel="stylesheet" href="/styles.css">
<script>document.documentElement.classList.add('js')</script>
${jsonld.map(j=>`<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" id="site-header"><div class="bar">
 <a class="brand" href="/" aria-label="House of Tangents, home">${MARK}<span>House of Tangents</span></a>
 <nav class="nav" aria-label="Primary">${nav}</nav>
 <a class="btn primary sm head-cta" href="/contact">Start a project</a>
 <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu">Menu</button>
</div></header>
<div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
 <div class="mm-top"><span class="brand">${MARK}<span>House of Tangents</span></span><button class="menu-close" type="button">Close</button></div>
 <nav aria-label="Mobile">${NAV.map(([l,h])=>`<a href="${h}">${l}</a>`).join('')}<a href="/contact">Contact</a></nav>
 <a class="btn lime mm-cta" href="/contact">Start a project</a>
</div>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer"><div class="wrap foot">
 <div><p class="brand">${MARK}<span>House of Tangents</span></p><p class="foot-line">${SITE.tagline}</p></div>
 <nav aria-label="Footer"><a href="/work">Work</a><a href="/services">Services</a><a href="/about">About</a><a href="/tangent-media">Tangent Media</a><a href="/contact">Contact</a><a href="/credits">Credits &amp; notes</a></nav>
 <p><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p>
</div></footer>
<dialog class="vdialog" id="vdialog" aria-labelledby="vtitle"><div class="vhead"><h2 id="vtitle"></h2><button type="button" class="vclose">Close</button></div><div class="vframe" id="vframe"></div><p id="vsummary" class="vsum"></p><p class="fine">Interim playback from the client’s shared Google Drive folder, loaded only after you press play.</p></dialog>
<script src="/site.js" defer></script>
</body></html>`;
}
const crumbs=items=>({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map(([n,u],i)=>({'@type':'ListItem',position:i+1,name:n,item:SITE.url+u}))});
const org={'@context':'https://schema.org','@type':'ProfessionalService',name:SITE.name,url:SITE.url,email:SITE.email,telephone:SITE.phone,description:'Branding, strategy, creative and marketing. Tangent thinking. Perpendicular commitment.',slogan:SITE.tagline};
const out=(p,html)=>{const f=p==='/'?'index.html':path.join(p.slice(1),'index.html');const fp=path.join(ROOT,f);fs.mkdirSync(path.dirname(fp),{recursive:true});fs.writeFileSync(fp,html)};
const TL='<svg class="tl" viewBox="0 0 240 90" aria-hidden="true" focusable="false"><path d="M0 70H88L150 20H240" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="120" cy="45" r="0"/><circle cx="88" cy="70" r="7" class="pt"/></svg>';
const phero=(eyebrow,h1,lead)=>`<section class="phero"><div class="wrap"><p class="eyebrow">${eyebrow}</p><h1>${h1}</h1>${lead?`<p class="lead">${lead}</p>`:''}${TL}</div></section>`;
const formHTML=(id)=>`<form class="form" id="${id}" method="post" action="/api/contact" novalidate>
 <div class="err-summary" role="alert" tabindex="-1" hidden></div>
 <div class="field"><label for="${id}-name">Name <span aria-hidden="true">*</span></label><input id="${id}-name" name="name" autocomplete="name" required aria-describedby="${id}-name-e"><span class="err" id="${id}-name-e"></span></div>
 <div class="field"><label for="${id}-company">Company or brand</label><input id="${id}-company" name="company" autocomplete="organization"></div>
 <div class="field"><label for="${id}-contact">Email or phone <span aria-hidden="true">*</span></label><input id="${id}-contact" name="contact" autocomplete="email" required aria-describedby="${id}-contact-e"><span class="err" id="${id}-contact-e"></span></div>
 <div class="field"><label for="${id}-need">What do you need help with? <span aria-hidden="true">*</span></label><textarea id="${id}-need" name="need" rows="4" required aria-describedby="${id}-need-e"></textarea><span class="err" id="${id}-need-e"></span></div>
 <div class="field"><label for="${id}-budget">Approximate budget (optional)</label><input id="${id}-budget" name="budget"></div>
 <div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>
 <button class="btn lime" type="submit">Send enquiry</button>
 <p class="form-status" role="status" aria-live="polite"></p>
 <p class="fine">If sending doesn’t work, email <a href="mailto:${SITE.email}">${SITE.email}</a> or call <a href="${SITE.phoneHref}">${SITE.phone}</a>.</p>
</form>`;

// ================= HOME =================
const featured=projects.filter(p=>p.featured).sort((a,b)=>a.featured-b.featured);
const ROWS=[[7,5],[4,4,4],[5,7],[6,6],[4,4,4]],ROWH=[520,400,520,460,400];
const flat=ROWS.flatMap((r,ri)=>r.map(sp=>({s:sp,h:ROWH[ri]})));
const lay=i=>flat[i%flat.length];
const HOMEROWS=[{s:7,h:520},{s:5,h:520},{s:5,h:520},{s:7,h:520},{s:7,h:520},{s:5,h:520}];
const svcPanel=(s)=>s.proof.filter(k=>MEDIA[k]).concat(s.proof.filter(k=>!MEDIA[k])).slice(0,2).map(k=>miniCard(bySlug[k])).join('');
const home=`
<section class="hero"><div class="wrap hero-grid">
 <div class="hero-copy">
  <p class="eyebrow">Branding / Strategy / Creative / Marketing</p>
  <h1>Good ideas rarely move in straight lines.</h1>
  <p class="lead">We find a different angle, then do the work to make it happen.</p>
  <div class="actions"><a class="btn primary" href="/contact">Start a project</a><a class="btn ghost" href="#work">Explore the work</a></div>
 </div>
 <div class="hero-media">
  <div class="reel-frame"><video class="reel" data-reel muted loop playsinline preload="none" poster="/assets/media/home/hero-poster.jpg" aria-label="Looping silent reel of House of Tangents work: the Majestic India logo reveal and the Navdurga Business Park visualisation" width="540" height="960"><source src="/assets/media/home/hero-reel.mp4" type="video/mp4"></video>
  <svg class="hero-tangent" viewBox="0 0 400 600" aria-hidden="true" focusable="false"><circle cx="330" cy="330" r="96" fill="none" stroke="#fff" stroke-width="2" class="draw"/><line x1="-10" y1="426" x2="410" y2="426" stroke="#3157ff" stroke-width="4" class="draw"/><circle cx="330" cy="426" r="9" fill="#c8ff3d" class="pop"/></svg></div>
  <button class="reel-toggle" type="button" data-reel-toggle aria-pressed="false" hidden>Pause reel</button>
  <p class="reel-cap">Majestic India reveal and Navdurga Business Park visualisation</p>
 </div>
</div></section>

<section class="band" id="work" aria-labelledby="feat-h"><div class="wrap">
 <div class="sec-head"><div><p class="eyebrow">Selected work</p><h2 id="feat-h">Six projects, six different angles.</h2></div><a class="textlink" href="/work">Browse all work <span aria-hidden="true">→</span></a></div>
 <div class="reel-grid">${featured.map((p,i)=>pcard(p,{span:HOMEROWS[i].s,h:HOMEROWS[i].h,eager:i<2})).join('')}</div>
</div></section>

<section class="band cobalt" aria-labelledby="proof-h"><div class="wrap">
 <p class="eyebrow">Evidence</p>
 <h2 id="proof-h">Results, with the context they belong to.</h2>
 <div class="proof">
  <figure><b>800%+</b><figcaption>organic account reach growth in the first two months.<a href="/work/capitol-hill">Capitol Hill</a></figcaption></figure>
  <figure><b>700K–800K</b><figcaption>organic views on selected reels. Paid lead campaigns were separate.<a href="/work/majestic-india">Majestic India</a></figcaption></figure>
  <figure><b>2 videos</b><figcaption>above one million views on a personal profile, with no boosted posts or ads.<a href="/work/shambhavi">Shambhavi Shiva</a></figcaption></figure>
  <figure><b>832</b><figcaption>followers in 20 days without paid follower acquisition.<a href="/work/santhal-strikers">JT20 / Santhal Strikers</a></figcaption></figure>
 </div>
 <p class="proof-note">Figures come from the team’s project records and supplied case studies. Views and followers are not sales. Reporting periods and qualifications sit on each case study. As of ${SITE.asOf}.</p>
</div></section>

<section class="band" aria-labelledby="serv-h"><div class="wrap">
 <p class="eyebrow">Services</p>
 <h2 id="serv-h">From the first idea to the final file.</h2>
 <div class="svc-index" data-svc>${SERVICES.map((s,i)=>`<div class="svc-item${i===0?' open':''}"><h3><button type="button" class="svc-btn" id="sb${i}" aria-expanded="${i===0}" aria-controls="sp${i}"><span class="num">0${i+1}</span>${s.title}</button></h3><div class="svc-panel" id="sp${i}" role="region" aria-labelledby="sb${i}"><p>${s.short}</p><div class="mini-row">${svcPanel(s)}</div></div></div>`).join('')}</div>
 <p><a class="textlink" href="/services">All services <span aria-hidden="true">→</span></a></p>
</div></section>

<section class="band mist" aria-labelledby="method-h"><div class="wrap">
 <p class="eyebrow">The Tangent Method</p>
 <h2 id="method-h">We look for the angle, then work through the details.</h2>
 <div class="journey">
  <svg class="j-line" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 70H167L330 20H500L670 100H833L1000 30" fill="none" stroke="#3157ff" stroke-width="3" vector-effect="non-scaling-stroke" pathLength="1" class="j-path"/></svg>
  <span class="j-dot" style="left:16.7%;top:70px" aria-hidden="true"></span><span class="j-dot" style="left:50%;top:20px" aria-hidden="true"></span><span class="j-dot" style="left:83.3%;top:100px" aria-hidden="true"></span>
  <ol class="j-steps">
   <li><span class="j-n">01</span><h3>Find the angle</h3><p>We look at what the business needs, who it wants to reach and what its audience is used to seeing. Then we look for a useful detail that gives the brief a different way in.</p></li>
   <li><span class="j-n">02</span><h3>Make the work</h3><p>We plan, write, design, shoot, build, edit and publish, including the less visible details that decide whether an idea makes sense when people meet it.</p></li>
   <li><span class="j-n">03</span><h3>Review the response</h3><p>We look at the response available to us and let it shape the next version. For FluffyPet, that meant changing the product experience itself.</p></li>
  </ol>
 </div>
</div></section>

<section class="band origin" id="origin" aria-labelledby="origin-h"><div class="wrap narrow">
 <p class="eyebrow">Why “Tangents”</p>
 <h2 id="origin-h">A line that touches a circle once, then moves on.</h2>
 <p>The name comes from a scene in <i>Gangs of Wasseypur Part II</i>, where Guddu explains the difference between a perpendicular and a tangent. It stayed with us because it made the angle matter. We’ve given that geometry its own nonviolent creative meaning.</p>
 <p class="platform">Tangent thinking. Perpendicular commitment.</p>
 <p><a class="textlink" href="/about#name">Read the full story <span aria-hidden="true">→</span></a></p>
</div></section>

<section class="band" aria-labelledby="team-h"><div class="wrap">
 <p class="eyebrow">The team</p>
 <h2 id="team-h">Four people, sharing the work.</h2>
 <ul class="roster">${TEAM.map(t=>`<li><b>${t.name}</b><span class="role">${t.role}</span><span>${t.short}</span></li>`).join('')}</ul>
 <p><a class="textlink" href="/about#team">Meet the team <span aria-hidden="true">→</span></a></p>
 <figure class="pullquote"><blockquote>“Guests appreciate the work, and many even ask who handles our marketing.”</blockquote><figcaption>Narendra Singh, General Manager, Capitol Hill<span class="fine">Excerpt from a testimonial published on our earlier agency website.</span></figcaption></figure>
</div></section>

<section class="band cobalt contact-band" id="contact-home" aria-labelledby="c-h"><div class="wrap contact-grid">
 <div>
  <div class="tangent-line" aria-hidden="true"></div>
  <h2 id="c-h">We can look at your brief from another angle.</h2>
  <p class="lead">Let’s work out what it needs, then get it made.</p>
  <p class="direct"><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p>
 </div>
 ${formHTML('hf')}
</div></section>`;
out('/',layout({path:'/',title:'House of Tangents — Branding, Strategy, Creative, Marketing',desc:'Good ideas rarely move in straight lines. House of Tangents finds a different angle, then does the work to make it happen across branding, strategy, creative and marketing.',body:home,jsonld:[org],preload:'<link rel="preload" as="image" href="/assets/media/home/hero-poster.webp" type="image/webp" fetchpriority="high">\n'}));

// ================= WORK INDEX =================
const wall=projects.map((p,i)=>pcard(p,{span:lay(i).s,h:lay(i).h,sizes:'(min-width:900px) 40vw,100vw'})).join('');
const filterBtns=`<div class="filters" role="group" aria-label="Filter projects by type"><button type="button" class="chip" data-filter="all" aria-pressed="true">All</button>${Object.entries(CATEGORIES).map(([k,v])=>`<button type="button" class="chip" data-filter="${k}" aria-pressed="false">${v}</button>`).join('')}</div>`;
out('/work',layout({path:'/work',title:'Work',desc:'Selected House of Tangents work across hospitality, personal branding, sport, product launches and brand identities, with results shown alongside their reporting context.',
 body:phero('Work','Work, with the evidence beside it.',`${projects.length} projects from 2023 to 2026. Each case study keeps its numbers next to the project, channel and period they belong to.`)+
 `<section class="band tight"><div class="wrap">${filterBtns}<p class="fine filter-status" role="status" aria-live="polite">Showing ${projects.length} projects</p><div class="wall" id="work-grid">${wall}</div></div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['Work','/work']])]}));

// ================= CASE STUDIES =================
for(const [pi,p] of projects.entries()){
  const m=MEDIA[p.slug];
  const metricsHTML=(arr,ctx)=>arr&&arr.length?`<div class="metrics" role="list" aria-label="Results">${arr.map(s=>`<div class="metric" role="listitem"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div><p class="metric-ctx">${esc(ctx)}</p>`:'';
  const ctx=p.name+(p.period?' · '+p.period.split('·')[0].trim():'');
  const chap=p.chapters.map(ch=>`<section class="chapter"><h3>${esc(ch.h)}</h3><div>${paras(ch.p)}${metricsHTML(ch.stats,ctx)}${ch.note?`<p class="note"><b>Note:</b> ${esc(ch.note)}</p>`:''}</div></section>`).join('');
  const statusNote={'Unpublished / under review':'This work remained unpublished and under management review in November 2026.','Status to confirm':'The delivery status of this engagement is being confirmed with the client.'}[p.status]||'';
  const rel=p.related.map(r=>bySlug[r]);
  const next=projects[(pi+1)%projects.length];
  const heroMedia=m?`<div class="case-hero-media">${pic(m.poster,m.alt,{sizes:'(min-width:1200px) 1100px,100vw',focus:m.focus,eager:true})}</div>`:`<div class="case-hero-media">${art(p)}</div>`;
  const vids=p.videos.map(videoBlock).join('');
  const gallery=m&&m.gallery?`<div class="gal gal-${Math.min(m.gallery.length,4)}">${m.gallery.map(g=>`<figure>${pic(g.src,g.alt,{sizes:'(min-width:900px) 25vw,50vw'})}</figure>`).join('')}</div>`:'';
  const body=`<section class="case-hero"><div class="wrap">
   <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/work">Work</a> / <span aria-current="page">${esc(p.name)}</span></nav>
   <h1>${esc(p.name)}</h1><p class="lead">${esc(p.title)}</p>
   <dl class="facts"><div><dt>Status</dt><dd>${badge(p.status)}${statusNote?`<small>${esc(statusNote)}</small>`:''}</dd></div><div><dt>Timeframe</dt><dd>${esc((p.period||'To confirm').split('·')[0].trim())}</dd></div><div><dt>Sector</dt><dd>${esc(p.tag)}</dd></div><div><dt>Scope</dt><dd>${p.services.map(esc).join(', ')}</dd></div></dl>
  </div>${heroMedia}</section>
  <section class="band"><div class="wrap case">
   <div class="ed"><h2 class="label">Overview</h2><div>${paras(p.overview)}</div></div>
   <div class="angle"><div><h2 class="label">The challenge</h2><p>${esc(p.challenge)}</p></div>${p.tangent?`<div><h2 class="label">The tangent</h2><p>${esc(p.tangent)}</p></div>`:''}</div>
   <div class="ed"><h2 class="label">Execution and results</h2><div>${chap}${metricsHTML(p.metrics,ctx)}</div></div>
   ${vids||gallery?`<div class="media-sec"><h2 class="label">Selected media</h2>${vids}${gallery}</div>`:''}
   <div class="ed"><h2 class="label">Methodology</h2><div class="method"><p>Figures come from the team’s project records and supplied case studies. Reporting periods are stated where that information is available. Views, followers, enquiries and address taps are not presented as sales or confirmed visits. Status as of ${SITE.asOf}. <a href="/credits">Full reporting notes</a>.</p></div></div>
   <div class="ed"><h2 class="label">Credits</h2><div><p>Collective work by the House of Tangents team and specialist collaborators, according to the engagement’s scope.</p></div></div>
  </div></section>
  <section class="band mist"><div class="wrap"><h2>Related work</h2><div class="rel-grid">${rel.map(r=>pcard(r,{sizes:'(min-width:900px) 30vw,100vw'})).join('')}</div></div></section>
  <section class="band cobalt cta-band next"><div class="wrap"><p class="eyebrow">Next project</p><a class="next-link" href="/work/${next.slug}">${esc(next.name)} <span aria-hidden="true">→</span></a><div class="actions"><a class="btn lime" href="/contact">Start a project</a><a class="btn outline-w" href="/work">All work</a></div></div></section>`;
  out('/work/'+p.slug,layout({path:'/work/'+p.slug,title:p.name+' case study',desc:`${p.name}: ${p.challenge} ${p.outcome}.`.slice(0,300),body,preload:m?`<link rel="preload" as="image" href="/assets/media/${m.poster}-720.webp" type="image/webp" fetchpriority="high">\n`:'',jsonld:[crumbs([['Home','/'],['Work','/work'],[p.name,'/work/'+p.slug]])]}));
}

// ================= SERVICES =================
out('/services',layout({path:'/services',title:'Services',desc:'Brand strategy and identity, content and production, marketing and campaigns, and websites and digital journeys from House of Tangents.',
 body:phero('Services','We work from the first idea to the final file.','We can start with what your business has today: a new account, an unfinished app, a property still on a plan, or an established business whose online presence needs to catch up.')+
 `<section class="band tight"><div class="wrap">${SERVICES.map((s,i)=>`<article class="svc" id="${s.id}"><div><span class="num">0${i+1}</span><h2>${s.title}</h2></div><div>${paras(s.long)}<div class="mini-row">${s.proof.map(k=>miniCard(bySlug[k])).join('')}</div></div></article>`).join('')}</div></section>
 <section class="band mist"><div class="wrap narrow"><h2>Identity work beyond the logo</h2>${paras(identityWork)}</div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['Services','/services']])]}));

// ================= ABOUT =================
out('/about',layout({path:'/about',title:'About',desc:'The story behind the name House of Tangents, the four-person core team, and how we choose an approach by understanding the brief.',
 body:phero('About','Our name has a story behind it.','Tangent thinking. Perpendicular commitment.')+
 `<section class="band tight" id="name"><div class="wrap narrow">
  <h2>Wasseypur made geometry hard to forget.</h2>
  <blockquote class="hindi" lang="hi">“अगर जान से मरा, तो ब्लेड परपेंडीकुलर गया था…और अगर सिर्फ चमड़ी कटा, तो समझो टेंजेण्ट था.”</blockquote>
  <p class="cite">Guddu, <i>Gangs of Wasseypur Part II</i></p>
  <p>Guddu’s dialogue made the angle matter. We’ve given that thought a different job at House of Tangents. Our creative platform is “Tangent thinking. Perpendicular commitment.” We look for an approach people haven’t seen coming, then stay with the work it takes to produce it.</p>
  <p class="fine">The dialogue is a brief excerpt from the published <i>Gangs of Wasseypur Part II</i> dubbing script, pp. 42–43. Our agency interpretation is our own. This website uses no film footage, stills or other film assets and does not claim or imply any endorsement, affiliation or collaboration with the film or its rights holders.</p>
 </div></section>
 <section class="band mist"><div class="wrap two"><div><h2>We think in tangents.</h2><p>For Navdurga, we imagined a visitor’s journey before there was a finished business park to film. For Santhal Strikers, a conversation with a player became a film about the dream that brought him to cricket.</p></div><div><h2>We commit to the execution.</h2><p>An idea still needs someone to plan the shoot and write the script. It needs prompt writing, footage selection, editing, design and a publishing plan. We work through those details, including the less visible ones.</p></div></div></section>
 <section class="band" id="team"><div class="wrap"><p class="eyebrow">The team</p><h2>We share the work across a four-person team.</h2><div class="team-full">${TEAM.map((t,i)=>`<article><span class="num">0${i+1}</span><h3>${t.name}</h3><p class="role">${t.role}</p>${paras(t.bio)}</article>`).join('')}</div><p class="fine">Our core team has four people. We work with specialist production collaborators when a project calls for them. The projects here represent collective work, and team members and collaborators contributed according to each engagement’s scope.</p></div></section>
 <section class="band cobalt"><div class="wrap two"><div><p class="eyebrow">Behind the HOT</p><h2>A few seconds on screen can contain days of work.</h2><p>The script comes after research. A shoot depends on preparation, and a useful edit starts with footage selection. We review the work before it goes out.</p><p>Our team crosses between roles because a brief rarely divides itself neatly into departments. We stay involved in the parts the work needs.</p></div><div><h3 class="alt-h">We choose the approach by understanding the brief.</h3><p>We look at what the business needs and who it wants to reach, then assess the material already available. That helps us decide whether the useful next step is an identity or a story, a digital journey or a more consistent content rhythm.</p><p>We plan production and build the assets, then publish or hand over the work and review the response available to us. Feedback informs the next version.</p></div></div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['About','/about']])]}));

// ================= TANGENT MEDIA =================
const rv=bySlug['majestic-india'].videos.find(v=>v.id==='1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R');
const nv=bySlug['navdurga'].videos;
const prop=(t,body)=>`<article class="proposal"><p class="prop-flag"><span class="status st-proposed"><i aria-hidden="true"></i>Proposed</span> Proposal — not yet produced</p><h3>${t}</h3>${body}</article>`;
out('/tangent-media',layout({path:'/tangent-media',title:'Tangent Media',desc:'Where the brief took a turn: unconventional approaches House of Tangents delivered, and clearly labelled proposals for new formats.',
 body:phero('Tangent Media','Tangent Media shows where the brief took a turn.','We explain the observation behind a concept and how we made it. When an idea is new, we show what it would take to put it into production.')+
 `<section class="band tight"><div class="wrap"><p class="eyebrow">Delivered</p><h2>Concepts we made and published.</h2>
  <article class="tm"><div><h3>We filmed the reveal before the logo was ready.</h3><p>Majestic India’s logo was still in development, but the shoot couldn’t wait for the final artwork. We filmed the performance and blank-paper interaction first. Once the logo was complete, we used masking to place it in the footage.</p><p>That let production continue while design work was still underway. The reveal campaign was completed and published. <a href="/work/majestic-india">Majestic India case study</a></p></div><div>${videoBlock(rv)}</div></article>
  <article class="tm"><div><h3>We turned the planned site into a visit people could follow.</h3><p>Navdurga had no completed site to film, so we created an airport-to-location film and a separate AI-generated FPV-style facilities walkthrough. We planned scenes, wrote the prompts, generated the sequences, and added sound and editing.</p><p>Both films were published organically on the page we managed. They are AI visualisations of planned facilities, rather than filmed tours of completed construction. <a href="/work/navdurga">Navdurga case study</a></p></div><div class="tm-pair">${nv.map(videoBlock).join('')}</div></article>
 </div></section>
 <section class="band mist"><div class="wrap"><p class="eyebrow">Proposals</p><h2>New ideas, clearly labelled.</h2><p class="lead">Nothing below has been produced or published. These are proposed formats based on decisions from our delivered work.</p>
  <div class="prop-grid">
  ${prop('A proposed HOT agency film',`<p>The film opens on a screen that says, “Show the business park.” The camera reaches an empty site. A cursor changes the question to, “What would the first visit feel like?” An imagined journey opens up.</p><p>A blank sheet then waits for a logo. A cricket scorecard opens into a player’s childhood dream, and a salon chair turns towards a finished haircut. The close returns to the team at the desk: “The angle is the beginning. We stay for the work.”</p><p class="fine">Production would use team footage, original graphics, approved work samples and labelled AI sequences.</p>`)}
  ${prop('The Brief Took a Turn',`<p>A proposed short-form series showing the original brief and the assumption that limited it, followed by the alternative question and finished work.</p><p>The first episode could use Navdurga. Later episodes could cover Majestic’s reveal or Pratyush’s story. Black’s decision to keep the approach simple would be another useful episode.</p>`)}
  ${prop('Angle / Execution',`<p>A proposed carousel or website format that places an observation beside a production plan: the scene and production method, the assets, and the intended audience response.</p><p>We could use the same approach in proposals so a new idea arrives with a clear route into production.</p>`)}
  </div></div></section>`+cta(),
 jsonld:[crumbs([['Home','/'],['Tangent Media','/tangent-media']])]}));

// ================= CONTACT =================
out('/contact',layout({path:'/contact',title:'Contact',desc:'Start a project with House of Tangents. Email farhafatima3686@gmail.com or call +91 70911 40333.',
 body:`<section class="band cobalt contact-page"><div class="wrap contact-grid"><div><div class="tangent-line" aria-hidden="true"></div><p class="eyebrow">Contact</p><h1>We can look at your brief from another angle.</h1><p class="lead">Let’s work out what it needs, then get it made.</p><p class="direct"><a href="mailto:${SITE.email}">${SITE.email}</a><br><a href="${SITE.phoneHref}">${SITE.phone}</a></p><p>Farha Fatima, Founder, Brand &amp; Creative Director.</p><p class="fine">Tell us about the brief, the business and what you have today. We’ll come back with how we’d approach it.</p></div>${formHTML('cf')}</div></section>`,
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
fs.writeFileSync(path.join(ROOT,'404.html'),layout({path:'/404',title:'Page not found',desc:'This page could not be found.',body:phero('404','This line went off at an angle.','The page you wanted isn’t here.')+`<section class="band tight"><div class="wrap"><p><a class="btn primary" href="/">Back to the homepage</a> <a class="btn ghost" href="/work">Browse work</a></p></div></section>`}));

// ================= sitemap / robots =================
const urls=['/','/work','/services','/about','/tangent-media','/contact','/credits',...projects.map(p=>'/work/'+p.slug)];
fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${SITE.url}${u==='/'?'/':u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log('built',urls.length,'routes');
