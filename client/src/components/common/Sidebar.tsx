import {
  LayoutDashboard,
  Upload,
  MessageCircle,
 FileText,
  Brain,
  ClipboardCheck,
  BarChart3,
  Lightbulb,
  Settings,
  User
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { APP_NAME } from "../../utils/constants";

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
      name:"Recommendations",
      path:"/recommendations",
      icon:<Lightbulb size={20}/>
    },

    {
      name:"Profile",
      path:"/profile",
      icon:<User size={20}/>
    },

    {
      name:"Settings",
      path:"/settings",
      icon:<Settings size={20}/>
    }

  ];

  return (

    <aside className="bg-slate-900 text-white w-64 min-h-screen">

      <div className="px-6 py-6 text-xl font-semibold tracking-tight border-b border-slate-800">

        {APP_NAME}

      </div>

      <div className="mt-5">

        {
          menus.map((menu)=>(

            <NavLink

              key={menu.path}

              to={menu.path}

              className={({isActive})=>

                `flex items-center gap-3 px-6 py-3 text-sm transition-colors border-l-2 ${
                  isActive
                    ? "bg-slate-800 border-blue-500 text-white"
                    : "border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white"
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