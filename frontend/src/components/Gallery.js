import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Gallery.scss";

// Import gallery images (WebP)
import weddingDanceFloor from "../images/wedding-dance-floor.webp";
import weddingDanceFloor2 from "../images/wedding-dance-floor2.webp";
import weddingDanceFloor3 from "../images/wedding-dance-floor3.webp";
import weddingDanceFloor4 from "../images/wedding-dance-floor4.webp";
import weddingCeremonyAudio from "../images/wedding-ceremony-audio.webp";
import weddingCeremonyAudio2 from "../images/wedding-ceremony-audio2.webp";
import wedding1 from "../images/wedding1.webp";
import wedding2 from "../images/wedding2.webp";
import wedding3 from "../images/wedding3.webp";
import weddingDanceBouquetToss from "../images/wedding_dance_bouqet_toss.webp";
import ashleyAndMe from "../images/Ashley_and_me.webp";
import djDecks from "../images/DJ_Decks.webp";
import djSetupDancefloor from "../images/dj-setup-dancefloor.webp";
import weddingDanceFloorGuys from "../images/wedding-dance-floor-guys.webp";
import weddingDanceFloorLaugh from "../images/wedding-dance-floor-laugh.webp";

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
      width: 800,
      height: 533,
    },
    {
      id: 2,
      image: weddingDanceFloor2,
      category: "Dance Floor",
      alt: "Wedding dance floor with energy and movement",
      width: 1200,
      height: 800,
    },
    {
      id: 3,
      image: weddingDanceFloor3,
      category: "Dance Floor",
      alt: "Wedding guests dancing",
      width: 1000,
      height: 666,
    },
    {
      id: 4,
      image: weddingDanceFloor4,
      category: "Dance Floor",
      alt: "Dance floor celebration",
      width: 800,
      height: 600,
    },
    {
      id: 5,
      image: weddingDanceBouquetToss,
      category: "Dance Floor",
      alt: "Wedding bouquet toss moment",
      width: 800,
      height: 499,
    },
    {
      id: 6,
      image: weddingCeremonyAudio,
      category: "Ceremony",
      alt: "Wedding ceremony setup",
      width: 800,
      height: 532,
    },
    {
      id: 7,
      image: weddingCeremonyAudio2,
      category: "Ceremony",
      alt: "Ceremony audio equipment",
      width: 800,
      height: 1000,
    },
    {
      id: 8,
      image: wedding1,
      category: "Ceremony",
      alt: "Wedding ceremony moment",
      width: 800,
      height: 533,
    },
    {
      id: 9,
      image: ashleyAndMe,
      category: "Couples",
      alt: "Couple portrait",
      width: 800,
      height: 600,
    },
    {
      id: 10,
      image: wedding2,
      category: "Couples",
      alt: "Newlyweds",
      width: 800,
      height: 532,
    },
    {
      id: 11,
      image: wedding3,
      category: "Couples",
      alt: "Wedding couple",
      width: 800,
      height: 533,
    },
    {
      id: 12,
      image: djDecks,
      category: "Dance Floor",
      alt: "DJ equipment and turntables",
      width: 800,
      height: 328,
    },
    {
      id: 13,
      image: djSetupDancefloor,
      category: "Dance Floor",
      alt: "DJ setup at dance floor",
      width: 800,
      height: 533,
    },
    {
      id: 14,
      image: weddingDanceFloorGuys,
      category: "Dance Floor",
      alt: "Grooms dancing at wedding reception",
      width: 800,
      height: 669,
    },
    {
      id: 15,
      image: weddingDanceFloorLaugh,
      category: "Dance Floor",
      alt: "Guests laughing and dancing at wedding",
      width: 800,
      height: 533,
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
                  loading="lazy"
                  width={item.width}
                  height={item.height}
                />
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
