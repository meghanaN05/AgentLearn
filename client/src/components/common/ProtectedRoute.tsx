import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import Loader from "./Loader";

import useAuth from "../../hooks/useAuth";

interface Props{

    children:ReactNode;

}

const ProtectedRoute = ({children}:Props)=>{

    const {user,loading}=useAuth();

    if(loading){

        return <Loader/>

    }

    if(!user){

        return <Navigate to="/login"/>

    }

    return children;

}

export default ProtectedRoute;