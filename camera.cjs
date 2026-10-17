const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),port=Number(process.env.TEST_PORT||8879),base=`http://localhost:${port}/camera/`;
const server=http.createServer((req,res)=>{let rel=req.url.split('?')[0].replace(/^\/camera\//,'')||'index.html';const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'text/plain');res.end(data);});});
let browser,checks=0;
function check(value,label){assert.ok(value,label);checks++;console.log('PASS '+label);}
async function drag(page,dx,dy){await page.mouse.move(350,190);await page.mouse.down();await page.mouse.move(350+dx,190+dy,{steps:8});await page.mouse.up();await page.waitForTimeout(60);}
async function reset(page){await page.evaluate(()=>{const s=Haematha.getState();s.player={...s.player,x:13,y:7.5,a:Math.PI/2,pitch:0,crouch:false};s.controls={...s.controls,bob:false,invertY:false};Haematha.load(s);});await page.waitForTimeout(150);}
async function run(){
 await new Promise(r=>server.listen(port,r));browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--no-zygote','--disable-webgl']});
 const context=await browser.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>window.Haematha?.build==='0.2.3');await page.click('#begin');await reset(page);
 let view=await page.evaluate(()=>Haematha.camera());check(Math.abs(view.height-1.28)<.01,'standing camera uses adult eye height');
 let eyes=await page.evaluate(()=>Haematha.project(13,10,1.29));check(Math.abs(eyes.y-393/2)<10,'standing viewpoint meets an NPC at eye level');
 if(process.env.QA_SHOTS)await page.screenshot({path:'/tmp/haematha-camera-standing.png'});
 await page.click('#duckButton');await page.waitForTimeout(400);view=await page.evaluate(()=>Haematha.camera());
 check(Math.abs(view.height-.82)<.02,'crouch lowers the actual viewpoint');check(view.pitch===0,'crouch does not fake a look-angle change');
 check(await page.locator('#duckButton small').textContent()==='STAND'&&await page.locator('#duckButton').getAttribute('aria-pressed')==='true','crouch button clearly offers Stand');
 eyes=await page.evaluate(()=>Haematha.project(13,10,1.29));check(eyes.y<100,'NPC eye line rises when the player crouches');
 if(process.env.QA_SHOTS)await page.screenshot({path:'/tmp/haematha-camera-crouched.png'});
 await page.click('#duckButton');await page.waitForTimeout(400);check(Math.abs((await page.evaluate(()=>Haematha.camera())).height-1.28)<.02,'Stand restores normal eye height');
 await drag(page,0,-150);view=await page.evaluate(()=>Haematha.camera());check(view.pitch>.9&&view.pitch<=view.maxPitch,'upward swipe reaches close to 55 degrees');check(Number.isFinite((await page.evaluate(()=>Haematha.project(13,10,0))).y),'upper look limit keeps projection finite');
 await reset(page);await drag(page,0,150);view=await page.evaluate(()=>Haematha.camera());check(view.pitch<-.9&&view.pitch>=-view.maxPitch,'downward swipe reaches close to 55 degrees');
 await reset(page);await drag(page,50,0);let yaw=await page.evaluate(()=>Haematha.getState().player.a);check(Math.abs(yaw-(Math.PI/2+50/393*2.15))<.001,'horizontal look response remains unchanged');
 await reset(page);await page.evaluate(()=>Haematha.openPanel('settings'));await page.locator('#verticalSensitivity').fill('0.6');await page.click('#closePanel');await drag(page,0,-70);let slow=(await page.evaluate(()=>Haematha.camera())).pitch;
 await reset(page);await page.evaluate(()=>Haematha.openPanel('settings'));await page.locator('#verticalSensitivity').fill('1.8');await page.click('#closePanel');await drag(page,0,-70);let fast=(await page.evaluate(()=>Haematha.camera())).pitch;check(fast>slow*2,'vertical sensitivity changes vertical response independently');
 await reset(page);await page.evaluate(()=>Haematha.openPanel('settings'));await page.check('#invertLook');await page.click('#closePanel');await drag(page,0,-70);check((await page.evaluate(()=>Haematha.camera())).pitch<0,'inverted vertical look still works');
 await page.evaluate(()=>{const s=Haematha.getState();delete s.controls.verticalLook;s.player.crouch=true;Haematha.load(s);});await page.waitForTimeout(80);view=await page.evaluate(()=>Haematha.camera());check(Math.abs(view.height-.82)<.01&&await page.locator('#duckButton small').textContent()==='STAND','loading a crouched save restores height and explicit Stand control');check((await page.evaluate(()=>Haematha.getState())).controls.verticalLook===1.2,'older controls receive the new vertical default');
 await page.click('#duckButton');await page.waitForTimeout(350);await page.setViewportSize({width:393,height:852});await reset(page);await drag(page,0,-150);check((await page.evaluate(()=>Haematha.camera())).pitch>.9,'portrait uses the expanded vertical range');
 check(errors.length===0,'no camera runtime errors: '+errors.join('; '));console.log(`\n${checks} camera checks passed.`);
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
