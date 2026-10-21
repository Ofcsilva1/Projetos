import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('.',import.meta.url)));
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg'};
const server = http.createServer(async (request,response) => {
  try {
    const url = new URL(request.url,'http://localhost:4173');
    const decoded = decodeURIComponent(url.pathname);
    if (decoded.split('/').some(part => part.startsWith('.'))) throw Error('Invalid path');
    let file = path.resolve(root,'.'+decoded);
    if (file !== root && !file.startsWith(root+path.sep)) throw Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = path.join(file,'index.html');
    if (!mime[path.extname(file)]) throw Error('Unsupported file');
    const body = await readFile(file);
    response.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    response.end(body);
  } catch {response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('Arquivo não encontrado');}
});
server.on('error',error => {console.error(error.message);process.exitCode=1;});
server.listen(4173,'127.0.0.1',()=>console.log('Prévia: http://localhost:4173'));
