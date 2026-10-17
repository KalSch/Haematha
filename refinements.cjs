const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),port=Number(process.env.TEST_PORT||8878),base=`http://localhost:${port}/revision/`;
// Deliberately break every separate code/style upload: the built page must still work.
const blocked=new Set(['style.css','touch.css','app.js','controls.js']);
const server=http.createServer((req,res)=>{let rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\/revision\//,'');if(!rel)rel='index.html';if(blocked.has(rel)){res.writeHead(404);return res.end('deliberately missing');}const file=path.resolve(root,rel);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'text/plain');res.end(data);});});
let browser,checks=0;
function check(value,label){assert.ok(value,label);checks++;console.log('PASS '+label);}
async function run(){
 await new Promise(r=>server.listen(port,r));
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--no-zygote','--disable-webgl']});
 const context=await browser.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>window.Haematha?.build==='0.2.3');
 check((await page.evaluate(()=>getComputedStyle(document.querySelector('#hud')).position))==='fixed','controls overlay works without separate style or script files');
 check((await page.evaluate(()=>getComputedStyle(document.body).backgroundColor))==='rgb(17, 25, 27)','embedded stylesheet gives the page its intended background');
 await page.click('#begin');let initial=await page.evaluate(()=>Haematha.getState());
 const j=await page.locator('#joystick').boundingBox(),cx=j.x+j.width/2,cy=j.y+j.height/2;
 await page.mouse.move(cx,cy);await page.mouse.down();await page.mouse.move(cx+2,cy+2);await page.waitForTimeout(250);await page.mouse.up();let st=await page.evaluate(()=>Haematha.getState());
 check(Math.hypot(st.player.x-initial.player.x,st.player.y-initial.player.y)<.01,'joystick dead zone prevents drift');
 const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:cx,y:cy},{id:2,x:350,y:170}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:cx,y:cy-32},{id:2,x:400,y:145}]});await page.waitForTimeout(350);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});st=await page.evaluate(()=>Haematha.getState());
 check(Math.hypot(st.player.x-initial.player.x,st.player.y-initial.player.y)>.15,'two-thumb input allows movement');
 check(Math.abs(st.player.a-initial.player.a)>.15,'two-thumb input allows simultaneous look');
 const stopped=st.player;await page.waitForTimeout(200);st=await page.evaluate(()=>Haematha.getState());
 check(Math.hypot(st.player.x-stopped.x,st.player.y-stopped.y)<.01,'lifting both thumbs stops movement');
 await page.evaluate(()=>Haematha.openPanel('settings'));await page.locator('#lookSensitivity').fill('1.4');await page.locator('#moveSensitivity').fill('0.8');await page.check('#invertLook');await page.uncheck('#cameraBob');
 st=await page.evaluate(()=>Haematha.getState());check(st.controls.look===1.4&&st.controls.move===.8&&st.controls.invertY&&!st.controls.bob,'touch preferences are stored in game state');
 await page.click('#levelView');check((await page.evaluate(()=>Haematha.getState())).player.pitch===0,'camera can be leveled');
 await page.evaluate(()=>{const s=Haematha.getState();delete s.controls;Haematha.load(s);});st=await page.evaluate(()=>Haematha.getState());
 check(st.controls.look===1&&st.controls.move===1&&!st.controls.invertY&&st.controls.bob,'older saves migrate to default controls');
 await page.evaluate(()=>Haematha.openInspect('letter'));const view=await page.locator('#objectView').boundingBox();let before=await page.evaluate(()=>Haematha.inspection());if(process.env.QA_SHOTS)await page.screenshot({path:'/tmp/haematha-v02-front.png'});
 await page.click('#flipObject');let after=await page.evaluate(()=>Haematha.inspection());check(Math.abs(after.angle-before.angle-Math.PI)<.001,'inspection can flip to the back');if(process.env.QA_SHOTS)await page.screenshot({path:'/tmp/haematha-v02-back.png'});
 const x=view.x+view.width*.5,y=view.y+view.height*.4;
 for(let n=0;n<3;n++){await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+40);await page.mouse.up();}
 after=await page.evaluate(()=>Haematha.inspection());check(after.tilt!==before.tilt&&await page.locator('#inspect').isVisible(),'vertical inspection drags tilt without becoming triple taps');
 before=after;
 for(let n=0;n<3;n++){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:3,x:x-35,y},{id:4,x:x+35,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:3,x:x-55,y},{id:4,x:x+55,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }
 after=await page.evaluate(()=>Haematha.inspection());check(after.zoom>before.zoom&&await page.locator('#inspect').isVisible(),'repeated pinches zoom without closing inspection');
 await page.click('#resetObject');after=await page.evaluate(()=>Haematha.inspection());check(after.zoom===1&&after.angle===.3&&after.tilt===-.12,'inspection view can reset');
 await page.mouse.click(x,y,{clickCount:3,delay:90});check(await page.locator('#inspect').isHidden(),'three deliberate taps still close inspection');
 await page.evaluate(s=>{s.player.pitch=-.45;Haematha.load(s);},initial);await page.waitForTimeout(100);
 const point=await page.evaluate(()=>Haematha.project(8.2,5.3,.45*.48));
 await page.mouse.click(point.x,Math.min(point.y,310));check(await page.locator('#inspect').isHidden(),'single tap selects without opening inspection');
 await page.click('#interactButton');check(await page.locator('#inspect').isVisible(),'interaction button inspects the selected object');await page.click('#closeInspect');
 await page.evaluate(()=>{const s=Haematha.getState(),n=s.npcs.find(n=>n.id==='boss');s.player.x=n.x-.9;s.player.y=n.y-.4;s.player.a=Math.atan2(.4,.9);Haematha.load(s);});await page.waitForTimeout(100);await page.keyboard.press('e');await page.fill('#talkInput','What happened to Thomas?');await page.locator('#talkForm button').click();await page.click('#talkNotes');await page.waitForTimeout(60);
 let left=await page.locator('#conversation').boundingBox(),right=await page.locator('#notes').boundingBox();check(left.x+left.width<=right.x,'landscape notebook leaves current exchange unobscured');if(process.env.QA_SHOTS)await page.screenshot({path:'/tmp/haematha-v02-notes.png'});
 await page.setViewportSize({width:393,height:852});await page.waitForTimeout(100);left=await page.locator('#conversation').boundingBox();right=await page.locator('#notes').boundingBox();check(left.y+left.height<=right.y,'portrait notebook leaves current exchange above it');
 await page.click('#closeNotes');await page.setViewportSize({width:852,height:393});await page.focus('#talkInput');await page.evaluate(()=>{Object.defineProperty(window.visualViewport,'height',{configurable:true,get:()=>180});window.visualViewport.dispatchEvent(new Event('resize'));});await page.waitForTimeout(50);
 const keyboard=await page.locator('#conversation').boundingBox();check(keyboard.y+keyboard.height<=181,'conversation fits a simulated keyboard-reduced viewport');
 await page.evaluate(()=>{delete window.visualViewport.height;document.activeElement.blur();window.visualViewport.dispatchEvent(new Event('resize'));});await page.click('#endTalk');
 await page.waitForFunction(()=>navigator.serviceWorker.controller);await page.evaluate(()=>Haematha.autoSave('refinement checks'));await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.Haematha?.build==='0.2.3');await page.click('#resume');
 check(await page.locator('#welcome').isHidden()&&(await page.evaluate(()=>getComputedStyle(document.querySelector('#hud')).position))==='fixed','offline resume retains embedded interface with source files missing');
 check(errors.length===0,'no refinement runtime errors: '+errors.join('; '));console.log(`\n${checks} refinement checks passed.`);
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
