const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const excluded=new Set(['node_modules','.git','vendor','fixtures','dist','assets','reference-sources']);
let files=0,inline=0;
function visit(folder){
  for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
    if(excluded.has(entry.name))continue;
    const file=path.join(folder,entry.name);
    if(entry.isDirectory())visit(file);
    else if(/\.(?:js|cjs|mjs)$/.test(entry.name)){
      const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
      if(result.status!==0){process.stderr.write(result.stderr||'Syntax check failed');process.exit(1);}files++;
    }else if(entry.name.endsWith('.html')){
      for(const match of fs.readFileSync(file,'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
        if(/\bsrc\s*=|\btype\s*=\s*["'](?:module|application\/)/i.test(match[1]))continue;
        new vm.Script(match[2],{filename:path.relative(root,file)});inline++;
      }
    }
  }
}
visit(root);console.log(`Syntax checked: ${files} JavaScript files; ${inline} inline scripts. TypeScript checked by the Paradise build.`);
