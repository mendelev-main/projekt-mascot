import {copyFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const webRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repoRoot=resolve(webRoot,'..');
const assets=[
  ['models/projekt-mascot-v04.glb','public/models/projekt-mascot-v04.glb'],
  ['blender/renders/mascot_front_v04.png','public/fallback/mascot-front-v04.png'],
];

for(const [source,target] of assets){
  const from=resolve(repoRoot,source);
  const to=resolve(webRoot,target);
  await mkdir(dirname(to),{recursive:true});
  await copyFile(from,to);
  console.log(`synced ${source} -> web/${target}`);
}
