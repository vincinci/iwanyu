import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveSeller(email: string) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { seller: true }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    if (!user.seller) {
      console.log(`❌ User ${email} doesn't have a seller account`);
      return;
    }

    if (user.seller.status === 'APPROVED') {
      console.log(`✅ Seller ${email} is already approved`);
      return;
    }

    // Approve the seller
    await prisma.seller.update({
      where: { id: user.seller.id },
      data: { status: 'APPROVED' }
    });

    console.log(`✅ Successfully approved seller: ${email}`);
    console.log(`   Business: ${user.seller.businessName || 'Not provided'}`);
    console.log(`   Status: PENDING → APPROVED`);
    console.log(`\nThe seller can now add products!`);
  } catch (error) {
    console.error('❌ Error approving seller:', error);
  }
}

async function listPendingSellers() {
  try {
    const pendingSellers = await prisma.seller.findMany({
      where: { status: 'PENDING' },
      include: { user: true }
    });

    if (pendingSellers.length === 0) {
      console.log('No pending sellers found.');
      return;
    }

    console.log('\n📋 Pending Sellers:');
    console.log('==================');
    pendingSellers.forEach((seller, index) => {
      console.log(`${index + 1}. ${seller.user.email}`);
      console.log(`   Business: ${seller.businessName || 'Not provided'}`);
      console.log(`   Created: ${seller.createdAt.toLocaleDateString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing pending sellers:', error);
  }
}

async function main() {
  const command = process.argv[2];
  const email = process.argv[3];

  if (command === 'list') {
    await listPendingSellers();
  } else if (command === 'approve' && email) {
    await approveSeller(email);
  } else {
    console.log('Usage:');
    console.log('  npm run approve-seller list');
    console.log('  npm run approve-seller approve <email>');
    console.log('');
    console.log('Examples:');
    console.log('  npm run approve-seller list');
    console.log('  npm run approve-seller approve user@example.com');
  }

  await prisma.$disconnect();
}

main().catch(console.error); 