import { useRef, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import axios from '../api/axios';
const LOGIN_URL = '/login';

const Login = () => {
    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
            const response = await fetch(LOGIN_URL, {
                 method: 'POST',
                 headers: {
                         'Accept': 'application/json',
                         'Content-Type': 'application/json'
                                                 },
                 body: JSON.stringify({ user, pwd })
                });
	    if(response.status < 400){
	            console.log(JSON.stringify(response?.body));
	            //console.log(JSON.stringify(response));
		    const data = await response.json();
	            const sessionId = data.session.sessionId;
		    console.log(data);
		    console.log(sessionId);
	            setAuth({ user, pwd, sessionId });
	            setUser('');
	            setPwd('');
	            navigate(from, { replace: true });
	    }else{
	            setErrMsg("Login failed");
	            errRef.current.focus();
	   }
       }

    return (

        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                />
                <button>Sign In</button>
            </form>
            <p>
                Need an Account?<br />
                <span className="line">
                    <Link to="/register">Sign Up</Link>
                </span>
            </p>
        </section>

    )
}

export default Login
