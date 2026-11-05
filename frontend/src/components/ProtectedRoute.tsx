import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { JSX } from "react/jsx-runtime";

interface JwtPayload{
    exp:number;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

interface ProtectedRouteProps{
    children: JSX.Element;
    allowedRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export function ProctedRoute({children,allowedRole}:ProtectedRouteProps){
    const token=localStorage.getItem('token');
    if(!token){
        return <Navigate to="/login" replace />;
    }
    try{
        const decoded=jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() /1000;
        if(decoded.exp<currentTime){
            localStorage.removeItem('token');
            return <Navigate to="/login" replace />;
        }
        if (decoded.role!==allowedRole){

            return <Navigate to="/login" replace />;
        }
        return children;
    }catch(error){
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
}