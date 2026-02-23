import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoSvg from "../images/for-the-record-logo.svg";
import "./Navbar.scss";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize Lucide icons after component mounts
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo and Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img
            src={LogoSvg}
            alt="For the Record Logo"
            className="navbar-logo"
          />
          <span className="brand-text">For the Record</span>
        </Link>

        {/* Hamburger Menu Toggle */}
        <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-menu ${isOpen ? "open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
            onClick={closeMenu}
          >
            About
          </Link>
          <Link
            to="/services"
            className={`nav-link ${isActive("/services") ? "active" : ""}`}
            onClick={closeMenu}
          >
            Services
          </Link>
          <Link
            to="/gallery"
            className={`nav-link ${isActive("/gallery") ? "active" : ""}`}
            onClick={closeMenu}
          >
            Gallery
          </Link>
          <Link
            to="/faq"
            className={`nav-link ${isActive("/faq") ? "active" : ""}`}
            onClick={closeMenu}
          >
            FAQ
          </Link>
          <Link
            to="/get-in-touch"
            className={`btn-primary nav-cta ${isActive("/get-in-touch") ? "active" : ""}`}
            onClick={closeMenu}
          >
            Let's Chat
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
