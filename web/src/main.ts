import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MascotController,MascotEmotion} from './MascotController';
import {createCoffeeSurface,deformCoffeeSurface} from './CoffeeSlosh';
import './style.css';

const canvas=document.querySelector<HTMLCanvasElement>('#mascot-canvas')!;
const staticFallback=document.querySelector<HTMLImageElement>('#static-fallback')!;
const webgl=canvas.getContext('webgl2');
if(!webgl){
  canvas.hidden=true;
  staticFallback.hidden=false;
  throw new Error('WebGL 2 is unavailable; showing the static mascot fallback.');
}
const renderer=new THREE.WebGLRenderer({canvas,context:webgl,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,1,.1,100);
camera.position.set(0,.05,7.2);
const modelFrame={width:3.55,height:2.25,padding:1.16};

const mascot=new MascotController();
scene.add(mascot.root);
const proceduralVisuals=new THREE.Group();
proceduralVisuals.name='ProceduralFallback';
mascot.root.add(proceduralVisuals);
const proceduralLiquid=new THREE.Group();
proceduralLiquid.name='ProceduralLiquidFallback';
mascot.coffeeSurface.add(proceduralLiquid);

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
  color:0xffc98f,transparent:true,opacity:.3,roughness:.07,transmission:.94,
  thickness:.34,ior:1.44,clearcoat:.5,clearcoatRoughness:.08,side:THREE.DoubleSide,depthWrite:false,
  attenuationColor:new THREE.Color(0xffb56f),attenuationDistance:2.4
});
const shell=new THREE.Mesh(roundedBox(3.25,1.85,1.32,.48),shellMat);
shell.name='Shell';
proceduralVisuals.add(shell);
const shellEdge=new THREE.LineSegments(
  new THREE.EdgesGeometry(shell.geometry,32),
  new THREE.LineBasicMaterial({color:0xc77a43,transparent:true,opacity:.28,depthWrite:false})
);
shellEdge.name='ShellEdge';
proceduralVisuals.add(shellEdge);

const innerGlowMat=new THREE.MeshBasicMaterial({color:0xffd6aa,transparent:true,opacity:.09,side:THREE.BackSide,depthWrite:false});
const innerGlow=new THREE.Mesh(roundedBox(3.11,1.71,1.19,.42),innerGlowMat);
innerGlow.name='InnerGlassGlow';
proceduralVisuals.add(innerGlow);

const coffeeMat=new THREE.MeshPhysicalMaterial({color:0x351006,roughness:.28,clearcoat:.16,clearcoatRoughness:.2});
const coffee=new THREE.Mesh(roundedBox(2.92,1.12,1.12,.34),coffeeMat);
coffee.position.y=-.31;
coffee.name='CoffeeVolume';
proceduralLiquid.add(coffee);

const surface=createCoffeeSurface(2.84,1.06,40,18);
surface.position.y=.24;
proceduralLiquid.add(surface);

const cremaMat=new THREE.MeshPhysicalMaterial({color:0xd9752b,roughness:.5,transparent:true,opacity:.94,clearcoat:.08});
const cremaBandMat=new THREE.MeshPhysicalMaterial({
  color:0xf09a4a,roughness:.54,clearcoat:.06,emissive:0x5a1907,emissiveIntensity:.45
});
const crema=surface.clone();
crema.name='CremaSurface';
crema.geometry=surface.geometry.clone();
crema.material=cremaMat;
crema.scale.set(.995,1,.995);
crema.position.y=.257;
proceduralLiquid.add(crema);

// The deforming top surface is viewed almost edge-on from the front. This thin
// companion volume keeps the signature crema readable without faking a lid.
const cremaBand=new THREE.Mesh(roundedBox(2.84,.14,1.125,.065),cremaBandMat);
cremaBand.name='Crema';
cremaBand.position.set(0,.27,.045);
proceduralLiquid.add(cremaBand);

