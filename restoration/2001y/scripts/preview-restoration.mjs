import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const base=path.resolve('out');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const old=/^\/blog\/(?:web|gadget|camera|other)\/(.+)$/.exec(url.pathname);
  if(url.pathname==='/works'||old){res.writeHead(old?301:307,{location:old?'/blog/'+old[1]+url.search:'/'+url.search});return res.end();}
  let route=decodeURIComponent(url.pathname).replace(/\/$/,'')||'/';if(route.includes('..')){res.writeHead(400);return res.end();}
  let file=path.join(base,route);
  try {const stat=await fs.stat(file);if(stat.isDirectory()) {
    try {await fs.stat(path.join(file,'index.html'));file=path.join(file,'index.html');}
    catch {file+='.html';}
  }}
  catch {if(!path.extname(file))file+='.html';}
  try {const bytes=await fs.readFile(file);res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});res.end(bytes);}
  catch {res.writeHead(404,{'content-type':'text/html'});res.end(await fs.readFile(path.join(base,'404.html')));}
}).listen(4175,'127.0.0.1',()=>console.log('Restoration preview http://127.0.0.1:4175'));
