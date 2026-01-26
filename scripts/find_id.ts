
import mongoose from 'mongoose';
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

const ID_TO_FIND = '696f9ba52f27c33714771955';

async function findDoc() {
    await connectDB();
    
    // Check Products
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const product = await Product.findById(ID_TO_FIND);
    if (product) {
        console.log('FOUND IN PRODUCTS:', product.name);
        process.exit(0);
    }

    // Check Services
    const Service = mongoose.models.Service || mongoose.model('Service', new mongoose.Schema({}, { strict: false }));
    const service = await Service.findById(ID_TO_FIND);
    if (service) {
        console.log('FOUND IN SERVICES:', service.name);
        process.exit(0);
    }

    // Check Addons
    const Addon = mongoose.models.Addon || mongoose.model('Addon', new mongoose.Schema({}, { strict: false }));
    const addon = await Addon.findById(ID_TO_FIND);
    if (addon) {
        console.log('FOUND IN ADDONS:', addon.name, 'Slug:', addon.slug);
        process.exit(0);
    }

    console.log('NOT FOUND in Products, Services, or Addons.');
    process.exit(1);
}

findDoc().catch(console.error);
