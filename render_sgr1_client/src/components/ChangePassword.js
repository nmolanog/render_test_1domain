import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from 'primereact/card';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

const ChangePassword = ({ authStatus, setAuthStatus }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [secondAuth, setSecondAuth] = useState("not verified");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");

    const navigate = useNavigate();  // Hook for programmatic navigation

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            // Add oldPassword as a query parameter
            const response = await fetch(`/auth/verify_password/${authStatus.userid}?oldPassword=${encodeURIComponent(oldPassword)}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include" // Important for session-based authentication
                });

            // Check if the user is not authenticated (status 401)
            if (response.status === 401) {
                console.error("User not authenticated");
                return;  // You can handle it by redirecting the user to login or showing a message
            }

            const jsonData = await response.json();
            setSecondAuth(jsonData);  // Proceed with your logic after verification
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
    
        try {
            const requestBody = { newPassword };

            const response = await fetch(`/auth/editpassword/${authStatus.userid}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
                credentials: "include"  // Important for session-based authentication
            });
    
            // Check if the user is not authenticated (status 401)
            if (response.status === 401) {
                console.error("User not authenticated");
                return;  // Handle authentication issue (e.g., redirect to login)
            }
    
            // If the password update is successful (status 200 or response.ok)
            if (response.ok) {
                alert("Password updated successfully");  // Show success message
                navigate("/dashboardg");  // Redirect to the dashboardg route
            } else {
                console.error("Failed to update password");
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div >
            <h1>Change password</h1>
            <p>User id: {authStatus.userid}</p>
            <p>User: {authStatus.userName}</p>
            <p>User type: {authStatus.usertype}</p>
            <p>auth?: {authStatus.isAuthenticated ? ("yes") : ("no")}</p>

            {secondAuth === "verified" ? (
                <Card title="Enter new password" className="md:w-25rem mx-auto">
                    <form onSubmit={handleChangePassword} className="md:w-25rem ">
                    <p>Password</p>
                        <Password
                            id="changePassword1"
                            name= "changePassword1"
                            value={newPassword}
                            placeholder="Password"
                            onChange={(e) => setNewPassword(e.target.value)}
                            feedback={true}
                            required
                        />
                        
                        <p>Repeat Password</p>
                        <Password
                            id="changePassword2"
                            name = "changePassword2"
                            value={newPassword2}
                            placeholder="Repeat Password"
                            onChange={(e) => setNewPassword2(e.target.value)}
                            feedback={false}
                            required
                        />
                        
                        {newPassword === newPassword2 && newPassword !== "" && newPassword2 !== "" ? (
                            <>
                            <p>You can change your password now!</p>
                            <div className="flex justify-center mt-4">                               
                                <Button label="Change password" type="submit" />
                            </div>
                            </>
                            
                        ) : (
                            <div className="flex justify-center mt-4">
                                <Button label="Change password" type="submit" disabled />
                            </div>
                        )}


                    </form>
                </Card>
            ) : (<Card title="Enter your present password" className="md:w-25rem mx-auto">
                <form onSubmit={handleVerify} className="md:w-25rem ">
                <p>Password</p>
                    <Password
                        id="password"
                        name="password"
                        value={oldPassword}
                        placeholder="Password"
                        onChange={(e) => setOldPassword(e.target.value)}
                        feedback={false}
                        required
                    />
                    
                    <div className="flex justify-center mt-4">
                        <Button label="Verify" type="submit" />
                    </div>

                </form>
            </Card>)}





            <p>Second Auth: {secondAuth}</p>

            <Link to="/home">Back to Home</Link>
        </div>
    );
};

export default ChangePassword;
