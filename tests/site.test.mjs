// Run with: node --test tests/*.test.mjs   (needs `playwright` resolvable, e.g. the globally installed one)
import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
const ROOT=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'))}catch{({chromium}=createRequire('/usr/lib/node_modules/')('playwright'))}
const projects=JSON.parse(fs.readFileSync(path.join(ROOT,'content/projects.json'),'utf8'));
const MEDIA=JSON.parse(fs.readFileSync(path.join(ROOT,'content/media.json'),'utf8'));
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
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const text=h=>h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' ');
const allPages=['index.html','work/index.html','services/index.html','about/index.html','tangent-media/index.html','contact/index.html','credits/index.html','404.html',...projects.map(p=>`work/${p.slug}/index.html`)];

/* ---------- content rules ---------- */
test('homepage body copy is tight: 700–1,200 words',()=>{
  const h=read('index.html');const main=h.slice(h.indexOf('<main'),h.indexOf('</main>'));
  const n=text(main).split(/\s+/).filter(Boolean).length;console.log('home words',n);assert.ok(n>=700&&n<=1200,'words='+n);
});
test('homepage shows exactly six featured projects, all linking to case studies',()=>{
  const h=read('index.html');const sec=h.slice(h.indexOf('id="work"'),h.indexOf('aria-labelledby="proof-h"'));
  const links=[...sec.matchAll(/href="\/work\/([a-z0-9-]+)"/g)].map(m=>m[1]);
  const uniq=[...new Set(links)];assert.equal(uniq.length,6);
  for(const s of uniq)assert.ok(fs.existsSync(path.join(ROOT,'work',s,'index.html')),s);
  assert.deepEqual(uniq.sort(),projects.filter(p=>p.featured).map(p=>p.slug).sort());
});
test('every project has a case study and appears in the sitemap',()=>{
  const sm=read('sitemap.xml');for(const p of projects){assert.ok(fs.existsSync(path.join(ROOT,'work',p.slug,'index.html')),p.slug);assert.ok(sm.includes('/work/'+p.slug))}
});
test('work page lists all 24 projects, grouped honestly by status',()=>{
  const h=read('work/index.html');assert.equal(projects.length,24);
  const links=new Set([...h.slice(h.indexOf('id="work-grid"')).matchAll(/href="\/work\/([a-z0-9-]+)"/g)].map(m=>m[1]));
  for(const p of projects)assert.ok(links.has(p.slug),'missing '+p.slug);
  const g=(id)=>{const a=h.indexOf(`data-group="${id}"`);const nxt=h.indexOf('data-group="',a+10);return h.slice(a,nxt>0?nxt:h.indexOf('class="band indigo'))};
  for(const p of projects.filter(p=>p.status==='Delivered'))assert.ok(g('Delivered').includes('/work/'+p.slug),p.slug+' not in Delivered');
  for(const p of projects.filter(p=>p.status==='Ongoing'))assert.ok(g('Ongoing').includes('/work/'+p.slug),p.slug+' not in Ongoing');
  for(const p of projects.filter(p=>/confirm|Unpublished/.test(p.status))){assert.ok(g('Confirm').includes('/work/'+p.slug));assert.ok(!g('Delivered').includes('/work/'+p.slug),p.slug+' wrongly under Delivered')}
  assert.ok(projects.filter(p=>p.status==='Unpublished / under review').length>=1);
});
test('proposals never appear as delivered work',()=>{
  assert.ok(!projects.some(p=>/proposed/i.test(p.status)));
  assert.ok(!/Proposal — not yet produced/.test(read('work/index.html')));
  assert.equal((read('tangent-media/index.html').match(/Proposal — not yet produced/g)||[]).length,3);
});
test('metadata: unique titles, canonical, description, one h1',()=>{
  const seen=new Set();
  for(const f of allPages.filter(f=>f!=='404.html')){const h=read(f);
    const t=h.match(/<title>(.*?)<\/title>/)[1];assert.ok(!seen.has(t),'dup title '+t);seen.add(t);
    assert.match(h,/<link rel="canonical" href="https:\/\/house-of-tangents\.vercel\.app/);assert.match(h,/<meta name="description" content="[^"]{30,}/);
    assert.equal((h.match(/<h1[ >]/g)||[]).length,1,'h1 count '+f)}
  assert.match(read('index.html'),/"@type":"ProfessionalService"/);assert.match(read('work/capitol-hill/index.html'),/"@type":"BreadcrumbList"/);
});
test('no encoding artefacts in generated pages',()=>{for(const f of allPages)assert.ok(!/â€|Ã|�/.test(read(f)),f)});
test('case studies follow the requested structure',()=>{
  for(const p of projects){const h=read(`work/${p.slug}/index.html`);
    for(const s of ['Introduction','The challenge','Creative execution','Deliverables','Methodology and credits','Related work','Next project'])assert.ok(h.includes(s),`${p.slug} missing ${s}`);
    assert.match(h,/<dt>Client<\/dt>/);assert.match(h,/<dt>Industry<\/dt>/)}
  assert.ok(read('work/majestic-india/index.html').includes('Project visuals'));
  assert.ok(read('work/capitol-hill/index.html').includes('Results and measurable impact'));
});
test('case studies are not forced into one template: media vs typographic heroes and two body layouts',()=>{
  const hs=projects.map(p=>read(`work/${p.slug}/index.html`));
  assert.ok(hs.some(h=>h.includes('case-hero media'))&&hs.some(h=>h.includes('case-hero type')));
  assert.ok(hs.some(h=>h.includes('case-a'))&&hs.some(h=>h.includes('case-b')));
});

/* ---------- design-system rules ---------- */
test('typography: Playfair Display + Inter, self-hosted, no CDN fonts',()=>{
  const css=read('styles.css');assert.match(css,/'Playfair Display'/);assert.match(css,/'Inter'/);
  for(const f of ['PlayfairDisplay-normal','PlayfairDisplay-italic','Inter-normal'])assert.ok(fs.existsSync(path.join(ROOT,`assets/fonts/${f}.woff2`)));
  for(const f of allPages)assert.ok(!/fonts\.googleapis|fonts\.gstatic/.test(read(f)),f);
});
test('sharp edges everywhere: no border-radius other than 0, no pills or circles',()=>{
  const css=read('styles.css');
  const rules=[...css.matchAll(/border-radius\s*:\s*([^;}]+)/g)].map(m=>m[1].trim());
  for(const r of rules)assert.equal(r,'0','non-zero radius: '+r);
  assert.ok(!/clip-path:\s*circle|border-radius/.test(css.replace(/\*\{box-sizing:border-box;border-radius:0\}/,'').replace(/\/\*[\s\S]*?\*\//g,'')),'stray radius or circle clip');
});
test('no decorative graphics: no inline SVG, curves, dots, diagrams or gradients on any page',()=>{
  for(const f of allPages){const h=read(f);assert.ok(!/<svg/i.test(h),'svg in '+f);
    for(const bad of ['tangent-line','hero-tangent','j-dot','j-line','geo-tile','art-stat','pt"'])assert.ok(!h.includes(bad),`${bad} in ${f}`)}
  const css=read('styles.css');for(const bad of ['gradient','box-shadow','backdrop-filter','text-shadow','filter:blur'])assert.ok(!css.includes(bad),'found '+bad);
});
test('hero shows real project media with a static fallback; no autoplay attribute, no sound',()=>{
  const h=read('index.html');
  assert.match(h,/<video class="reel" data-reel muted loop playsinline preload="none" poster="\/assets\/media\/home\/hero-poster\.webp"/);
  assert.ok(!/<video[^>]*\sautoplay/.test(h));
  for(const f of ['assets/media/home/hero-reel.mp4','assets/media/home/hero-poster.webp'])assert.ok(fs.existsSync(path.join(ROOT,f)),f);
});
test('self-hosted videos never preload and carry an accessible label',()=>{
  for(const f of ['work/majestic-india/index.html','work/navdurga/index.html','tangent-media/index.html']){
    for(const v of read(f).match(/<video[^>]*>/g)||[]){assert.match(v,/preload="none"/);assert.match(v,/aria-label="[^"]+"/);assert.ok(!/autoplay/.test(v))}}
});
test('all referenced local media files exist and every image has alt text',()=>{
  for(const f of allPages){const h=read(f);
    for(const m of h.matchAll(/(?:src|srcset|href|poster)="(\/assets\/[^"\s,]+)/g))assert.ok(fs.existsSync(path.join(ROOT,m[1].split('?')[0])),`${f}: ${m[1]}`);
    for(const img of h.match(/<img[^>]*>/g)||[])assert.match(img,/alt="[^"]{8,}"/,'weak alt in '+f)}
});
test('no horizontal overflow, text clipping or layout break at required viewports',async()=>{
  const urls=['/','/work','/work/capitol-hill','/work/majestic-india','/work/black','/services','/about','/tangent-media','/contact','/credits'];
  for(const [w,h] of [[360,800],[390,844],[768,1024],[1024,768],[1440,900]]){
    const pg=await browser.newPage({viewport:{width:w,height:h}});
    for(const u of urls){await pg.goto(base+u);const o=await pg.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert.ok(o<=0,`${u} @${w}: overflow ${o}`)}
    await pg.close()}
});
test('computed styles: nothing rendered has a non-zero radius; page backgrounds are brand colours',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:900}});
  for(const u of ['/','/work','/work/capitol-hill','/contact']){await pg.goto(base+u);
    const bad=await pg.evaluate(()=>{const r=[];for(const e of document.body.querySelectorAll('*')){if(e.tagName==='SOURCE')continue;const c=getComputedStyle(e);if(['borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius'].some(k=>c[k]!=='0px'))r.push(e.tagName+'.'+e.className)}return r.slice(0,5)});
    assert.deepEqual(bad,[],u+' has rounded elements');
    const bg=await pg.evaluate(()=>getComputedStyle(document.body).backgroundColor);assert.equal(bg,'rgb(233, 232, 248)')}
  await pg.close();
});
test('CTA and positioning visible in first viewport (desktop and mobile)',async()=>{
  for(const [w,h] of [[390,844],[1440,900]]){const pg=await browser.newPage({viewport:{width:w,height:h}});await pg.goto(base+'/');
    const r=await pg.evaluate(()=>{const c=document.querySelector('.hero .btn.primary').getBoundingClientRect();const t=document.querySelector('.hero h1').getBoundingClientRect();return {cb:c.bottom,tb:t.bottom}});
    assert.ok(r.cb<=h,`CTA below fold @${w}`);assert.ok(r.tb<=h);await pg.close()}
});
test('mobile menu: open, trap focus, Escape closes, focus returns, 44px targets',async()=>{
  const pg=await browser.newPage({viewport:{width:390,height:844}});await pg.goto(base+'/');
  await pg.click('.menu-btn');assert.equal(await pg.getAttribute('.menu-btn','aria-expanded'),'true');
  assert.equal(await pg.evaluate(()=>document.body.classList.contains('lock')),true);
  for(let i=0;i<12;i++)await pg.keyboard.press('Tab');
  assert.equal(await pg.evaluate(()=>!!document.activeElement.closest('#mobile-menu')),true,'focus escaped menu');
  await pg.keyboard.press('Escape');
  assert.equal(await pg.evaluate(()=>document.getElementById('mobile-menu').hidden),true);
  assert.equal(await pg.evaluate(()=>document.activeElement.classList.contains('menu-btn')),true,'focus not returned');
  const sz=await pg.evaluate(()=>{const r=document.querySelector('.menu-btn').getBoundingClientRect();return [r.width,r.height]});assert.ok(sz[0]>=44&&sz[1]>=44);
  await pg.close();
});
test('work filter shows/hides by category, hides empty groups, keeps links in DOM',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:900}});await pg.goto(base+'/work');
  const total=await pg.locator('#work-grid .feat,#work-grid .row').count();assert.equal(total,projects.length);
  await pg.click('[data-filter=product]');
  const vis=await pg.locator('#work-grid .feat:not([hidden]),#work-grid .row:not([hidden])').count();
  assert.equal(vis,projects.filter(p=>p.categories.includes('product')).length);
  assert.equal(await pg.locator('#work-grid .feat,#work-grid .row').count(),total);
  const groups=await pg.locator('.wgroup:not([hidden])').count();assert.ok(groups>=1&&groups<=3);await pg.close();
});
test('video dialog loads iframe only on intent, Escape closes, focus returns',async()=>{
  const pg=await browser.newPage();await pg.goto(base+'/work/majestic-india');
  assert.equal(await pg.locator('iframe').count(),0,'iframe present before intent');
  await pg.click('.vbtn');assert.equal(await pg.locator('dialog[open] iframe').count(),1);
  await pg.keyboard.press('Escape');await pg.waitForFunction(()=>!document.querySelector('iframe'));
  assert.equal(await pg.evaluate(()=>document.activeElement.classList.contains('vbtn')),true);await pg.close();
});
test('contact form posts to the real API route on success',async()=>{
  const pg=await browser.newPage();let body=null;
  await pg.route('**/api/contact',async r=>{body=JSON.parse(r.request().postData());await r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'})});
  await pg.goto(base+'/contact');await pg.fill('#cf-name','Test');await pg.fill('#cf-contact','t@example.com');await pg.fill('#cf-need','Brief');await pg.click('#cf button[type=submit]');
  await pg.waitForFunction(()=>document.querySelector('#cf .form-status').textContent.includes('Thank you'));
  assert.equal(body.name,'Test');assert.equal(body.contact,'t@example.com');assert.equal(body.website,'');await pg.close();
});
test('reduced motion: hero reel does not play and there is no pause control',async()=>{
  const ctx=await browser.newContext({reducedMotion:'reduce'});const pg=await ctx.newPage();await pg.goto(base+'/');await pg.waitForTimeout(500);
  assert.equal(await pg.evaluate(()=>document.querySelector('[data-reel]').paused),true);
  assert.equal(await pg.evaluate(()=>document.querySelector('[data-reel-toggle]').hidden),true);await ctx.close();
});
test('no console errors or failed requests on key pages',async()=>{
  const pg=await browser.newPage();const errs=[];pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});pg.on('pageerror',e=>errs.push(e.message));
  pg.on('requestfailed',r=>{if(!/drive\.google|\.mp4/.test(r.url()))errs.push('failed '+r.url())});
  for(const u of ['/','/work','/work/navdurga','/services','/about','/tangent-media','/contact','/credits']){await pg.goto(base+u,{waitUntil:'load'});await pg.waitForTimeout(300)}
  assert.deepEqual(errs,[]);await pg.close();
});

