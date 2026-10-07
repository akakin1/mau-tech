import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const output=path.join(root,'out');
const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const routes=walk(output).filter(file=>file.endsWith('.html')).map(file=>file===path.join(output,'index.html')?'/':file.slice(output.length,-5));
const worker=fs.readFileSync(path.join(root,'worker/index.mjs'),'utf8').replace('__PAGE_ROUTES__',JSON.stringify(routes));
fs.rmSync(path.join(root,'dist'),{recursive:true,force:true});
fs.mkdirSync(path.join(root,'dist/server'),{recursive:true});
fs.cpSync(output,path.join(root,'dist/client'),{recursive:true});
for (const file of walk(output).filter(file=>file.endsWith('.html'))) {
  const relative=path.relative(output,file);
  const target=path.join(root,'dist/client/_pages',relative.replace(/\.html$/,'.txt'));
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.renameSync(path.join(root,'dist/client',relative),target);
}
fs.writeFileSync(path.join(root,'dist/server/index.js'),worker);
console.log('Hosting adapter prepared for',routes.length,'exported pages');
