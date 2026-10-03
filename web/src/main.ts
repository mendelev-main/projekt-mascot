import * as THREE from 'three';
import {MascotController,MascotEmotion} from './MascotController';
import './style.css';

const canvas=document.querySelector<HTMLCanvasElement>('#mascot-canvas')!;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,1,.1,100);
camera.position.set(0,0,7);

const mascot=new MascotController();
scene.add(mascot.root);

// Placeholder geometry proves runtime/controller before GLB lands.
const shellMat=new THREE.MeshPhysicalMaterial({color:0xffc98d,transparent:true,opacity:.24,roughness:.08,transmission:.75,thickness:.25});
const shell=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.35,1.8,12,8,8),shellMat);
shell.geometry.computeVertexNormals();
mascot.root.add(shell);

const coffeeMat=new THREE.MeshPhysicalMaterial({color:0x351006,roughness:.3});
const coffee=new THREE.Mesh(new THREE.BoxGeometry(2.9,.82,1.55),coffeeMat);
coffee.position.y=-.18;
mascot.coffeeSurface.add(coffee);

const cremaMat=new THREE.MeshStandardMaterial({color:0xc66a25,roughness:.55});
const crema=new THREE.Mesh(new THREE.BoxGeometry(2.88,.08,1.53),cremaMat);
crema.position.y=.25;
mascot.coffeeSurface.add(crema);

const faceMat=new THREE.MeshStandardMaterial({color:0xffe5a7,emissive:0xff9d42,emissiveIntensity:2});
function pill(x:number){
  const m=new THREE.Mesh(new THREE.CapsuleGeometry(.10,.22,8,16),faceMat);
  m.position.set(x,-.12,.93); m.rotation.x=Math.PI/2; mascot.root.add(m); return m;
}
const eyeL=pill(-.48), eyeR=pill(.48);
const mouth=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,12,32,Math.PI),faceMat);
mouth.position.set(0,-.26,.94); mouth.rotation.set(Math.PI/2,0,Math.PI); mascot.root.add(mouth);

scene.add(new THREE.HemisphereLight(0xffead0,0x3a1a0d,2.5));
const key=new THREE.DirectionalLight(0xffd0a0,4); key.position.set(3,4,5); scene.add(key);

function resize(){
  const rect=canvas.getBoundingClientRect();
  renderer.setSize(rect.width,rect.height,false);
  camera.aspect=rect.width/rect.height; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas); resize();

canvas.addEventListener('pointermove',e=>{
  const r=canvas.getBoundingClientRect();
  mascot.lookAtNormalized((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1);
});

document.querySelectorAll<HTMLButtonElement>('[data-emotion]').forEach(b=>b.onclick=()=>{
  const emotion=b.dataset.emotion as MascotEmotion; mascot.setEmotion(emotion);
  if(emotion==='happy') mascot.impulse(.7);
  if(emotion==='surprised') mascot.impulse(1.2);
  eyeL.scale.y=eyeR.scale.y=emotion==='sleepy'?.18:1;
  mouth.scale.setScalar(emotion==='happy'?1.25:1);
});
document.querySelector<HTMLButtonElement>('#move-left')!.onclick=()=>mascot.moveToX(-1.15);
document.querySelector<HTMLButtonElement>('#move-right')!.onclick=()=>mascot.moveToX(1.15);
document.querySelector<HTMLButtonElement>('#impulse')!.onclick=()=>mascot.impulse(1);
document.querySelector<HTMLInputElement>('#slosh')!.oninput=e=>mascot.options.sloshStrength=+(e.target as HTMLInputElement).value;
document.querySelector<HTMLInputElement>('#damping')!.oninput=e=>mascot.options.damping=+(e.target as HTMLInputElement).value;
document.querySelector<HTMLInputElement>('#reduced-motion')!.onchange=e=>mascot.options.reducedMotion=(e.target as HTMLInputElement).checked;

const debug=document.querySelector('#debug')!;
let last=performance.now();
function frame(now:number){
  const dt=(now-last)/1000; last=now;
  mascot.update(dt,now);
  debug.textContent=`emotion: ${mascot.getEmotion()}\nslosh: ${mascot.options.sloshStrength.toFixed(2)}\ndamping: ${mascot.options.damping.toFixed(2)}`;
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
