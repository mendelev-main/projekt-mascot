import * as THREE from 'three';
import {MascotController,MascotEmotion} from './MascotController';
import {createCoffeeSurface,deformCoffeeSurface} from './CoffeeSlosh';
import './style.css';

const canvas=document.querySelector<HTMLCanvasElement>('#mascot-canvas')!;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,1,.1,100);
camera.position.set(0,.05,7.2);

const mascot=new MascotController();
scene.add(mascot.root);

function roundedBox(w:number,h:number,d:number,r:number){
  const shape=new THREE.Shape();
  const x=-w/2,y=-h/2;
  shape.moveTo(x+r,y);
  shape.lineTo(x+w-r,y);
  shape.quadraticCurveTo(x+w,y,x+w,y+r);
  shape.lineTo(x+w,y+h-r);
  shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  shape.lineTo(x+r,y+h);
  shape.quadraticCurveTo(x,y+h,x,y+h-r);
  shape.lineTo(x,y+r);
  shape.quadraticCurveTo(x,y,x+r,y);
  const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSegments:6,steps:1,bevelSize:r*.26,bevelThickness:r*.26});
  g.center();
  return g;
}

const shellMat=new THREE.MeshPhysicalMaterial({
  color:0xffd7ae,transparent:true,opacity:.18,roughness:.03,transmission:.98,
  thickness:.18,ior:1.44,clearcoat:.55,clearcoatRoughness:.04
});
const shell=new THREE.Mesh(roundedBox(3.25,1.85,1.32,.48),shellMat);
shell.name='Shell';
mascot.root.add(shell);

const innerGlowMat=new THREE.MeshBasicMaterial({color:0xffd9b0,transparent:true,opacity:.055,side:THREE.BackSide});
const innerGlow=new THREE.Mesh(roundedBox(3.11,1.71,1.19,.42),innerGlowMat);
innerGlow.name='InnerGlassGlow';
mascot.root.add(innerGlow);

const coffeeMat=new THREE.MeshPhysicalMaterial({color:0x3b1005,roughness:.22,clearcoat:.22,clearcoatRoughness:.16});
const coffee=new THREE.Mesh(roundedBox(2.92,1.12,1.12,.34),coffeeMat);
coffee.position.y=-.31;
coffee.name='CoffeeVolume';
mascot.coffeeSurface.add(coffee);

const surface=createCoffeeSurface(2.84,1.06,40,18);
surface.position.y=.24;
mascot.coffeeSurface.add(surface);

const cremaMat=new THREE.MeshPhysicalMaterial({color:0xd47a2d,roughness:.46,transparent:true,opacity:.9,clearcoat:.12});
const crema=surface.clone();
crema.name='Crema';
crema.geometry=surface.geometry.clone();
crema.material=cremaMat;
crema.scale.set(.995,1,.995);
crema.position.y=.257;
mascot.coffeeSurface.add(crema);

const faceMat=new THREE.MeshStandardMaterial({color:0xfff3d7,emissive:0xffa64c,emissiveIntensity:3.2,roughness:.24});
function eye(x:number){
  const m=new THREE.Mesh(new THREE.CapsuleGeometry(.082,.19,8,18),faceMat);
  m.position.set(x,-.06,.755);
  mascot.root.add(m);
  return m;
}
const eyeL=eye(-.46),eyeR=eye(.46);

const smile=new THREE.Mesh(new THREE.TorusGeometry(.16,.03,12,40,Math.PI),faceMat);
smile.position.set(0,-.30,.775);
smile.rotation.z=Math.PI;
mascot.root.add(smile);

const surpriseMouth=new THREE.Mesh(new THREE.TorusGeometry(.095,.026,12,36),faceMat);
surpriseMouth.position.set(0,-.30,.775);
surpriseMouth.visible=false;
mascot.root.add(surpriseMouth);

const highlightMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.22,depthWrite:false});
const highlightA=new THREE.Mesh(new THREE.CapsuleGeometry(.032,.42,6,12),highlightMat);
highlightA.position.set(-1.18,.34,.72);
highlightA.rotation.z=-.24;
mascot.root.add(highlightA);
const highlightB=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),highlightMat);
highlightB.scale.set(1.4,.55,.35);
highlightB.position.set(-.92,.62,.73);
mascot.root.add(highlightB);

const shadowMat=new THREE.MeshBasicMaterial({color:0x3a1a0d,transparent:true,opacity:.13,depthWrite:false});
const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.15,64),shadowMat);
shadow.rotation.x=-Math.PI/2;
shadow.scale.y=.35;
shadow.position.set(0,-1.12,0);
scene.add(shadow);

