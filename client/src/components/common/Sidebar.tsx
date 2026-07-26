import {
    LayoutDashboard,
    Upload,
    MessageCircle,
    FileText,
    BrainCircuit,
    ClipboardCheck,
    BarChart3,
    User
} from "lucide-react";

import { NavLink } from "react-router-dom";

const Sidebar = () => {

    const menu = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: <LayoutDashboard size={20}/>
        },
        {
            name: "Upload PDF",
            path: "/upload",
            icon: <Upload size={20}/>
        },
        {
            name: "Chat",
            path: "/chat",
            icon: <MessageCircle size={20}/>
        },
        {
            name: "Summary",
            path: "/summary",
            icon: <FileText size={20}/>
        },
        {
            name: "MCQ Generator",
            path: "/mcq",
            icon: <BrainCircuit size={20}/>
        },
        {
            name: "Mock Test",
            path: "/mocktest",
            icon: <ClipboardCheck size={20}/>
        },
        {
            name: "Analytics",
            path: "/analytics",
            icon: <BarChart3 size={20}/>
        },
        {
            name: "Profile",
            path: "/profile",
            icon: <User size={20}/>
        },
    ];

    return (
        <aside className="w-64 bg-slate-900 min-h-screen text-white">

            <div className="text-center py-8 text-3xl font-bold border-b border-slate-700">
                LearnFlow
            </div>

            <nav className="mt-6">

                {
                    menu.map((item)=>(
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({isActive})=>

                                `flex items-center gap-3 px-6 py-4 hover:bg-slate-800 transition ${
                                    isActive ? "bg-blue-600":""
                                }`

                            }
                        >

                            {item.icon}

                            {item.name}

                        </NavLink>
                    ))
                }

            </nav>

        </aside>
    );
};

export default Sidebar;