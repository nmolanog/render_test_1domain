import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    usertype: null,  // Default value for usertype
  });
  const [error, setError] = useState("");

  const userTypes = [
    { label: 'Admin', value: 'admin' },
    { label: 'Guest', value: 'guest' }
  ];

  const navigate = useNavigate();

  // Handle input change for form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Dropdown change separately since the structure of the event is different
  const handleDropdownChange = (e) => {
    setFormData({
      ...formData,
      usertype: e.value, // PrimeReact Dropdown passes the selected value in e.value
    });
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login after successful registration
        console.log("User registered successfully");
        navigate("/login");
      } else {
        // Handle error from server response
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during registration. Please try again.");
    }
  };

  return (
    <Card title="Register" className="md:w-25rem mx-auto">
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister} className="md:w-25rem">
        <div>
          <p>Name</p>
          <InputText
            value={formData.name}
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            autoComplete="name"
          />
          <p>Email</p>
          <InputText
            value={formData.email}
            type="email"
            keyfilter="email"
            placeholder="Email"
            name="email"  // Add name attribute for consistency
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <p>Password</p>
          <Password
            value={formData.password}
            placeholder="Password"
            name="password"  // Add name attribute for consistency
            onChange={handleChange}
            required
          />
          <p>User type</p>
          <Dropdown
            id="usertype"
            name="usertype"
            value={formData.usertype}
            options={userTypes}
            onChange={handleDropdownChange}  // Handle Dropdown separately
            placeholder="Select a user type"
            className="w-full md:w-14rem"
          />

        </div>
        <div className="flex justify-center mt-4">
          <Button label="Register" type="submit" />
        </div>

      </form>
      <h3>Already have an account?</h3>
      <Link to="/login" className="p-button font-bold">Login</Link>
      {/* 
      <h2>name?: {formData.name}</h2>
      <h2>email?: {formData.email}</h2>
      <h2>password?: {formData.password}</h2>
      <h2>user type?: {formData.usertype}</h2>
      */}
    </Card>
  );
};

export default Register;
