const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const localProductsPath = path.join(__dirname, 'src/lib/localProducts.ts');
let fileContent = fs.readFileSync(localProductsPath, 'utf8');

const codeToEval = fileContent
  .replace(/import.*?;/, '')
  .replace('export type ProductWithFeatured = Product & { featured?: boolean };', '')
  .replace('export const LOCAL_PRODUCTS: ProductWithFeatured[] =', 'return');

let products = [];
try {
  products = new Function(codeToEval)();
} catch (e) {
  console.error("Failed to parse products:", e);
  process.exit(1);
}

const headers = ['id', 'name', 'description', 'price_xaf', 'brand', 'specs', 'images', 'stock_status', 'created_at', 'featured'];
const rows = [headers.join(',')];

const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

products.forEach(p => {
  // If the local ID is not a UUID, we must generate one so Supabase accepts it
  const id = isUUID(String(p.id)) ? p.id : crypto.randomUUID();
  
  const safeName = p.name ? p.name.replace(/"/g, '""') : '';
  const safeDesc = p.description ? p.description.replace(/"/g, '""') : '';
  
  // Specs should be valid JSON string
  const specsJson = JSON.stringify(p.specs || {});
  const safeSpecs = specsJson.replace(/"/g, '""');
  
  // Images should be valid JSON array representation as seen in screenshot
  const imagesJson = JSON.stringify(p.images || []);
  const safeImages = imagesJson.replace(/"/g, '""');
  
  // Featured should be TRUE/FALSE
  const featured = p.featured ? 'TRUE' : 'FALSE';
  
  // Create a default timestamp
  const createdAt = new Date().toISOString();
  
  const row = [
    id,
    `"${safeName}"`,
    `"${safeDesc}"`,
    p.price_xaf || 0,
    `"${p.brand || ''}"`,
    `"${safeSpecs}"`,
    `"${safeImages}"`,
    p.stock_status || 'in_stock',
    createdAt,
    featured
  ];
  rows.push(row.join(','));
});

const outPath = path.join(__dirname, 'products_update.csv');
fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
console.log('Successfully generated Supabase-formatted CSV at ' + outPath);
