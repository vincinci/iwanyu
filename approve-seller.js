const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveSeller() {
  try {
    console.log('Approving seller...');
    
    // Find the seller by email
    const seller = await prisma.seller.findFirst({
      where: {
        businessEmail: 'iwanyu.seller@iwanyu.store'
      }
    });

    if (!seller) {
      console.log('❌ Seller not found');
      return;
    }

    if (seller.status === 'APPROVED') {
      console.log('✅ Seller is already approved!');
      return;
    }

    // Update seller status to APPROVED
    await prisma.seller.update({
      where: { id: seller.id },
      data: { status: 'APPROVED' }
    });

    console.log('✅ Seller approved successfully!');
    console.log(`📧 Business Email: ${seller.businessEmail}`);
    console.log(`🏪 Business Name: ${seller.businessName}`);
    console.log(`✨ Status: APPROVED`);

  } catch (error) {
    console.error('❌ Error approving seller:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
approveSeller(); 