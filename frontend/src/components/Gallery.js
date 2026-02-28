import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Gallery.scss";

// Import gallery images
import weddingDanceFloor from "../images/wedding-dance-floor.jpg";
import weddingDanceFloor2 from "../images/wedding-dance-floor2.png";
import weddingDanceFloor3 from "../images/wedding-dance-floor3.png";
import weddingDanceFloor4 from "../images/wedding-dance-floor4.jpg";
import weddingCeremonyAudio from "../images/wedding-ceremony-audio.jpg";
import weddingCeremonyAudio2 from "../images/wedding-ceremony-audio2.jpg";
import wedding1 from "../images/wedding1.jpg";
import wedding2 from "../images/wedding2.jpg";
import wedding3 from "../images/wedding3.jpg";
import weddingDanceBouquetToss from "../images/wedding_dance_bouqet_toss.jpg";
import ashleyAndMe from "../images/Ashley_and_me.jpeg";
import djDecks from "../images/DJ_Decks.jpeg";
import djSetupDancefloor from "../images/dj-setup-dancefloor.png";
import weddingDanceFloorGuys from "../images/wedding-dance-floor-guys.png";
import weddingDanceFloorLaugh from "../images/wedding-dance-floor-laugh.png";

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    window.lucide?.createIcons();
  }, []);

  // Re-initialize icons when lightbox opens or filter changes
  useEffect(() => {
    setTimeout(() => window.lucide?.createIcons(), 50);
  }, [expandedId, activeFilter]);

  // Close expanded photo on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setExpandedId(null);
    };
    if (expandedId) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [expandedId]);

  // Gallery items organized by category
  const galleryItems = [
    {
      id: 1,
      image: weddingDanceFloor,
      category: "Dance Floor",
      alt: "Couple dancing on wedding dance floor",
    },
    {
      id: 2,
      image: weddingDanceFloor2,
      category: "Dance Floor",
      alt: "Wedding dance floor with energy and movement",
    },
    {
      id: 3,
      image: weddingDanceFloor3,
      category: "Dance Floor",
      alt: "Wedding guests dancing",
    },
    {
      id: 4,
      image: weddingDanceFloor4,
      category: "Dance Floor",
      alt: "Dance floor celebration",
    },
    {
      id: 5,
      image: weddingDanceBouquetToss,
      category: "Dance Floor",
      alt: "Wedding bouquet toss moment",
    },
    {
      id: 6,
      image: weddingCeremonyAudio,
      category: "Ceremony",
      alt: "Wedding ceremony setup",
    },
    {
      id: 7,
      image: weddingCeremonyAudio2,
      category: "Ceremony",
      alt: "Ceremony audio equipment",
    },
    {
      id: 8,
      image: wedding1,
      category: "Ceremony",
      alt: "Wedding ceremony moment",
    },
    { id: 9, image: ashleyAndMe, category: "Couples", alt: "Couple portrait" },
    { id: 10, image: wedding2, category: "Couples", alt: "Newlyweds" },
    { id: 11, image: wedding3, category: "Couples", alt: "Wedding couple" },
    {
      id: 12,
      image: djDecks,
      category: "Dance Floor",
      alt: "DJ equipment and turntables",
    },
    {
      id: 13,
      image: djSetupDancefloor,
      category: "Dance Floor",
      alt: "DJ setup at dance floor",
    },
    {
      id: 14,
      image: weddingDanceFloorGuys,
      category: "Dance Floor",
      alt: "Grooms dancing at wedding reception",
    },
    {
      id: 15,
      image: weddingDanceFloorLaugh,
      category: "Dance Floor",
      alt: "Guests laughing and dancing at wedding",
    },
  ];

  // Filter items based on active filter
  const filteredItems =
    activeFilter === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="container">
          <h1 className="section-title">Real Minnesota Weddings</h1>
          <p className="section-description">
            Every wedding tells a unique story. From intimate ceremonies to
            dance floor celebrations, here's a glimpse into the moments we've
            helped create.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="gallery-filters-section">
        <div className="container">
          <div className="filter-tabs">
            {["All", "Dance Floor", "Ceremony", "Couples"].map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="gallery-grid-section">
        <div className="container">
          <div className="gallery-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`gallery-item ${item.id === 7 ? "shift-down" : ""} ${item.id === 12 ? "zoom-in" : ""}`}
                onClick={() => setExpandedId(item.id)}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="gallery-image"
                />
                <div className="gallery-overlay">
                  <span className="expand-icon">
                    <i data-lucide="maximize-2"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Overlay */}
      {expandedId && (
        <div className="lightbox-overlay" onClick={() => setExpandedId(null)}>
          <button
            className="lightbox-close"
            onClick={() => setExpandedId(null)}
          >
            <i data-lucide="x"></i>
          </button>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryItems.find((item) => item.id === expandedId)?.image}
              alt={galleryItems.find((item) => item.id === expandedId)?.alt}
              className="lightbox-image"
            />
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="gallery-cta-section">
        <div className="container">
          <div className="gallery-cta-content">
            <h2>Love what you see?</h2>
            <p>Let's create unforgettable moments for your big day.</p>
            <Link to="/get-in-touch" className="btn-primary">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