/* ---------- V4: tokens, no black, contrast ---------- */
test('official brand palette is intact; deep indigo replaces every dark; colours are defined once as tokens',()=>{
  const css=read('styles.css');const low=css.toLowerCase();
  for(const ok of ['#8DB9F0','#E9E8F8','#F5B69E','#FFFFFF','#2A2550'])assert.ok(low.includes(ok.toLowerCase()),'missing '+ok);
  for(const bad of ['#3157FF','#C8FF3D','#F7F8FA','#0B0D12','#E9ECF4','#F5F1E6','#E2502F','Bricolage','Manrope','Instrument Serif','Open Sans','gradient','box-shadow'])assert.ok(!low.includes(bad.toLowerCase()),'found '+bad);
  const root=css.slice(css.indexOf(':root{'),css.indexOf('\n}',css.indexOf(':root{')));
  const outside=css.replace(root,'');
  assert.deepEqual(outside.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g)||[],[],'hard-coded colour outside the :root tokens');
  const hexes=[...new Set((root.match(/#[0-9a-fA-F]{6}\b/g)||[]).map(h=>h.toUpperCase()))].sort();
  assert.deepEqual(hexes,['#2A2550','#3E3968','#8DB9F0','#E9E8F8','#F5B69E','#FFFFFF']);
});
test('no black anywhere: no black values in CSS, JS, templates, SVG, or any built page',()=>{
  const files=['styles.css','site.js','assets/favicon.svg','scripts/build.mjs',...allPages];
  const bad=[/#000\b/i,/#000000/i,/#0{1,2}[0-9a-f]{4}\b/i,/#1[0-9a-f]1[0-9a-f]1[0-9a-f]\b/i,/#191919/i,/#2[0-9a-f]2[0-9a-f]2[0-9a-f]\b(?!.*2A2550)/i,/rgba?\(\s*0\s*,\s*0\s*,\s*0/i,/rgba?\(\s*(1\d|2[0-9]|3[0-9])\s*,\s*\1\s*,\s*\1/,/hsla?\([^)]*,\s*[0-9.]+%\s*,\s*(0|[1-9])%/i];
  for(const f of files){let src=read(f);src=src.replace(/Black Salon|Black’s|\/work\/black|black"|Black turns|Black\b/g,'X');
    for(const re of bad)assert.ok(!re.test(src),`${f} matches ${re}`);
    if(/\.(css|js|svg)$/.test(f))assert.ok(!/\bblack\b/i.test(src),`${f} uses the keyword black`)}
});
test('no rendered element is black or near-black (text, background, border, fill)',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:900}});
  const near=(c)=>{const m=c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);if(!m)return false;const a=m[4]===undefined?1:+m[4];return a>0&&Math.max(+m[1],+m[2],+m[3])<=60&&!(+m[1]===42&&+m[2]===37&&+m[3]===80)};
  for(const u of ['/','/work','/work/capitol-hill','/work/majestic-india','/services','/about','/tangent-media','/contact','/credits']){await pg.goto(base+u);
    const bad=await pg.evaluate((nearSrc)=>{const near=eval(nearSrc);const out=[];for(const e of document.body.querySelectorAll('*')){if(['SOURCE','SCRIPT','STYLE','VIDEO','IMG','PICTURE'].includes(e.tagName))continue;const c=getComputedStyle(e);
      const keys=['color','backgroundColor','borderTopColor','borderBottomColor','borderLeftColor','borderRightColor','outlineColor'].concat(e instanceof SVGElement?['fill','stroke']:[]);for(const k of keys)if(c[k]&&near(c[k])&&(k!=='borderTopColor'||c.borderTopWidth!=='0px')&&(k!=='borderBottomColor'||c.borderBottomWidth!=='0px')&&(k!=='borderLeftColor'||c.borderLeftWidth!=='0px')&&(k!=='borderRightColor'||c.borderRightWidth!=='0px')&&(k!=='outlineColor'||c.outlineStyle!=='none'))out.push(e.tagName+'.'+e.className+' '+k+' '+c[k])}return out.slice(0,5)},near.toString());
    assert.deepEqual(bad,[],u+' has black-ish colours')}
  await pg.close();
});
test('WCAG AA: every text/surface pair in use clears 4.5:1',()=>{
  const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
  const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const ink='#2A2550',soft='#3E3968';
  const pairs=[[ink,'#E9E8F8'],[soft,'#E9E8F8'],[ink,'#FFFFFF'],[soft,'#FFFFFF'],[ink,'#8DB9F0'],[soft,'#8DB9F0'],[ink,'#F5B69E'],[soft,'#F5B69E'],['#E9E8F8',ink],['#F5B69E',ink],['#FFFFFF',ink]];
  for(const [a,b] of pairs)assert.ok(cr(a,b)>=4.5,`${a} on ${b} = ${cr(a,b).toFixed(2)}`);
});

