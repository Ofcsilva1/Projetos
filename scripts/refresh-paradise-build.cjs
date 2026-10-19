// Synchronize only the local static artifact consumed by Pages. Never deploy.
const fs=require('node:fs'),path=require('node:path');
const target=path.resolve(__dirname,'../paradise-island');
const source=path.join(target,'source/dist');
if(!fs.existsSync(path.join(source,'index.html')))throw new Error('Run the Paradise build first.');
const check=process.argv.includes('--check');
const previous=fs.readFileSync(path.join(target,'index.html'),'utf8');
const refs=html=>[...html.matchAll(/(?:src|href)="\.\/(assets\/[A-Za-z0-9_-]+\.(?:js|css))"/g)].map(m=>m[1]);
const current=fs.readFileSync(path.join(source,'index.html'),'utf8');
let changed=0;
function copy(folder){
  for(const e of fs.readdirSync(folder,{withFileTypes:true})){
    if(e.isSymbolicLink())throw new Error('Unexpected symlink in build.');
    const input=path.join(folder,e.name),relative=path.relative(source,input),output=path.resolve(target,relative);
    if(!output.startsWith(target+path.sep))throw new Error('Invalid build path.');
    if(e.isDirectory())copy(input);
    else if(!fs.existsSync(output)||!fs.readFileSync(input).equals(fs.readFileSync(output))){
      changed++;
      if(!check){fs.mkdirSync(path.dirname(output),{recursive:true});fs.copyFileSync(input,output);}
    }
  }
}
copy(source);
if(check&&changed)throw new Error(`Static Paradise artifact differs in ${changed} files. Run npm run refresh:paradise.`);
if(!check){
  // Only old generated JS/CSS referenced by the prior entry page are retired.
  // Original versions remain in Git; source, media, fonts and data are untouched.
  const keep=new Set(refs(current));
  for(const ref of refs(previous))if(!keep.has(ref)){
    const file=path.resolve(target,ref);
    if(!file.startsWith(path.join(target,'assets')+path.sep))throw new Error('Invalid asset path.');
    if(fs.existsSync(file))fs.unlinkSync(file);
  }
}
console.log(check?'Static Paradise artifact matches the build.':`Updated ${changed} local static files; no publication performed.`);
