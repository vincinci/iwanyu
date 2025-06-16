import prisma from '../utils/db';

async function approveSeller() {
  try {
    // Find a seller with PENDING status
    const seller = await prisma.seller.findFirst({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!seller) {
      console.log('❌ No pending seller found');
      return;
    }

    // Update seller status to APPROVED
    const updatedSeller = await prisma.seller.update({
      where: { id: seller.id },
      data: { status: 'APPROVED' }
    });

    console.log('✅ Seller approved successfully:');
    console.log('  - Business Name:', seller.businessName);
    console.log('  - Owner:', seller.user?.firstName, seller.user?.lastName);
    console.log('  - Email:', seller.user?.email);
    console.log('  - Status:', updatedSeller.status);
    console.log('\nThe seller can now add products!');
  } catch (error) {
    console.error('❌ Error approving seller:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveSeller(); 