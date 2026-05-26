'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, ShoppingCart, Info, MapPin, Phone, Trash, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';

export default function PetShop() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [promo, setPromo] = useState('');

  const loadProducts = async (query = '') => {
    setLoading(true);
    try {
      // Calls the API (which has the deliberate CASE-SENSITIVE search bug)
      const res = await fetch(`/api/petShop?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadProducts('');
  };

  // Add to cart
  const handleAddToCart = (productId: string, quantity: number) => {
    // DELIBERATE BUG: Negative quantity addition allowed!
    // We do not prevent quantity from being negative or equal to zero.
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + quantity;
      
      const updated = { ...prev };
      if (newQty === 0 && quantity > 0) {
        // Normally we'd delete, but let's allow saving the state
        delete updated[productId];
      } else {
        updated[productId] = newQty;
      }
      return updated;
    });
  };

  const handleUpdateCartQtyDirect = (productId: string, value: string) => {
    const parsed = parseInt(value, 10);
    // DELIBERATE BUG: Allow direct entry of negative numbers in the cart input
    setCart((prev) => {
      const updated = { ...prev };
      if (isNaN(parsed)) {
        updated[productId] = 0;
      } else {
        updated[productId] = parsed;
      }
      return updated;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  // Calculate cart items and total price
  const cartItemsList = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p._id === id) || { _id: id, name: 'Unknown Product', price: 0 };
    
    // DELIBERATE BUG: Double add price overwrite bug!
    // If quantity is exactly 2, the price is overwritten to $0 in the cart total.
    const priceToUse = qty === 2 ? 0 : product.price;
    
    return {
      product,
      quantity: qty,
      subtotal: Number((priceToUse * qty).toFixed(2))
    };
  });

  // DELIBERATE BUG: Promo code SAVE10 increases price by 10% instead of discounting!
  let subtotalSum = cartItemsList.reduce((sum, item) => sum + item.subtotal, 0);
  if (promo.trim().toUpperCase() === 'SAVE10') {
    subtotalSum = subtotalSum * 1.10;
  }

  // DELIBERATE BUG: Decimal Rounding Mismatch display raw floats
  const rawSubtotalFloat = cartItemsList.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const cartTotal = Number(subtotalSum.toFixed(2));

  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    setCheckoutLoading(true);
    setError('');
    setMessage('');

    try {
      const itemsPayload = Object.entries(cart).map(([id, qty]) => ({
        productId: id,
        quantity: qty
      }));

      // Calls checkout API (allows negative quantities)
      const res = await fetch('/api/petShop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Checkout successful! Thank you. Total Charged/Refunded: $${data.totalPrice}`);
        setCart({});
      } else {
        setError(data.error || 'Checkout failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Checkout connection error.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Shop Info Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-amber-500 w-8 h-8" /> Happy Tails Shop
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xl">
            Browse and purchase pet food, harnesses, toys, and supplies. A portion of all proceeds is donated to finance local animal rescue drives.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-mono text-zinc-550 border-l border-zinc-200 dark:border-zinc-850 pl-6 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> Downtown Outlet</div>
            <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-400" /> +1 (999) 888-7777</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Products Grid - Column 8 */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accessories (CASE SENSITIVE, e.g. Dog vs dog)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 rounded-xl text-xs"
              >
                Clear
              </button>
            )}
          </form>

          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading catalog...</div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center py-12 rounded-2xl text-zinc-550">
              No products found. (Reminder: product search is case sensitive!)
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div 
                  key={prod._id} 
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="h-44 bg-zinc-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={prod.imageUrl} alt={prod.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm leading-tight">{prod.name}</h3>
                      <p className="text-xs text-zinc-450 line-clamp-2">{prod.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-150">${prod.price}</span>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
                        Stock: {prod.stock}
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 border-t border-zinc-150 dark:border-zinc-800 flex gap-2">
                    {/* Negative Quantity Test: We show buttons that allow adding negative items! */}
                    <button
                      onClick={() => handleAddToCart(prod._id, -1)}
                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer"
                      title="Add negative quantity (Buggy)"
                    >
                      -1 Qty (Bug)
                    </button>
                    <button
                      onClick={() => handleAddToCart(prod._id, 1)}
                      className="flex-grow py-1 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping Cart - Column 4 */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold border-b border-zinc-150 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" /> Shopping Cart
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-655 dark:text-red-400 p-3 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-650 dark:text-emerald-450 p-3 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-550" />
              <span>{message}</span>
            </div>
          )}

          {cartItemsList.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs italic">
              Your cart is empty. Add accessories to checkout.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-60 overflow-y-auto space-y-2">
                {cartItemsList.map((item) => (
                  <div key={item.product._id} className="pt-2 flex justify-between items-center gap-2 text-xs">
                    <div className="flex-grow truncate">
                      <div className="font-bold truncate">{item.product.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">${item.product.price} each</div>
                    </div>
                    
                    {/* Quantity editor (accepts negative numbers) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateCartQtyDirect(item.product._id, e.target.value)}
                        className="w-12 text-center p-1 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded font-mono text-xs focus:outline-none"
                      />
                      <button
                        onClick={() => handleRemoveFromCart(item.product._id)}
                        className="p-1 hover:text-red-500 text-zinc-400 transition"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="w-16 text-right font-bold font-mono">
                      {/* Can be negative! */}
                      ${item.subtotal}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-zinc-400">Apply Promo (SAVE10):</label>
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-zinc-350 dark:border-zinc-700 bg-transparent text-[11px] focus:outline-none"
                />
              </div>

              {/* Total Summary */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[10px] text-zinc-450">
                  <span>Raw Decimal Display:</span>
                  <span className="font-mono">{rawSubtotalFloat}</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>Cart Total:</span>
                  <span className={`font-mono ${cartTotal < 0 ? 'text-rose-500 font-extrabold bg-rose-550/10 px-1 py-0.5 rounded' : 'text-zinc-800 dark:text-zinc-100'}`}>
                    ${cartTotal}
                  </span>
                </div>
                {cartTotal < 0 && (
                  <div className="p-2 rounded bg-rose-500/10 text-rose-500 font-semibold text-[10px]">
                    ⚠️ Cart total is negative! Store checkout will process this as a credit/refund.
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-md shadow-amber-500/10"
              >
                {checkoutLoading ? 'Processing Checkout...' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QA Warning description */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/25 rounded-2xl space-y-2 text-xs">
        <h4 className="font-bold text-amber-500 flex items-center gap-1.5">
          💡 QA Testing Guide: Pet Shop Bugs
        </h4>
        <ul className="list-disc list-inside space-y-1 text-zinc-450 leading-relaxed">
          <li>
            <strong className="text-zinc-300">Negative Quantity Bug:</strong> Click the <strong className="text-zinc-200">-1 Qty (Bug)</strong> button on any product. Look at the Shopping Cart. You will see a negative quantity! You can also type any negative number directly in the cart input field. Note that this lowers the total cart price, and you can successfully checkout with a negative total!
          </li>
          <li>
            <strong className="text-zinc-305">Case-Sensitive Search:</strong> Try searching for <strong className="text-zinc-205">&quot;dog food&quot;</strong> (all lowercase). You will get no results even though &quot;Premium Dog Food&quot; exists. Search for <strong className="text-zinc-205">&quot;Dog&quot;</strong> to match it.
          </li>
        </ul>
      </div>
    </div>
  );
}
