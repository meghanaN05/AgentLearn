import { Bell, Search, UserCircle } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-white border-b shadow-sm h-16 flex items-center justify-between px-8">

      <div className="flex items-center gap-3">

        <Search className="text-gray-500" size={20} />

        <input
          type="text"
          placeholder="Search PDFs, Chats..."
          className="outline-none border rounded-lg px-3 py-2 w-80 focus:border-blue-500"
        />

      </div>

      <div className="flex items-center gap-6">

        <button className="relative">

          <Bell size={22} className="text-gray-600 hover:text-blue-600"/>

          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        <div className="flex items-center gap-2">

          <UserCircle size={35}/>

          <div>

            <h2 className="font-semibold">
              User
            </h2>

            <p className="text-sm text-gray-500">
              Student
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;