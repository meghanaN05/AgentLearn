import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface Props{

    children: React.ReactNode;

}

const Layout = ({children}:Props) => {

    return (

        <div className="flex">

            <Sidebar/>

            <div className="flex-1 bg-gray-100 min-h-screen">

                <Navbar/>

                <div className="p-8">

                    {children}

                </div>

            </div>

        </div>

    );

};

export default Layout;