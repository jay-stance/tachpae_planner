
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import City from '@/models/City';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Service from '@/models/Service';
import Addon from '@/models/Addon';

const PLACEHOLDER_IMAGES = {
  teddyBear: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&h=400&fit=crop',
  moneyBouquet: 'https://images.unsplash.com/photo-1554672407-607cff89b5a3?w=400&h=400&fit=crop',
  frame: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop',
  chocolate: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop',
  flowers: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=400&fit=crop',
  perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
  jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
  dinner: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
  spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop',
};

export async function POST() {
  await dbConnect();

  try {
    // Clear existing data for clean re-seed
    await Promise.all([
      Product.deleteMany({}),
      Service.deleteMany({}),
      Category.deleteMany({}),
      Addon.deleteMany({}),
    ]);

    // 1. Create/Update Cities
    const citiesData = [
      { name: 'Lagos', slug: 'lagos' },
      { name: 'Ibadan', slug: 'ibadan' },
      { name: 'Port Harcourt', slug: 'ph' },
      { name: 'Abeokuta', slug: 'abeokuta' },
      { name: 'Abuja', slug: 'abuja' },
    ];

    const cities = [];
    for (const city of citiesData) {
      let c = await City.findOne({ slug: city.slug });
      if (!c) {
        c = await City.create(city);
      }
      cities.push(c);
    }

    // 2. Create/Update Event
    const eventName = 'Valentine 2026';
    const eventSlug = 'val-2026';
    
    let event = await Event.findOne({ slug: eventSlug });
    if (!event) {
      event = await Event.create({
        name: eventName,
        slug: eventSlug,
        cities: cities.map(c => c._id),
        themeConfig: {
          primaryColor: '#e11d48',
          secondaryColor: '#fff1f2',
          fontFamily: 'Inter',
          assets: {
            logo: '/images/val-logo.png',
            heroImage: '/images/val-hero.jpg'
          }
        }
      });
    }

    // 3. Create Categories
    const categoriesData = [
        { name: 'Money Bouquets', slug: 'money-bouquets', icon: '💵' },
        { name: 'Teddy Bears', slug: 'teddy-bears', icon: '🧸' },
        { name: 'Digital Frames', slug: 'digital-frames', icon: '🖼️' },
        { name: 'Chocolates & Sweets', slug: 'chocolates', icon: '🍫' },
        { name: 'Flowers', slug: 'flowers', icon: '💐' },
        { name: 'Perfumes', slug: 'perfumes', icon: '🧴' },
        { name: 'Jewelry', slug: 'jewelry', icon: '💎' },
    ];

    const categories: any[] = [];
    for (const cat of categoriesData) {
        const c = await Category.create({ ...cat, event: event._id });
        categories.push(c);
    }

    // Helper to find category
    const getCat = (slug: string) => categories.find(c => c.slug === slug)?._id;

    // 4. Create Products
    const productsData = [
      // Teddy Bears
      { name: 'Classic Red Teddy', description: 'A soft, cuddly teddy bear in romantic red.', basePrice: 15000, category: getCat('teddy-bears'), mediaGallery: [PLACEHOLDER_IMAGES.teddyBear] },
      { name: 'Giant Love Bear', description: 'A 4-foot giant teddy bear for maximum impact.', basePrice: 45000, category: getCat('teddy-bears'), mediaGallery: [PLACEHOLDER_IMAGES.teddyBear] },
      { name: 'Mini Bear Set (3 Pack)', description: 'Three adorable mini bears in pink, red, and white.', basePrice: 12000, category: getCat('teddy-bears'), mediaGallery: [PLACEHOLDER_IMAGES.teddyBear] },
      
      // Money Bouquets
      { name: '₦20K Money Bouquet', description: 'A stunning bouquet made with ₦20,000 in crisp notes.', basePrice: 25000, category: getCat('money-bouquets'), mediaGallery: [PLACEHOLDER_IMAGES.moneyBouquet] },
      { name: '₦50K Money Bouquet', description: 'Make a statement with ₦50,000 arranged beautifully.', basePrice: 58000, category: getCat('money-bouquets'), mediaGallery: [PLACEHOLDER_IMAGES.moneyBouquet] },
      { name: '₦100K Money Bouquet', description: 'The ultimate money bouquet for your special someone.', basePrice: 110000, category: getCat('money-bouquets'), mediaGallery: [PLACEHOLDER_IMAGES.moneyBouquet] },
      
      // Digital Frames
      { 
        name: 'Digital Moving Frame', 
        description: 'A beautiful frame that plays your video memories.', 
        basePrice: 45000, 
        category: getCat('digital-frames'), 
        mediaGallery: [PLACEHOLDER_IMAGES.frame],
        variantsConfig: {
          options: [
            { name: 'Frame Color', values: [
              { label: 'Black', value: 'black', priceModifier: 0 },
              { label: 'Gold', value: 'gold', priceModifier: 5000 },
              { label: 'Rose Gold', value: 'rosegold', priceModifier: 7000 },
            ]}
          ]
        },
        customizationSchema: {
          steps: [
            { title: 'Upload Your Memory', fields: [
              { name: 'video_file', label: 'Upload Video', type: 'file', accept: 'video/*', required: true }
            ]},
            { title: 'Personalization', fields: [
              { name: 'custom_text', label: 'Engraving Text (Optional)', type: 'text', required: false }
            ]}
          ]
        },
        videoConfig: { maxDuration: 10, maxSize: 50 }
      },
      { name: 'Classic Photo Frame', description: 'Elegant wooden frame for your favorite photo.', basePrice: 18000, category: getCat('digital-frames'), mediaGallery: [PLACEHOLDER_IMAGES.frame] },
      
      // Chocolates
      { name: 'Belgian Chocolate Box', description: 'Premium Belgian chocolates in a heart-shaped box.', basePrice: 22000, category: getCat('chocolates'), mediaGallery: [PLACEHOLDER_IMAGES.chocolate] },
      { name: 'Ferrero Rocher Tower', description: 'A tower of 48 Ferrero Rocher chocolates.', basePrice: 35000, category: getCat('chocolates'), mediaGallery: [PLACEHOLDER_IMAGES.chocolate] },
      { name: 'Assorted Truffle Collection', description: 'Hand-crafted truffles in various flavors.', basePrice: 28000, category: getCat('chocolates'), mediaGallery: [PLACEHOLDER_IMAGES.chocolate] },
      
      // Flowers
      { name: 'Red Rose Bouquet (12)', description: 'A dozen fresh red roses beautifully arranged.', basePrice: 25000, category: getCat('flowers'), mediaGallery: [PLACEHOLDER_IMAGES.flowers] },
      { name: 'Mixed Flower Arrangement', description: 'A vibrant mix of seasonal flowers in a vase.', basePrice: 32000, category: getCat('flowers'), mediaGallery: [PLACEHOLDER_IMAGES.flowers] },
      { name: 'Preserved Forever Rose', description: 'A real rose preserved to last a lifetime.', basePrice: 40000, category: getCat('flowers'), mediaGallery: [PLACEHOLDER_IMAGES.flowers] },
      
      // Perfumes
      { name: 'Dior Sauvage (100ml)', description: 'A bold, fresh fragrance for him.', basePrice: 95000, category: getCat('perfumes'), mediaGallery: [PLACEHOLDER_IMAGES.perfume] },
      { name: 'Chanel Coco Mademoiselle', description: 'An elegant, feminine fragrance for her.', basePrice: 120000, category: getCat('perfumes'), mediaGallery: [PLACEHOLDER_IMAGES.perfume] },
      { name: 'Tom Ford Black Orchid', description: 'A luxurious, seductive unisex scent.', basePrice: 150000, category: getCat('perfumes'), mediaGallery: [PLACEHOLDER_IMAGES.perfume] },
      
      // Jewelry
      { name: 'Gold Heart Pendant', description: '18K gold pendant with cubic zirconia.', basePrice: 85000, category: getCat('jewelry'), mediaGallery: [PLACEHOLDER_IMAGES.jewelry] },
      { name: 'Diamond Stud Earrings', description: 'Elegant diamond studs in white gold.', basePrice: 250000, category: getCat('jewelry'), mediaGallery: [PLACEHOLDER_IMAGES.jewelry] },
      { name: 'Couple Bracelets Set', description: 'Matching bracelets in sterling silver.', basePrice: 45000, category: getCat('jewelry'), mediaGallery: [PLACEHOLDER_IMAGES.jewelry] },
      
      // New products with media limits
      { 
        name: 'Digital Memory Scrapbook', 
        description: 'A physical scrapbook with a digital twist. Upload up to 5 photos.', 
        basePrice: 30000, 
        category: getCat('digital-frames'), 
        mediaGallery: [PLACEHOLDER_IMAGES.frame],
        customizationSchema: {
          steps: [
            { title: 'Upload Memories', fields: [
              { name: 'photos', label: 'Upload up to 5 Photos', type: 'file', accept: 'image/*', required: true, maxImages: 5 }
            ]}
          ]
        }
      },
      { 
        name: 'Cinematic Video Greeting', 
        description: 'A professionally edited video message with a custom thumbnail.', 
        basePrice: 20000, 
        category: getCat('digital-frames'), 
        mediaGallery: [PLACEHOLDER_IMAGES.frame],
        customizationSchema: {
          steps: [
            { title: 'Upload Media', fields: [
              { name: 'video', label: 'Upload Your Video', type: 'file', accept: 'video/*', required: true, maxVideos: 1 },
              { name: 'thumbnail', label: 'Upload a Thumbnail Photo', type: 'file', accept: 'image/*', required: true, maxImages: 1 }
            ]}
          ]
        },
        videoConfig: { maxDuration: 60, maxSize: 100 }
      },
    ];

    for (const product of productsData) {
      await Product.create({ ...product, event: event._id });
    }

    // 5. Create Services
    const lagos = cities.find(c => c.slug === 'lagos');
    const ibadan = cities.find(c => c.slug === 'ibadan');
    const abuja = cities.find(c => c.slug === 'abuja');

    const servicesData = [
      { name: 'Candlelight Dinner at Eko Hotel', description: 'A romantic 3-course meal with champagne.', basePrice: 150000, location: lagos?._id, bookingType: 'DIRECT', availabilityConfig: { defaultSlots: [{ time: '18:00', maxCapacity: 10 }, { time: '20:00', maxCapacity: 10 }] } },
      { name: 'Couples Spa Retreat', description: 'Full body massage and facial for two.', basePrice: 80000, location: lagos?._id, bookingType: 'DIRECT', availabilityConfig: { defaultSlots: [{ time: '10:00', maxCapacity: 5 }, { time: '14:00', maxCapacity: 5 }] } },
      { name: 'Rooftop Dinner at Ibadan Heights', description: 'Dine under the stars with panoramic city views.', basePrice: 120000, location: ibadan?._id, bookingType: 'DIRECT', availabilityConfig: { defaultSlots: [{ time: '19:00', maxCapacity: 8 }] } },
      { name: 'Yacht Cruise Lagos Lagoon', description: 'A 2-hour private yacht cruise for two.', basePrice: 300000, location: lagos?._id, bookingType: 'DIRECT', availabilityConfig: { defaultSlots: [{ time: '16:00', maxCapacity: 1 }, { time: '18:30', maxCapacity: 1 }] } },
      { name: 'Private Chef Experience', description: 'A professional chef cooks dinner at your home.', basePrice: 200000, location: abuja?._id, bookingType: 'DIRECT', availabilityConfig: { defaultSlots: [{ time: '18:00', maxCapacity: 3 }] } },
    ];

    for (const service of servicesData) {
      if (service.location) {
        await Service.create({ ...service, event: event._id });
      }
    }

    // 6. Create Add-ons
    const addonsData = [
      { 
        name: 'Surprise Yourself', 
        slug: 'surprise-yourself', 
        type: 'QUESTIONNAIRE', 
        description: 'Answer a few questions and let us curate a mystery package just for you!',
        price: 0,
        icon: 'heart',
        config: {
          questionnaireSchema: {
            questions: [
              { id: 'budget', text: 'What is your budget?', type: 'select', options: ['Under ₦30K', '₦30K - ₦50K', '₦50K - ₦100K', 'Above ₦100K'] },
              { id: 'recipient', text: 'Who is this for?', type: 'select', options: ['My Partner', 'Myself', 'A Friend', 'Family'] },
              { id: 'vibe', text: 'What vibe are you going for?', type: 'select', options: ['Romantic', 'Fun & Playful', 'Luxurious', 'Thoughtful'] },
            ]
          }
        }
      },
      { 
        name: 'Be My Val Proposal', 
        slug: 'be-my-val', 
        type: 'LINK', 
        description: 'Send a romantic digital proposal link to your crush.',
        price: 0,
        icon: 'heart',
        config: { redirectUrl: '/proposal/create' }
      },
      { 
        name: 'Custom Logistics', 
        slug: 'custom-logistics', 
        type: 'LOGISTICS', 
        description: "Already bought a gift elsewhere? Send it to our hub, and we will package it with your order!",
        price: 2000,
        icon: 'package',
        config: { hubAddress: 'Tachpae Hub, 123 Valentine Avenue, Near City Mall' }
      },
    ];

    for (const addon of addonsData) {
      await Addon.create({ ...addon, event: event._id });
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully!', 
      data: {
        event_id: event._id,
        city_id: lagos?._id,
        category_id: categories[0]?._id,
        product_id: (await Product.findOne({ name: 'Classic Red Teddy' }))?._id,
        complex_product_id: (await Product.findOne({ name: 'Digital Memory Scrapbook' }))?._id,
      },
      counts: {
        cities: cities.length,
        categories: categories.length,
        products: productsData.length,
        services: servicesData.filter(s => s.location).length,
        addons: addonsData.length,
      }
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
