import { useState, useEffect } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JwtPayload{
    sub: number;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    exp: number;
}

export function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(()=>{
        const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          if (decoded.role === 'ADMIN') navigate('/admin');
          else if (decoded.role === 'TEACHER') navigate('/teacher');
          else navigate('/student');
        } else {
          localStorage.removeItem('token');
        }} 
        catch (err) {
        localStorage.removeItem('token');
      }
    }
    },[navigate]);

    const handleLogin = async(e: React.FormEvent) =>{
        e.preventDefault();
        try{
            const response = await api.post('/auth/login',{email,password});
            const token=response.data.access_token;
            localStorage.setItem('token',token);
            const decode=jwtDecode<JwtPayload>(token);
            
            if(decode.role === 'ADMIN'){
                navigate('/admin');
            } else if (decode.role === 'STUDENT'){
                navigate('/student');
            } else {navigate('/teacher');}
        }
        catch(err){
            setError('Wrong email or password.');
        }
    };
    return (
        <div style={{padding:'50px', maxWidth:'300px', margin:'0 auto'}}>
            <h2>Login</h2>
            {error && <p style={{color:'red'}}>{error}</p>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Email (ex: admin@school.com)" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <button type="submit">Login into account</button>
        </form>
        </div>
    );
}