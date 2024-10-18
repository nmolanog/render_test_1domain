import React, { useState } from "react";
//import { useNavigate, Link } from "react-router-dom";
import { useNavigate} from "react-router-dom";
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import styles from "../styles.module.css";


const Login = ({ authStatus, setAuthStatus }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Important for session-based authentication
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Refetch authentication status after login
                const authResponse = await fetch(`${process.env.REACT_APP_API_URL}/auth/status`, {
                    credentials: "include",  // Important for session handling
                });
                const authData = await authResponse.json();

                // Update authStatus state in App.js
                setAuthStatus({
                    isAuthenticated: authData.isAuthenticated,
                    usertype: authData.usertype,
                    userName: authData.username,
                    userid: authData.userid
                });

                // Navigate to dashboard1 on successful login
                navigate("/dashboardg");
            } else {
                // Handle error from server response
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("An error occurred during login. Please try again.");
        }
    };

    return (

        <Card title="Login" className={styles.FormContainer}>

            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleLogin} className="md:w-25rem ">

                <div >
                    <div >
                    <label htmlFor="email" className={styles.FormLabel}>Email</label>
                        <InputText
                            id="email"
                            name="email"
                            value={email}
                            keyfilter="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className={styles.FormField}
                        />
                        

                    </div>

                    <div >
                    <label htmlFor="password" className={styles.FormLabel}>Password</label>
                        <Password
                            inputId="password"
                            name="password"
                            value={password}
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            feedback={false}
                            required
                            className={styles.FormField}
                        />
                        

                    </div>
                </div>
                <div className={styles.FormButtonContainer}>
                    <Button label="Login" type="submit" />
                </div>

            </form>
            {/*<h3>Not registered?</h3>
      <Link to={"/register"} className="p-button font-bold">
        Register
      </Link>*/}
      {/*
            <p>User id: {authStatus.userid}</p>
            <p>User: {authStatus.userName}</p>
            <p>User type: {authStatus.usertype}</p>
            <p>auth?: {authStatus.isAuthenticated ? ("yes") : ("no")}</p>
      */}
      
        </Card>

    );
};

export default Login;
