// Run with: node --test tests/*.test.mjs   (needs `playwright` resolvable, e.g. the globally installed one)
// Build first: node scripts/build.mjs. No test sends a real enquiry: the contact API is always mocked.
import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
import {SITE,CHAPTERS,TEAM,SERVICES,SECTORS,MEDIA_TYPES} from '../content/site.mjs';
import {HOME,MEDIA_ITEMS,IDENTITIES,STORIES,IDEAS,PROCESS,ADDITIONAL,NOTES,WASSEYPUR} from '../content/pages.mjs';
const ROOT=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'))}catch{({chromium}=createRequire('/usr/lib/node_modules/')('playwright'))}
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const projects=JSON.parse(read('content/projects.json'));
const by=Object.fromEntries(projects.map(p=>[p.slug,p]));
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain','.woff2':'font/woff2','.mp4':'video/mp4','.jpg':'image/jpeg','.webp':'image/webp'};
let server,base,browser;
test.before(async()=>{
  server=http.createServer((q,s)=>{let u=decodeURIComponent(q.url.split('?')[0]);let f=path.join(ROOT,u);
    if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
    else if(!fs.existsSync(f)&&fs.existsSync(f+'.html'))f+='.html';
    if(!fs.existsSync(f)){s.writeHead(404);return s.end('nf')}
    s.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});s.end(fs.readFileSync(f))}).listen(0);
  base='http://localhost:'+server.address().port;browser=await chromium.launch();
});
test.after(async()=>{await browser.close();server.close()});
const ROUTES=['/','/work','/hot-results','/hot-media','/brand-identities','/services','/about','/tangent-media','/contact','/credits'];
const file=r=>r==='/'?'index.html':r.slice(1)+'/index.html';
const mainPages=ROUTES.map(file),casePages=projects.map(p=>`work/${p.slug}/index.html`);
const allPages=[...mainPages,...casePages,'404.html'];
const dec=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');
const text=h=>dec(h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ');
const main=f=>{const h=read(f);return h.slice(h.indexOf('<main'),h.indexOf('</main>'))};
const page=f=>text(read(f));
const has=(f,s)=>assert.ok(page(f).includes(s),`${f} is missing: ${s}`);

/* =================== site map and navigation =================== */
test('every route in the brief exists, and existing /work/[slug] URLs are preserved',()=>{
  for(const f of allPages)assert.ok(fs.existsSync(path.join(ROOT,f)),f);
  assert.equal(projects.length,24);
  const old=['capitol-hill','black','majestic-india','santhal-strikers','shambhavi','zoi','sanatni','the-pi','dimechain','grenx','navdurga','saregama','zoha','dense','kalinga','avn-grand','lobby-cafe','bioecko','fluffypet','quzones','ifitme','unfaked','shafaf','moksh'];
  assert.deepEqual(projects.map(p=>p.slug).sort(),old.sort());
  const sm=read('sitemap.xml');for(const r of [...ROUTES,...projects.map(p=>'/work/'+p.slug)])assert.ok(sm.includes(`<loc>${SITE.url}${r==='/'?'/':r}</loc>`),'sitemap: '+r);
});
test('primary navigation: Work (with four links), Services, About, Tangent Media, Start a project',()=>{
  for(const f of allPages){const h=read(f),nav=h.slice(h.indexOf('<nav class="nav"'),h.indexOf('</header>'));
    const sub=nav.slice(nav.indexOf('id="work-menu"'),nav.indexOf('</div></div>'));
    assert.deepEqual([...sub.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)</g)].map(m=>[m[2],m[1]]),[['All work','/work'],['HOT Results','/hot-results'],['HOT Media','/hot-media'],['Brand identities','/brand-identities']],f);
    const rest=nav.slice(nav.indexOf('</div></div>'));
    assert.deepEqual([...rest.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)</g)].map(m=>m[2]),['Services','About','Tangent Media','Start a project'],f);
    assert.match(nav,/<button type="button" class="nav-btn" aria-expanded="false" aria-controls="work-menu">Work/)}
});
test('active navigation state is marked on every page, including pages inside Work',()=>{
  for(const [f,href] of [['services/index.html','/services'],['about/index.html','/about'],['tangent-media/index.html','/tangent-media']])assert.match(read(f),new RegExp(`<a href="${href}" aria-current="page">`));
  for(const [f,href] of [['hot-results/index.html','/hot-results'],['hot-media/index.html','/hot-media'],['brand-identities/index.html','/brand-identities'],['work/index.html','/work'],['work/black/index.html','/work']]){
    const h=read(f);assert.match(h,/class="nav-group is-current"/,f);assert.match(h,new RegExp(`<a href="${href}" aria-current="page">`),f)}
  assert.ok(!/class="nav-group is-current"/.test(read('about/index.html')));
});
test('project pages have breadcrumbs and contextual links to related projects',()=>{
  for(const p of projects){const h=read(`work/${p.slug}/index.html`);
    assert.match(h,/<nav class="crumbs" aria-label="Breadcrumb"><a href="\/">Home<\/a> \/ <a href="\/work">Work<\/a> \/ <span aria-current="page">/,p.slug);
    assert.match(h,/"@type":"BreadcrumbList"/);
    const rel=h.slice(h.indexOf('Related work'));for(const r of p.related)assert.ok(rel.includes(`href="/work/${r}"`),`${p.slug} -> ${r}`)}
});
test('every internal link and asset reference resolves, including #anchors',()=>{
  const exists=p=>{const f=path.join(ROOT,p.replace(/^\//,''));return fs.existsSync(f)&&fs.statSync(f).isFile()||fs.existsSync(path.join(f,'index.html'))};
  const missing=[];
  for(const f of allPages){const h=read(f);
    for(const m of h.matchAll(/(?:href|src|poster|data-local|data-poster)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){if(m[1]!=='/'&&!exists(m[1]))missing.push(`${f} -> ${m[1]}`)}
    for(const m of h.matchAll(/srcset="([^"]+)"/g))for(const part of m[1].split(','))if(!exists(part.trim().split(' ')[0]))missing.push(`${f} -> ${part}`);
    for(const m of h.matchAll(/href="(\/[^"#?]*)#([^"]+)"/g)){const t=m[1]==='/'?'index.html':m[1].slice(1)+'/index.html';if(!read(t).includes(`id="${m[2]}"`))missing.push(`${f}: #${m[2]} not on ${m[1]}`)}
    for(const m of h.matchAll(/href="#([^"]+)"/g))if(!h.includes(`id="${m[1]}"`))missing.push(`${f}: #${m[1]}`)}
  assert.deepEqual(missing,[]);
});

/* =================== the four chapters =================== */
test('HOT Results, HOT Media, Brand identities and Tangent Media each carry their exact explanation directly under the title',()=>{
  for(const [k,f] of [['results','hot-results/index.html'],['media','hot-media/index.html'],['identities','brand-identities/index.html'],['tangent','tangent-media/index.html']]){
    const c=CHAPTERS[k],h=main(f);
    assert.match(h,new RegExp(`<p class="label">${c.name}</p><h1>[^<]+</h1><p class="lead">`),f);
    assert.ok(h.includes(`<p class="lead">${c.explain}</p><p class="support">${c.support}</p>`),f)}
  const home=main('index.html');
  for(const k of ['results','media','tangent']){const c=CHAPTERS[k];assert.ok(home.includes(`>${c.name}</h2><p class="lead">${c.explain}</p><p class="support">${c.support}</p>`),'home: '+c.name)}
  assert.equal(CHAPTERS.results.explain,'HOT is short for House of Tangents. This is where we show what happened after the work went out.');
  assert.equal(CHAPTERS.media.explain,'HOT Media is the work you can watch, browse or hold, made by the team at House of Tangents.');
  assert.equal(CHAPTERS.identities.explain,'A brand needs to work wherever people meet it.');
  assert.equal(CHAPTERS.tangent.explain,'Tangent Media is where we show the turn in the thinking and how we made it happen.');
});

/* =================== homepage =================== */
test('homepage sections appear in the exact order A to H',()=>{
  const t=page('index.html');
  const marks=['Good ideas rarely move in straight lines.','The angle matters. So does what you do with it.','HOT is short for House of Tangents.','HOT Media is the work you can watch','We can start with what your business has today.','Tangent Media is where we show the turn','Four people. Shared responsibility for the work.','Tell us what you’re trying to change.'];
  const idx=marks.map(m=>t.indexOf(m));
  for(const [i,x] of idx.entries())assert.ok(x>0,'missing: '+marks[i]);
  for(let i=1;i<idx.length;i++)assert.ok(idx[i]>idx[i-1],`out of order: ${marks[i]}`);
});
test('homepage hero uses the supplied copy and buttons, and stays short',()=>{
  const h=main('index.html'),hero=h.slice(0,h.indexOf('id="why"'));
  assert.ok(hero.includes('<p class="label">HOUSE OF TANGENTS</p><h1>Good ideas rarely move in straight lines.</h1>'));
  assert.ok(text(hero).includes('We find a different angle, then do the work to make it happen. House of Tangents brings brand thinking into the same room as the people making and marketing the work.'));
  assert.match(hero,/<a class="btn primary" href="\/work">Explore our work<\/a><a class="btn ghost" href="\/contact">Tell us your brief<\/a>/);
  assert.ok(text(hero.replace(/<figure[\s\S]*?<\/figure>/,'')).split(' ').filter(Boolean).length<60,'hero copy is too long');
});
test('homepage film reference: supplied wording, attributed, with no violent imagery or new Hindi',()=>{
  const h=main('index.html'),sec=h.slice(h.indexOf('id="why"'),h.indexOf('id="hot-results"')),t=text(sec);
  for(const s of [WASSEYPUR.heading,WASSEYPUR.body,WASSEYPUR.closing,'Gangs of Wasseypur Part II'])assert.ok(t.includes(s),s);
  assert.equal(WASSEYPUR.body,'The tangent and perpendicular reference in Gangs of Wasseypur stayed with us. At House of Tangents, we’ve given that thought a different job. We look beyond the first familiar answer, then stay involved until the idea becomes work people can actually encounter.');
  // Hindi appears only inside the supplied dialogue, on the two pages that carry the reference
  for(const f of allPages){const hindi=(text(read(f)).match(/[ऀ-ॿ]+/g)||[]).join('');
    const inAlt=(read(f).match(/alt="[^"]*[ऀ-ॿ]/g)||[]).length;assert.equal(inAlt,0);
    if(['index.html','tangent-media/index.html'].includes(f))assert.equal(hindi,(WASSEYPUR.dialogue.match(/[ऀ-ॿ]+/g)||[]).join(''),f);else assert.equal(hindi,'',f)}
  assert.ok(!/blade|blood|knife/i.test(page('index.html')));
});
test('homepage HOT Results: four separate evidence cards with their labels, plus the five-project strip',()=>{
  const h=main('index.html'),sec=h.slice(h.indexOf('id="hot-results"'),h.indexOf('id="hot-media"')),t=text(sec);
  const want=[['capitol-hill','800%+ organic reach growth.','Within the first two months.'],['majestic-india','Approximately 300 qualified enquiries.','Contestant lead campaigns over approximately three to five months.'],['black','Five to ten bookings a day, reported around ‘Black turns 2’.','The anniversary campaign used no Google or Meta ad spend.'],['santhal-strikers','832 followers in 20 days.','No paid follower acquisition.']];
  assert.equal((sec.match(/<article class="ev">/g)||[]).length,4);
  for(const [slug,claim,label] of want){const card=sec.split('<article class="ev">').find(c=>c.includes(`href="/work/${slug}"`));assert.ok(card,slug);const ct=text(card);assert.ok(ct.includes(claim)&&ct.includes(label),slug);assert.ok(ct.includes('Read the case study'))}
  assert.deepEqual([...sec.slice(sec.indexOf('class="ev-strip"')).matchAll(/href="\/work\/([a-z-]+)"/g)].map(m=>m[1]).slice(0,5),['shambhavi','zoi','sanatni','the-pi','dimechain']);
  assert.ok(sec.includes('href="/hot-results">Explore HOT Results'));
  assert.ok(!/combined|in total|altogether|\btotal of\b/i.test(t),'results must not be added together');
});
test('homepage HOT Media leads with the six listed projects and never autoplays',()=>{
  const h=main('index.html'),sec=h.slice(h.indexOf('id="hot-media"'),h.indexOf('aria-labelledby="needs-h"'));
  const tiles=sec.split('<article class="mt"').slice(1);assert.equal(tiles.length,6);
  assert.deepEqual(tiles.map(t=>t.match(/<h3><a href="\/work\/([a-z-]+)"/)[1]).sort(),['grenx','majestic-india','navdurga','santhal-strikers','saregama','zoha']);
  const sar=tiles.find(t=>t.includes('/work/saregama'));assert.ok(/Approval and publication pending in the November 2026 record/.test(sar));assert.ok(!/data-video|data-local|<video/.test(sar),'the pending film must not be playable');
  for(const t of tiles)assert.match(t,/<p class="meta">[^<]+<\/p><h3>/);
  assert.ok(sec.includes('href="/hot-media">Explore HOT Media'));
  for(const f of allPages)for(const v of read(f).match(/<video[^>]*>/g)||[])assert.ok(!/\sautoplay/.test(v)&&/preload="none"/.test(v),f);
});
test('homepage: four service links, both Tangent Media teasers, four equal team entries, invitation and footer',()=>{
  const h=main('index.html'),t=text(h);
  const links=[...h.slice(h.indexOf('class="svc-links"')).matchAll(/<a href="\/services#([a-z]+)">/g)].map(m=>m[1]).slice(0,4);assert.deepEqual(links,['brand','content','marketing','digital']);
  for(const s of ['The brief was to show a business park. The park wasn’t built.','See where the brief took a turn','Sometimes, the right angle is to keep it simple.','See the thinking behind Black','The roles give you a starting point. Our involvement crosses over because the brief usually does.','Meet the team','You don’t need a finished brief. Tell us about the business and where you’re getting stuck.'])assert.ok(t.includes(s),s);
  const people=h.slice(h.indexOf('class="people"'),h.indexOf('</ul>',h.indexOf('class="people"')));
  assert.equal((people.match(/<li>/g)||[]).length,4);for(const m of TEAM)assert.ok(people.includes(`<h3>${m.name}</h3><p class="role">${m.role.replace('&','&amp;')}</p><p>${m.bio}</p>`),m.name);
  assert.ok(people.includes('Founder, Brand &amp; Creative Director'));
  const foot=read('index.html');const ft=foot.slice(foot.indexOf('<footer'));
  for(const s of ['logo-lavender','Good ideas rarely move in straight lines.','href="/credits">Credits &amp; notes',`mailto:${SITE.email}`,SITE.phoneHref])assert.ok(ft.includes(s),s);
  assert.ok(!/instagram|facebook\.com|linkedin\.com|twitter\.com|<address/i.test(ft),'no unverified social links or office address');
});

/* =================== work index =================== */
test('work index: supplied heading, two independent filter groups, every project discoverable',()=>{
  const h=read('work/index.html');has('work/index.html','Different businesses. Different starting points.');
  has('work/index.html','Some needed their first identity. Others needed an online presence that reflected what they’d already built. Explore the work by the problem, the output or the kind of business.');
  const chips=g=>[...h.slice(h.indexOf(`data-fgroup="${g}"`),h.indexOf('</div>',h.indexOf(`data-fgroup="${g}"`))).matchAll(/<button[^>]*>([^<]+)</g)].map(m=>dec(m[1]));
  assert.deepEqual(chips('chapter'),['All work','HOT Results','HOT Media','Brand identities']);
  assert.deepEqual(chips('sector'),['All sectors','Hospitality','Beauty & wellness','Sports','Personal branding','Technology & products','Property','Jewellery','Consumer brands']);
  assert.match(h,/role="group" aria-labelledby="fl-chapter"/);assert.match(h,/role="group" aria-labelledby="fl-sector"/);
  const grid=h.slice(h.indexOf('id="work-grid"'),h.indexOf('<p class="empty"'));
  for(const p of projects)assert.ok(grid.includes(`<a href="/work/${p.slug}">`),p.slug);
  assert.equal((grid.match(/class="went lead/g)||[]).length,projects.filter(p=>p.lead).length);
  assert.ok(projects.filter(p=>p.lead).length>=4&&projects.filter(p=>!p.lead).length>=10,'not every project gets the same prominence');
  for(const p of projects){const li=grid.split('<li class="went').find(x=>x.includes(`href="/work/${p.slug}"`));assert.ok(li.includes(dec(p.challenge).replace(/&/g,'&amp;')),p.slug+' brief');assert.ok(/<ul class="tags"><li>/.test(li))}
});
test('AVN Grand, Kalinga India and The Lobby Café are related but individually discoverable; Moksh has sections for its venues',()=>{
  for(const s of ['avn-grand','kalinga','lobby-cafe'])assert.ok(fs.existsSync(path.join(ROOT,'work',s,'index.html')));
  for(const s of ['kalinga','lobby-cafe']){assert.equal(by[s].partOf,'avn-grand');assert.match(read(`work/${s}/index.html`),/<dt>Part of<\/dt><dd><a class="link" href="\/work\/avn-grand">Hotel AVN Grand/);assert.ok(by[s].related.includes('avn-grand'))}
  assert.ok(['kalinga','lobby-cafe'].every(s=>by['avn-grand'].related.includes(s)));
  const m=read('work/moksh/index.html');for(const id of ['moksh-parent','sora','solace','sparrow'])assert.ok(m.includes(`<article class="part" id="${id}">`),id);
  assert.ok(text(m).includes('pool-table café'));assert.ok(!/swimming/i.test(text(m)));
  assert.ok(read('work/capitol-hill/index.html').includes('<article class="part" id="aura">'));
});
test('additional experience is listed with its limited scope; School of Sports is omitted everywhere',()=>{
  const t=page('work/index.html');assert.ok(t.includes('These were limited pieces of work or earlier records, not full-service engagements.'));
  for(const a of ADDITIONAL){assert.ok(t.includes(a.name),a.name);assert.ok(t.includes(a.scope),a.name)}
  for(const f of allPages)assert.ok(!/School of Sports/i.test(read(f)),f);
  assert.ok(!/School of Sports/i.test(read('content/projects.json')+read('content/pages.mjs')));
});

/* =================== HOT Results =================== */
test('HOT Results: five categories, and every story has the five parts',()=>{
  const h=main('hot-results/index.html'),t=text(h);has('hot-results/index.html','The work went out. People responded.');
  for(const g of ['Hospitality and discovery','Beauty and appointment enquiries','Pageants and personal branding','Sports and audience building','Product introductions and professional audiences'])assert.ok(h.includes(`>${g}</h2>`),g);
  const stories=h.split('<article class="rstory"').slice(1);assert.equal(stories.length,11);
  for(const s of stories){for(const part of ['The starting point','The decision we made','What our team delivered','The reported response'])assert.ok(s.includes(part),part);assert.ok(/class="note"><b>Context:<\/b>/.test(s),'context note')}
  for(const slug of ['capitol-hill','zoi','black','majestic-india','shambhavi','santhal-strikers','sanatni','the-pi','dimechain','grenx'])assert.ok(h.includes(`id="r-${slug}"`),slug);
  for(const slug of ['avn-grand','kalinga','lobby-cafe'])assert.ok(h.includes(`href="/work/${slug}"`),slug);
  assert.ok(t.includes('The earlier case-study figures were supplied without reporting windows.'));
});
test('every result record states its source, and none invents revenue, ROAS or conversion rates',()=>{
  let n=0;
  for(const f of [...casePages,'hot-results/index.html']){const h=read(f);for(const li of h.split('<ol class="records">').slice(1).flatMap(b=>b.split('</ol>')[0].split('<li>').slice(1))){n++;assert.match(li,/<span class="fig">[^<]+<\/span>/);assert.match(li,/<p class="rec-meta">[^<]*Source: /,f)}}
  assert.ok(n>=50,'records rendered: '+n);
  for(const p of projects)for(const r of p.results)assert.ok(r.value&&r.metric&&r.source,p.slug);
  for(const f of allPages)assert.ok(!/\bROAS\b|return on ad spend|conversion rate|\brevenue (grew|growth|increase)|₹|\bINR\b/i.test(page(f)),f);
  for(const p of projects.filter(p=>!p.results.length))assert.ok(!read(`work/${p.slug}/index.html`).includes('<ol class="records">'),p.slug+' has no numbers to show');
});
test('qualitative feedback is never turned into a metric',()=>{
  const gx=read('work/grenx/index.html');assert.ok(text(gx).includes('The client reported good entries and leads. No count was supplied.'));assert.ok(!gx.includes('class="fig"'));
  const kal=text(read('work/kalinga/index.html'));assert.ok(kal.includes('Valentine’s Day activity received strong bookings. No numerical booking data was supplied.'));
  for(const s of ['navdurga','zoha','saregama','avn-grand','dense'])assert.ok(!read(`work/${s}/index.html`).includes('<ol class="records">'),s);
});

/* =================== claim checks from the brief =================== */
test('paid and organic results are kept apart',()=>{
  const rec=(slug,val)=>{const h=read(`work/${slug}/index.html`);const li=h.split('<li>').find(x=>x.startsWith(`<span class="fig">${val}`));assert.ok(li,`${slug} ${val}`);return text(li)};
  assert.match(rec('majestic-india','~300'),/Paid lead campaigns/);assert.match(rec('majestic-india','700K–800K'),/Organic/);
  assert.ok(text(read('work/majestic-india/index.html')).includes('Paid lead generation and organic reel views are separate results.'));
  assert.match(rec('black','5 to 10'),/No Google or Meta ad spend/);
  assert.ok(text(read('work/black/index.html')).includes('Other campaigns in the wider engagement used paid ads, so the zero-spend note applies to the anniversary campaign only.'));
  assert.match(rec('shambhavi','2 videos'),/Organic\. No boosted posts and no profile ads/);
  assert.match(rec('santhal-strikers','832'),/No paid follower acquisition/);
  assert.ok(text(read('work/santhal-strikers/index.html')).includes('Advertising support was part of the scope.'));
  assert.match(rec('dimechain','0 to 584'),/Paid or organic basis not recorded/);
  assert.match(rec('sanatni','1M+'),/Organic/);assert.ok(text(read('work/sanatni/index.html')).includes('They are not attributed to the reel.'));
  assert.ok(text(read('work/navdurga/index.html')).includes('No ads ran on these videos.'));
});
test('sponsor-acquisition credit and production credit are stated correctly',()=>{
  const t=s=>text(read(`work/${s}/index.html`));
  assert.ok(t('majestic-india').includes('The founder secured the sponsors. Our team made their communication.'));
  assert.ok(t('dense').includes('Our team didn’t shoot the food itself.'));
  assert.ok(t('saregama').includes('Footage supplied by the shooting team.'));assert.ok(!/we shot|our shoot|commissioned by Saregama/i.test(t('saregama')));
  assert.ok(t('sanatni').includes('App engineering was not our scope.'));assert.ok(t('the-pi').includes('Manufacturing and native app development were not our scope.'));
  assert.ok(t('avn-grand').includes('The hotel’s original logo is not our work.'));assert.ok(t('unfaked').includes('The detection technology is not our work.'));
  assert.ok(t('quzones').includes('The logo and the engineering are not our work.'));
  const m=text(read('hot-media/index.html'));assert.ok(m.includes('using footage supplied by the shooting team'));assert.ok(m.includes('Local photographers and videographers shot the food to our briefs.'));
});
test('no pending app, property or video is shown as launched',()=>{
  const st=s=>{let h=read(`work/${s}/index.html`);h=h.slice(h.indexOf('<dl class="facts">'),h.indexOf('</dl>'));return (h.match(/<span class="status st-[a-z]+"><i aria-hidden="true"><\/i>([^<]+)</)||[])[1]};
  assert.equal(st('saregama'),'Publication pending');assert.equal(st('moksh'),'Property upcoming');
  for(const s of ['fluffypet','bioecko','dense','black','shafaf','grenx','kalinga','avn-grand','lobby-cafe'])assert.equal(st(s),'Ongoing (Nov 2026)',s);
  for(const s of ['the-pi','dimechain','quzones','ifitme','unfaked'])assert.equal(st(s),undefined,s+' has no recorded status, so none is claimed');
  const t=s=>text(read(`work/${s}/index.html`));
  assert.ok(t('fluffypet').includes('Public launch pending in the November 2026 record.'));assert.ok(t('bioecko').includes('Application in development in the November 2026 record'));
  assert.ok(t('moksh').includes('The property is upcoming, and websites and launch marketing remained future work.'));
  assert.ok(t('saregama').includes('Management approval and publication were pending in the November 2026 record.'));
  // the pending Saregama film is not playable anywhere on the site
  assert.equal(by.saregama.videos.length,0);
  for(const f of allPages){const h=read(f);for(const tile of h.split(/<article class="(?:mt|story)"/).slice(1))if(tile.slice(0,1500).includes('Saregama'))assert.ok(!/data-video|data-local|<video/.test(tile.split('</article>')[0]),f)}
  for(const f of allPages)assert.ok(!/1F-EZu5xVFRoIbqj3uoukfAZlFcl-ShDh/.test(read(f)),'unapproved BTS file id in '+f);
  for(const p of projects.filter(p=>['Pending','Not recorded'].includes(p.status))){const h=read(`work/${p.slug}/index.html`);assert.ok(!h.slice(h.indexOf('<main'),h.indexOf('Related work')).includes('st-delivered"'),p.slug)}
});
test('JT20 / Santhal Strikers and Shambhavi Shiva are both present and clearly distinct',()=>{
  const a=text(read('work/santhal-strikers/index.html')),b=text(read('work/shambhavi/index.html'));
  assert.ok(a.includes('JT20 / Santhal Strikers')&&a.includes('Santhal ka dum. Jeetenge hum.')&&a.includes('832'));
  assert.ok(b.includes('Shambhavi Shiva')&&b.includes('JT20 Baithki with Shambhavi')&&b.includes('Pitchside with Shambhavi')&&b.includes('2 videos'));
  assert.ok(!b.includes('832')&&!a.includes('Jyotirlinga'));
  assert.ok(b.includes('The guests appeared across different episodes.'));
  const w=read('work/index.html');assert.ok(w.includes('href="/work/santhal-strikers"')&&w.includes('href="/work/shambhavi"'));
  assert.notEqual(by['santhal-strikers'].sector,by.shambhavi.sector);
});
test('other record details: dates, names and cautions',()=>{
  const t=s=>text(read(`work/${s}/index.html`));
  assert.ok(t('santhal-strikers').includes('9 to 23 June'));assert.ok(t('majestic-india').includes('approximately ten logo routes'));
  assert.ok(t('black').includes('two free haircuts'));assert.ok(t('zoi').includes('Life at ZOI'));
  for(const f of allPages)assert.ok(!/\bZoe\b|sports car|shadowban/i.test(page(f)),f);
  assert.ok(t('shafaf').includes('The underlying broom business was established in 1960.'));
  assert.ok(t('fluffypet').includes('It is not the product’s founding date.'));
  assert.ok(t('zoha').includes('Website, print and enquiry handling were not in scope.'));
  assert.ok(t('ifitme').includes('associated with Dubai'));assert.ok(!/launched in Dubai/i.test(t('ifitme')));
  const nav=text(main('work/navdurga/index.html').replace(/alt="[^"]*"/g,''));assert.ok(!/\d+\s?(km|kms|kilometres)\b/i.test(nav),'no distances in our own copy');
  assert.ok(nav.includes('They are not footage of completed construction.'));
});

/* =================== case studies =================== */
test('every case study is populated: introduction, challenge, approach, delivered scope, outcome or status, related work',()=>{
  for(const p of projects){const h=read(`work/${p.slug}/index.html`),t=text(h);
    for(const s of ['Introduction','The challenge','Our approach','Delivered scope','Outcome and status','Credits and notes','Related work','Next project'])assert.ok(h.includes(s),`${p.slug}: ${s}`);
    assert.ok(t.includes(p.challenge)&&t.includes(p.approach)&&t.includes(p.overview[0]),p.slug);
    for(const d of p.deliverables)assert.ok(t.includes(d),`${p.slug}: ${d}`);
    assert.ok(text(h.slice(h.indexOf('<main'),h.indexOf('Related work'))).split(' ').length>170,p.slug+' is thin');
    assert.match(h,/<dt>Client<\/dt>/);assert.match(h,/<dt>Sector<\/dt>/)}
});
test('case-study layout varies with the project: three hero types and three section orders',()=>{
  const hs=Object.fromEntries(projects.map(p=>[p.slug,read(`work/${p.slug}/index.html`)]));
  assert.ok(hs['majestic-india'].includes('case-hero media'));assert.ok(hs['capitol-hill'].includes('case-hero evidence'));assert.ok(hs['moksh'].includes('case-hero type'));
  assert.ok(Object.values(hs).some(h=>h.includes('case-a'))&&Object.values(hs).some(h=>h.includes('case-b')));
  const pos=(h,a,b)=>h.indexOf(`<h2 class="label">${a}</h2>`)<h.indexOf(`<h2 class="label">${b}</h2>`);
  assert.ok(pos(hs.navdurga,'Project media','The challenge'),'media-led work shows the work first');
  assert.ok(pos(hs.moksh,'The four identities','The challenge'),'identity-led work shows the identities first');
  assert.ok(pos(hs['capitol-hill'],'The challenge','Delivered scope'));
});

/* =================== HOT Media and Brand identities =================== */
test('HOT Media: six output filters, captions on every asset, typographic entries where no asset exists',()=>{
  const h=read('hot-media/index.html');has('hot-media/index.html','The idea has to become something.');
  const chips=[...h.slice(h.indexOf('data-fgroup="type"'),h.indexOf('</div>',h.indexOf('data-fgroup="type"'))).matchAll(/<button[^>]*>([^<]+)</g)].map(m=>dec(m[1]));
  assert.deepEqual(chips,['All media','Films and edits','AI visualisation','Campaign creative','Websites','Print and merchandise','Brand applications']);
  assert.equal((h.match(/data-item data-type="/g)||[]).length,MEDIA_ITEMS.length);
  for(const k of Object.keys(MEDIA_TYPES))assert.ok(MEDIA_ITEMS.some(m=>m.type===k),'no items of type '+k);
  for(const m of MEDIA_ITEMS)assert.ok(text(h).includes(m.did),m.id+' caption');
  const tiles=h.split('<article class="mt"').slice(1);assert.equal(tiles.length,MEDIA_ITEMS.filter(m=>m.video||m.image).length);
  for(const t of tiles)assert.ok(/<img |class="mt-top mt-play mt-plate dark"/.test(t));
  assert.ok(!/upload image here|placeholder|lorem ipsum|coming soon|image here/i.test(page('hot-media/index.html')));
});
test('Brand identities: all fourteen entries, with explorations separated from approved work',()=>{
  const h=read('brand-identities/index.html'),t=text(h);has('brand-identities/index.html','The logo is where the identity begins.');
  const names=['Majestic India','Kalinga India','The Lobby Café','Aura','Sanatni','The Pi','FluffyPet','BioEcko','Dimechain','Shafaf','Moksh','Sora','Solace','Sparrow'];
  assert.deepEqual(IDENTITIES.map(e=>e.name),names);assert.equal((h.match(/<article class="id-entry/g)||[]).length,14);
  for(const e of IDENTITIES){assert.ok(t.includes(e.scope),e.name);assert.ok(h.includes(`href="${e.href}"`),e.name)}
  assert.equal((h.match(/<dt>Design explorations<\/dt>/g)||[]).length,2);
  assert.ok(t.includes('The underlying business was established in 1960.'));assert.ok(t.includes('The property is upcoming.'));
  assert.ok(t.includes('A design credit doesn’t mean packaging was printed or a venue has opened.'));
  assert.ok(!/<img src="[^"]*logo/i.test(h.slice(h.indexOf('<main'),h.indexOf('</main>'))),'no fabricated client logos');
});

/* =================== Services, About, Tangent Media, Contact, Credits =================== */
test('Services: four sections with the supplied one-liners, scope, examples and tailored enquiry links',()=>{
  const h=read('services/index.html'),t=text(h);has('services/index.html','We work from the first idea to the final file.');
  has('services/index.html','We can start with what your business has today. We help decide what it needs to communicate, then build the work and the next step around that.');
  const want={brand:['We give the business an introduction it can keep building on.','Talk to us about your brand'],content:['We choose the production method that serves the idea.','Discuss a production brief'],marketing:['We connect what the brand says with a reason to respond.','Plan your next campaign'],digital:['A click should lead somewhere that makes sense.','Discuss your digital experience']};
  for(const s of SERVICES){const sec=h.slice(h.indexOf(`<article class="svc-sec" id="${s.id}">`)).split('</article>')[0],st=text(sec);
    assert.ok(st.includes(want[s.id][0])&&st.includes(s.body),s.id);for(const x of ['When you need it','What we handle','Project examples'])assert.ok(st.includes(x),x);
    for(const x of s.scope)assert.ok(st.includes(x),`${s.id}: ${x}`);
    assert.ok(sec.includes(`<a class="btn ghost" href="/contact?service=${s.id}">${want[s.id][1]}</a>`),s.id+' CTA');
    for(const e of s.examples)assert.ok(sec.includes(typeof e==='string'?`href="/work/${e}"`:`href="/work/${e.slug}#${e.hash}"`),s.id+' example')}
  assert.match(h,/<nav class="svc-index" aria-label="Services on this page">/);assert.match(h,/<details class="svc-jump"><summary>Jump to a service<\/summary>/);
  assert.ok(t.includes('Not every project includes every deliverable'));
  assert.ok(!/guarantee[ds]? (first|top|#1|ranking)|pricing|per month|package[s]? from/i.test(t));
});
test('About: people first, exact biographies of comparable length, four process stages, no invented titles',()=>{
  const h=read('about/index.html'),t=text(h);has('about/index.html','A small team with a wider view of the work.');
  assert.ok(t.includes('Farha Fatima founded House of Tangents with experience across technology consulting, sales and marketing.'));
  for(const m of TEAM)assert.ok(h.includes(`<h3>${m.name}</h3><p class="role">${m.role.replace('&','&amp;')}</p><p>${m.bio}</p>`),m.name);
  assert.equal((h.match(/<article class="profile">/g)||[]).length,4);
  const len=TEAM.map(m=>m.bio.split(' ').length);assert.ok(Math.max(...len)-Math.min(...len)<=14,'biography lengths: '+len);
  assert.deepEqual(PROCESS.map(s=>s.title),['Understand what needs to change.','Find a useful direction.','Make and deliver the work.','Review the response and improve.']);
  for(const s of PROCESS)assert.ok(t.includes(s.title)&&t.includes(s.text));
  assert.ok(t.includes(NOTES.collective)&&t.includes('Specialist collaborators join according to the project.'));
  for(const f of allPages)assert.ok(!/co-?founder/i.test(page(f)),f);
});
test('Tangent Media: five delivered stories in the five-part structure, and proposals kept visibly separate',()=>{
  const h=read('tangent-media/index.html'),t=text(h);has('tangent-media/index.html','Here’s where the brief took a turn.');
  const titles=['The park wasn’t built. We planned the visit.','The shoot couldn’t wait for the logo.','Before the player introduction, we listened.','The decision was to keep showing the work.','Everyone in the room needed to be in the film.'];
  assert.deepEqual(STORIES.map(s=>s.title),titles);
  const stories=h.split('<article class="story"').slice(1);assert.equal(stories.length,5);
  for(const s of stories){for(const part of ['The brief','What was getting in the way','The turn in the thinking','How we made it','The finished work'])assert.ok(s.includes(`<dt>${part}</dt>`),part);assert.ok(s.includes('Delivered story'))}
  assert.ok(t.includes('Proposed infrastructure visualisation.'));
  assert.ok(t.includes(WASSEYPUR.heading)&&t.includes('Gangs of Wasseypur Part II'));
  const ideas=h.slice(h.indexOf('id="ideas"'));assert.ok(h.indexOf('id="ideas"')>h.lastIndexOf('<article class="story"'));
  assert.ok(text(ideas).includes('Ideas we’re developing'));assert.equal((ideas.match(/<p class="prop-flag">Proposed format<\/p>/g)||[]).length,2);
  assert.deepEqual(IDEAS.map(i=>i.title),['The Brief Took a Turn','Angle / Execution']);
  for(const i of IDEAS)for(const dt of ['Required footage','Production approach','Intended placement'])assert.ok(ideas.includes(`<dt>${dt}</dt>`),dt);
  assert.ok(!/class="fig"|views|followers|reach/i.test(text(ideas.split('</section>')[0])),'no invented reach on proposals');
  for(const f of ['index.html','work/index.html','hot-results/index.html','hot-media/index.html','brand-identities/index.html',...casePages])assert.ok(!/Proposed format|Angle \/ Execution/.test(read(f)),'proposal shown outside Tangent Media: '+f);
});
test('Contact: supplied heading, the listed fields with visible labels, and the multi-select of services',()=>{
  const h=read('contact/index.html');has('contact/index.html','Start with the business. We’ll help shape the brief.');
  has('contact/index.html','Tell us what you’re working on, what needs to change and when you need to move.');
  const labels=[...h.matchAll(/<label for="cf-[a-z]+">([^<]+)/g)].map(m=>m[1].trim());
  assert.deepEqual(labels,['Name','Work email','Company or project','Brief description','Timeline (optional)','Budget range (optional)']);
  assert.match(h,/<fieldset class="checks"><legend>What do you need help with\?<\/legend>/);
  assert.deepEqual([...h.matchAll(/<input type="checkbox" name="services" value="([^"]+)"/g)].map(m=>m[1]),['Brand strategy and identity','Content and production','Marketing and campaigns','Websites and digital journeys','I’m still working that out']);
  assert.match(h,/<button class="btn submit" type="submit">Send your brief<\/button>/);
  assert.match(h,/<input id="cf-email" name="email" type="email" autocomplete="email" required aria-required="true"/);
  assert.match(h,/<div class="hp" aria-hidden="true" inert>/);
  assert.ok(h.includes(`mailto:${SITE.email}`)&&h.includes(SITE.phoneHref));
});
test('Credits & notes carries the two supplied statements, the film note and dated statuses',()=>{
  const t=page('credits/index.html');
  assert.ok(t.includes('This site presents selected collective team experience across client work, product engagements and earlier agency roles. Contributions and scope vary by project.'));
  assert.ok(t.includes('Project results come from team records, supplied case studies and client-reported feedback. Reporting periods are stated where available. Historical results are not guarantees of future performance.'));
  assert.ok(t.includes('Gangs of Wasseypur Part II')&&t.includes('our own interpretation')&&t.includes('has no association with the film'));
  assert.ok(t.includes('Statuses are a snapshot from the November 2026 project record.'));
  for(const f of allPages)assert.ok(read(f).includes('href="/credits">Credits &amp; notes</a>'),f+' footer link');
});

/* =================== copy rules =================== */
test('copy rules: no em dashes and none of the banned expressions on any page or in any content file',()=>{
  const banned=/\bdelve[sd]?\b|\bcrucial\b|\bpivotal\b|\btapestry\b|\bleverag(e|es|ed|ing)\b|\brobust\b|\bseamless(ly)?\b|in today[’']s world|it[’']s important to note|\bmoreover\b|\bin conclusion\b/i;
  for(const f of allPages){const h=read(f);assert.ok(!h.includes('—'),'em dash in '+f);const m=text(h).match(banned);assert.ok(!m,`${f}: ${m&&m[0]}`)}
  for(const f of ['content/projects.json','content/pages.mjs','content/site.mjs','content/media.json','site.js','api/contact.js','styles.css']){const s=read(f);assert.ok(!s.includes('—'),'em dash in '+f);assert.ok(!banned.test(s),f)}
});
test('no placeholder copy, fake ratings or invented testimonials',()=>{
  for(const f of allPages){const t=page(f);assert.ok(!/upload image here|lorem ipsum|\bTBD\b|\bTODO\b|placeholder/i.test(t),f);
    assert.ok(!/"@type":"(AggregateRating|Review)"|ratingValue/.test(read(f)),f)}
  const quotes=allPages.flatMap(f=>[...read(f).matchAll(/<figure class="tq"><blockquote>([^<]+)</g)].map(m=>m[1]));
  assert.ok(quotes.length>=1&&quotes.every(q=>q==='“Guests appreciate the work, and many even ask who handles our marketing.”'),'only the one supplied testimonial');
});
test('metadata: unique titles and descriptions, canonical, social image, one h1, valid structured data',()=>{
  const titles=new Set(),descs=new Set();
  for(const f of [...mainPages,...casePages]){const h=read(f);
    const t=h.match(/<title>(.*?)<\/title>/)[1],d=h.match(/<meta name="description" content="([^"]+)"/)[1];
    assert.ok(!titles.has(t),'dup title '+t);titles.add(t);assert.ok(!descs.has(d),'dup description '+f);descs.add(d);assert.ok(d.length>=50,f);
    assert.match(h,/<link rel="canonical" href="https:\/\/house-of-tangents\.vercel\.app/);assert.match(h,/<meta property="og:image" content="https:\/\/house-of-tangents\.vercel\.app\/assets\/og\.png">/);
    assert.equal((h.match(/<h1[ >]/g)||[]).length,1,'h1 count '+f);
    for(const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))JSON.parse(m[1])}
  assert.match(read('index.html'),/"@type":"ProfessionalService"/);assert.ok(fs.existsSync(path.join(ROOT,'assets/og.png')));
});

/* =================== structured data and assets =================== */
test('content model: each project has the fields the brief lists, and the asset manifest is editable',()=>{
  for(const p of projects)for(const k of ['name','slug','sector','services','dates','status','overview','challenge','approach','deliverables','results','context','videos','credits','related'])assert.ok(k in p,`${p.slug}.${k}`);
  for(const p of projects)for(const r of p.results)for(const k of ['value','metric','period','basis','source'])assert.ok(k in r,`${p.slug} result.${k}`);
  for(const p of projects)assert.ok(p.sector===null||SECTORS[p.sector],p.slug);
  const a=JSON.parse(read('content/assets.json'));
  for(const k of ['homepageBanner','wasseypurArtwork','teamGroup','teamPortraits','logos','notYetSupplied'])assert.ok(k in a,k);
  assert.deepEqual(Object.keys(a.teamPortraits),TEAM.map(t=>t.id));assert.equal(Object.keys(a.logos).length,14);
});
test('every image has real dimensions and alt text; no missing-asset placeholders are published',()=>{
  for(const f of allPages){const h=read(f);for(const img of h.match(/<img[^>]*>/g)||[]){assert.match(img,/alt="[^"]{8,}"/,'weak alt in '+f);assert.match(img,/width="\d+" height="\d+"/,f)}
    assert.ok(!/src=""|src="undefined|src="null/.test(h),f)}
});

/* =================== design system =================== */
test('colours are defined once as tokens; no black, gradients, shadows, rounded corners or inline SVG',()=>{
  const css=read('styles.css'),root=css.slice(css.indexOf(':root{'),css.indexOf('\n}',css.indexOf(':root{')));
  assert.deepEqual((css.replace(root,'').match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g)||[]),[],'hard-coded colour outside :root');
  assert.deepEqual([...new Set((root.match(/#[0-9a-fA-F]{6}\b/g)||[]).map(h=>h.toUpperCase()))].sort(),['#2A2550','#3E3968','#8DB9F0','#E9E8F8','#F5B69E','#FFFFFF']);
  for(const bad of ['gradient','box-shadow','text-shadow','backdrop-filter'])assert.ok(!css.includes(bad),bad);
  assert.ok(!/\bblack\b/i.test(css));
  for(const r of [...css.matchAll(/border-radius\s*:\s*([^;}]+)/g)].map(m=>m[1].trim()))assert.equal(r,'0');
  for(const f of allPages)assert.ok(!/<svg/i.test(read(f)),'inline svg in '+f);
  assert.match(css,/'Playfair Display'/);assert.match(css,/'Inter'/);for(const f of allPages)assert.ok(!/fonts\.googleapis|fonts\.gstatic/.test(read(f)),f);
});
test('WCAG AA: every text and surface pair in use clears 4.5:1',()=>{
  const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
  const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const ink='#2A2550',soft='#3E3968';
  for(const [a,b] of [[ink,'#E9E8F8'],[soft,'#E9E8F8'],[ink,'#FFFFFF'],[soft,'#FFFFFF'],[ink,'#8DB9F0'],[ink,'#F5B69E'],['#E9E8F8',ink],['#F5B69E',ink],['#FFFFFF',ink]])assert.ok(cr(a,b)>=4.5,`${a} on ${b} = ${cr(a,b).toFixed(2)}`);
});

/* =================== behaviour in the browser =================== */
const KEY=['/','/work','/hot-results','/hot-media','/brand-identities','/services','/about','/tangent-media','/contact','/credits','/work/capitol-hill','/work/majestic-india','/work/moksh','/work/navdurga'];
test('no horizontal overflow at 360, 375, 768, 1024 and 1440 on every page type',async()=>{
  for(const [w,h] of [[360,800],[375,667],[768,1024],[1024,768],[1440,900]]){const pg=await browser.newPage({viewport:{width:w,height:h}});
    for(const u of KEY){await pg.goto(base+u);const o=await pg.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert.ok(o<=0,`${u} @${w}: overflow ${o}`)}
    await pg.close()}
});
test('rendered colours: no element is black, grey-black or off-palette; nothing has a rounded corner',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:900}});
  for(const u of KEY){await pg.goto(base+u);
    const bad=await pg.evaluate(()=>{const out=[];const near=c=>{const m=c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);if(!m)return false;const a=m[4]===undefined?1:+m[4];return a>0&&Math.max(+m[1],+m[2],+m[3])<=60&&!(+m[1]===42&&+m[2]===37&&+m[3]===80)};
      for(const e of document.body.querySelectorAll('*')){if(['SOURCE','SCRIPT','STYLE','VIDEO','IMG','PICTURE'].includes(e.tagName))continue;const c=getComputedStyle(e);
        for(const k of ['color','backgroundColor'])if(near(c[k]))out.push(e.tagName+'.'+e.className+' '+k+' '+c[k]);
        for(const s of ['Top','Bottom','Left','Right'])if(c['border'+s+'Width']!=='0px'&&near(c['border'+s+'Color']))out.push(e.tagName+'.'+e.className+' border '+c['border'+s+'Color']);
        if(['borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius'].some(k=>c[k]!=='0px'))out.push(e.tagName+'.'+e.className+' radius')}
      return out.slice(0,5)});
    assert.deepEqual(bad,[],u)}
  await pg.close();
});
test('hero headline, body and both buttons are visible without scrolling on phone, tablet and laptop',async()=>{
  for(const [w,h] of [[375,667],[768,1024],[1366,768],[1440,900]]){const pg=await browser.newPage({viewport:{width:w,height:h}});await pg.goto(base+'/');
    const r=await pg.evaluate(()=>{const q=s=>document.querySelector(s).getBoundingClientRect().bottom;return [q('.hero h1'),q('.hero .lead'),q('.hero .btn.primary'),q('.hero .btn.ghost')]});
    assert.ok(r.every(x=>x<=h),`hero overflows ${w}x${h}: ${r}`);await pg.close()}
});
test('desktop Work menu: opens on click, closes on Escape with focus restored, and its links navigate',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:800}});await pg.goto(base+'/about');
  assert.equal(await pg.locator('#work-menu').isVisible(),false);
  await pg.click('.nav-btn');assert.equal(await pg.getAttribute('.nav-btn','aria-expanded'),'true');assert.equal(await pg.locator('#work-menu').isVisible(),true);
  await pg.keyboard.press('Escape');assert.equal(await pg.getAttribute('.nav-btn','aria-expanded'),'false');assert.equal(await pg.evaluate(()=>document.activeElement.className),'nav-btn');
  await pg.focus('.nav-btn');await pg.keyboard.press('Enter');await pg.keyboard.press('Tab');assert.equal(await pg.evaluate(()=>document.activeElement.getAttribute('href')),'/work');
  await pg.click('#work-menu a[href="/hot-results"]');await pg.waitForURL('**/hot-results');
  assert.equal(await pg.textContent('h1'),'The work went out. People responded.');await pg.close();
});
test('mobile menu: expandable Work links, focus trap, Escape, focus return, scroll lock, current page, 44px targets',async()=>{
  const pg=await browser.newPage({viewport:{width:375,height:667}});await pg.goto(base+'/about');
  await pg.click('.menu-btn');assert.equal(await pg.getAttribute('.menu-btn','aria-expanded'),'true');assert.equal(await pg.evaluate(()=>getComputedStyle(document.body).overflow),'hidden');
  assert.equal(await pg.locator('#mobile-menu .mm-group a').first().isVisible(),false,'Work links start collapsed outside the Work section');
  await pg.click('#mobile-menu .mm-group summary');assert.equal(await pg.locator('#mobile-menu .mm-group a[href="/hot-media"]').isVisible(),true);
  assert.equal(await pg.getAttribute('#mobile-menu a[href="/about"]','aria-current'),'page');
  const small=await pg.evaluate(()=>[...document.querySelectorAll('#mobile-menu a,#mobile-menu summary,#mobile-menu button')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<44).map(e=>e.textContent));assert.deepEqual(small,[]);
  for(let i=0;i<16;i++)await pg.keyboard.press('Tab');assert.equal(await pg.evaluate(()=>!!document.activeElement.closest('#mobile-menu')),true,'focus escaped the menu');
  await pg.keyboard.press('Escape');assert.equal(await pg.evaluate(()=>document.getElementById('mobile-menu').hidden),true);
  assert.equal(await pg.evaluate(()=>document.activeElement.classList.contains('menu-btn')),true);assert.equal(await pg.evaluate(()=>document.body.classList.contains('lock')),false);
  await pg.goto(base+'/hot-media');await pg.click('.menu-btn');assert.equal(await pg.locator('#mobile-menu .mm-group a[href="/hot-media"]').isVisible(),true,'Work links are open inside the Work section');
  await pg.click('#mobile-menu .mm-group a[href="/brand-identities"]');await pg.waitForURL('**/brand-identities');await pg.close();
});
test('work filters: chapter and sector combine, the count updates, and an empty result offers a reset',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:900}});await pg.goto(base+'/work');
  const vis=()=>pg.locator('#work-grid .went:not([hidden])').count();
  assert.equal(await vis(),24);
  await pg.click('[data-fgroup=chapter] [data-f=results]');assert.equal(await vis(),projects.filter(p=>p.chapters.includes('results')).length);
  await pg.click('[data-fgroup=sector] [data-f=hospitality]');assert.equal(await vis(),projects.filter(p=>p.chapters.includes('results')&&p.sector==='hospitality').length);
  assert.match(await pg.textContent('.filter-status'),/^Showing 5 projects$/);
  assert.equal(await pg.getAttribute('[data-fgroup=chapter] [data-f=results]','aria-pressed'),'true');assert.equal(await pg.getAttribute('[data-fgroup=chapter] [data-f=all]','aria-pressed'),'false');
  await pg.click('[data-fgroup=chapter] [data-f=identities]');await pg.click('[data-fgroup=sector] [data-f=sports]');
  assert.equal(await vis(),0);assert.equal(await pg.locator('.empty').isVisible(),true);
  await pg.click('[data-reset]');assert.equal(await vis(),24);assert.equal(await pg.locator('.empty').isVisible(),false);
  assert.equal(await pg.locator('#work-grid .went').count(),24,'filtered projects stay in the page for search engines');
  for(const k of Object.keys(SECTORS)){await pg.click(`[data-fgroup=sector] [data-f=${k}]`);assert.equal(await vis(),projects.filter(p=>p.sector===k).length,k);assert.ok(await vis()>=1,k+' is empty')}
  await pg.close();
});
test('HOT Media filter: each output type shows its items and hides empty groups',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:900}});await pg.goto(base+'/hot-media');
  for(const k of Object.keys(MEDIA_TYPES)){await pg.click(`[data-fgroup=type] [data-f=${k}]`);
    assert.equal(await pg.locator('#media-arch [data-item]:not([hidden])').count(),MEDIA_ITEMS.filter(m=>m.type===k).length,k)}
  await pg.click('[data-fgroup=type] [data-f=websites]');assert.equal(await pg.locator('#media-arch .arch').isVisible(),false,'no website assets yet, so the image grid hides');
  await pg.click('[data-fgroup=type] [data-f=all]');assert.equal(await pg.locator('#media-arch [data-item]:not([hidden])').count(),MEDIA_ITEMS.length);await pg.close();
});
test('video: nothing loads before a click; the player opens with a poster, closes on Escape and returns focus',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:900}});await pg.goto(base+'/hot-media');
  assert.equal(await pg.locator('iframe').count(),0);assert.equal(await pg.locator('video').count(),0);
  const local=pg.locator('.mt-play[data-local]').first();assert.ok(await local.locator('img').count()===1,'local films show a poster image');
  await local.click();assert.equal(await pg.locator('dialog[open] video').count(),1);assert.ok((await pg.getAttribute('dialog[open] video','poster')).includes('/assets/media/'));
  assert.equal(await pg.evaluate(()=>document.querySelector('dialog video').muted),false);
  await pg.keyboard.press('Escape');await pg.waitForFunction(()=>!document.querySelector('dialog video'));assert.equal(await pg.evaluate(()=>document.activeElement.hasAttribute('data-local')),true);
  await pg.locator('.mt-play[data-video]').first().click();assert.equal(await pg.locator('dialog[open] iframe').count(),1);
  await pg.keyboard.press('Escape');await pg.waitForFunction(()=>!document.querySelector('iframe'));await pg.close();
});
test('contact form in the browser: inline validation, honest failure, loading state, single submission, success, service preselect',async()=>{
  const pg=await browser.newPage();await pg.goto(base+'/contact?service=content');
  assert.equal(await pg.isChecked('input[data-service=content]'),true,'the service link preselects its option');
  assert.equal((await pg.textContent('#cf .form-status')).trim(),'');
  await pg.click('#cf button[type=submit]');assert.equal(await pg.locator('#cf .err-summary').isVisible(),true);
  for(const id of ['name','email','brief'])assert.equal(await pg.getAttribute('#cf-'+id,'aria-invalid'),'true',id);
  assert.equal(await pg.textContent('#cf-email-e'),'Enter your work email.');
  await pg.fill('#cf-name','Test');await pg.fill('#cf-email','not-an-email');await pg.fill('#cf-brief','A brief');await pg.click('#cf button[type=submit]');
  assert.equal(await pg.textContent('#cf-email-e'),'Enter a valid email address.');
  await pg.fill('#cf-email','t@example.com');await pg.check('input[data-service=brand]');await pg.fill('#cf-timeline','Next month');
  await pg.route('**/api/contact',r=>r.fulfill({status:503,contentType:'application/json',body:'{"ok":false}'}));
  await pg.click('#cf button[type=submit]');await pg.waitForSelector('#cf .form-status.bad');
  assert.match(await pg.textContent('#cf .form-status'),/We couldn’t send your brief/);assert.equal(await pg.locator('#cf .form-status a[href^="mailto:"]').count(),1);
  assert.ok(!/Thank you/.test(await pg.textContent('#cf .form-status')),'no success message when delivery fails');
  await pg.unroute('**/api/contact');let calls=0,body=null;
  await pg.route('**/api/contact',async r=>{calls++;body=JSON.parse(r.request().postData());await new Promise(x=>setTimeout(x,400));await r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'})});
  await pg.click('#cf button[type=submit]');await pg.click('#cf button[type=submit]',{force:true}).catch(()=>{});
  assert.equal(await pg.textContent('#cf button[type=submit]'),'Sending…');assert.equal(await pg.isDisabled('#cf button[type=submit]'),true);
  await pg.waitForSelector('#cf .form-status.ok');assert.match(await pg.textContent('#cf .form-status'),/Thank you\. Your brief has been sent\./);assert.equal(calls,1);
  assert.deepEqual(body.services,['Brand strategy and identity','Content and production']);assert.equal(body.email,'t@example.com');assert.equal(body.timeline,'Next month');assert.equal(body.website,'');
  assert.equal(await pg.textContent('#cf button[type=submit]'),'Send your brief');await pg.close();
});
test('contact API: validates, drops honeypot posts, refuses to fake success, and only accepts the offered services',async()=>{
  const handler=require('../api/contact.js');const saved={...process.env},realFetch=global.fetch;
  const run=async body=>{let out={};const res={setHeader(){},status(c){out.code=c;return this},json(j){out.j=j;return this}};await handler({method:'POST',headers:{'x-forwarded-for':'t'+Math.random()},body},res);return out};
  try{
    for(const k of ['RESEND_API_KEY','CONTACT_FROM','CONTACT_TO'])delete process.env[k];
    let sent=0;global.fetch=async()=>{sent++;return {ok:true}};
    assert.equal((await run({})).code,400);assert.equal((await run({name:'A',email:'bad',brief:'x'})).code,400);
    assert.deepEqual(await run({website:'bot'}),{code:200,j:{ok:true}});
    const un=await run({name:'A',email:'a@b.co',brief:'x'});assert.equal(un.code,503);assert.equal(un.j.ok,false);assert.equal(sent,0,'nothing is sent when no delivery service is configured');
    Object.assign(process.env,{RESEND_API_KEY:'test',CONTACT_FROM:'f@example.com',CONTACT_TO:'t@example.com'});
    let payload;global.fetch=async(u,o)=>{payload=JSON.parse(o.body);return {ok:true}};
    const ok=await run({name:'A',email:'a@b.co',brief:'x<b>',services:['Content and production','Something else']});
    assert.deepEqual(ok,{code:200,j:{ok:true}});assert.ok(payload.html.includes('Content and production')&&!payload.html.includes('Something else'));assert.ok(payload.html.includes('x&lt;b>'));assert.equal(payload.reply_to,'a@b.co');
    global.fetch=async()=>({ok:false});assert.equal((await run({name:'A',email:'a@b.co',brief:'x'})).code,502,'a failed delivery is reported as a failure');
    let res405={};await handler({method:'GET',headers:{}},{setHeader(){},status(c){res405.code=c;return this},json(){return this}});assert.equal(res405.code,405);
  }finally{global.fetch=realFetch;for(const k of ['RESEND_API_KEY','CONTACT_FROM','CONTACT_TO'])if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k]}
});
test('reduced motion: the hero reel stays still; keyboard focus is always visible',async()=>{
  const ctx=await browser.newContext({reducedMotion:'reduce'});const pg=await ctx.newPage();await pg.goto(base+'/');await pg.waitForTimeout(400);
  assert.equal(await pg.evaluate(()=>document.querySelector('[data-reel]').paused),true);assert.equal(await pg.evaluate(()=>document.querySelector('[data-reel-toggle]').hidden),true);
  await pg.keyboard.press('Tab');await pg.keyboard.press('Tab');
  const o=await pg.evaluate(()=>{const c=getComputedStyle(document.activeElement);return [c.outlineStyle,c.outlineWidth]});assert.notEqual(o[0],'none');assert.notEqual(o[1],'0px');await ctx.close();
});
test('touch targets are at least 44px high on mobile, and filter chips are labelled groups',async()=>{
  const pg=await browser.newPage({viewport:{width:375,height:667}});
  for(const u of ['/','/work','/hot-media','/services','/contact','/tangent-media']){await pg.goto(base+u);
    const small=await pg.evaluate(()=>[...document.querySelectorAll('a.btn,button.btn,.chip,.menu-btn,.svc-jump summary,.svc-jump a,.site-footer a,.check,.link-btn,.mt-play')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<44).map(e=>e.className+' '+Math.round(e.getBoundingClientRect().height)));
    assert.deepEqual(small,[],u)}
  await pg.close();
});
test('no console errors or failed requests on any main page',async()=>{
  const pg=await browser.newPage();const errs=[];pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});pg.on('pageerror',e=>errs.push(e.message));
  pg.on('requestfailed',r=>{if(!/drive\.google|\.mp4/.test(r.url()))errs.push('failed '+r.url())});
  for(const u of KEY){await pg.goto(base+u,{waitUntil:'load'});await pg.waitForTimeout(150)}
  assert.deepEqual(errs,[]);await pg.close();
});
