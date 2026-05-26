import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: GlobalMongoose;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.log(`\n[DATABASE CONNECTION] MONGODB_URI is not set. Falling back to Mock In-Memory Database.`);
    return null;
  }

  if (cached.conn) {
    console.log(`[DATABASE CONNECTION] Using existing cached MongoDB connection.`);
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log(`[DATABASE CONNECTION] Establishing new connection to MongoDB...`);
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      console.log(`[DATABASE CONNECTION SUCCESS] Connected to MongoDB database.`);
      // Asynchronously seed default credentials in MongoDB (Disabled: already seeded)
      // seedDefaultUsers();
      return mongooseInstance;
    }).catch((err) => {
      console.log(`[DATABASE CONNECTION ERROR] Failed to establish MongoDB connection:`, err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function seedDefaultUsers() {
  try {
    const User = (await import('@/models/userModel')).default;
    
    // Check and seed default admin account
    const adminExists = await User.findOne({ email: 'admin@tailwise.org' });
    if (!adminExists) {
      console.log('[DATABASE SEED] Seeding default admin account: admin@tailwise.org');
      await User.create({
        name: 'Alice Admin',
        email: 'admin@tailwise.org',
        phone: '5551234567',
        role: 'admin',
        password: 'admin123'
      });
    }

    // Check and seed default volunteer account
    const volunteerExists = await User.findOne({ email: 'volunteer@tailwise.org' });
    if (!volunteerExists) {
      console.log('[DATABASE SEED] Seeding default volunteer account: volunteer@tailwise.org');
      await User.create({
        name: 'Jane Volunteer',
        email: 'volunteer@tailwise.org',
        phone: '9876543210',
        role: 'volunteer',
        password: 'volunteer123'
      });
    }

    // Check and seed default user account
    const userExists = await User.findOne({ email: 'user@tailwise.org' });
    if (!userExists) {
      console.log('[DATABASE SEED] Seeding default user account: user@tailwise.org');
      await User.create({
        name: 'John Doe',
        email: 'user@tailwise.org',
        phone: '1234567890',
        role: 'user',
        password: 'user123'
      });
    }
  } catch (err: any) {
    console.log('[DATABASE SEED ERROR] Failed to seed default users:', err.message);
  }
}

export function isUsingMock() {
  return !MONGODB_URI;
}
