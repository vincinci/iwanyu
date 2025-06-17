const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importVariants() {
  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '..', 'products_export_1 (1).csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      console.log('CSV file is empty');
      return;
    }
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('CSV Headers:', headers.slice(0, 10), '...'); // Show first 10 headers
    
    // Find relevant column indices
    const handleIndex = headers.findIndex(h => h.toLowerCase() === 'handle');
    const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');
    const option1NameIndex = headers.findIndex(h => h.toLowerCase() === 'option1 name');
    const option1ValueIndex = headers.findIndex(h => h.toLowerCase() === 'option1 value');
    const option2NameIndex = headers.findIndex(h => h.toLowerCase() === 'option2 name');
    const option2ValueIndex = headers.findIndex(h => h.toLowerCase() === 'option2 value');
    const option3NameIndex = headers.findIndex(h => h.toLowerCase() === 'option3 name');
    const option3ValueIndex = headers.findIndex(h => h.toLowerCase() === 'option3 value');
    const variantPriceIndex = headers.findIndex(h => h.toLowerCase() === 'variant price');
    const variantQtyIndex = headers.findIndex(h => h.toLowerCase() === 'variant inventory qty');
    const variantSkuIndex = headers.findIndex(h => h.toLowerCase() === 'variant sku');
    const variantImageIndex = headers.findIndex(h => h.toLowerCase() === 'variant image');
    
    console.log('Key column indices:');
    console.log('Handle:', handleIndex);
    console.log('Title:', titleIndex);
    console.log('Option1 Name:', option1NameIndex);
    console.log('Option1 Value:', option1ValueIndex);
    console.log('Option2 Name:', option2NameIndex);
    console.log('Option2 Value:', option2ValueIndex);
    console.log('Variant Price:', variantPriceIndex);
    console.log('Variant Qty:', variantQtyIndex);
    
    // Group variants by product handle
    const productVariants = {};
    let processedLines = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      try {
        // Parse CSV line (handle quoted fields properly)
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim()); // Add the last value
        
        const handle = values[handleIndex]?.replace(/"/g, '') || '';
        const title = values[titleIndex]?.replace(/"/g, '') || '';
        const option1Name = values[option1NameIndex]?.replace(/"/g, '') || '';
        const option1Value = values[option1ValueIndex]?.replace(/"/g, '') || '';
        const option2Name = values[option2NameIndex]?.replace(/"/g, '') || '';
        const option2Value = values[option2ValueIndex]?.replace(/"/g, '') || '';
        const option3Name = values[option3NameIndex]?.replace(/"/g, '') || '';
        const option3Value = values[option3ValueIndex]?.replace(/"/g, '') || '';
        const variantPrice = parseFloat(values[variantPriceIndex]?.replace(/"/g, '') || '0');
        const variantQty = parseInt(values[variantQtyIndex]?.replace(/"/g, '') || '0');
        const variantSku = values[variantSkuIndex]?.replace(/"/g, '') || '';
        const variantImage = values[variantImageIndex]?.replace(/"/g, '') || '';
        
        if (!handle || !title) continue;
        
        // Initialize product variants array if not exists
        if (!productVariants[handle]) {
          productVariants[handle] = {
            title: title,
            variants: []
          };
        }
        
        // Add variants for this row
        const variants = [];
        
        if (option1Name && option1Value) {
          variants.push({
            name: option1Name,
            value: option1Value,
            price: variantPrice > 0 ? variantPrice : null,
            stock: variantQty,
            sku: variantSku,
            image: variantImage
          });
        }
        
        if (option2Name && option2Value) {
          variants.push({
            name: option2Name,
            value: option2Value,
            price: variantPrice > 0 ? variantPrice : null,
            stock: variantQty,
            sku: variantSku,
            image: variantImage
          });
        }
        
        if (option3Name && option3Value) {
          variants.push({
            name: option3Name,
            value: option3Value,
            price: variantPrice > 0 ? variantPrice : null,
            stock: variantQty,
            sku: variantSku,
            image: variantImage
          });
        }
        
        // Add unique variants
        variants.forEach(variant => {
          const existingVariant = productVariants[handle].variants.find(
            v => v.name === variant.name && v.value === variant.value
          );
          if (!existingVariant) {
            productVariants[handle].variants.push(variant);
          }
        });
        
        processedLines++;
        if (processedLines % 100 === 0) {
          console.log(`Processed ${processedLines} lines...`);
        }
        
      } catch (error) {
        console.error(`Error processing line ${i}:`, error.message);
        continue;
      }
    }
    
    console.log(`\nProcessed ${processedLines} lines`);
    console.log(`Found ${Object.keys(productVariants).length} unique products with potential variants`);
    
    // Show sample of what we found
    console.log('\nSample products with variants:');
    let sampleCount = 0;
    for (const [handle, data] of Object.entries(productVariants)) {
      if (data.variants.length > 0 && sampleCount < 3) {
        console.log(`\n${handle} (${data.title}):`);
        data.variants.forEach(variant => {
          console.log(`  - ${variant.name}: ${variant.value} (Price: ${variant.price}, Stock: ${variant.stock})`);
        });
        sampleCount++;
      }
    }
    
    // Now import variants to database
    let importedVariants = 0;
    let skippedProducts = 0;
    
    for (const [handle, data] of Object.entries(productVariants)) {
      if (data.variants.length === 0) continue;
      
      try {
        // Find the product in database by name (since handle might not match exactly)
        const product = await prisma.product.findFirst({
          where: {
            OR: [
              { name: { contains: data.title, mode: 'insensitive' } },
              { name: { contains: handle.replace(/-/g, ' '), mode: 'insensitive' } }
            ]
          }
        });
        
        if (!product) {
          console.log(`Product not found for handle: ${handle} (${data.title})`);
          skippedProducts++;
          continue;
        }
        
        // Create variants for this product
        for (const variant of data.variants) {
          try {
            await prisma.productVariant.create({
              data: {
                productId: product.id,
                name: variant.name,
                value: variant.value,
                price: variant.price,
                stock: variant.stock,
                sku: variant.sku || null,
                image: variant.image || null,
                sortOrder: 0,
                isActive: true
              }
            });
            importedVariants++;
          } catch (variantError) {
            // Skip if variant already exists (unique constraint)
            if (!variantError.message.includes('Unique constraint')) {
              console.error(`Error creating variant for ${product.name}:`, variantError.message);
            }
          }
        }
        
        console.log(`✓ Added ${data.variants.length} variants for: ${product.name}`);
        
      } catch (error) {
        console.error(`Error processing product ${handle}:`, error.message);
        skippedProducts++;
      }
    }
    
    console.log(`\n✅ Import completed!`);
    console.log(`- Imported variants: ${importedVariants}`);
    console.log(`- Skipped products: ${skippedProducts}`);
    
  } catch (error) {
    console.error('Error importing variants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importVariants(); 