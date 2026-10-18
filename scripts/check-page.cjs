const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
(async()=>{
 console.log('Starting browser');
 const browser=await chromium.launch({headless:true,channel:'msedge',timeout:15000});
 const results=[];
 const out=path.resolve('.impeccable/review');fs.mkdirSync(out,{recursive:true});
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['small-mobile',360,800],['tablet',768,1024],['wide',1920,1080]]){
  console.log('Checking '+name);
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://localhost:3100',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready;Array.from(document.images).forEach(i=>i.loading='eager');await Promise.all(Array.from(document.images).map(i=>i.decode().catch(()=>{})));});
  const report=await page.evaluate(()=>{
   const sections=Array.from(document.querySelectorAll('main>section')).map(el=>({id:el.id,height:Math.round(el.getBoundingClientRect().height)}));
   const images=Array.from(document.images).filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src);
   const line=document.querySelector('.hero-second-line').getBoundingClientRect();
   const dog=document.querySelector('.hero-dog').getBoundingClientRect();
   const title=document.querySelector('#about-title').getBoundingClientRect();
   const seal=document.querySelector('.brand-seal').getBoundingClientRect();
   const facade=document.querySelector('.storefront').getBoundingClientRect();
   return {viewport:{width:innerWidth,height:innerHeight},overflow:document.documentElement.scrollWidth>innerWidth,sections,brokenImages:images,phoneVisible:/99252|8791/.test(document.body.innerText),headings:document.querySelectorAll('h1').length,mapIcons:document.querySelectorAll('#loja .address svg').length,heroBackground:getComputedStyle(document.querySelector('.hero')).backgroundImage,mapButton:document.querySelector('#loja .button').textContent.trim(),headerContact:document.querySelector('.header-contact').getAttribute('href'),logoFilter:getComputedStyle(document.querySelector('.brand-link img')).filter,noseDelta:Math.round(dog.top+dog.height*.31-(line.top+line.height/2)),sealPosition:seal.right<=title.left&&(innerWidth<=1100||seal.height>title.height),facadeWidth:Math.round(facade.width)};
  });
  if(response.status()!==200||report.overflow||report.brokenImages.length||report.phoneVisible||report.headings!==1||report.sections.length!==5||report.sections.some(s=>s.height<height)||report.mapIcons!==1||errors.length)throw new Error(name+' layout failure '+JSON.stringify({...report,errors}));
  if(report.headerContact!=='#contato'||report.logoFilter!=='none'||!report.sealPosition||(width>1100&&Math.abs(report.noseDelta)>4)||(width<=760&&report.facadeWidth!==width))throw new Error(name+' adjustment failure '+JSON.stringify(report));
  await page.locator('.hero-actions a').first().click();
  await page.waitForTimeout(150);
  if(!(await page.evaluate(()=>Math.abs(document.querySelector('#selecao').getBoundingClientRect().top)<50)))throw new Error('Selection scroll failed '+name);
  await page.locator('a[href="#inicio"]').last().click();await page.waitForTimeout(100);
  if(width<=760){
   await page.getByRole('button',{name:'Abrir menu'}).click();
   await page.getByRole('navigation').getByRole('link',{name:'Nossa loja'}).click();
   if(await page.getByRole('button',{name:'Abrir menu'}).getAttribute('aria-expanded')!=='false')throw new Error('Mobile menu did not close');
   await page.evaluate(()=>scrollTo(0,0));
   await page.getByRole('button',{name:'Abrir menu'}).click();await page.keyboard.press('Escape');
   if(await page.getByRole('button',{name:'Abrir menu'}).getAttribute('aria-expanded')!=='false')throw new Error('Escape menu failed');
  }
  await page.evaluate(()=>scrollTo(0,0));
  if(width<=760)await page.getByRole('button',{name:'Abrir menu'}).click();
  await page.locator('.header-contact').click();
  await page.waitForTimeout(100);
  if(!(await page.evaluate(()=>Math.abs(document.querySelector('#contato').getBoundingClientRect().top)<50)))throw new Error('Contact header scroll failed '+name);
  await page.evaluate(()=>scrollTo(0,0));
  if(name==='desktop'||name==='mobile')await page.screenshot({path:path.join(out,name+'.png'),fullPage:true,animations:'disabled'});
  results.push({name,...report,errors});await page.close();
 }
 const context=await browser.newContext();
 const redirect=await context.request.get('http://localhost:3100/contato/whatsapp',{maxRedirects:0});
 if(redirect.status()!==307||!redirect.headers().location.startsWith('https://wa.me/'))throw new Error('WhatsApp redirect invalid');
 await browser.close();
 fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({passed:true,viewports:results.map(r=>({name:r.name,sections:r.sections,overflow:r.overflow})),whatsappStatus:redirect.status()},null,2));
})().catch(e=>{console.error(e);process.exit(1)});

