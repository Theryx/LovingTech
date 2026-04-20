import { ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase, Product } from "@/lib/supabase";

async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Supabase connection failed:', e);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="px-6 py-24 text-center bg-gradient-to-b from-zinc-900 to-black">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl mb-6">
          Premium Tech <br />
          <span className="text-zinc-500">For Professionals.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-zinc-400 text-lg mb-10">
          The finest collection of Logitech, Anker, and Keychron gadgets in Cameroon. 
          100% Authentic. Delivered in 24h.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#catalog" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition">
            Browse Catalog
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-zinc-900">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-zinc-900 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-xl">100% Authentic</h3>
          <p className="text-zinc-500">Directly sourced premium brands. No counterfeits.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-zinc-900 rounded-2xl">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-xl">Fast Delivery</h3>
          <p className="text-zinc-500">24h in Douala, 48h in Yaoundé. Express shipping.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-zinc-900 rounded-2xl">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-xl">Pay on Delivery</h3>
          <p className="text-zinc-500">Inspect your gadget before paying. MoMo supported.</p>
        </div>
      </section>

      {/* Product Grid */}
      <section id="catalog" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-bold mb-3 tracking-tight">Featured Collection</h2>
            <p className="text-zinc-500 text-lg">Carefully curated for peak performance.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Logitech', 'Anker', 'Keychron'].map((brand) => (
              <button key={brand} className="px-5 py-2.5 rounded-full border border-zinc-800 text-sm font-medium hover:bg-zinc-900 transition">
                {brand}
              </button>
            ))}
          </div>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-zinc-950 border border-zinc-900 rounded-3xl">
            <p className="text-zinc-500">No products found. Please check your Supabase connection.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold italic tracking-tighter">LOVING TECH</div>
          <div className="flex gap-8 text-zinc-500 text-sm">
            <a href="#" className="hover:text-white transition">Instagram</a>
            <a href="#" className="hover:text-white transition">WhatsApp</a>
            <a href="#" className="hover:text-white transition">Terms</a>
          </div>
          <p className="text-zinc-600 text-sm">© 2026 Loving Tech Cameroon. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