/* ---------- V4: copy ---------- */
test('copy: removed wording is gone everywhere; results are ordered and concise',()=>{
  const gone=[/Interim playback/i,/client’s shared Google Drive/i,/If sending doesn’t work/i,/as of 11 November/i,/nonviolent/i,/earlier agency website/i,/loved the approach/i,/Each figure stays with its project/i,/Results, with the context they belong to/i,/supplied case studies, as of/i,/Views and followers are not sales/i];
  for(const f of allPages)for(const re of gone)assert.ok(!re.test(read(f)),`${f}: ${re}`);
  const h=read('index.html');const sec=h.slice(h.indexOf('proof-h'),h.indexOf('aria-labelledby="serv-h"'));
  assert.ok(sec.includes('The work went out, and people responded.'));
  const order=['2 videos','700K–800K','800%+'].map(x=>sec.indexOf(x));assert.ok(order.every(i=>i>0)&&order[0]<order[1]&&order[1]<order[2],'results order');
  assert.ok(!sec.includes('832'));assert.ok(read('work/santhal-strikers/index.html').includes('832'));
  assert.ok(sec.includes('Full context for every figure is on its case study.'));
  assert.ok(h.includes('Narendra Singh')&&h.includes('General Manager, Capitol Hill'));
  assert.ok(read('contact/index.html').includes('Prefer email or a call?'));
  assert.ok(h.includes('Video loads when you press play.'));
});
test('copy: card outcomes, Tangent Media block, and Black Salon name',()=>{
  const by=Object.fromEntries(projects.map(p=>[p.slug,p]));
  assert.equal(by.navdurga.outcome,'Two AI films completed and published organically');
  assert.ok(by.black.outcome.startsWith('4.8/5 Google rating'));assert.ok(by['santhal-strikers'].outcome.includes('116K and 111K views'));
  const h=read('index.html');assert.ok(h.includes('Tangent Media shows the thinking behind our more unexpected work'));assert.ok(h.includes('href="/tangent-media"'));
  assert.ok(read('work/black/index.html').includes('Black Salon'));
});

