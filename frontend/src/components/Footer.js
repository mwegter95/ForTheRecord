import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import LogoSvg from "../images/for-the-record-logo.svg";
import "./Footer.scss";

const Footer = () => {
  // Initialize Lucide icons after component mounts
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <img
            src={LogoSvg}
            alt="For the Record Logo"
            className="footer-logo"
          />
          <h3 className="footer-title">For the Record</h3>
          <p className="footer-tagline">
            Minnesota's Audio-Obsessed Wedding DJ
          </p>
        </div>

        {/* Links Section */}
        <nav className="footer-nav">
          <Link to="/about" className="footer-link">
            About
          </Link>
          <Link to="/services" className="footer-link">
            Services
          </Link>
          <Link to="/gallery" className="footer-link">
            Gallery
          </Link>
          <Link to="/faq" className="footer-link">
            FAQ
          </Link>
          <Link to="/get-in-touch" className="footer-link">
            Get In Touch
          </Link>
        </nav>

        {/* Contact Section */}
        <div className="footer-contact">
          <a href="tel:(612)389-7005" className="footer-contact-link">
            <i data-lucide="phone"></i>
            <span>(612) 389-7005</span>
          </a>
          <a
            href="mailto:michael@fortherecordmn.com"
            className="footer-contact-link"
          >
            <i data-lucide="mail"></i>
            <span>michael@fortherecordmn.com</span>
          </a>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-copyright">
        <p>&copy; {currentYear} For the Record. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
