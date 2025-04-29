import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./Components/Auth/Login.tsx";
import "./App.css";
import Chat from "./Pages/Chat.tsx";

const App = () => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  console.log("user", user);

  return (
    <div>
      <Routes>
        <Route
          path="/"
          exact
          element={user ? <Chat user={user} /> : <Login setUser={setUser} />}
        />
        <Route path="/login" exact element={<Login setUser={setUser} />} />
        <Route path="/chat" exact element={<Chat user={user} />} />
      </Routes>
    </div>
  );
};

export default App;
