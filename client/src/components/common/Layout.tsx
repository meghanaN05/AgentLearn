import type { ReactNode } from "react";

import Navbar from "./Navbar";

import Sidebar from "./Sidebar";

interface Props{

    children:ReactNode;

}

const Layout = ({children}:Props)=>{

    return(

        <div className="flex">

            <Sidebar/>

            <div className="flex-1 bg-slate-100 min-h-screen">

                <Navbar/>

                <main className="p-8">

                    {children}

                </main>

            </div>

        </div>

    );

}

export default Layout;