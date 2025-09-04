// Dedicated layout for admin routes - no navbar, clean background
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black to-gray-900">
      {children}
    </div>
  );
}
