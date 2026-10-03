import * as THREE from 'three';
import {MascotController,MascotEmotion} from './MascotController';
import {createCoffeeSurface,deformCoffeeSurface} from './CoffeeSlosh';
import './style.css';

const canvas=document.querySelector<HTMLCanvasElement>('#mascot-canvas')!;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;

const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,.05,7.2);
const mascot=new MascotController();scene.add(mascot.root);

function roundedBox(w:number,h:number,d:number,r:number){
 const shape=new THREE.Shape();const x=-w/2,y=-h/2;
 shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
 const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:r*.28,bevelThickness:r*.28});g.center();return g;
}

const shellMat=new THREE.MeshPhysicalMaterial({color:0xffd5a4,transparent:true,opacity:.22,roughness:.035,transmission:.96,thickness:.22,ior:1.45,clearcoat:.35});
const shell=new THREE.Mesh(roundedBox(3.25,1.85,1.32,.48),shellMat);shell.name='Shell';mascot.root.add(shell);

const coffeeMat=new THREE.MeshPhysicalMaterial({color:0x431306,roughness:.24,clearcoat:.18});
const coffee=new THREE.Mesh(roundedBox(2.92,1.12,1.12,.34),coffeeMat);coffee.position.y=-.31;coffee.name='CoffeeVolume';mascot.coffeeSurface.add(coffee);

const surface=createCoffeeSurface(2.84,1.06,40,18);surface.position.y=.24;mascot.coffeeSurface.add(surface);
const cremaMat=new THREE.MeshPhysicalMaterial({color:0xd47a2d,roughness:.5,transparent:true,opacity:.92});
const crema=surface.clone();crema.name='Crema';crema.material=cremaMat;crema.scale.set(.995,1,.995);crema.position.y=.255;mascot.coffeeSurface.add(crema);

const faceMat=new THREE.MeshStandardMaterial({color:0xfff0c9,emissive:0xffa94c,emissiveIntensity:3.4,roughness:.28});
function eye(x:number){const m=new THREE.Mesh(new THREE.CapsuleGeometry(.085,.20,8,18),faceMat);m.position.set(x,-.10,.76);m.rotation.x=Math.PI/2;mascot.root.add(m);return m}
const eyeL=eye(-.46),eyeR=eye(.46);
const mouth=new THREE.Mesh(new THREE.TorusGeometry(.16,.03,12,36,Math.PI),faceMat);mouth.position.set(0,-.31,.765);mouth.rotation.set(Math.PI/2,0,Math.PI);mascot.root.add(mouth);

scene.add(new THREE.HemisphereLight(0xffead3,0x32140a,2.5));
const key=new THREE.DirectionalLight(0xffd2a5,4.5);key.position.set(3,4,5);scene.add(key);
const rim=new THREE.DirectionalLight(0xff9b55,2.8);rim.position.set(-4,2,-2);scene.add(rim);

function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvas);resize();
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mascot.lookAtNormalized((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1)});

document.querySelectorAll<HTMLButtonElement>('[data-emotion]').forEach(b=>b.onclick=()=>{const emotion=b.dataset.emotion as MascotEmotion;mascot.setEmotion(emotion);if(emotion==='happy')mascot.impulse(.7);if(emotion==='surprised')mascot.impulse(1.2);eyeL.scale.y=eyeR.scale.y=emotion==='sleepy'?.18:1;mouth.scale.setScalar(emotion==='happy'?1.25:1)});
document.querySelector<HTMLButtonElement>('#move-left')!.onclick=()=>mascot.moveToX(-1.15);
document.querySelector<HTMLButtonElement>('#move-right')!.onclick=()=>mascot.moveToX(1.15);
document.querySelector<HTMLButtonElement>('#impulse')!.onclick=()=>mascot.impulse(1);
document.querySelector<HTMLInputElement>('#slosh')!.oninput=e=>mascot.options.sloshStrength=+(e.target as HTMLInputElement).value;
document.querySelector<HTMLInputElement>('#damping')!.oninput=e=>mascot.options.damping=+(e.target as HTMLInputElement).value;
document.querySelector<HTMLInputElement>('#reduced-motion')!.onchange=e=>mascot.options.reducedMotion=(e.target as HTMLInputElement).checked;

const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)');const reduced=document.querySelector<HTMLInputElement>('#reduced-motion')!;reduced.checked=prefersReduced.matches;mascot.options.reducedMotion=prefersReduced.matches;prefersReduced.addEventListener('change',e=>{reduced.checked=e.matches;mascot.options.reducedMotion=e.matches});
const debug=document.querySelector('#debug')!;let last=performance.now();
function frame(now:number){const dt=(now-last)/1000;last=now;mascot.update(dt,now);const s=mascot.getSlosh();deformCoffeeSurface(surface,s);deformCoffeeSurface(crema,s);debug.textContent=`emotion: ${mascot.getEmotion()}\ntilt: ${s.tilt.toFixed(3)}\nwave: ${s.wave.toFixed(3)}\nslosh: ${mascot.options.sloshStrength.toFixed(2)}\ndamping: ${mascot.options.damping.toFixed(2)}`;renderer.render(scene,camera);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