/* ---------- V4: layout and behaviour ---------- */
test('selected work: six cards with identical media proportions, desktop and mobile',async()=>{
  for(const [w,h] of [[1440,900],[1024,768],[375,667]]){const pg=await browser.newPage({viewport:{width:w,height:h}});await pg.goto(base+'/');
    const r=await pg.evaluate(()=>[...document.querySelectorAll('.sel-media')].map(e=>{const b=e.getBoundingClientRect();return +(b.width/b.height).toFixed(2)}));
    assert.equal(r.length,6);assert.ok(r.every(x=>Math.abs(x-r[0])<0.02),`ratios differ @${w}: ${r}`);
    const imgs=await pg.evaluate(()=>[...document.querySelectorAll('.sel-media img')].every(i=>i.width&&i.height&&i.getAttribute('width')&&i.getAttribute('height')));assert.ok(imgs);await pg.close()}
});
test('results: three across on desktop, stacked on mobile, 832 not on homepage',async()=>{
  const pg=await browser.newPage({viewport:{width:1440,height:900}});await pg.goto(base+'/');
  const d=await pg.evaluate(()=>[...document.querySelectorAll('.res-trio li')].map(e=>Math.round(e.getBoundingClientRect().top)));
  assert.equal(d.length,3);assert.ok(d.every(x=>x===d[0]),'not in one row: '+d);
  await pg.setViewportSize({width:375,height:667});
  const m=await pg.evaluate(()=>[...document.querySelectorAll('.res-trio li')].map(e=>Math.round(e.getBoundingClientRect().top)));
  assert.ok(m[0]<m[1]&&m[1]<m[2],'not stacked: '+m);await pg.close();
});
test('hero headline, subhead and primary button are visible without scrolling (375×667, 768×1024, 1366×768, 1440×900)',async()=>{
  for(const [w,h] of [[375,667],[768,1024],[1366,768],[1440,900]]){const pg=await browser.newPage({viewport:{width:w,height:h}});await pg.goto(base+'/');
    const r=await pg.evaluate(()=>{const q=s=>document.querySelector(s).getBoundingClientRect();return {h1:q('.hero h1').bottom,lead:q('.hero .lead').bottom,cta:q('.hero .btn.primary').bottom}});
    assert.ok(r.h1<=h&&r.lead<=h&&r.cta<=h,`hero overflows ${w}x${h}: ${JSON.stringify(r)}`);await pg.close()}
});
test('one primary and one quieter secondary button style; 44px tap targets on mobile',async()=>{
  const pg=await browser.newPage({viewport:{width:375,height:667}});
  for(const u of ['/','/work','/contact']){await pg.goto(base+u);
    const small=await pg.evaluate(()=>[...document.querySelectorAll('a.btn,button.btn,.chip,.menu-btn')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<44).map(e=>e.className+' '+Math.round(e.getBoundingClientRect().height)));
    assert.deepEqual(small,[],u+' small targets')}
  await pg.goto(base+'/');const s=await pg.evaluate(()=>{const a=getComputedStyle(document.querySelector('.hero .btn.primary')),b=getComputedStyle(document.querySelector('.hero .btn.ghost'));return [a.backgroundColor,b.backgroundColor]});
  assert.notEqual(s[0],s[1]);await pg.close();
});
test('mobile menu: current page marked, closes on link click, locks background scroll',async()=>{
  const pg=await browser.newPage({viewport:{width:375,height:667}});await pg.goto(base+'/work');
  await pg.click('.menu-btn');assert.equal(await pg.evaluate(()=>getComputedStyle(document.body).overflow),'hidden');
  assert.equal(await pg.getAttribute('#mobile-menu a[href="/work"]','aria-current'),'page');
  await pg.click('#mobile-menu a[href="/services"]');await pg.waitForURL('**/services');await pg.close();
});
test('contact form: honeypot is unreachable, failure shows fallback only on failure, success state, loading state, no double submit',async()=>{
  const pg=await browser.newPage();
  const hp=await pg.goto(base+'/contact').then(()=>pg.evaluate(()=>{const w=document.querySelector('#cf .hp'),i=w.querySelector('input');const r=i.getBoundingClientRect();return {aria:w.getAttribute('aria-hidden'),inert:w.hasAttribute('inert'),tab:i.tabIndex,small:r.width<=1&&r.height<=1||r.left<-100}}));
  assert.deepEqual(hp,{aria:'true',inert:true,tab:-1,small:true});
  assert.equal((await pg.textContent('#cf .form-status')).trim(),'');
  assert.ok(!/If sending/.test(await pg.textContent('#cf')));
  await pg.click('#cf button[type=submit]');assert.equal(await pg.locator('#cf .err-summary').isVisible(),true);assert.equal(await pg.getAttribute('#cf-name','aria-invalid'),'true');
  assert.equal(await pg.getAttribute('#cf-name','aria-required'),'true');
  // failure
  await pg.route('**/api/contact',r=>r.fulfill({status:503,contentType:'application/json',body:'{"ok":false}'}));
  await pg.fill('#cf-name','A');await pg.fill('#cf-contact','a@b.co');await pg.fill('#cf-need','Hello');await pg.click('#cf button[type=submit]');
  await pg.waitForSelector('#cf .form-status.bad');
  assert.match(await pg.textContent('#cf .form-status'),/couldn’t send your enquiry/);assert.equal(await pg.locator('#cf .form-status a[href^="mailto:"]').count(),1);assert.equal(await pg.locator('#cf .form-status a[href^="tel:"]').count(),1);
  // loading + no double submit + success
  await pg.unroute('**/api/contact');let calls=0;
  await pg.route('**/api/contact',async r=>{calls++;await new Promise(x=>setTimeout(x,500));await r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'})});
  await pg.click('#cf button[type=submit]');await pg.click('#cf button[type=submit]',{force:true}).catch(()=>{});
  assert.equal(await pg.textContent('#cf button[type=submit]'),'Sending…');assert.equal(await pg.isDisabled('#cf button[type=submit]'),true);
  await pg.waitForSelector('#cf .form-status.ok');assert.match(await pg.textContent('#cf .form-status'),/Thank you/);assert.equal(calls,1);
  assert.equal(await pg.textContent('#cf button[type=submit]'),'Send enquiry');await pg.close();
});
test('footer: grouped links are 44px tall on mobile and the copyright line has no status date',async()=>{
  const pg=await browser.newPage({viewport:{width:375,height:667}});await pg.goto(base+'/');
  const small=await pg.evaluate(()=>[...document.querySelectorAll('.site-footer a')].filter(a=>a.getBoundingClientRect().height<44).map(a=>a.textContent));assert.deepEqual(small,[]);
  const t=await pg.textContent('.site-footer .copy');assert.match(t,/© 2026 House of Tangents\./);assert.ok(!/as of/i.test(t));await pg.close();
});

test('every internal link and asset reference in every built page resolves to a real file',()=>{
  const exists=p=>{const f=path.join(ROOT,p.replace(/^\//,''));return fs.existsSync(f)&&fs.statSync(f).isFile()||fs.existsSync(path.join(f,'index.html'))||fs.existsSync(f+'.html')};
  const missing=[];
  for(const f of allPages)for(const m of read(f).matchAll(/(?:href|src)="(\/[^"#?]*)(?:#[^"]*)?"/g)){const u=m[1];if(u==='/'||u.startsWith('//'))continue;if(!exists(u))missing.push(`${f} -> ${u}`)}
  assert.deepEqual(missing,[]);
  for(const f of allPages)for(const m of read(f).matchAll(/href="(\/[^"#?]*)#([^"]+)"/g)){const target=m[1]==='/'?'index.html':path.join(m[1].slice(1),'index.html');assert.ok(read(target).includes(`id="${m[2]}"`),`${f}: anchor #${m[2]} missing in ${m[1]}`)}
});
test('header gains its bottom rule only after scrolling (no layout reads)',async()=>{
  const pg=await browser.newPage({viewport:{width:1280,height:700}});await pg.goto(base+'/');
  assert.equal(await pg.evaluate(()=>document.getElementById('site-header').classList.contains('scrolled')),false);
  await pg.evaluate(()=>window.scrollTo({top:400,behavior:'instant'}));await pg.waitForFunction(()=>document.getElementById('site-header').classList.contains('scrolled'));
  await pg.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await pg.waitForFunction(()=>!document.getElementById('site-header').classList.contains('scrolled'));await pg.close();
});

test('real logo is used in header, mobile menu and footer, in token colours only, with intrinsic size set',()=>{
  for(const f of ['assets/brand/logo-indigo.png','assets/brand/logo-indigo.webp','assets/brand/logo-lavender.png','assets/brand/logo-lavender.webp'])assert.ok(fs.existsSync(path.join(ROOT,f)),f);
  for(const f of allPages.filter(f=>f!=='404.html'||true)){const h=read(f);
    assert.match(h,/<a class="brand" href="\/" aria-label="House of Tangents, home"><picture>[\s\S]*?logo-indigo\.png" alt="House of Tangents" width="1200" height="340"/,f+' header logo');
    assert.match(h,/class="mm-top"><a class="brand"[\s\S]*?logo-lavender\.png/,f+' menu logo');
    assert.match(h,/class="foot-brand"><picture>[\s\S]*?logo-lavender/,f+' footer logo')}
});
test('logo renders crisp and fully visible at header size on desktop and mobile',async()=>{
  for(const [w,h] of [[1440,900],[375,667]]){const pg=await browser.newPage({viewport:{width:w,height:h}});await pg.goto(base+'/');
    const r=await pg.evaluate(()=>{const i=document.querySelector('.site-header .brand img');const b=i.getBoundingClientRect();return {ok:i.complete&&i.naturalWidth===1200,w:Math.round(b.width),h:Math.round(b.height),top:b.top,bottom:b.bottom,hh:document.getElementById('site-header').getBoundingClientRect().height}});
    assert.ok(r.ok,'logo not loaded');assert.ok(r.top>=0&&r.bottom<=r.hh,`logo clipped by header @${w}: ${JSON.stringify(r)}`);assert.ok(r.w>=150,`logo too small @${w}: ${r.w}`);await pg.close()}
});
