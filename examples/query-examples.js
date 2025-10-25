import S5 from "../index.js";

// Example: Advanced querying with S5 JavaScript ORM
async function queryExamples() {
  console.log("🔍 S5 JavaScript ORM - Query Examples\n");

  const s5 = new S5({
    apiKey: "ak_your_prefix_your_secret",
  });

  const Product = s5.collection("products");

  try {
    // Create some sample products
    console.log("Creating sample products...");
    const products = await Promise.all([
      Product.create({
        name: "Laptop",
        category: "electronics",
        price: 999.99,
        in_stock: true,
        tags: ["computer", "portable"],
      }),
      Product.create({
        name: "Phone",
        category: "electronics",
        price: 699.99,
        in_stock: false,
        tags: ["mobile", "communication"],
      }),
      Product.create({
        name: "Book",
        category: "education",
        price: 19.99,
        in_stock: true,
        tags: ["reading", "learning"],
      }),
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Basic queries
    console.log("\n1. Find all products:");
    const allProducts = await Product.all();
    console.log(`   Found ${allProducts.documents.length} products`);

    // Equality queries
    console.log("\n2. Find electronics:");
    const electronics = await Product.where({
      q: ['eq(category,"electronics")'],
    });
    console.log(`   Found ${electronics.documents.length} electronics`);

    // Numeric comparisons
    console.log("\n3. Find expensive products (>$500):");
    const expensive = await Product.where({
      q: ["gt(price,500)"],
    });
    console.log(`   Found ${expensive.documents.length} expensive products`);

    // Multiple conditions
    console.log("\n4. Find in-stock electronics:");
    const inStockElectronics = await Product.where({
      q: ['eq(category,"electronics")', "eq(in_stock,true)"],
    });
    console.log(
      `   Found ${inStockElectronics.documents.length} in-stock electronics`
    );

    // Array operations
    console.log("\n5. Find products with specific tags:");
    const taggedProducts = await Product.where({
      q: ['in(tags,["computer","mobile"])'],
    });
    console.log(`   Found ${taggedProducts.documents.length} tagged products`);

    // Ordering
    console.log("\n6. Find products ordered by price:");
    const orderedProducts = await Product.where({
      order: ["-price"],
    });
    console.log(
      `   Found ${orderedProducts.documents.length} products (ordered by price)`
    );

    // JSON filter example
    console.log("\n7. Using JSON filter:");
    const jsonFiltered = await Product.where({
      filter: {
        eq: { category: "electronics" },
        gt: { price: 500 },
      },
    });
    console.log(
      `   Found ${jsonFiltered.documents.length} products with JSON filter`
    );

    // Complex query
    console.log("\n8. Complex query - in-stock electronics under $800:");
    const complexQuery = await Product.where({
      q: ['eq(category,"electronics")', "eq(in_stock,true)", "lt(price,800)"],
      order: ["price"],
    });
    console.log(
      `   Found ${complexQuery.documents.length} products matching complex criteria`
    );

    // First and count
    console.log("\n9. Finding first product:");
    const firstProduct = await Product.first();
    console.log(`   First product: ${firstProduct?.get("name")}`);

    console.log("\n10. Counting products:");
    const productCount = await Product.count();
    console.log(`   Total products: ${productCount}`);

    // Clean up
    console.log("\nCleaning up...");
    await Promise.all(products.map((p) => p.destroy()));
    console.log("✅ All products deleted");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// export { queryExamples };

queryExamples();
