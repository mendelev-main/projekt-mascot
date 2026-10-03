import * as THREE from 'three';

export type MascotEmotion='neutral'|'happy'|'surprised'|'sleepy';

export interface MascotOptions {
  sloshStrength?:number;
  damping?:number;
  reducedMotion?:boolean;
}

export class MascotController {
  readonly root=new THREE.Group();
  readonly coffeeSurface=new THREE.Group();
  private targetX=0;
  private velocityX=0;
  private previousX=0;
  private slosh=0;
  private sloshVelocity=0;
  private emotion:MascotEmotion='neutral';
  options:Required<MascotOptions>;

  constructor(options:MascotOptions={}){
    this.options={
      sloshStrength:options.sloshStrength??1,
      damping:options.damping??0.9,
      reducedMotion:options.reducedMotion??false
    };
    this.root.name='MascotRoot';
    this.coffeeSurface.name='CoffeeSurfaceDriver';
    this.root.add(this.coffeeSurface);
  }

  setEmotion(value:MascotEmotion){ this.emotion=value; }
  getEmotion(){ return this.emotion; }

  moveToX(x:number){
    this.targetX=THREE.MathUtils.clamp(x,-1.5,1.5);
  }

  impulse(amount=1){
    if(this.options.reducedMotion) return;
    this.sloshVelocity+=amount*0.12;
  }

  lookAtNormalized(x:number,y:number){
    if(this.options.reducedMotion) return;
    this.root.rotation.y=THREE.MathUtils.lerp(this.root.rotation.y,-x*0.08,.08);
    this.root.rotation.x=THREE.MathUtils.lerp(this.root.rotation.x,y*0.05,.08);
  }

  update(dt:number,time:number){
    const safeDt=Math.min(dt,1/30);
    const stiffness=this.options.reducedMotion?5:10;
    const dx=this.targetX-this.root.position.x;
    this.velocityX+=dx*stiffness*safeDt;
    this.velocityX*=Math.pow(.82,safeDt*60);
    this.root.position.x+=this.velocityX*safeDt;

    const acceleration=(this.root.position.x-this.previousX)/(safeDt||1)-this.velocityX;
    this.previousX=this.root.position.x;

    const targetSlosh=this.options.reducedMotion?0:THREE.MathUtils.clamp(-acceleration*.035*this.options.sloshStrength,-.22,.22);
    const spring=16;
    this.sloshVelocity+=(targetSlosh-this.slosh)*spring*safeDt;
    this.sloshVelocity*=Math.pow(this.options.damping,safeDt*60);
    this.slosh+=this.sloshVelocity*safeDt*60;

    this.coffeeSurface.rotation.z=this.slosh;
    this.root.position.y=this.options.reducedMotion?0:Math.sin(time*.0017)*.035;
    this.root.rotation.z=this.options.reducedMotion?0:Math.sin(time*.0011)*.012;
  }
}
