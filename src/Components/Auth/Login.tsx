import React, { useEffect, useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  // useEffect(() => {
  //   if (localStorage.getItem("token")) {
  //     navigate("/expenseForm");
  //   }
  //   // eslint-disable-next-line
  // }, []);

  const toggleForm = () => {
    setIsSignup((prev) => !prev);
    setUsername("");
    setEmail("");
    setPassword("");
    setShowForgotPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = isSignup ? { username, email, password } : { email, password };

    console.log(isSignup ? "Signing up data:" : "Logging in data:", data);

    try {
      const endpoint = isSignup
        ? `http://localhost:5000/user_api/register`
        : `http://localhost:5000/user_api/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok) {
        localStorage.setItem("token", resData.token);
        localStorage.setItem("user", JSON.stringify(resData.user));
        console.log(resData.user);
        // window.location.reload();
        navigate("/chat");
      } else {
        throw new Error(resData.message || "Something went wrong");
      }

      console.log("Success:", resData);
    } catch (error: any) {
      console.error("Error during auth:", error.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/user_api/password/forgotpassword`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      alert("Password reset link sent to your email.");
      setForgotEmail("");
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error("Forgot password error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        {!showForgotPassword ? (
          <>
            <h2>{isSignup ? "Sign Up" : "Login"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              {isSignup && (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.input}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button type="submit" className={styles.button}>
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </form>
            {!isSignup && (
              <p className={styles.forgotPassword}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </p>
            )}
            <p className={styles.toggleText}>
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <span className={styles.toggleLink} onClick={toggleForm}>
                {isSignup ? " Login" : " Sign Up"}
              </span>
            </p>
          </>
        ) : (
          <>
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPassword} className={styles.form}>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className={styles.input}
                required
              />
              <button type="submit" className={styles.button}>
                Send Reset Link
              </button>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
