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

test('homepage body copy is 900–1,200 words',()=>{
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const main=h.slice(h.indexOf('<main'),h.indexOf('</main>'));
  const n=text(main).split(/\s+/).filter(Boolean).length;console.log('home words',n);
  assert.ok(n>=900&&n<=1200,'words='+n);
});
test('homepage features no more than six projects, each linking to a case study',()=>{
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const links=[...h.matchAll(/class="stretch"/g)].length;assert.ok(links>=1&&links<=6,String(links));
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
  const total=await pg.locator('#work-grid .card').count();assert.equal(total,projects.length);
  await pg.click('[data-filter=hospitality]');
  const vis=await pg.locator('#work-grid .card:not([hidden])').count();
  assert.equal(vis,projects.filter(p=>p.categories.includes('hospitality')).length);
  assert.equal(await pg.locator('#work-grid .card').count(),total);await pg.close();
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
