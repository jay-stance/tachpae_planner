/**
 * Update Bundle Media Script
 * 
 * Fetches images from each component product and adds them to bundle media galleries.
 * 
 * Run: npx ts-node scripts/update_bundle_media.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

// Helper to get first image (not video) from media gallery
function getFirstImage(mediaGallery: string[]): string | null {
  return mediaGallery.find(url => !url.match(/\.(mp4|webm|ogg|mov)$/i)) || null;
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const Product = mongoose.connection.collection('products');
  
  // Find all bundles
  const bundles = await Product.find({ isBundle: true }).toArray();
  console.log(`Found ${bundles.length} bundles to update.\n`);

  // Get all products for lookup
  const allProducts = await Product.find({ isBundle: { $ne: true } }).toArray();
  const productById = new Map(allProducts.map(p => [p._id.toString(), p]));
  const productByName = new Map(allProducts.map(p => [p.name.toLowerCase(), p]));

  for (const bundle of bundles) {
    const mediaGallery: string[] = [];
    
    // Get images from bundleItems
    if (bundle.bundleItems && bundle.bundleItems.length > 0) {
      for (const item of bundle.bundleItems) {
        let product = null;
        
        // Try by ID first
        if (item.productId) {
          product = productById.get(item.productId.toString());
        }
        
        // Fallback to name lookup
        if (!product && item.productName) {
          product = productByName.get(item.productName.toLowerCase());
        }
        
        if (product && product.mediaGallery && product.mediaGallery.length > 0) {
          const img = getFirstImage(product.mediaGallery);
          if (img) {
            mediaGallery.push(img);
          }
        }
      }
    }
    
    // If we found images, update the bundle
    if (mediaGallery.length > 0) {
      await Product.updateOne(
        { _id: bundle._id },
        { $set: { mediaGallery } }
      );
      console.log(`✓ ${bundle.name}: Added ${mediaGallery.length} images`);
    } else {
      console.log(`⚠️ ${bundle.name}: No images found from components`);
    }
  }

  console.log('\n✅ Bundle media update complete!');
  
  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(console.error);
