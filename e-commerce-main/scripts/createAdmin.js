import dbConnect from '../lib/dbConnect.js';
import Admin from '../models/Admin.js';

async function createAdmin() {
  try {
    await dbConnect();
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@ecommerce.com',
      password: 'admin123', // This will be hashed automatically
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@ecommerce.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
