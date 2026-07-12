import AddToCartButton from "@/components/AddToCartButton";

export default async function Home() {
  const response = await fetch('http://localhost:8000/api/products', {
    cache: 'no-store'

  });

  const products = await response.json()

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-1 text-gray-800">Katalog Produk</h1>
            <p className="text-gray-500">Pilih barang impianmu hari ini!</p>
          </div>
          <a href="/login" className="text-blue-600 font-semibold hover:underline">Masuk / Daftar</a>
        </div>
        {/* Grid System Tailwind untuk menata kartu produk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {products.map((product: any) => (
            <div key={product.id} className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-xl transition-shadow duration-300">

              {/* Tempat Gambar (Placeholder) */}
              <div className="bg-gray-200 h-48 rounded-xl mb-4 flex items-center justify-center text-gray-400 font-medium">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover rounded-xl" />
                ) : (
                  "Belum Ada Gambar"
                )}
              </div>

              {/* Info Produk */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-500 font-bold tracking-widest uppercase">
                  {product.category.name}
                </span>
                <h2 className="text-lg font-extrabold text-gray-800 truncate" title={product.name}>
                  {product.name}
                </h2>

                {/* Format Harga ke Rupiah standar Indonesia */}
                <p className="text-xl font-black text-orange-500 mt-2">
                  Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                </p>
              </div>
              {/* Tombol Keranjang */}
              <AddToCartButton product={product} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}