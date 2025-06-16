import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  console.log('\n📋 Current Users in Database:');
  console.log('='.repeat(80));
  
  const users = await prisma.user.findMany({
    include: {
      seller: {
        select: {
          id: true,
          businessName: true,
          status: true
        }
      },
      _count: {
        select: {
          orders: true,
          reviews: true,
          cartItems: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (users.length === 0) {
    console.log('No users found in the database.');
    return [];
  }

  users.forEach((user: any, index: number) => {
    console.log(`\n${index + 1}. ${user.firstName || ''} ${user.lastName || ''} (${user.email})`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
    console.log(`   Orders: ${user._count.orders}, Reviews: ${user._count.reviews}, Cart Items: ${user._count.cartItems}`);
    
    if (user.seller) {
      console.log(`   Seller: ${user.seller.businessName || 'No business name'} (${user.seller.status})`);
    }
  });

  console.log(`\n📊 Total Users: ${users.length}`);
  return users;
}

async function removeUser(userId: string) {
  console.log(`\n🗑️  Removing user: ${userId}`);
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        seller: true,
        orders: true,
        reviews: true,
        cartItems: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return false;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Has seller profile: ${!!user.seller}`);
    console.log(`Orders: ${user.orders.length}, Reviews: ${user.reviews.length}, Cart Items: ${user.cartItems.length}`);

    // Delete user and all related data in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Delete user's cart items
      if (user.cartItems.length > 0) {
        console.log(`Deleting ${user.cartItems.length} cart items...`);
        await tx.cartItem.deleteMany({
          where: { userId }
        });
      }

      // Delete user's reviews
      if (user.reviews.length > 0) {
        console.log(`Deleting ${user.reviews.length} reviews...`);
        await tx.review.deleteMany({
          where: { userId }
        });
      }

      // If user is a seller, delete their products and seller profile
      if (user.seller) {
        console.log(`Deleting seller products and profile...`);
        
        // Delete seller's products
        await tx.product.deleteMany({
          where: { sellerId: user.seller.id }
        });

        // Delete seller profile
        await tx.seller.delete({
          where: { id: user.seller.id }
        });
      }

      // Handle orders - transfer to deleted user placeholder
      if (user.orders.length > 0) {
        console.log(`Transferring ${user.orders.length} orders to deleted user placeholder...`);
        
        // Create a placeholder deleted user entry if it doesn't exist
        const deletedUser = await tx.user.upsert({
          where: { email: 'deleted-user@system.internal' },
          update: {},
          create: {
            email: 'deleted-user@system.internal',
            firstName: 'Deleted',
            lastName: 'User',
            role: 'USER',
            password: 'deleted-account'
          }
        });

        // Transfer orders to the deleted user placeholder
        await tx.order.updateMany({
          where: { userId },
          data: { userId: deletedUser.id }
        });
      }

      // Finally delete the user
      console.log('Deleting user record...');
      await tx.user.delete({
        where: { id: userId }
      });
    });

    console.log('✅ User deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return false;
  }
}

async function removeAllUsers(excludeAdmins = true) {
  console.log('\n🗑️  Removing all users...');
  
  const whereClause = excludeAdmins ? { role: { not: 'ADMIN' as any } } : {};
  
  const users = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, email: true, role: true }
  });

  if (users.length === 0) {
    console.log('No users to delete');
    return;
  }

  console.log(`Found ${users.length} users to delete`);
  
  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    console.log(`\nDeleting: ${user.email} (${user.role})`);
    const success = await removeUser(user.id);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Deletion Summary:`);
  console.log(`✅ Successfully deleted: ${successCount}`);
  console.log(`❌ Failed to delete: ${failCount}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'list':
        await listUsers();
        break;
        
      case 'remove':
        const userId = args[1];
        if (!userId) {
          console.log('Usage: npm run manage-users remove <user-id>');
          process.exit(1);
        }
        await removeUser(userId);
        break;
        
      case 'remove-all':
        const includeAdmins = args[1] === '--include-admins';
        console.log(`⚠️  This will delete ${includeAdmins ? 'ALL' : 'ALL NON-ADMIN'} users!`);
        console.log('This action cannot be undone.');
        
        await removeAllUsers(!includeAdmins);
        break;
        
      case 'remove-test':
        // Remove common test users
        const testEmails = [
          'testseller@example.com',
          'test@example.com',
          'testseller@iwanyu.store',
          'admin@test.com',
          'seller@test.com',
          'user@test.com'
        ];
        
        console.log('🧪 Removing test users...');
        let testRemoved = 0;
        
        for (const email of testEmails) {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            console.log(`Found test user: ${email}`);
            const success = await removeUser(user.id);
            if (success) testRemoved++;
          }
        }
        
        console.log(`✅ Removed ${testRemoved} test users`);
        break;

      case 'remove-fake-reviews':
        // Remove fake review users (emails containing @domain.com or reviewer_)
        console.log('🧪 Removing fake review users...');
        
        const fakeUsers = await prisma.user.findMany({
          where: {
            OR: [
              { email: { contains: '@domain.com' } },
              { email: { contains: 'reviewer_' } },
              { email: { contains: '@example.com' } }
            ]
          },
          select: { id: true, email: true, role: true }
        });

        console.log(`Found ${fakeUsers.length} fake review users`);
        
        let fakeRemoved = 0;
        let fakeFailed = 0;

        for (const user of fakeUsers) {
          console.log(`Deleting fake user: ${user.email}`);
          const success = await removeUser(user.id);
          if (success) {
            fakeRemoved++;
          } else {
            fakeFailed++;
          }
        }

        console.log(`\n📊 Fake User Removal Summary:`);
        console.log(`✅ Successfully deleted: ${fakeRemoved}`);
        console.log(`❌ Failed to delete: ${fakeFailed}`);
        break;
        
      default:
        console.log('User Management Script');
        console.log('Usage:');
        console.log('  npm run manage-users list                    - List all users');
        console.log('  npm run manage-users remove <user-id>       - Remove specific user');
        console.log('  npm run manage-users remove-all             - Remove all non-admin users');
        console.log('  npm run manage-users remove-all --include-admins - Remove ALL users');
        console.log('  npm run manage-users remove-test            - Remove common test users');
        console.log('  npm run manage-users remove-fake-reviews    - Remove fake review users');
        break;
    }
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 