const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'content', 'products.json');
const htmlPath = path.join(__dirname, '..', 'content', 'instagram-likes-description.html');

const raw = fs.readFileSync(productsPath, 'utf-8');
const data = JSON.parse(raw);
const html = fs.readFileSync(htmlPath, 'utf-8');

const idx = data.products.findIndex((p) => p.slug === 'instagram-likes-kaufen');
if (idx === -1) {
  console.error('Product instagram-likes-kaufen not found');
  process.exit(1);
}

data.products[idx].description = html;
fs.writeFileSync(productsPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Updated instagram-likes-kaufen with description from instagram-likes-description.html');
