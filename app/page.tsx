export default function Home() {
  return (
    <div className="space-y-12">
      <section className="bg-blue-50 p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Find Your Dream Home</h1>
        <p className="text-xl mb-6">
          Browse our extensive collection of properties or let our AI assistant help you find the perfect match.
        </p>
        <div className="flex space-x-4">
          <a 
            href="/search" 
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Search Properties
          </a>
          <a 
            href="/ai-agent" 
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            AI Home Finder
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="font-bold text-lg">Beautiful Home in City Center</h3>
                <p className="text-gray-600">3 beds • 2 baths • 1,500 sq ft</p>
                <p className="font-bold text-xl mt-2">$450,000</p>
                <a 
                  href="/property/1" 
                  className="mt-4 inline-block text-blue-600 hover:underline"
                >
                  View details
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Why Choose Our Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold text-xl mb-2">Extensive Listings</h3>
            <p>Browse thousands of properties across the country.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold text-xl mb-2">AI-Powered Recommendations</h3>
            <p>Let our advanced AI find your perfect home based on your preferences.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold text-xl mb-2">Expert Support</h3>
            <p>Our team of real estate experts is always ready to help.</p>
          </div>
        </div>
      </section>
    </div>
  );
} 