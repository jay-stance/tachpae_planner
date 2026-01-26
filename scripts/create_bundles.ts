/**
 * Create Valentine Bundles Script
 * 
 * Creates the 10 curated Valentine bundles as products.
 * 
 * Run: npx ts-node scripts/create_bundles.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

// Bundle definitions from the Valentine Bundle PDF
const bundles = [
  // 💖 COUPLES
  {
    name: 'ILoveU Box',
    description: 'An affordable Valentine gift box for students and first-time couples. Includes: 25cm Teddy Bear, Scented Candle, Fresh Roses (2 stems), Valentine Gift Box.',
    basePrice: 39000,
    bundleCategory: 'couples',
    tags: ['bundle', 'budget', 'couples', 'popular'],
    tierLabel: 'entry',
    microBenefits: ['Perfect Starter', 'Gift Wrapped'],
    componentNames: ['25cm teddy bear', 'Scented Candles', 'fresh roses per stem'],
  },
  {
    name: 'Sweet Love Box',
    description: 'A simple and romantic Valentine box for everyday gifting. Includes: Medium Teddy Bear, Scented Candle, Fresh Roses (2 stems), Valentine Gift Box.',
    basePrice: 53000,
    bundleCategory: 'couples',
    tags: ['bundle', 'popular', 'couples', 'romantic'],
    tierLabel: 'popular',
    microBenefits: ['Most Popular', 'Romantic'],
    componentNames: ['medium teddy bear', 'Scented Candles', 'fresh roses per stem'],
  },
  {
    name: 'True Love Box',
    description: 'A memory-filled Valentine box for emotional and meaningful gifting. Includes: Love Heart Medium Teddy Bear, Framed Photo, Fresh Roses (3 stems), Valentine Gift Box.',
    basePrice: 72000,
    bundleCategory: 'couples',
    tags: ['bundle', 'popular', 'couples', 'romantic', 'personalized'],
    tierLabel: 'popular',
    microBenefits: ['Personalized', 'Memorable'],
    componentNames: ['love heart medium teddy bear', 'framed photo', 'fresh roses per stem'],
  },
  {
    name: 'Forever Us Box',
    description: 'A premium Valentine box for serious relationships and anniversaries. Includes: Medium Teddy Bear, Faux Flower Arrangement, Framed Photo, Fresh Roses (3 stems), Valentine Gift Box.',
    basePrice: 102000,
    bundleCategory: 'couples',
    tags: ['bundle', 'luxury', 'couples', 'romantic'],
    tierLabel: 'grandGesture',
    microBenefits: ['Premium', 'Anniversary Perfect'],
    componentNames: ['medium teddy bear', 'faux flower', 'framed photo', 'fresh roses per stem'],
  },
  
  // 🌸 FOR HER
  {
    name: 'Soft Life Babe Box',
    description: 'A stylish and aesthetic Valentine box for modern girlfriends. Includes: Stanley Cup, Scented Candle, Faux Flower Arrangement, Valentine Gift Box.',
    basePrice: 60000,
    bundleCategory: 'for-her',
    tags: ['bundle', 'for-her', 'trendy', 'self-love'],
    tierLabel: 'popular',
    microBenefits: ['Trendy', 'Aesthetic'],
    componentNames: ['Stanley cup', 'Scented Candles', 'faux flower'],
  },
  {
    name: 'Fine Girl in Love Box',
    description: 'A romantic Valentine box for girlfriends who love flowers and memories. Includes: Medium Teddy Bear, Fresh Roses (3 stems), Photo Bouquet (10–20 photos), Valentine Gift Box.',
    basePrice: 82000,
    bundleCategory: 'for-her',
    tags: ['bundle', 'for-her', 'romantic', 'personalized'],
    tierLabel: 'popular',
    microBenefits: ['Personalized', 'Romantic'],
    componentNames: ['medium teddy bear', 'fresh roses per stem', 'Photo boquet'],
  },
  {
    name: 'Queen Treatment Box',
    description: 'A luxury Valentine box for wives, fiancées and premium gifting. Includes: 120cm Teddy Bear, Faux Flower Arrangement, Large Framed Photo, Fresh Roses (3 stems), Valentine Gift Box.',
    basePrice: 150000,
    bundleCategory: 'for-her',
    tags: ['bundle', 'for-her', 'luxury', 'grand-gesture'],
    tierLabel: 'grandGesture',
    microBenefits: ['Grand Gesture', 'Premium'],
    componentNames: ['120cm teddy', 'faux flower', 'framed photo', 'fresh roses per stem'],
  },
  
  // 🧔 FOR HIM
  {
    name: 'My Man Box',
    description: 'A thoughtful Valentine box combining fashion and personal memories. Includes: Chelsea Men Set, 3-in-1 VSA Perfume, Framed Photo, Valentine Gift Box.',
    basePrice: 57000,
    bundleCategory: 'for-him',
    tags: ['bundle', 'for-him', 'popular'],
    tierLabel: 'popular',
    microBenefits: ['For Him', 'Stylish'],
    componentNames: ['Chelsea Men Set', '3in1 VSA Perfume', 'framed photo'],
  },
  {
    name: 'Boss Guy Box',
    description: 'A bold Valentine box for men who love gadgets and fashion. Includes: Smart Watch, Customized Jersey, Perfume, Valentine Gift Box.',
    basePrice: 70000,
    bundleCategory: 'for-him',
    tags: ['bundle', 'for-him', 'luxury', 'tech'],
    tierLabel: 'popular',
    microBenefits: ['Tech Lover', 'Bold'],
    componentNames: ['80 Suit Extreme Smart Watch', 'Customied Jerseys', '3in1 VSA Perfume'],
  },
  
  // 💛 SELF-LOVE
  {
    name: 'Self-Love Box',
    description: 'A self-care Valentine box for singles and personal gifting. Includes: Scented Candle, Faux Flower Arrangement, Customized Journal, Valentine Gift Box, Affirmation Card.',
    basePrice: 53000,
    bundleCategory: 'self-love',
    tags: ['bundle', 'self-love', 'for-her', 'self-care'],
    tierLabel: 'popular',
    microBenefits: ['Self-Care', 'Treat Yourself'],
    componentNames: ['Scented Candles', 'faux flower', 'customized journal'],
  },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const Product = mongoose.connection.collection('products');
  const Category = mongoose.connection.collection('categories');
  
  // Find or create "Bundles" category
  let bundlesCategory = await Category.findOne({ name: /bundle/i });
  if (!bundlesCategory) {
    // Get the event ID from existing products
    const sampleProduct = await Product.findOne({});
    const eventId = sampleProduct?.event;
    
    const result = await Category.insertOne({
      name: 'Valentine Bundles',
      slug: 'bundles',
      description: 'Curated gift bundles for Valentine\'s Day',
      icon: '🎁',
      event: eventId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    bundlesCategory = { _id: result.insertedId };
    console.log('Created "Valentine Bundles" category');
  } else {
    console.log('Using existing Bundles category');
  }

  // Get all products to map component names to IDs
  const allProducts = await Product.find({}).toArray();
  const productMap = new Map(allProducts.map(p => [p.name.toLowerCase(), p]));
  
  // Get event ID
  const eventId = allProducts[0]?.event;

  console.log(`\nCreating ${bundles.length} bundles...\n`);

  for (const bundle of bundles) {
    // Check if bundle already exists
    const existing = await Product.findOne({ name: bundle.name });
    if (existing) {
      console.log(`⏭️  ${bundle.name} already exists, skipping...`);
      continue;
    }

    // Map component names to product IDs
    const bundleItems = bundle.componentNames.map(name => {
      const product = productMap.get(name.toLowerCase());
      return product ? {
        productId: product._id,
        productName: product.name,
        quantity: 1,
      } : null;
    }).filter(Boolean);

    // Use first component's image as bundle image (or placeholder)
    const firstComponent = bundleItems[0] as any;
    const firstProduct = firstComponent ? productMap.get(firstComponent.productName.toLowerCase()) : null;
    const mediaGallery = firstProduct?.mediaGallery || [];

    const newBundle = {
      name: bundle.name,
      description: bundle.description,
      basePrice: bundle.basePrice,
      event: eventId,
      category: bundlesCategory._id,
      mediaGallery,
      tags: bundle.tags,
      tierLabel: bundle.tierLabel,
      microBenefits: bundle.microBenefits,
      isBundle: true,
      bundleCategory: bundle.bundleCategory,
      bundleItems,
      variantsConfig: { options: [] },
      customizationSchema: { steps: [] },
      videoConfig: null,
      isActive: true,
      locations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await Product.insertOne(newBundle);
    console.log(`✓ Created: ${bundle.name} (₦${bundle.basePrice.toLocaleString()})`);
  }

  console.log('\n✅ Bundle creation complete!');
  
  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(console.error);
