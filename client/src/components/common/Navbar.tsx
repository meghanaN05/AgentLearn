import { Bell, UserCircle } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          LearnFlow AI
        </h1>
      </div>

      <div className="flex items-center gap-5">

        <button className="relative">
          <Bell className="w-6 h-6 text-gray-600 hover:text-blue-600 transition" />

          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
        </button>

        <button>
          <UserCircle className="w-9 h-9 text-gray-700 hover:text-blue-600 transition" />
        </button>

      </div>
    </nav>
  );
};

export default Navbar;