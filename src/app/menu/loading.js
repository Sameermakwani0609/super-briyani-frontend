export default function Loading() {
  return (
    <section className="pt-24 pb-16 bg-black text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center text-yellow-400 mb-12 drop-shadow-lg">
          Loading menu…
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-yellow-400/10 border border-yellow-400 rounded-xl p-6 animate-pulse"
            >
              <div className="mb-4 h-40 w-full overflow-hidden rounded-lg bg-yellow-400/10" />
              <div className="h-6 w-2/3 bg-yellow-400/20 rounded mb-3" />
              <div className="h-5 w-1/3 bg-yellow-400/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


