import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import styles from './styles.module.css'

const Home = ({ authStatus, setAuthStatus }) => {

  const navigate = useNavigate();

  const homeModel = [
    {
      label: 'Students',
      icon: 'pi pi-fw pi-user',
      items: [
        {
          label: "Register",
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate("/inputstudents")
        },
        {
          label: "Search & Edit",
          icon: 'pi pi-fw pi-search',
          command: () => navigate("/sedstudent")
        }
      ]
    },
    {
      label: 'Programs',
      icon: 'pi pi-fw pi-book',
      items: [
        {
          label: "Register",
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate("/proginput")
        },
        {
          label: "Search & Edit",
          icon: 'pi pi-fw pi-search',
          command: () => navigate("/sedprogram")
        }
      ]
    },
    {
      label: 'Enrollments',
      icon: 'pi pi-fw pi-id-card',
      items: [
        {
          label: "Register",
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate("/inputenrollments")
        },
        {
          label: "Search & Edit",
          icon: 'pi pi-fw pi-search',
          command: () => navigate("/sedenrollment")
        }
      ]
    },
    {
      label: 'Change password',
      icon: 'pi pi-fw pi-key',
      command: () => navigate("/changepassword")
    }
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include", // Important for session-based logout
      });

      if (response.ok) {
        // Update authStatus after logout
        setAuthStatus({
          isAuthenticated: false,
          usertype: null,
          userName: null,
          userid: null
        });

        // Redirect to login after successful logout
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <div className={styles.Home}>
      <Menubar
        model={homeModel}
        start={<h2>SGR scheduler</h2>}
        end={<Button label="Logout" icon="pi pi-power-off" onClick={handleLogout} />}
        className={styles.Menubar}
      />
      {/*leave space for the header */}
      <div className={styles.EmptyDivHeader}>
      </div>

      <p>User id: {authStatus.userid}</p>
      <p>auth?: {authStatus.isAuthenticated ? ("yes") : ("no")}</p>
      <div className={styles.OutletContainer}>
        <Outlet />
      </div>

    </div>
  );
};

export default Home;