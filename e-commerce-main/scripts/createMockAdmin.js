import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Admin schema (inline to avoid import issues)
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function createMockAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Email: admin@ecommerce.com');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create mock admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('Mock admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@ecommerce.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating mock admin:', error);
    process.exit(1);
  }
}

createMockAdmin();
