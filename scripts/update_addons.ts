import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');
};

// --- Inline Models ---
const EventSchema = new Schema({
    name: String,
    slug: String,
    isActive: Boolean
}, { strict: false }); // dynamic

const AddonSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    price: { type: Number, default: 0 },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    config: { type: Schema.Types.Mixed, default: {} },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Use existing models if defined (to avoid OverwriteModelError if hot reload weirdness)
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const Addon = mongoose.models.Addon || mongoose.model('Addon', AddonSchema);

const SURPRISE_QUESTIONNAIRE = {
  title: "Love Starts With You",
  subtitle: "You deserve the mystery. You deserve the magic.",
  prices: [
    { label: '₦50,000', value: 50000, description: 'The Self-Care Bloom 🌸' },
    { label: '₦100,000', value: 100000, description: 'The Empress Pack 👑' },
    { label: '₦200,000', value: 200000, description: 'The Ultimate Glow Up ✨' },
    { label: '₦350,000', value: 350000, description: 'The Legend Treatment 💎' },
  ],
  questions: [
    {
      id: 'hero-vibe',
      label: 'If you had a free Saturday, what are you doing?',
      description: 'This helps us pick your perfect hero item!',
      type: 'select',
      options: [
        { label: 'Netflix & Chill', value: 'home-comfort', icon: 'tv', resultHint: 'Cozy Box', emoji: '🍿' },
        { label: 'Out with friends', value: 'social-fashion', icon: 'users', resultHint: 'Glam Box', emoji: '💃' },
        { label: 'Working on my hustle', value: 'tech-productivity', icon: 'laptop', resultHint: 'Boss Box', emoji: '💻' },
        { label: 'Self-care day', value: 'wellness', icon: 'bath', resultHint: 'Wellness Box', emoji: '🧖‍♀️' },
      ]
    },
    {
      id: 'hates',
      label: 'Your No-Go List',
      description: "What should we avoid? Let us know your dislikes or allergies so we only pack what you'll love.",
      type: 'text',
      placeholder: "e.g. I hate chocolates, allergic to nuts, no strong perfumes...",
      required: true
    },
    {
      id: 'noteToSelf',
      label: 'Tell us a little about Yourself',
      description: "Help us curate the perfect experience for you. What are your vibes? What makes you smile?",
      type: 'text',
      placeholder: "I love minimalism, soft jazz, and scented candles...",
      required: false
    }
  ]
};

const LOGISTICS_CONFIG = {
  cityHubs: {
    'Abuja': 'Tachpae Hub, Wuse 2, Abuja',
    'Lagos': 'Tachpae Hub, Lekki Phase 1, Lagos',
    'Ibadan': 'Tachpae Hub, Bodija, Ibadan',
    'Port Harcourt': 'Tachpae Hub, GRA, Port Harcourt',
    'Abeokuta': 'Tachpae Hub, Oke-Ilewo, Abeokuta',
    'default': 'Tachpae Central Hub'
  }
};

async function updateAddons() {
  await connectDB();
  console.log('Connected to DB');

  const event = await Event.findOne({ slug: 'val-2026' });
  if (!event) {
    console.error('Event val-2026 not found!');
    process.exit(1);
  }

  // 1. Surprise Yourself
  await Addon.findOneAndUpdate(
    { slug: 'surprise-yourself', event: event._id },
    {
      name: 'Surprise Yourself',
      slug: 'surprise-yourself',
      type: 'QUESTIONNAIRE',
      description: 'Answer a few questions and let us curate a mystery package just for you!',
      price: 0, // Dynamic price
      event: event._id,
      config: {
        questionnaireSchema: SURPRISE_QUESTIONNAIRE
      },
      icon: 'sparkles',
      isActive: true
    },
    { upsert: true, new: true }
  );
  console.log('Updated Surprise Yourself Addon');

  // 2. Custom Logistics
  await Addon.findOneAndUpdate(
    { slug: 'custom-logistics', event: event._id },
    {
        name: 'Custom Logistics',
        slug: 'custom-logistics',
        type: 'LOGISTICS',
        description: 'Already bought a gift elsewhere? Send it to our hub, and we will package it with your order!',
        price: 3000, 
        event: event._id,
        config: LOGISTICS_CONFIG,
        icon: 'package',
        isActive: true
    },
    { upsert: true, new: true }
  );
  console.log('Updated Custom Logistics Addon');

  console.log('Done.');
  process.exit(0);
}

updateAddons().catch(err => {
  console.error(err);
  process.exit(1);
});
