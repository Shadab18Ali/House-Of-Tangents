// Run with: node --test tests/   (needs `playwright` resolvable, e.g. the globally installed one)
import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
const ROOT=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'))}catch{({chromium}=createRequire('/usr/lib/node_modules/')('playwright'))}
const projects=JSON.parse(fs.readFileSync(path.join(ROOT,'content/projects.json'),'utf8'));
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
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
const text=h=>h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' ');

test('homepage body copy is tight: 700–1,200 words',()=>{
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const main=h.slice(h.indexOf('<main'),h.indexOf('</main>'));
  const n=text(main).split(/\s+/).filter(Boolean).length;console.log('home words',n);
  assert.ok(n>=700&&n<=1200,'words='+n);
});
test('homepage features no more than six projects, each linking to a case study',()=>{
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const grid=h.slice(h.indexOf('class="reel-grid"'),h.indexOf('class="band cobalt"'));
  const links=[...grid.matchAll(/class="pcard-link"/g)].length;assert.ok(links>=1&&links<=6,String(links));
  assert.equal(projects.filter(p=>p.featured).length,links);
  for(const p of projects.filter(p=>p.featured))assert.ok(fs.existsSync(path.join(ROOT,'work',p.slug,'index.html')));
});
test('every project has a generated case study and appears in the sitemap',()=>{
  const sm=fs.readFileSync(path.join(ROOT,'sitemap.xml'),'utf8');
  for(const p of projects){assert.ok(fs.existsSync(path.join(ROOT,'work',p.slug,'index.html')),p.slug);assert.ok(sm.includes('/work/'+p.slug))}
});
test('proposals never appear as delivered work',()=>{
  assert.ok(!projects.some(p=>/proposed/i.test(p.status)));
  const idx=fs.readFileSync(path.join(ROOT,'work/index.html'),'utf8');assert.ok(!/Proposal — not yet produced/.test(idx));
  const tm=fs.readFileSync(path.join(ROOT,'tangent-media/index.html'),'utf8');
  assert.equal((tm.match(/Proposal — not yet produced/g)||[]).length,3);
});
test('metadata: unique titles, canonical, description',()=>{
  const seen=new Set();
  const pages=['index.html','work/index.html','services/index.html','about/index.html','tangent-media/index.html','contact/index.html','credits/index.html',...projects.map(p=>`work/${p.slug}/index.html`)];
  for(const f of pages){const h=fs.readFileSync(path.join(ROOT,f),'utf8');
    const t=h.match(/<title>(.*?)<\/title>/)[1];assert.ok(!seen.has(t),'dup title '+t);seen.add(t);
    assert.match(h,/<link rel="canonical" href="https:\/\/house-of-tangents\.vercel\.app/);assert.match(h,/<meta name="description" content="[^"]{30,}/);
    assert.equal((h.match(/<h1[ >]/g)||[]).length,1,'h1 count '+f)}
});
test('no encoding artefacts in generated pages',()=>{
  for(const f of ['index.html','about/index.html','credits/index.html']){const h=fs.readFileSync(path.join(ROOT,f),'utf8');assert.ok(!/â€|Ã|�/.test(h),f)}
});
test('no horizontal overflow at required viewports',async()=>{
  for(const [w,h] of [[360,800],[390,844],[768,1024],[1024,768],[1440,900]]){
    const pg=await browser.newPage({viewport:{width:w,height:h}});
    for(const u of ['/','/work','/work/capitol-hill','/services','/about','/tangent-media','/contact','/credits']){
      await pg.goto(base+u);const o=await pg.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      assert.ok(o<=0,`${u} @${w}: overflow ${o}`)}
    await pg.close()}
});
test('CTA and positioning visible in first viewport (desktop and mobile)',async()=>{
  for(const [w,h] of [[390,844],[1440,900]]){const pg=await browser.newPage({viewport:{width:w,height:h}});await pg.goto(base+'/');
    const r=await pg.evaluate(()=>{const c=document.querySelector('.hero .btn.primary').getBoundingClientRect();const t=document.querySelector('.hero h1').getBoundingClientRect();return {cb:c.bottom,tb:t.bottom}});
    assert.ok(r.cb<=h,`CTA below fold @${w}`);assert.ok(r.tb<=h);await pg.close()}
});
test('mobile menu: open, trap focus, Escape closes, focus returns',async()=>{
  const pg=await browser.newPage({viewport:{width:390,height:844}});await pg.goto(base+'/');
  await pg.click('.menu-btn');assert.equal(await pg.getAttribute('.menu-btn','aria-expanded'),'true');
  assert.equal(await pg.evaluate(()=>document.body.classList.contains('lock')),true);
  for(let i=0;i<12;i++)await pg.keyboard.press('Tab');
  assert.equal(await pg.evaluate(()=>!!document.activeElement.closest('#mobile-menu')),true,'focus escaped menu');
  await pg.keyboard.press('Escape');
  assert.equal(await pg.evaluate(()=>document.getElementById('mobile-menu').hidden),true);
  assert.equal(await pg.evaluate(()=>document.activeElement.classList.contains('menu-btn')),true,'focus not returned');
  assert.equal(await pg.evaluate(()=>document.body.classList.contains('lock')),false);
  const sz=await pg.evaluate(()=>{const r=document.querySelector('.menu-btn').getBoundingClientRect();return [r.width,r.height]});assert.ok(sz[0]>=44&&sz[1]>=44);
  await pg.close();
});
test('work filter shows/hides by category and keeps links in DOM',async()=>{
  const pg=await browser.newPage();await pg.goto(base+'/work');
  const total=await pg.locator('#work-grid .pcard').count();assert.equal(total,projects.length);
  await pg.click('[data-filter=hospitality]');
  const vis=await pg.locator('#work-grid .pcard:not([hidden])').count();
  assert.equal(vis,projects.filter(p=>p.categories.includes('hospitality')).length);
  assert.equal(await pg.locator('#work-grid .pcard').count(),total);await pg.close();
});
test('video dialog loads iframe only on intent, Escape closes, focus returns',async()=>{
  const pg=await browser.newPage();await pg.goto(base+'/work/majestic-india');
  assert.equal(await pg.locator('iframe').count(),0,'iframe present before intent');
  await pg.click('.vbtn');assert.equal(await pg.locator('dialog[open] iframe').count(),1);
  await pg.keyboard.press('Escape');await pg.waitForFunction(()=>!document.querySelector('iframe'));assert.equal(await pg.locator('iframe').count(),0);
  assert.equal(await pg.evaluate(()=>document.activeElement.classList.contains('vbtn')),true);await pg.close();
});
test('contact form validates and never fakes success',async()=>{
  const pg=await browser.newPage();await pg.route('**/api/contact',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,error:'Online enquiries are not switched on yet.'})}));
  await pg.goto(base+'/contact');await pg.click('#cf button[type=submit]');
  assert.equal(await pg.locator('#cf .err-summary').isVisible(),true);assert.equal(await pg.getAttribute('#cf-name','aria-invalid'),'true');
  await pg.fill('#cf-name','A');await pg.fill('#cf-contact','a@b.co');await pg.fill('#cf-need','Hello');await pg.click('#cf button[type=submit]');
  await pg.waitForFunction(()=>document.querySelector('#cf .form-status').textContent.includes('not switched on'));
  assert.ok(!/Thank you/.test(await pg.textContent('#cf .form-status')));await pg.close();
});

