import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Search, Sun, UserCircle } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { useThemeContext } from "../../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (query.trim()) {
      navigate(`/upload?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm h-16 flex items-center justify-between px-8">

      <form onSubmit={handleSearch} className="flex items-center gap-3">

        <Search className="text-gray-500 dark:text-gray-400" size={20} />

        <input
          type="text"
          placeholder="Search your PDFs..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="outline-none border dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 w-80 focus:border-blue-500"
        />

      </form>

      <div className="flex items-center gap-6">

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="text-gray-600 dark:text-gray-300 hover:text-blue-600"
        >
          {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        <div className="flex items-center gap-2">

          <UserCircle size={35} />

          <div>

            <h2 className="font-semibold">
              {user?.name ?? "Account"}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="text-gray-600 dark:text-gray-300 hover:text-red-600"
        >
          <LogOut size={22} />
        </button>

      </div>

    </header>
  );
};

export default Navbar;
