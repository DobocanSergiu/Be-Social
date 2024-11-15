import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import SettingsPage from "./SettingsPage/SettingsPage";
import ConnectionsPage from "./ConnectionsPage/ConnectionPage";
import ProfilePage from "./ProfilePage/ProfilePage";
import DetailedPostPage from "./DetailedPostPage/DetailedPostPage";
import LoginPage from "./LoginPage/LoginPage";
import RegisterPage from "./RegisterPage/RegisterPage";
import './index.css'
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path={`/profile/:IdName`} element={<ProfilePage />} />
        <Route path="/post/:PostId" element={<DetailedPostPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// Measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();