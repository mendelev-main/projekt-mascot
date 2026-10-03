import * as THREE from 'three';

export interface SloshSample {
  tilt:number;
  wave:number;
  phase:number;
}

/**
 * Lightweight 1D liquid response used to deform the coffee surface.
 * It intentionally models perceived inertia, not computational fluid dynamics.
 */
export class CoffeeSlosh {
  tilt=0;
  tiltVelocity=0;
  wave=0;
  waveVelocity=0;
  phase=0;

  update(dt:number, accelerationX:number, strength:number, damping:number, reducedMotion:boolean):SloshSample {
    const step=Math.min(dt,1/30);
    const target=reducedMotion?0:THREE.MathUtils.clamp(-accelerationX*.018*strength,-.24,.24);

    this.tiltVelocity+=(target-this.tilt)*18*step;
    this.tiltVelocity*=Math.pow(damping,step*60);
    this.tilt+=this.tiltVelocity*step*60;

    const energy=Math.abs(target-this.tilt)+Math.abs(this.tiltVelocity)*.12;
    const waveTarget=reducedMotion?0:THREE.MathUtils.clamp(energy*.18,0,.07);
    this.waveVelocity+=(waveTarget-this.wave)*10*step;
    this.waveVelocity*=Math.pow(.88,step*60);
    this.wave+=this.waveVelocity*step*60;
    this.phase+=step*(4.2+Math.min(energy*8,3));

    return {tilt:this.tilt,wave:this.wave,phase:this.phase};
  }

  impulse(amount:number){
    this.tiltVelocity+=amount*.045;
    this.waveVelocity+=Math.abs(amount)*.018;
  }
}

export function createCoffeeSurface(width=2.88,depth=1.53,segmentsX=36,segmentsZ=18){
  const geometry=new THREE.PlaneGeometry(width,depth,segmentsX,segmentsZ);
  geometry.rotateX(-Math.PI/2);
  const base=geometry.attributes.position.array.slice() as Float32Array;
  geometry.setAttribute('basePosition',new THREE.BufferAttribute(base,3));

  const material=new THREE.MeshPhysicalMaterial({
    color:0x5b1b08,
    roughness:.22,
    clearcoat:.25,
    clearcoatRoughness:.18,
    side:THREE.DoubleSide
  });
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name='CoffeeSurface';
  return mesh;
}

export function deformCoffeeSurface(mesh:THREE.Mesh,sample:SloshSample){
  const geometry=mesh.geometry as THREE.BufferGeometry;
  const pos=geometry.getAttribute('position') as THREE.BufferAttribute;
  const base=geometry.getAttribute('basePosition') as THREE.BufferAttribute;
  if(!pos||!base)return;

  for(let i=0;i<pos.count;i++){
    const x=base.getX(i);
    const y=base.getY(i);
    const z=base.getZ(i);
    const normalizedX=x/1.44;
    const edge=Math.pow(Math.min(Math.abs(normalizedX),1),1.7);
    const longWave=Math.sin(normalizedX*Math.PI*1.35+sample.phase)*sample.wave;
    const crossWave=Math.sin((z/.765)*Math.PI+sample.phase*.72)*sample.wave*.32;
    const height=normalizedX*sample.tilt + longWave*(.35+.65*edge)+crossWave;
    pos.setXYZ(i,x,y+height,z);
  }
  pos.needsUpdate=true;
  geometry.computeVertexNormals();
}
