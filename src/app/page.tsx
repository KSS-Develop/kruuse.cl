import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Bienvenido a Kruuse.cl
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Tu tienda de insumos veterinarios
        </p>
        
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Selecciona tu región:</h2>
          <div className="space-y-4">
            <Link href="/cl/store" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold">🇨🇱 Chile</h3>
              <p className="text-gray-600">Precios en CLP</p>
            </Link>
            <Link href="/us/store" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold">🇺🇸 Estados Unidos</h3>
              <p className="text-gray-600">Precios en USD</p>
            </Link>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Páginas de prueba:</h3>
            <div className="space-x-4">
              <Link href="/test-server" className="text-blue-600 hover:underline">
                Test Server
              </Link>
              <Link href="/api/test-supabase" className="text-blue-600 hover:underline">
                Test API
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}