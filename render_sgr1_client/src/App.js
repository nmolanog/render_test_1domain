import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Home from "./components/Home";
//import Register from './components/auth/Register';
import InputStudents from "./components/student/inputstudents";
import SedStudent from './components/student/sedStudent';
import ProgInput from './components/program/progInput';
import SedProgram from './components/program/sedProgram';
import InputEnrollments from './components/enrollment/inputEnrollment';
import SedEnrollment from './components/enrollment/sedEnrollment';
import Commit from './components/commit/Commit'
import Appointments from './components/appointments/appointments'
import ChangePassword from "./components/ChangePassword";
import styles from "./components/styles.module.css";
import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css';
//comment

function App() {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    usertype: null,
    userName: null,
    userid: null
  });

  useEffect(() => {
    // Fetch authentication status from the server
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/auth/status", {
          credentials: "include",  // Important for session handling
        });
        const data = await response.json();
        setAuthStatus({
          isAuthenticated: data.isAuthenticated,
          usertype: data.usertype,
          userName: data.username,
          userid: data.userid
        });
      } catch (err) {
        console.error(err);
      }
    };

    checkAuthStatus();
  }, []);

  const noAuthRoutes =
    <>
      <Route path="/login" element={<Login authStatus={authStatus} setAuthStatus={setAuthStatus} />} />
      {/*<Route path="/register" element={<Register />} />*/}
      <Route path="*" element={<Navigate to={"/login"} />} />
    </>;

  const authRoutes =
    <>
      <Route path="/" element={<Home authStatus={authStatus} setAuthStatus={setAuthStatus} />} >
        <Route path="/changepassword" element={<ChangePassword authStatus={authStatus} setAuthStatus={setAuthStatus} />} />
        <Route path="/inputstudents" element={<InputStudents />} />
        <Route path="/sedstudent" element={<SedStudent />} />
        <Route path="/proginput" element={<ProgInput />} />
        <Route path="/sedprogram" element={<SedProgram />} />
        <Route path="/inputenrollments" element={<InputEnrollments />} />
        <Route path="/sedenrollment" element={<SedEnrollment />} />
        <Route path="/commit/:enroll_id" element={<Commit />} />
        <Route path="/appointments/:commit_id" element={<Appointments />} />
      </Route>
      <Route path="*" element={<Navigate to={"/"} />} />
    </>;

  let myroutes;
  if (!authStatus.isAuthenticated) {
    myroutes = noAuthRoutes;
  } else {
    myroutes = authRoutes;
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      myroutes
    )
  );

  return (
    <div className={styles.App}>
      <RouterProvider router={router} />
    </div>
  );

}

export default App;
