import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load environment variables from .env.local (Next.js convention)
dotenv.config({ path: path.join(__dirname, '../.env.local') });
import mongoose from 'mongoose';
import mime from 'mime-types';
import Product, { IProduct } from '../src/models/Product';
// Note: Category and Event models might be needed for rigorous validation, 
// but we'll trust the User puts valid IDs in meta.json or implement lookup later.

// --- Configuration ---
const MONGODB_URI = process.env.MONGODB_URI;
const S3_BUCKET = process.env.AWS_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// UPLOAD_QUEUE is in the same folder as this script, or 'scripts/upload_queue' relative to root
const UPLOAD_QUEUE_DIR = path.join(__dirname, 'upload_queue');
const PROCESSED_DIR = path.join(__dirname, 'upload_processed');

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

if (!S3_BUCKET || !AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.error('Missing AWS Configuration in .env');
  process.exit(1);
}

// --- S3 Client ---
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// --- MongoDB Connection ---
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');
};

// --- Helper: Upload File to S3 ---
const uploadToS3 = async (filePath: string, productName: string): Promise<string> => {
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  // Create a clean key: products/[product_name]/[timestamp]_[filename]
  const key = `products/${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}/${Date.now()}_${fileName}`;
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    // ACL: 'public-read', // Uncomment if bucket is not public by default
  });

  await s3Client.send(command);
  // Construct Public URL
  return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
};

// --- Main Script ---
const main = async () => {
  await connectDB();

  // Ensure directories exist
  if (!fs.existsSync(UPLOAD_QUEUE_DIR)) fs.mkdirSync(UPLOAD_QUEUE_DIR);
  if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR);

  const productFolders = fs.readdirSync(UPLOAD_QUEUE_DIR).filter(item => {
    return fs.statSync(path.join(UPLOAD_QUEUE_DIR, item)).isDirectory();
  });

  console.log(`📂 Found ${productFolders.length} folders in upload_queue`);

  for (const folderName of productFolders) {
    const folderPath = path.join(UPLOAD_QUEUE_DIR, folderName);
    console.log(`\n🚀 Processing: ${folderName}`);

    try {
      // 1. Check if product already exists
      const existingProduct = await Product.findOne({ name: folderName });
      if (existingProduct) {
        console.warn(`⚠️  Product "${folderName}" already exists. Skipping.`);
        // Optional: Move to processed even if skipped to clear queue
        // const skippedPath = path.join(PROCESSED_DIR, `SKIPPED_${folderName}`);
        // fs.renameSync(folderPath, skippedPath);
        continue;
      }

      // 2. Read meta.json
      const metaPath = path.join(folderPath, 'meta.json');
      // Default IDs for Valentine Bundles
      const DEFAULT_EVENT_ID = '696bb790aca35414ca4947fc'; // Valentine 2026
      const DEFAULT_CATEGORY_ID = '6977b1747a295ce1a802c8f5'; // Valentine Bundles

      let metaData: any = {
        name: folderName,
        basePrice: 0,
        isActive: true, // Default to true now
        event: DEFAULT_EVENT_ID,
        category: DEFAULT_CATEGORY_ID
      };

      if (fs.existsSync(metaPath)) {
        try {
            const rawMeta = fs.readFileSync(metaPath, 'utf-8');
            const parsed = JSON.parse(rawMeta);
            // If parsed meta has event "val-2026", replace with ID
            if (parsed.event === 'val-2026') parsed.event = DEFAULT_EVENT_ID;
            
            metaData = { ...metaData, ...parsed };
        } catch (e) {
            console.error(`❌ Error reading meta.json for ${folderName}:`, e);
            continue;
        }
      } else {
        console.warn(`⚠️  No meta.json found for ${folderName}. Using defaults.`);
      }

      // 3. Upload Media
      const files = fs.readdirSync(folderPath).filter(f => f !== 'meta.json' && !f.startsWith('.'));
      const mediaGallery: string[] = [];

      console.log(`   Uploading ${files.length} media files...`);
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        if (fs.statSync(filePath).isFile()) {
            try {
                const s3Url = await uploadToS3(filePath, folderName);
                mediaGallery.push(s3Url);
                console.log(`   ✅ Uploaded: ${file}`);
            } catch (err) {
                console.error(`   ❌ Failed to upload ${file}:`, err);
            }
        }
      }

      // 4. Create Product in DB
      const productName = metaData.name || folderName;
      const description = metaData.description || folderName;
      
      const productData = {
        ...metaData,
        name: productName, 
        description: description,
        mediaGallery: [...(metaData.mediaGallery || []), ...mediaGallery], // Combine existing + new
        // Ensure bundle fields are passed
        isBundle: metaData.isBundle || false,
        bundleCategory: metaData.bundleCategory,
        microBenefits: metaData.microBenefits,
        locations: metaData.locations
      };

      const newProduct = new Product(productData);

      await newProduct.save();
      console.log(`✅ Created Product: ${newProduct.name} (${newProduct._id})`);

      // 5. Move to Processed
      const processedPath = path.join(PROCESSED_DIR, folderName);
      if (fs.existsSync(processedPath)) {
        // If folder exists in processed, rename with timestamp
        fs.renameSync(folderPath, path.join(PROCESSED_DIR, `${folderName}_${Date.now()}`));
      } else {
        fs.renameSync(folderPath, processedPath);
      }
      console.log(`📦 Moved to processed.`);

    } catch (err) {
      console.error(`❌ Critical Error processing ${folderName}:`, err);
    }
  }

  console.log('\n✨ Bulk Upload Complete');
  process.exit(0);
};

main();
