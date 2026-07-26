const fs = require('fs');
const path = require('path');
const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'].forEach(file => {
  fs.writeFileSync(path.join(__dirname, 'public', file), buffer);
});
console.log('Icons created');
