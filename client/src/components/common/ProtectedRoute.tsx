import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";

interface Props{
    children: JSX.Element;
}

const ProtectedRoute = ({children}:Props) => {

    const {user, loading} = useAuth();

    if(loading){

        return <Loader/>

    }

    if(!user){

        return <Navigate to="/login"/>

    }

    return children;

};

export default ProtectedRoute;