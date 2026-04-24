const fs = require('fs');
const path = require('path');

const csvLines = fs.readFileSync('C:/Users/Administrateur/.gemini/antigravity/brain/93e135b8-6c65-4779-b10d-0ccb16c7d4d2/.system_generated/steps/164/content.md', 'utf8').split('\n');

const parsePrice = (str) => {
  if (!str) return 0;
  const num = parseInt(str.replace(/[^0-9]/g, ''));
  return isNaN(num) ? 0 : num;
};

const localProductsPath = path.join(__dirname, 'src/lib/localProducts.ts');
let existingFile = fs.readFileSync(localProductsPath, 'utf8');

const codeToEval = existingFile
  .replace(/import.*?;/, '')
  .replace('export type ProductWithFeatured = Product & { featured?: boolean };', '')
  .replace('export const LOCAL_PRODUCTS: ProductWithFeatured[] =', 'return');

let existingProducts = [];
try { existingProducts = new Function(codeToEval)(); } catch (e) {}

const newProducts = [...existingProducts];

for (let i = 6; i < csvLines.length; i++) {
  const line = csvLines[i];
  if (!line.trim() || line.startsWith(',,,') || line.startsWith('LOG-024,')) continue;
  
  const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  if (parts.length < 5) continue;
  
  const rawName = parts[1].replace(/"/g, '');
  if (!rawName) continue;
  
  const name = rawName.trim();
  const brand = name.toLowerCase().includes('logi') || parts[0].includes('LOG') ? 'Logitech' : 'Unknown';
  
  const shelfPrice = parsePrice(parts[3]);
  const stockQty = parsePrice(parts[6]);
  
  if (shelfPrice === 0) continue;
  
  let existing = newProducts.find(p => p.name.toLowerCase() === name.toLowerCase() || p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
  
  if (existing) {
    existing.price_xaf = shelfPrice;
    existing.stock_status = stockQty > 0 ? 'in_stock' : 'out_of_stock';
    existing.featured = stockQty > 0;
  } else {
    newProducts.push({
      id: String(newProducts.length + 100),
      name: name,
      description: name,
      price_xaf: shelfPrice,
      brand: brand,
      specs: {},
      images: ['/images/placeholder.svg'],
      stock_status: stockQty > 0 ? 'in_stock' : 'out_of_stock',
      featured: stockQty > 0 
    });
  }
}

const fileContent = `import { Product } from './supabase';

export type ProductWithFeatured = Product & { featured?: boolean };

export const LOCAL_PRODUCTS: ProductWithFeatured[] = ${JSON.stringify(newProducts, null, 2)};
`;

fs.writeFileSync(localProductsPath, fileContent, 'utf8');
console.log('Update complete. Total products: ' + newProducts.length);
