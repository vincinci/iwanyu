import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/utils/db';
import { uploadToSupabaseS3 } from '../src/utils/supabaseS3';
import path from 'path';

function checkEnv() {
  const required = [
    'SUPABASE_S3_ENDPOINT',
    'SUPABASE_S3_BUCKET',
    'SUPABASE_S3_ACCESS_KEY_ID',
    'SUPABASE_S3_SECRET_ACCESS_KEY',
  ];
  let ok = true;
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing env var: ${key}`);
      ok = false;
    }
  }
  if (!ok) {
    console.error('Aborting migration due to missing credentials.');
    process.exit(1);
  }
}

async function migrateProductImages() {
  checkEnv();
  const products = await prisma.product.findMany();
  for (const product of products) {
    let updated = false;
    let newImage = product.image;
    let newImages: string[] = [];

    // Migrate main image
    if (product.image && !product.image.startsWith('http')) {
      const ext = product.image.split('.').pop();
      const destKey = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      try {
        const s3Url = await uploadToSupabaseS3(product.image, destKey);
        newImage = s3Url;
        updated = true;
      } catch (e) {
        console.error(`Failed to upload main image for product ${product.id}:`, e);
      }
    }

    // Migrate images array
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img && !img.startsWith('http')) {
          const ext = img.split('.').pop();
          const destKey = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          try {
            const s3Url = await uploadToSupabaseS3(img, destKey);
            newImages.push(s3Url);
            updated = true;
          } catch (e) {
            console.error(`Failed to upload image for product ${product.id}:`, e);
          }
        } else if (img) {
          newImages.push(img);
        }
      }
    }

    if (updated) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          image: newImage,
          images: newImages.length > 0 ? newImages : undefined,
        },
      });
      console.log(`Updated product ${product.id}`);
    }
  }
  console.log('Migration complete.');
  process.exit(0);
}

migrateProductImages().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
}); 