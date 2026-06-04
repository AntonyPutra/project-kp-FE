const fs = require('fs');
const md = fs.readFileSync('C:/Users/T0fuu/.gemini/antigravity-ide/brain/83d59aa4-b927-4daf-8830-c40cc2b778f0/api_documentation.md', 'utf8');

const collection = {
  info: {
    name: 'SICAMS Full API',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    { key: 'base_url', value: 'https://api.whaleestudio.my.id/api', type: 'string' },
    { key: 'token', value: '', type: 'string' }
  ],
  auth: {
    type: 'bearer',
    bearer: [ { key: 'token', value: '{{token}}', type: 'string' } ]
  },
  item: []
};

const lines = md.split('\n');
let currentFolder = null;
let currentItem = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.startsWith('## ') && !line.startsWith('## Smart') && /^[0-9]/.test(line.substring(3).trim())) {
    const folderName = line.substring(3).replace(/^[0-9]+\.\s*/, '').trim();
    currentFolder = { name: folderName, item: [] };
    collection.item.push(currentFolder);
  }
  else if (line.startsWith('### ') && (line.includes('GET') || line.includes('POST') || line.includes('PUT') || line.includes('DELETE'))) {
    const parts = line.substring(4).split(' ');
    const method = parts[0];
    const pathStr = parts[1];
    
    let name = pathStr;
    if (i + 1 < lines.length && !lines[i+1].startsWith('#') && lines[i+1].trim() !== '') {
      name = lines[i+1].trim();
    }
    
    const pathArray = pathStr.split('/').filter(p => p !== '');
    const pathVars = pathArray.map(p => {
      if (p.startsWith('{') && p.endsWith('}')) {
         return { key: p.substring(1, p.length-1), value: '1' };
      }
      return null;
    }).filter(Boolean);
    
    const cleanPathArray = pathArray.map(p => p.startsWith('{') ? ':' + p.substring(1, p.length-1) : p);
    
    currentItem = {
      name: name,
      request: {
        method: method,
        header: [
          { key: 'Accept', value: 'application/json' },
          { key: 'Content-Type', value: 'application/json' }
        ],
        url: {
          raw: '{{base_url}}/' + cleanPathArray.join('/'),
          host: ['{{base_url}}'],
          path: cleanPathArray,
          variable: pathVars
        }
      }
    };
    
    if (currentFolder) {
      currentFolder.item.push(currentItem);
    } else {
      collection.item.push(currentItem);
    }
  }
  else if (line.startsWith('**Request Body') && currentItem) {
    let j = i + 1;
    let jsonStr = '';
    let inJson = false;
    let isFormData = line.includes('multipart/form-data');
    
    while (j < lines.length) {
      if (lines[j].startsWith('```json')) {
        inJson = true;
        j++;
        continue;
      }
      if (inJson && lines[j].startsWith('```')) {
        break;
      }
      if (inJson) {
        jsonStr += lines[j] + '\n';
      }
      if (!inJson && lines[j].startsWith('### ')) break;
      j++;
    }
    
    if (jsonStr) {
      if (isFormData) {
         try {
           const parsed = JSON.parse(jsonStr);
           const formdata = Object.keys(parsed).map(k => {
             return { key: k, value: typeof parsed[k] === 'object' ? JSON.stringify(parsed[k]) : String(parsed[k]), type: 'text' };
           });
           currentItem.request.body = { mode: 'formdata', formdata: formdata };
           currentItem.request.header = currentItem.request.header.filter(h => h.key !== 'Content-Type');
         } catch(e) {}
      } else {
         currentItem.request.body = { mode: 'raw', raw: jsonStr.trim() };
      }
    }
  }
}

fs.writeFileSync('e:/KP/SICAMS_Postman_Collection.json', JSON.stringify(collection, null, 2));
console.log('Full Postman collection generated successfully.');
