/**
 * Bulk Tag Products Script
 * 
 * Updates all existing products with CRO-optimized tags, tier labels, and micro-benefits.
 * 
 * Run: npx ts-node scripts/tag_products.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

// Product tagging rules based on name patterns and price
interface TagRule {
  namePatterns: RegExp[];
  priceRange?: { min?: number; max?: number };
  tags: string[];
  tierLabel: 'entry' | 'popular' | 'grandGesture';
  microBenefits: string[];
}

const tagRules: TagRule[] = [
  // Teddy Bears - Small (Entry)
  {
    namePatterns: [/25cm teddy/i, /30dm teddy/i],
    priceRange: { max: 20000 },
    tags: ['budget', 'popular', 'couples'],
    tierLabel: 'entry',
    microBenefits: ['Budget Friendly', 'Gift Wrapped'],
  },
  // Teddy Bears - Medium (Popular)
  {
    namePatterns: [/medium teddy/i, /40cm/i, /50cm/i, /60cm/i, /love heart/i, /twin/i, /long leg/i],
    priceRange: { min: 20000, max: 60000 },
    tags: ['popular', 'romantic', 'couples'],
    tierLabel: 'popular',
    microBenefits: ['Popular Choice', 'Premium Quality'],
  },
  // Teddy Bears - Large (Grand Gesture)
  {
    namePatterns: [/100cm/i, /110cm/i, /120cm/i, /160cm/i, /200cm/i],
    tags: ['luxury', 'romantic', 'grand-gesture'],
    tierLabel: 'grandGesture',
    microBenefits: ['Grand Gesture', 'Jaw-Dropping'],
  },
  // Money Bouquets - Entry
  {
    namePatterns: [/money boquet/i, /money tower/i],
    priceRange: { max: 70000 },
    tags: ['popular', 'for-him', 'for-her'],
    tierLabel: 'popular',
    microBenefits: ['Most Requested', 'Viral Gift'],
  },
  // Money Bouquets - Luxury
  {
    namePatterns: [/big boyz/i, /dollar boquet/i, /\$100/i],
    tags: ['luxury', 'grand-gesture'],
    tierLabel: 'grandGesture',
    microBenefits: ['Grand Gesture', 'Premium'],
  },
  // Room Decor - All Luxury
  {
    namePatterns: [/room decor/i],
    tags: ['luxury', 'romantic', 'grand-gesture'],
    tierLabel: 'grandGesture',
    microBenefits: ['Full Setup', 'Memorable'],
  },
  // Cakes
  {
    namePatterns: [/cake/i, /cupid/i, /macaron/i, /rose.*red/i, /ruby/i, /coquette/i, /pink box/i],
    tags: ['popular', 'couples', 'for-her'],
    tierLabel: 'popular',
    microBenefits: ['Freshly Made', 'Valentine Theme'],
  },
  // Flowers
  {
    namePatterns: [/flower/i, /rose/i, /faux/i],
    tags: ['romantic', 'for-her', 'popular'],
    tierLabel: 'entry',
    microBenefits: ['Classic Romance', 'Fresh'],
  },
  // Personalized Items
  {
    namePatterns: [/framed photo/i, /photo boquet/i, /customized/i, /journal/i, /newspaper/i, /jersey/i],
    tags: ['romantic', 'personalized', 'for-her', 'for-him'],
    tierLabel: 'popular',
    microBenefits: ['Personalized', 'Unique Gift'],
  },
  // For Him Gifts
  {
    namePatterns: [/men set/i, /chelsea/i, /perfume/i, /watch/i, /bracelet/i, /laptop bag/i],
    tags: ['for-him', 'popular'],
    tierLabel: 'popular',
    microBenefits: ['For Him', 'Quality'],
  },
  // For Her Gifts
  {
    namePatterns: [/hair dryer/i, /stanley/i, /cosmetic/i, /candle/i],
    tags: ['for-her', 'self-love', 'popular'],
    tierLabel: 'popular',
    microBenefits: ['Self-Care', 'Trendy'],
  },
  // Tech/Luxury Items
  {
    namePatterns: [/digital.*frame/i, /smart watch/i],
    tags: ['luxury', 'for-him', 'for-her'],
    tierLabel: 'grandGesture',
    microBenefits: ['Premium Tech', 'Memorable'],
  },
  // Food Items
  {
    namePatterns: [/chops/i, /platter/i, /banquet/i, /dinner/i, /chocolate/i],
    tags: ['popular', 'couples', 'experience'],
    tierLabel: 'popular',
    microBenefits: ['Delicious', 'Fresh'],
  },
  // Gift Packs (existing bundles)
  {
    namePatterns: [/pack/i, /endless love/i, /sweetheart/i, /love language/i],
    tags: ['bundle', 'popular', 'couples'],
    tierLabel: 'popular',
    microBenefits: ['Curated Bundle', 'Best Value'],
  },
  // Novelty/Unique
  {
    namePatterns: [/labubu/i, /stich/i, /panda/i, /mickey/i],
    tags: ['popular', 'unique', 'for-her'],
    tierLabel: 'popular',
    microBenefits: ['Unique', 'Trending'],
  },
];

function getTagsForProduct(name: string, price: number): { tags: string[], tierLabel: string, microBenefits: string[] } {
  for (const rule of tagRules) {
    const nameMatches = rule.namePatterns.some(pattern => pattern.test(name));
    if (!nameMatches) continue;
    
    if (rule.priceRange) {
      const { min = 0, max = Infinity } = rule.priceRange;
      if (price < min || price > max) continue;
    }
    
    return {
      tags: rule.tags,
      tierLabel: rule.tierLabel,
      microBenefits: rule.microBenefits,
    };
  }
  
  // Default fallback
  return {
    tags: ['other'],
    tierLabel: 'popular',
    microBenefits: ['Quality Gift'],
  };
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const Product = mongoose.connection.collection('products');
  
  const products = await Product.find({}).toArray();
  console.log(`Found ${products.length} products to tag.\n`);

  let updated = 0;
  for (const product of products) {
    const { tags, tierLabel, microBenefits } = getTagsForProduct(product.name, product.basePrice);
    
    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          tags,
          tierLabel,
          microBenefits,
        }
      }
    );
    
    console.log(`✓ ${product.name} -> [${tags.join(', ')}] (${tierLabel})`);
    updated++;
  }

  console.log(`\n✅ Updated ${updated} products with CRO tags.`);
  
  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(console.error);