const faceMat=new THREE.MeshStandardMaterial({color:0xfff4dc,emissive:0xff9e42,emissiveIntensity:2.65,roughness:.28});
function eye(x:number){
  const m=new THREE.Mesh(new THREE.CapsuleGeometry(.082,.19,8,18),faceMat);
  m.position.set(x,-.06,.755);
  proceduralVisuals.add(m);
  return m;
}
let eyeL:THREE.Object3D=eye(-.46),eyeR:THREE.Object3D=eye(.46);

const smile=new THREE.Mesh(new THREE.TorusGeometry(.16,.03,12,40,Math.PI),faceMat);
smile.position.set(0,-.30,.775);
smile.rotation.z=Math.PI;
proceduralVisuals.add(smile);
let activeMouth:THREE.Object3D=smile;
let mouthHappyRotation=Math.PI;
let mouthSadRotation=0;

const surpriseMouth=new THREE.Mesh(new THREE.TorusGeometry(.095,.026,12,36),faceMat);
surpriseMouth.position.set(0,-.30,.775);
surpriseMouth.visible=false;
mascot.root.add(surpriseMouth);

const highlightMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.22,depthWrite:false});
const highlightA=new THREE.Mesh(new THREE.CapsuleGeometry(.026,.34,6,12),highlightMat);
highlightA.position.set(-1.2,.3,.72);
highlightA.rotation.z=-.24;
proceduralVisuals.add(highlightA);
const highlightB=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),highlightMat);
highlightB.scale.set(1.4,.55,.35);
highlightB.position.set(-.92,.62,.73);
proceduralVisuals.add(highlightB);
const highlightTop=new THREE.Mesh(new THREE.CapsuleGeometry(.025,1.5,6,18),highlightMat);
highlightTop.position.set(-.12,.68,.71);
highlightTop.rotation.z=Math.PI/2-.035;
highlightTop.scale.y=.7;
proceduralVisuals.add(highlightTop);

const shadowMat=new THREE.MeshBasicMaterial({color:0x3a1a0d,transparent:true,opacity:.13,depthWrite:false});
const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.15,64),shadowMat);
shadow.rotation.x=-Math.PI/2;
shadow.scale.y=.35;
shadow.position.set(0,-1.12,0);
scene.add(shadow);

scene.add(new THREE.HemisphereLight(0xffead3,0x32140a,2.55));
const key=new THREE.DirectionalLight(0xffd2a5,4.7);key.position.set(3,4,5);scene.add(key);
const rim=new THREE.DirectionalLight(0xff9b55,2.7);rim.position.set(-4,2,-2);scene.add(rim);

let assetState='loading GLB';
const modelUrl=`${import.meta.env.BASE_URL}models/projekt-mascot-v04.glb`;
new GLTFLoader().load(modelUrl,gltf=>{
  const importedRoot=gltf.scene.getObjectByName('MascotRoot')??gltf.scene;
  mascot.root.add(gltf.scene);
  scene.updateMatrixWorld(true);

  const liquidNodes:THREE.Object3D[]=[];
  importedRoot.traverse(node=>{
    if(node.name==='CoffeeVolume'||node.name==='Crema'||node.name==='CremaSurface'||node.name.startsWith('CremaBubble_')) liquidNodes.push(node);
  });
  liquidNodes.forEach(node=>mascot.coffeeSurface.attach(node));

  const importedEyeL=importedRoot.getObjectByName('Eye_L');
  const importedEyeR=importedRoot.getObjectByName('Eye_R');
  const importedMouth=importedRoot.getObjectByName('Mouth');
  if(importedEyeL) eyeL=importedEyeL;
  if(importedEyeR) eyeR=importedEyeR;
  if(importedMouth){
    activeMouth=importedMouth;
    mouthHappyRotation=importedMouth.rotation.z;
    mouthSadRotation=mouthHappyRotation+Math.PI;
  }

  proceduralVisuals.visible=false;
  proceduralLiquid.visible=false;
  assetState='GLB v0.4';
  setEmotion(mascot.getEmotion());
},undefined,error=>{
  console.warn('GLB unavailable; procedural fallback remains active.',error);
  assetState='procedural fallback';
});

