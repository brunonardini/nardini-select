const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 for(const [name,width,height] of [['pequena',375,667],['media',970,949],['grande',1657,953]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto('http://localhost:3100',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready;const i=document.querySelector('.brand-seal');i.loading='eager';await i.decode();});
  const result=await page.evaluate(()=>{
   const title=document.querySelector('#about-title').getBoundingClientRect();
   const seal=document.querySelector('.brand-seal').getBoundingClientRect();
   return {width:innerWidth,title:title.toJSON(),seal:seal.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth,valid:seal.right<=title.left&&(innerWidth<=1100||seal.height>title.height)};
  });
  if(!result.valid||result.overflow)throw new Error(JSON.stringify({name,...result}));
  await page.locator('#marca').screenshot({path:'.impeccable/review/selo-'+name+'.png'});
  console.log(JSON.stringify({name,titleWidth:result.title.width,titleHeight:result.title.height,sealWidth:result.seal.width,sealHeight:result.seal.height,passed:true}));
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