test('Electric Editorial palette only: no cream, beige, orange, terracotta or brown tokens; Open Sans removed',()=>{
  const css=fs.readFileSync(path.join(ROOT,'styles.css'),'utf8');
  for(const bad of ['#f5f1e6','#ece6d6','#e2502f','#dd4a2b','#b8381b','#ff8f6e','#1f1f1d','Open Sans','Bodoni'])assert.ok(!css.toLowerCase().includes(bad.toLowerCase()),'found '+bad);
  for(const good of ['#F7F8FA','#0B0D12','#3157FF','#C8FF3D','#E9ECF4'])assert.ok(css.includes(good),'missing '+good);
  for(const f of ['index.html','work/index.html'])assert.ok(!/Open\+Sans|Open Sans|fonts\.googleapis/.test(fs.readFileSync(path.join(ROOT,f),'utf8')),'external/legacy font in '+f);
  for(const f of ['BricolageGrotesque-normal','Manrope-normal','InstrumentSerif-normal'])assert.ok(fs.existsSync(path.join(ROOT,'assets/fonts/'+f+'.woff2')));
});
test('WCAG contrast for the token pairs actually used',()=>{
  const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
  const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const pairs=[['#0B0D12','#F7F8FA',4.5],['#4A5163','#F7F8FA',4.5],['#4A5163','#E9ECF4',4.5],['#FFFFFF','#3157FF',4.5],['#3157FF','#F7F8FA',4.5],['#3157FF','#E9ECF4',4.5],['#0B0D12','#C8FF3D',4.5],['#C8FF3D','#0B0D12',4.5],['#FFFFFF','#0B0D12',4.5],['#C8FF3D','#3157FF',4.5],['#FFFFFF','#0B0D12',4.5]];
  for(const [a,b,min] of pairs)assert.ok(cr(a,b)>=min,`${a} on ${b} = ${cr(a,b).toFixed(2)}`);
});
test('hero shows real project media with a static fallback; no autoplay attribute, no sound',()=>{
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  assert.match(h,/<video class="reel" data-reel muted loop playsinline preload="none" poster="\/assets\/media\/home\/hero-poster\.jpg"/);
  assert.ok(!/<video[^>]*\sautoplay/.test(h));
  for(const f of ['assets/media/home/hero-reel.mp4','assets/media/home/hero-poster.jpg','assets/media/home/hero-poster.webp'])assert.ok(fs.existsSync(path.join(ROOT,f)),f);
});
test('featured projects: media-backed where approved media exists, typographic poster otherwise, none empty',()=>{
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const cards=h.slice(h.indexOf('class="reel-grid"'),h.indexOf('class="band cobalt"')).split('<article class="pcard"').slice(1);
  assert.equal(cards.length,6);
  for(const c of cards)assert.ok(/<img /.test(c)||/class="art art-/.test(c));
  assert.ok(cards.filter(c=>/<img /.test(c)).length>=2);
});
test('self-hosted videos never preload and carry a visible title',()=>{
  for(const f of ['work/majestic-india/index.html','work/navdurga/index.html','tangent-media/index.html']){
    const h=fs.readFileSync(path.join(ROOT,f),'utf8');
    for(const v of h.match(/<video[^>]*>/g)||[]){assert.match(v,/preload="none"/);assert.match(v,/aria-label="[^"]+"/);assert.ok(!/autoplay/.test(v))}}
});
test('reduced motion: hero reel does not play and there is no pause control',async()=>{
  const ctx=await browser.newContext({reducedMotion:'reduce'});const pg=await ctx.newPage();await pg.goto(base+'/');await pg.waitForTimeout(500);
  assert.equal(await pg.evaluate(()=>document.querySelector('[data-reel]').paused),true);
  assert.equal(await pg.evaluate(()=>document.querySelector('[data-reel-toggle]').hidden),true);await ctx.close();
});
test('services index: one panel open, aria-expanded kept in sync',async()=>{
  const pg=await browser.newPage({viewport:{width:1440,height:900}});await pg.goto(base+'/');
  assert.equal(await pg.getAttribute('#sb0','aria-expanded'),'true');await pg.click('#sb2');
  assert.equal(await pg.getAttribute('#sb2','aria-expanded'),'true');assert.equal(await pg.getAttribute('#sb0','aria-expanded'),'false');
  assert.equal(await pg.locator('.svc-panel:visible').count(),1);await pg.close();
});