canvas.addEventListener('webglcontextlost',event=>{
  event.preventDefault();
  canvas.hidden=true;
  staticFallback.hidden=false;
  assetState='static fallback';
});

function resize(){
  const r=canvas.getBoundingClientRect();
  if(!r.width||!r.height)return;
  renderer.setSize(r.width,r.height,false);
  camera.aspect=r.width/r.height;
  const verticalFov=THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*camera.aspect);
  const distanceForWidth=modelFrame.width*.5/Math.tan(horizontalFov/2);
  const distanceForHeight=modelFrame.height*.5/Math.tan(verticalFov/2);
  camera.position.z=Math.max(distanceForWidth,distanceForHeight)*modelFrame.padding;
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
  if(emotion==='excited') mascot.impulse(1.0);
  if(emotion==='surprised') mascot.impulse(1.15);
  if(emotion==='success') mascot.impulse(1.3);
  surpriseMouth.visible=emotion==='surprised';
  activeMouth.visible=emotion!=='surprised';
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
let stageVisible=true;
new IntersectionObserver(entries=>{stageVisible=entries[0]?.isIntersecting??true},{threshold:.01}).observe(canvas);
function frame(now:number){
  const dt=(now-last)/1000;
  last=now;
  if(document.hidden||!stageVisible){requestAnimationFrame(frame);return}
  mascot.update(dt,now);

  const s=mascot.getSlosh();
  deformCoffeeSurface(surface,s);
  deformCoffeeSurface(crema,s);

  const emotion=mascot.getEmotion();
  const autoBlink=!mascot.options.reducedMotion&&emotion!=='surprised'
    ?Math.pow(Math.max(0,Math.sin(now*.00115+1.4)),54)
    :0;
  const eyeScaleByEmotion:Record<MascotEmotion,[number,number]>={
    neutral:[1,1],happy:[.72,.72],excited:[1.16,1.16],surprised:[1.20,1.20],
    thinking:[.62,1],sad:[.74,.74],sleepy:[.20,.20],success:[.68,.68],focused:[.58,.58]
  };
  const [leftEye,rightEye]=eyeScaleByEmotion[emotion];
  eyeL.scale.y=THREE.MathUtils.lerp(eyeL.scale.y,Math.max(.08,leftEye*(1-autoBlink*.92)),.22);
  eyeR.scale.y=THREE.MathUtils.lerp(eyeR.scale.y,Math.max(.08,rightEye*(1-autoBlink*.92)),.22);

  const smileScaleX=emotion==='happy'?1.28:emotion==='excited'?1.42:emotion==='success'?1.48:emotion==='thinking'?.72:emotion==='focused'?.78:emotion==='sleepy'?.82:1;
  const smileScaleY=emotion==='excited'?1.18:emotion==='success'?1.22:emotion==='sleepy'?.58:emotion==='focused'?.48:1;
  const smileRotation=emotion==='sad'?mouthSadRotation:mouthHappyRotation;
  activeMouth.scale.x=THREE.MathUtils.lerp(activeMouth.scale.x,smileScaleX,.14);
  activeMouth.scale.y=THREE.MathUtils.lerp(activeMouth.scale.y,smileScaleY,.14);
  activeMouth.rotation.z=THREE.MathUtils.lerp(activeMouth.rotation.z,smileRotation,.1);

  const bob=mascot.options.reducedMotion?0:Math.sin(now*.0017)*.018;
  shadow.scale.x=1.12-bob*1.4;
  shadow.material.opacity=.13-bob*.4;

  debug.textContent=`asset: ${assetState}\nemotion: ${emotion}\ntilt: ${s.tilt.toFixed(3)}\nwave: ${s.wave.toFixed(3)}\nslosh: ${mascot.options.sloshStrength.toFixed(2)}\ndamping: ${mascot.options.damping.toFixed(2)}`;
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
