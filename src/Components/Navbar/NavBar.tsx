import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<string | null>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(token);
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(null);
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <h2 className={styles.logo}>💰 Expense</h2>
      </div>
      <div className={styles.navbarCenter}>
        <Link to="/expenseForm" className={styles.navLink}>
          Expense Form
        </Link>
        <Link to="/expenses" className={styles.navLink}>
          Expense List
        </Link>
        <Link to="/showLeaderBoard" className={styles.navLink}>
          Show LeaderBoard
        </Link>
      </div>
      <div className={styles.navbarRight}>
        {isLoggedIn !== null ? (
          <button onClick={handleLogout} className={styles.authButton}>
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className={styles.authButton}
          >
            Login
          </button>
        )}
        
      </div>
    </nav>
  );
}

export default Navbar;
