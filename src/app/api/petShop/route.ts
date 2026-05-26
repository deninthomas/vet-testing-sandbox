import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import Product from '@/models/petShopModel';
import { mockDb } from '@/lib/mockData';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('q') || '';

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX PET SHOP SEARCH]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);
    console.log(`- Search Query: "${searchQuery}"`);

    if (searchQuery) {
      console.log(`[QA PET SHOP SEARCH WARNING]: Case-sensitive search. Raw query: "${searchQuery}" (Deliberate Bug 42/71).`);
    }

    if (isUsingMock()) {
      let filteredProducts = mockDb.products;

      if (searchQuery) {
        // DELIBERATE BUG: Case-sensitive search!
        filteredProducts = mockDb.products.filter(p => p.name.includes(searchQuery));
      }
      console.log(`- Total products returned: ${filteredProducts.length}`);
      return NextResponse.json({ success: true, products: filteredProducts });
    } else {
      await connectToDatabase();
      let query = {};
      if (searchQuery) {
        // DELIBERATE BUG: Case-sensitive Mongoose search (no 'i' regex option)
        query = { name: { $regex: searchQuery } };
      }
      const products = await Product.find(query);
      console.log(`- Total products returned: ${products.length}`);
      return NextResponse.json({ success: true, products });
    }
  } catch (error: any) {
    console.log(`[QA PET SHOP GET FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { items } = await req.json(); // Array of { productId, quantity }

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX PET SHOP CHECKOUT]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log(`[QA PET SHOP CHECKOUT FAILURE]: No items in cart.`);
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    let totalPrice = 0;
    const purchasedProducts = [];

    for (const item of items) {
      const { productId, quantity } = item;

      console.log(`- Cart Item: ProductID="${productId}", Quantity=${quantity}`);

      // DELIBERATE BUG: Negative quantity check missing!
      if (quantity <= 0) {
        console.log(`[QA PET SHOP WARNING]: Non-positive/negative quantity checkout allowed! (Deliberate Bug 41/70). Qty: ${quantity}`);
      }

      if (isUsingMock()) {
        const prod = mockDb.products.find(p => p._id === productId);
        if (!prod) {
          console.log(`[QA PET SHOP CHECKOUT FAILURE]: Product "${productId}" not found in mock store.`);
          return NextResponse.json({ error: 'Product not found: ' + productId }, { status: 404 });
        }

        // Calculate price (could be negative if quantity is negative!)
        totalPrice += prod.price * quantity;
        
        // Simulating stock adjustment (a negative quantity actually INCREASES the stock!)
        prod.stock -= quantity;
        console.log(`  - Product: "${prod.name}" | Price: $${prod.price} | New Stock: ${prod.stock}`);

        purchasedProducts.push({
          name: prod.name,
          price: prod.price,
          quantity: quantity,
        });
      } else {
        await connectToDatabase();
        const prod = await Product.findById(productId);
        if (!prod) {
          console.log(`[QA PET SHOP CHECKOUT FAILURE]: Product "${productId}" not found in MongoDB.`);
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        totalPrice += prod.price * quantity;
        prod.stock -= quantity;
        await prod.save();
        console.log(`  - Product: "${prod.name}" | Price: $${prod.price} | New Stock: ${prod.stock}`);

        purchasedProducts.push({
          name: prod.name,
          price: prod.price,
          quantity: quantity,
        });
      }
    }

    console.log(`[QA PET SHOP CHECKOUT SUCCESS] Total Price: $${totalPrice.toFixed(2)}`);

    // Success response with checkout summary (which could be negative!)
    return NextResponse.json({
      success: true,
      message: 'Checkout successful!',
      totalPrice: Number(totalPrice.toFixed(2)),
      items: purchasedProducts,
    });
  } catch (error: any) {
    console.log(`[QA PET SHOP CHECKOUT FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