scene.add(new THREE.HemisphereLight(0xffead3,0x32140a,2.55));
const key=new THREE.DirectionalLight(0xffd2a5,4.7);key.position.set(3,4,5);scene.add(key);
const rim=new THREE.DirectionalLight(0xff9b55,2.7);rim.position.set(-4,2,-2);scene.add(rim);
const faceFill=new THREE.PointLight(0xffb267,8,4);faceFill.position.set(0,0,3);scene.add(faceFill);

function resize(){
  const r=canvas.getBoundingClientRect();
  renderer.setSize(r.width,r.height,false);
  camera.aspect=r.width/r.height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

canvas.addEventListener('pointermove',e=>{
  const r=canvas.getBoundingClientRect();
  mascot.lookAtNormalized((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1);
});

function setEmotion(emotion:MascotEmotion){
  mascot.setEmotion(emotion);
  if(emotion==='happy') mascot.impulse(.7);
  if(emotion==='surprised') mascot.impulse(1.15);
  surpriseMouth.visible=emotion==='surprised';
  smile.visible=emotion!=='surprised';
}
document.querySelectorAll<HTMLButtonElement>('[data-emotion]').forEach(b=>b.onclick=()=>setEmotion(b.dataset.emotion as MascotEmotion));
document.querySelector<HTMLButtonElement>('#move-left')!.onclick=()=>mascot.moveToX(-1.15);
document.querySelector<HTMLButtonElement>('#move-right')!.onclick=()=>mascot.moveToX(1.15);
document.querySelector<HTMLButtonElement>('#impulse')!.onclick=()=>mascot.impulse(1);
document.querySelector<HTMLInputElement>('#slosh')!.oninput=e=>mascot.options.sloshStrength=+(e.target as HTMLInputElement).value;
document.querySelector<HTMLInputElement>('#damping')!.oninput=e=>mascot.options.damping=+(e.target as HTMLInputElement).value;
document.querySelector<HTMLInputElement>('#reduced-motion')!.onchange=e=>mascot.options.reducedMotion=(e.target as HTMLInputElement).checked;

const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)');
const reduced=document.querySelector<HTMLInputElement>('#reduced-motion')!;
reduced.checked=prefersReduced.matches;
mascot.options.reducedMotion=prefersReduced.matches;
prefersReduced.addEventListener('change',e=>{reduced.checked=e.matches;mascot.options.reducedMotion=e.matches});

const debug=document.querySelector('#debug')!;
let last=performance.now();
function frame(now:number){
  const dt=(now-last)/1000;
  last=now;
  mascot.update(dt,now);

  const s=mascot.getSlosh();
  deformCoffeeSurface(surface,s);
  deformCoffeeSurface(crema,s);

  const emotion=mascot.getEmotion();
  const autoBlink=!mascot.options.reducedMotion&&emotion!=='surprised'
    ?Math.pow(Math.max(0,Math.sin(now*.00115+1.4)),54)
    :0;
  const emotionEye=emotion==='sleepy'?.22:emotion==='happy'?.78:emotion==='surprised'?1.18:1;
  const targetEye=Math.max(.08,emotionEye*(1-autoBlink*.92));
  eyeL.scale.y=THREE.MathUtils.lerp(eyeL.scale.y,targetEye,.22);
  eyeR.scale.y=THREE.MathUtils.lerp(eyeR.scale.y,targetEye,.22);

  const smileScale=emotion==='happy'?1.28:emotion==='sleepy'?.82:1;
  smile.scale.x=THREE.MathUtils.lerp(smile.scale.x,smileScale,.14);
  smile.scale.y=THREE.MathUtils.lerp(smile.scale.y,emotion==='sleepy'?.7:1,.14);
  smile.rotation.z=THREE.MathUtils.lerp(smile.rotation.z,emotion==='sleepy'?0:Math.PI,.1);

  const bob=mascot.options.reducedMotion?0:Math.sin(now*.0017)*.018;
  shadow.scale.x=1.12-bob*1.4;
  shadow.material.opacity=.13-bob*.4;

  debug.textContent=`emotion: ${emotion}\ntilt: ${s.tilt.toFixed(3)}\nwave: ${s.wave.toFixed(3)}\nslosh: ${mascot.options.sloshStrength.toFixed(2)}\ndamping: ${mascot.options.damping.toFixed(2)}`;
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
