import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);



// This script is meant to be run with a .env-aware runner or after build
// For a quick fix, we use a simple Mongoose connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tachpae';

async function createAdmin() {
  console.log('--- Bootstrap Admin ---');
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.mjs <email> <password>');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.error('User already exists');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'ADMIN'
    });

    console.log('Admin created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
