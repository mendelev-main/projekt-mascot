import * as THREE from 'three';
import {CoffeeSlosh,SloshSample} from './CoffeeSlosh';
export type MascotEmotion='neutral'|'happy'|'surprised'|'sleepy';
export interface MascotOptions{sloshStrength?:number;damping?:number;reducedMotion?:boolean}
export class MascotController{
 readonly root=new THREE.Group();readonly coffeeSurface=new THREE.Group();
 private targetX=0;private velocityX=0;private previousVelocityX=0;private emotion:MascotEmotion='neutral';
 private liquid=new CoffeeSlosh();private lastSlosh:SloshSample={tilt:0,wave:0,phase:0};options:Required<MascotOptions>;
 constructor(options:MascotOptions={}){this.options={sloshStrength:options.sloshStrength??1,damping:options.damping??.9,reducedMotion:options.reducedMotion??false};this.root.name='MascotRoot';this.coffeeSurface.name='CoffeeSurfaceDriver';this.root.add(this.coffeeSurface)}
 setEmotion(v:MascotEmotion){this.emotion=v}getEmotion(){return this.emotion}getSlosh(){return this.lastSlosh}
 moveToX(x:number){this.targetX=THREE.MathUtils.clamp(x,-1.5,1.5)}
 impulse(a=1){if(!this.options.reducedMotion)this.liquid.impulse(a)}
 lookAtNormalized(x:number,y:number){if(this.options.reducedMotion)return;this.root.rotation.y=THREE.MathUtils.lerp(this.root.rotation.y,-x*.08,.08);this.root.rotation.x=THREE.MathUtils.lerp(this.root.rotation.x,y*.05,.08)}
 update(dt:number,time:number){const s=Math.min(dt,1/30),dx=this.targetX-this.root.position.x;this.velocityX+=dx*(this.options.reducedMotion?5:10)*s;this.velocityX*=Math.pow(.82,s*60);this.root.position.x+=this.velocityX*s;
  const a=(this.velocityX-this.previousVelocityX)/(s||1);this.previousVelocityX=this.velocityX;this.lastSlosh=this.liquid.update(s,a,this.options.sloshStrength,this.options.damping,this.options.reducedMotion);
  this.coffeeSurface.rotation.z=this.lastSlosh.tilt*.20;this.root.position.y=this.options.reducedMotion?0:Math.sin(time*.0017)*.035;this.root.rotation.z=this.options.reducedMotion?0:Math.sin(time*.0011)*.012}
}