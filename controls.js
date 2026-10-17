'use strict';
// Touch, keyboard, and inspection refinements. Kept separate from world simulation.
(() => {
  const BUILD = '0.2.2';
  const defaults = { look: 1, move: 1, invertY: false, bob: true };
  let joystickPointer = null, selectedWorld = null, selectedUntil = 0;
  let tilt = -.12, gesture = null;
  function preferences() {
    const c = state.controls || {};
    state.controls = {
      look: Number.isFinite(c.look) ? Math.max(.4, Math.min(1.8, c.look)) : 1,
      move: Number.isFinite(c.move) ? Math.max(.5, Math.min(1.5, c.move)) : 1,
      invertY: c.invertY === true,
      bob: c.bob !== false
    };
    return state.controls;
  }
  preferences();
  function releaseInputs() {
    keys = {}; joy = {x:0, y:0}; look = null;
    if (joystickPointer !== null && joystick.hasPointerCapture(joystickPointer)) joystick.releasePointerCapture(joystickPointer);
    joystickPointer = null;
    $('#stick').style.transform = '';
    clearTimeout(duckHold);
  }
  // Old build saves retain schema 1. Missing control settings receive defaults.
  const originalLoad = loadSave;
  loadSave = function(save) { releaseInputs(); originalLoad(save); preferences(); selectedWorld = null; selectedItem = null; updateLayout(); };
  Haematha.load = loadSave;
  const originalClose = closeAll;
  closeAll = function() { releaseInputs(); originalClose(); updateLayout(); };
  const originalPanel = openPanel;
  openPanel = function(which) {
    releaseInputs(); originalPanel(which);
    $('#panel').classList.add('navigation-screen');
    $('#closePanel').onclick = returnFromMap;
    updateLayout();
  };
  Haematha.openPanel = openPanel;
  function returnFromMap() {
    document.activeElement?.blur();
    $('#panel').hidden = true;
    pendingTake = null;
    releaseInputs(); updateLayout();
  }
  function toggleMap() {
    if (!started) return;
    if (!$('#panel').hidden && $('#panel').classList.contains('navigation-screen')) returnFromMap();
    else { $('#inspect').hidden = true; openPanel('map'); }
  }
  $('#mapButton').onclick = toggleMap;
  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'm' || ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!e.repeat) toggleMap();
  }, true);
  const originalNotes = openNotes;
  openNotes = function(mode) { releaseInputs(); originalNotes(mode); updateLayout(); };
  const originalTalk = startTalk;
  startTalk = function(id) {
    releaseInputs(); originalTalk(id);
    $('#talkInput').value = '';
    updateLayout();
  };
  const originalInspect = openInspect;
  openInspect = function(id) {
    releaseInputs(); objectPointers.clear(); objectTap = []; gesture = null; tilt = -.12;
    originalInspect(id);
    // Equipment is chosen in inventory, after the item has actually been collected.
    $('#equipItem')?.remove();
    if (ITEMS[id].power) {
      $('#useItem')?.remove();
      const hint = document.createElement('p'); hint.className = 'muted';
      hint.textContent = state.inventory.some(i=>i.id===id) ? 'Equip this item from Inventory.' : 'Take this item, then equip it from Inventory.';
      $('#objectInfo').append(hint);
    }
  };
  Haematha.openInspect = openInspect;
  const originalInventory = inventoryPanel;
  inventoryPanel = function() {
    originalInventory();
    const name = state.equipped ? ITEMS[state.equipped].name : 'Fists';
    const slot = document.createElement('section'); slot.id='equippedSlot'; slot.className='equipment-slot';
    const caption=document.createElement('div');
    const label=document.createElement('small'); label.textContent='CURRENTLY EQUIPPED';
    const value=document.createElement('strong'); value.textContent=name;
    caption.append(label,value);slot.append(caption);
    if(state.equipped){const b=document.createElement('button');b.id='unequipCurrent';b.textContent='Unequip';b.onclick=()=>equip(state.equipped);slot.append(b);}
    $('#panelBody').prepend(slot);
    if(selectedItem && state.inventory.includes(selectedItem) && ITEMS[selectedItem.id].power){
      const active=state.equipped===selectedItem.id;
      $('#invEquip').textContent=active?'Unequip':'Equip';
      $('#invEquip').setAttribute('aria-pressed',String(active));
      const status=document.createElement('p');status.id='equipmentStatus';status.className=active?'equipment-status':'muted';
      status.textContent=active?'Equipped — ready on the Attack button.':'Carried — select Equip to ready this item.';
      $('#inventoryDetail h3').after(status);
      // Using a weapon and equipping it are the same action; present one clear control.
      $('#invUse').remove();
    }
    const cells=[...$('#bagGrid').children];
    for(let y=0;y<2;y++)for(let x=0;x<5;x++){
      const i=state.inventory.find(i=>i.slot==='bag'&&i.id===state.equipped&&x>=i.x&&x<i.x+ITEMS[i.id].w&&y>=i.y&&y<i.y+ITEMS[i.id].h);
      if(i){cells[y*5+x].classList.add('equipped-item');cells[y*5+x].title=ITEMS[i.id].name+' · equipped';}
    }
    [...$('#pockets').children].forEach((b,p)=>{if(state.inventory.some(i=>i.slot==='pocket'&&i.p===p&&i.id===state.equipped))b.classList.add('equipped-item');});
  };
  const originalEquip=equip;
  equip=function(id){
    const before=state.equipped; originalEquip(id);
    if(before!==state.equipped){
      if(!$('#panel').hidden&&tab==='inventory')inventoryPanel();
      updateHUD(); autoSave('Equipment changed');
    }
  };
  const originalPut=putItem;
  putItem=function(id,placement){
    const count=state.inventory.length; originalPut(id,placement);
    if(state.inventory.length>count){selectedItem=state.inventory.at(-1);inventoryPanel();}
  };
  const originalSettings = settingsPanel;
  settingsPanel = function() {
    originalSettings();
    const c = preferences(), section = document.createElement('section');
    section.className = 'card touch-settings';
    section.innerHTML = `<h3>Touch & camera · build ${BUILD}</h3>
      <label>Look sensitivity <output id="lookValue">${c.look.toFixed(1)}</output><input id="lookSensitivity" type="range" min="0.4" max="1.8" step="0.1" value="${c.look}"></label>
      <label>Joystick response <output id="moveValue">${c.move.toFixed(1)}</output><input id="moveSensitivity" type="range" min="0.5" max="1.5" step="0.1" value="${c.move}"></label>
      <label><input id="invertLook" type="checkbox" ${c.invertY?'checked':''}> Invert vertical look</label>
      <label><input id="cameraBob" type="checkbox" ${c.bob?'checked':''}> Walking camera motion</label>
      <div class="row"><button id="levelView">LEVEL CAMERA</button><button id="resetControls">RESET CONTROLS</button></div>
      <p class="muted">Settings travel with your save. The interface is embedded in this build’s main page.</p>`;
    $('#panelBody').prepend(section);
    $('#lookSensitivity').oninput = e => { state.controls.look = +e.target.value; $('#lookValue').value = state.controls.look.toFixed(1); };
    $('#moveSensitivity').oninput = e => { state.controls.move = +e.target.value; $('#moveValue').value = state.controls.move.toFixed(1); };
    $('#invertLook').onchange = e => state.controls.invertY = e.target.checked;
    $('#cameraBob').onchange = e => { state.controls.bob = e.target.checked; if (!e.target.checked) walkBob = 0; };
    $('#levelView').onclick = () => { state.player.pitch = 0; toast('Camera leveled.'); };
    $('#resetControls').onclick = () => { state.controls = {...defaults}; state.player.pitch = 0; settingsPanel(); };
  };
  joystick.onpointerdown = e => {
    if (paused() || rest || talking || joystickPointer !== null) return;
    e.preventDefault(); joystickPointer = e.pointerId; joystick.setPointerCapture(e.pointerId); setJoystick(e);
  };
  function setJoystick(e) {
    const r = joystick.getBoundingClientRect(), radius = r.width*.34;
    let x = (e.clientX-r.left-r.width/2)/radius, y = (e.clientY-r.top-r.height/2)/radius;
    const distance = Math.hypot(x,y), deadZone = .12;
    const power = distance <= deadZone ? 0 : Math.min(1,(distance-deadZone)/(1-deadZone));
    const response = Math.min(1,power*preferences().move);
    joy = distance ? {x:x/distance*response,y:y/distance*response} : {x:0,y:0};
    $('#stick').style.transform = `translate(${joy.x*radius}px,${joy.y*radius}px)`;
    if (watch && response) { watch=null; toast('You stop watching.'); }
  }
  joystick.onpointermove = e => { if (e.pointerId===joystickPointer) { e.preventDefault(); setJoystick(e); } };
  function endJoystick(e) { if (e.pointerId !== joystickPointer) return; joystickPointer=null; resetJoy(); }
  joystick.onpointerup=endJoystick; joystick.onpointercancel=endJoystick; joystick.onlostpointercapture=endJoystick;
  canvas.onpointerdown=e=>{
    if(paused()||rest||talking||look) return;
    e.preventDefault(); canvas.setPointerCapture(e.pointerId);
    look={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:0};
  };
  canvas.onpointermove=e=>{
    if(!look||look.id!==e.pointerId||paused())return;
    const dx=e.clientX-look.x,dy=e.clientY-look.y,c=preferences();
    // Normalize against the short screen edge; portrait and landscape have comparable response.
    const unit=1/Math.min(innerWidth,innerHeight);
    state.player.a+=dx*unit*2.15*c.look;
    state.player.pitch=Math.max(-.26,Math.min(.26,(state.player.pitch||0)-dy*unit*.5*c.look*(c.invertY?-1:1)));
    look.moved+=Math.hypot(dx,dy);look.x=e.clientX;look.y=e.clientY;
  };
  canvas.onpointerup=e=>{if(!look||look.id!==e.pointerId)return;const moved=look.moved;look=null;if(moved<10)worldTap(e);};
  canvas.onpointercancel=canvas.onlostpointercapture=e=>{if(look?.id===e.pointerId)look=null;};
  // A single tap selects an object; the existing interaction button is a second way to inspect it.
  const originalTap=worldTap;
  worldTap=function(e){
    const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*canvas.width,y=(e.clientY-r.top)/r.height*canvas.height;
    const hit=projected.filter(p=>x>p.left&&x<p.right&&y>p.top&&y<p.bottom&&p.distance<3.2).sort((a,b)=>a.distance-b.distance)[0];
    if(hit&&!hit.npc){selectedWorld=hit.id;selectedUntil=performance.now()+5000;}
    originalTap(e);
    if(hit&&!hit.npc&&$('#inspect').hidden)toast(ITEMS[hit.id].name+' · tap ◇ to inspect, or triple tap the object');
  };
  function selectedTarget(){return selectedWorld&&performance.now()<selectedUntil?projected.find(p=>p.id===selectedWorld&&!p.npc&&p.distance<3.2):null;}
  const originalInteract=interact;
  interact=function(entity){if(paused()||rest)return;originalInteract(entity||selectedTarget()||nearest());};
  const originalHUD=updateHUD;
  const originalRender=renderWorld;
  renderWorld=function(t){if(!preferences().bob)walkBob=0;originalRender(t);};
  updateHUD=function(){
    originalHUD();if(!preferences().bob)walkBob=0;
    const weapon=state.equipped;
    $('#weaponLabel').textContent=weapon=== 'wrench'?'WRENCH':weapon==='wood'?'HANDLE':'FISTS';
    $('#attackButton').setAttribute('aria-label','Attack with '+(weapon?ITEMS[weapon].name:'fists'));
    $('#attackButton').title='Attack with '+(weapon?ITEMS[weapon].name:'fists');
    const current=selectedTarget()||nearest();
    $('#interactButton small').textContent=current?(current.npc?'TALK':'INSPECT'):'INTERACT';
    if(selectedTarget())$('#target').textContent=ITEMS[current.id].name+' · ◇ INSPECT';
    updateLayout();
  };
  // An ended pinch must never count as a tap or accidentally close the inspector.
  objectCanvas.onpointerdown=e=>{
    e.preventDefault();objectCanvas.setPointerCapture(e.pointerId);
    objectPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(!gesture)gesture={moved:0,multi:false};
    if(objectPointers.size>1){gesture.multi=true;objectTap=[];const p=[...objectPointers.values()];oldPinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}
  };
  objectCanvas.onpointermove=e=>{
    const p=objectPointers.get(e.pointerId);if(!p||!gesture)return;
    const dx=e.clientX-p.x,dy=e.clientY-p.y;gesture.moved+=Math.hypot(dx,dy);p.x=e.clientX;p.y=e.clientY;
    if(objectPointers.size===1&&!gesture.multi){inspectAngle+=dx*.013;tilt=Math.max(-1.05,Math.min(1.05,tilt+dy*.01));}
    else if(objectPointers.size===2){const a=[...objectPointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(oldPinch)inspectZoom=Math.max(.45,Math.min(2.4,inspectZoom*d/oldPinch));oldPinch=d;}
  };
  objectCanvas.onpointerup=e=>{
    objectPointers.delete(e.pointerId);
    if(objectPointers.size||!gesture)return;
    if(!gesture.multi&&gesture.moved<10){const t=performance.now();objectTap=objectTap.filter(v=>t-v<800);objectTap.push(t);if(objectTap.length===3){$('#closeInspect').click();objectTap=[];}}
    gesture=null;
  };
  objectCanvas.onpointercancel=e=>{objectPointers.delete(e.pointerId);gesture=null;objectTap=[];};
  $('#flipObject').onclick=()=>inspectAngle+=Math.PI;
  $('#zoomIn').onclick=()=>inspectZoom=Math.min(2.4,inspectZoom*1.2);
  $('#zoomOut').onclick=()=>inspectZoom=Math.max(.45,inspectZoom/1.2);
  $('#resetObject').onclick=()=>{inspectAngle=.3;tilt=-.12;inspectZoom=1;};
  renderInspect=function(){
    if($('#inspect').hidden||!inspectId)return;
    const c=objectCanvas,r=c.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
    const width=Math.round(r.width*ratio),height=Math.round(r.height*ratio);
    if(c.width!==width||c.height!==height){c.width=width;c.height=height;}
    const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.save();g.translate(c.width/2,c.height/2);
    const size=Math.min(c.width,c.height)*.62*inspectZoom;
    g.fillStyle='#0004';g.beginPath();g.ellipse(0,Math.min(c.height*.36,size*.6),size*.4,size*.06,0,0,7);g.fill();
    inspectionModel(g,inspectId,size,inspectAngle,tilt);g.restore();
  };
  function inspectionModel(g,id,size,yaw,pitch){
    const d=ITEMS[id];let points,thickness=.12;
    const rect=(x,y)=>[[-x,-y],[x,-y],[x,y],[-x,y]];
    if(d.shape==='wrench'){points=[[-.08,.4],[.08,.4],[.06,-.15],[.2,-.25],[.19,-.43],[.1,-.46],[.09,-.31],[-.07,-.3],[-.1,-.46],[-.2,-.4],[-.2,-.23],[-.06,-.15]];thickness=.07;}
    else if(d.shape==='wood'){points=rect(.045,.55);thickness=.08;}
    else if(d.shape==='paper'){points=rect(.38,.28);thickness=.018;}
    else if(d.shape==='book'){points=rect(.3,.38);thickness=.10;}
    else if(d.shape==='locker'){points=[[-.3,-.95],[.3,-.95],[.3,.75],[-.3,.75]];thickness=.30;}
    else if(d.shape==='bed'){points=rect(.65,.3);thickness=.45;}
    else if(d.shape==='bench'){points=rect(.6,.35);thickness=.4;}
    else if(d.shape==='wire'||d.shape==='blood'||d.shape==='key'){points=Array.from({length:16},(_,i)=>[Math.cos(i/16*Math.PI*2)*.32,Math.sin(i/16*Math.PI*2)*.27]);thickness=d.shape==='blood'?.005:.08;}
    else points=rect(.3,.22);
    function project(x,y,z){const rx=x*Math.cos(yaw)+z*Math.sin(yaw),rz=-x*Math.sin(yaw)+z*Math.cos(yaw),ry=y*Math.cos(pitch)-rz*Math.sin(pitch),zz=y*Math.sin(pitch)+rz*Math.cos(pitch),perspective=1/(1-zz*.28);return{x:rx*perspective,y:ry*perspective,z:zz};}
    const front=points.map(p=>project(...p,thickness/2)),back=points.map(p=>project(...p,-thickness/2)),faces=[{p:front,texture:true,brightness:1},{p:back,brightness:.7}];
    for(let i=0;i<points.length;i++){const j=(i+1)%points.length;faces.push({p:[front[i],back[i],back[j],front[j]],brightness:.45+(i%3)*.12});}
    for(const face of faces)face.z=face.p.reduce((a,p)=>a+p.z,0)/face.p.length;
    faces.sort((a,b)=>a.z-b.z);
    function shade(hex,n){return'#'+hex.replace('#','').match(/../g).map(v=>Math.round(parseInt(v,16)*n).toString(16).padStart(2,'0')).join('');}
    for(const face of faces){g.beginPath();face.p.forEach((p,i)=>i?g.lineTo(p.x*size,p.y*size):g.moveTo(p.x*size,p.y*size));g.closePath();g.fillStyle=shade(d.color,face.brightness);g.fill();g.strokeStyle='#111d2533';g.lineWidth=Math.max(.5,size*.002);g.stroke();
      if(face.texture){g.save();g.clip();const o=project(0,0,thickness/2),u=project(1,0,thickness/2),v=project(0,1,thickness/2);g.transform((u.x-o.x)*size,(u.y-o.y)*size,(v.x-o.x)*size,(v.y-o.y)*size,o.x*size,o.y*size);drawObject(g,id,1,0,true);g.restore();}}
  }
  function updateLayout(){
    if ($('#panel').hidden) $('#panel').classList.remove('navigation-screen');
    const navigation = !$('#panel').hidden && $('#panel').classList.contains('navigation-screen');
    document.body.classList.toggle('map-screen', navigation);
    $('#mapButton').setAttribute('aria-expanded', String(navigation));
    $('#mapButton').setAttribute('aria-label', navigation ? 'Return to game' : 'Map and menu');
    $('#mapButton').title = navigation ? 'Return to game' : 'Map and menu';
    $('#mapButton').setAttribute('aria-controls', 'panel');
    document.body.classList.toggle('notebook-with-talk',!$('#notes').hidden&&!$('#conversation').hidden);
    const v=window.visualViewport,typing=['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
    document.body.classList.toggle('keyboard-open',!!(v&&typing&&v.height<innerHeight*.78));
    const root=document.documentElement;
    root.style.setProperty('--visible-height',(v?.height||innerHeight)+'px');
    root.style.setProperty('--visible-top',(v?.offsetTop||0)+'px');
  }
  window.visualViewport?.addEventListener('resize',updateLayout);
  window.visualViewport?.addEventListener('scroll',updateLayout);
  window.addEventListener('orientationchange',releaseInputs);
  window.addEventListener('blur',releaseInputs);
  document.addEventListener('focusin',updateLayout);
  document.addEventListener('focusout',updateLayout);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseInputs();});
  document.addEventListener('contextmenu',e=>{if(e.target.closest('canvas,#hud'))e.preventDefault();});
  // Save before opening another build and allow a user-requested waiting worker to activate.
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(sessionStorage.getItem('haematha-apply-update')==='yes'){
      sessionStorage.removeItem('haematha-apply-update'); location.reload();
    }
  });
  navigator.serviceWorker?.getRegistration().then(reg=>{
    if(!reg)return;
    function offer(){if(!reg.waiting)return;const box=document.createElement('div');box.id='updateNotice';box.innerHTML='<span>A new build is ready.</span><button>Save & update</button>';box.querySelector('button').onclick=()=>{autoSave('Before app update');sessionStorage.setItem('haematha-apply-update','yes');reg.waiting?.postMessage({type:'ACTIVATE_UPDATE'});};if(!$('#updateNotice'))document.body.append(box);}
    offer();reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',offer));
  }).catch(()=>{});
  Haematha.build=BUILD;
  Haematha.inspection=()=>({angle:inspectAngle,tilt,zoom:inspectZoom,pointers:objectPointers.size});
  updateLayout();
})();
