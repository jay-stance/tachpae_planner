/**
 * Fix Bundle Media Script
 * 
 * Cross-references bundle items with products JSON to get accurate images.
 * Replaces bundle mediaGallery with one image from each component product.
 * 
 * Run: npx ts-node scripts/fix_bundle_media.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

// Helper to get first image (not video) from media gallery
function getFirstImage(mediaGallery: string[]): string | null {
  if (!mediaGallery || !Array.isArray(mediaGallery)) return null;
  return mediaGallery.find(url => !url.match(/\.(mp4|webm|ogg|mov)$/i)) || null;
}

// Normalize product name for matching
function normalizeProductName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  // Load products from JSON file
  const productsJsonPath = path.join(process.cwd(), 'test.products.json');
  console.log(`Loading products from ${productsJsonPath}...`);
  const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
  console.log(`Loaded ${productsData.length} products from JSON.\n`);

  // Create a map of normalized product names to their data
  const productMap = new Map<string, any>();
  for (const product of productsData) {
    const normalizedName = normalizeProductName(product.name);
    productMap.set(normalizedName, product);
  }

  const Product = mongoose.connection.collection('products');
  
  // Find all bundles
  const bundles = await Product.find({ isBundle: true }).toArray();
  console.log(`Found ${bundles.length} bundles to fix.\n`);

  for (const bundle of bundles) {
    const newMediaGallery: string[] = [];
    
    console.log(`Processing: ${bundle.name}`);
    console.log(`  Bundle items: ${bundle.bundleItems?.length || 0}`);
    
    // Get images from bundleItems by matching productName
    if (bundle.bundleItems && bundle.bundleItems.length > 0) {
      for (const item of bundle.bundleItems) {
        const itemName = item.productName;
        if (!itemName) {
          console.log(`    ⚠️ Item has no productName`);
          continue;
        }
        
        const normalizedItemName = normalizeProductName(itemName);
        
        // Try exact match first
        let product = productMap.get(normalizedItemName);
        
        // If not found, try partial match
        if (!product) {
          for (const [name, prod] of productMap.entries()) {
            if (name.includes(normalizedItemName) || normalizedItemName.includes(name)) {
              product = prod;
              break;
            }
          }
        }
        
        if (product && product.mediaGallery && product.mediaGallery.length > 0) {
          const img = getFirstImage(product.mediaGallery);
          if (img) {
            newMediaGallery.push(img);
            console.log(`    ✓ Found image for: ${itemName}`);
          } else {
            console.log(`    ⚠️ No image in gallery for: ${itemName}`);
          }
        } else {
          console.log(`    ✗ Product not found in JSON: "${itemName}"`);
        }
      }
    }
    
    // Update the bundle with new media gallery
    if (newMediaGallery.length > 0) {
      await Product.updateOne(
        { _id: bundle._id },
        { $set: { mediaGallery: newMediaGallery } }
      );
      console.log(`  ✅ Updated with ${newMediaGallery.length} images\n`);
    } else {
      console.log(`  ⚠️ No images found, keeping existing gallery\n`);
    }
  }

  console.log('✅ Bundle media fix complete!');
  
  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(console.error);
