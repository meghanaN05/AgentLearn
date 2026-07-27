import {
  LayoutDashboard,
  Upload,
  MessageCircle,
 FileText,
  Brain,
  ClipboardCheck,
  BarChart3,
  User
} from "lucide-react";

import { NavLink } from "react-router-dom";

const Sidebar = () => {

  const menus = [

    {
      name:"Dashboard",
      path:"/dashboard",
      icon:<LayoutDashboard size={20}/>
    },

    {
      name:"Upload PDF",
      path:"/upload",
      icon:<Upload size={20}/>
    },

    {
      name:"Chat",
      path:"/chat",
      icon:<MessageCircle size={20}/>
    },

    {
      name:"Summary",
      path:"/summary",
      icon:<FileText size={20}/>
    },

    {
      name:"MCQ",
      path:"/mcq",
      icon:<Brain size={20}/>
    },

    {
      name:"Mock Test",
      path:"/mocktest",
      icon:<ClipboardCheck size={20}/>
    },

    {
      name:"Analytics",
      path:"/analytics",
      icon:<BarChart3 size={20}/>
    },

    {
      name:"Profile",
      path:"/profile",
      icon:<User size={20}/>
    }

  ];

  return (

    <aside className="bg-slate-900 text-white w-64 min-h-screen">

      <div className="text-center py-8 text-3xl font-bold border-b border-slate-700">

        LearnFlow AI

      </div>

      <div className="mt-5">

        {
          menus.map((menu)=>(

            <NavLink

              key={menu.path}

              to={menu.path}

              className={({isActive})=>

                `flex items-center gap-4 px-6 py-4 hover:bg-slate-800 transition ${
                  isActive ? "bg-blue-600":""
                }`

              }

            >

              {menu.icon}

              {menu.name}

            </NavLink>

          ))
        }

      </div>

    </aside>

  );

};

export default Sidebar;