import React from "react";
import "../App.css";

function Navbar({ setPage, page }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">A</div>
        <span className="navbar-title">AI MCQ Generator</span>
      </div> 

      <div className="nav-links">
        <button
          className={page === "home" ? "active" : ""}
          onClick={() => setPage("home")}
        >
          Home
        </button>
        <button
          className={page === "upload" ? "active" : ""}
          onClick={() => setPage("upload")}
        >
          Upload
        </button>
        <button
          className={page === "mcq" ? "active" : ""}
          onClick={() => setPage("mcq")}
        >
          MCQs
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
