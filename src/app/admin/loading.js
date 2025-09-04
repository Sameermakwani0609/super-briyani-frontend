export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <div className="container mx-auto">
        <div className="h-16 w-64 bg-yellow-400/20 rounded mb-6 animate-pulse" />
        <div className="flex space-x-2 mb-6">
          <div className="h-10 w-28 bg-yellow-400/20 rounded animate-pulse" />
          <div className="h-10 w-28 bg-yellow-400/20 rounded animate-pulse" />
          <div className="h-10 w-28 bg-yellow-400/20 rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-6 w-40 bg-yellow-400/20 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-yellow-400/10 rounded" />
                <div className="h-4 w-5/6 bg-yellow-400/10 rounded" />
                <div className="h-4 w-2/3 bg-yellow-400/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


