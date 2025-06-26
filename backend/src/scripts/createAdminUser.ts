import prisma from '../utils/db';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    console.log('👑 Creating admin user...');

    const email = 'admin@iwanyu.store';
    const password = 'Admin$100';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    let user;
    if (existingUser) {
      console.log('📝 User already exists, updating to admin role and password...');
      user = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User'
        }
      });
    } else {
      console.log('📝 Creating new admin user...');
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isEmailVerified: true,
          isActive: true
        }
      });
    }

    console.log('✅ Admin user created/updated successfully!');
    console.log(`📧 Admin Email: ${user.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: ${user.role}`);
    console.log('🌐 Admin Panel: http://localhost:5173/admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 