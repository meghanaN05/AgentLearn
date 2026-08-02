import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { pageTransition } from "../../lib/motion";

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  const { pathname } = useLocation();

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 dark:bg-gray-900 dark:text-gray-100 min-h-screen">

        <Navbar />

        {/* Keyed on pathname so each route re-runs the entrance rather than
            swapping content in place. */}
        <motion.main
          key={pathname}
          className="p-8"
          variants={pageTransition}
          initial="hidden"
          animate="visible"
        >
          {children}
        </motion.main>

      </div>

    </div>
  );
};

export default Layout;
