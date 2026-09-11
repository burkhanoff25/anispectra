import * as fs from 'fs';

function extractObjectByKey(str: string, key: string) {
  const searchKey = `"${key}":{`;
  const startIndex = str.indexOf(searchKey);
  if (startIndex === -1) return null;
  
  let objStart = startIndex + searchKey.length - 1;
  let braces = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = objStart; i < str.length; i++) {
    const char = str[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') braces++;
      if (char === '}') {
        braces--;
        if (braces === 0) {
          return str.substring(objStart, i + 1);
        }
      }
    }
  }
  return null;
}

async function testExtract() {
  const html = fs.readFileSync('page.html', 'utf-8');
  const matches = html.match(/self\.__next_f\.push\(\[1,"(.*?)"\]\)/g);
  let fullUnescaped = "";
  if (matches) {
    for (const m of matches) {
      const inner = m.substring(24, m.length - 3); 
      try { fullUnescaped += JSON.parse(`"${inner}"`); } catch (e) {}
    }
  }
  
  const objStr = extractObjectByKey(fullUnescaped, "anime");
  if (objStr) {
     const anime = JSON.parse(objStr);
     console.log(anime.title_uz);
     console.log(anime.episodes.length);
     console.log(anime.episodes[0].sources[0].url);
  }
}
testExtract();
