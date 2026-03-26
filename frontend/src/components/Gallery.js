import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import "./Gallery.scss";

// Import gallery images (WebP)
import weddingDanceFloor2 from "../images/wedding-dance-floor2.webp";
import weddingDanceFloor3 from "../images/wedding-dance-floor3.webp";
import weddingDanceFloor4 from "../images/wedding-dance-floor4.webp";
import weddingCeremonyAudio2 from "../images/wedding-ceremony-audio2.webp";
import wedding1 from "../images/wedding1.webp";
import wedding3 from "../images/wedding3.webp";
import ashleyAndMe from "../images/Ashley_and_me.webp";
import djDecks from "../images/DJ_Decks.webp";
import djSetupDancefloor from "../images/dj-setup-dancefloor.webp";
import weddingDanceFloorGuys from "../images/wedding-dance-floor-guys.webp";
import weddingDanceFloorLaugh from "../images/wedding-dance-floor-laugh.webp";
// New dance floor photos
import danceFloorChairLift from "../images/wedding-dance-floor-chair-lift.webp";
import danceFloorHandsUpWave from "../images/wedding-dance-floor-hands-up-wave.webp";
import danceFloorHandsUp from "../images/wedding-dance-floor-hands-up.webp";
import danceFloorCrowd from "../images/wedding-dance-floor-crowd.webp";
import danceFloorBrideGroom from "../images/wedding-dance-floor-bride-and-groom.webp";

const Gallery = () => {
  useSEO({
    title: "Wedding Gallery | For the Record MN DJ",
    description:
      "Real MN weddings by For the Record. Dance floor energy, ceremony setups & celebrations across Minneapolis, St. Paul & the Twin Cities.",
    canonical: "https://fortherecordmn.com/gallery",
  });

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
      image: danceFloorChairLift,
      category: "Couples",
      alt: "Wedding chair lift celebration on the dance floor",
      width: 1600,
      height: 1067,
    },
    {
      id: 2,
      image: danceFloorHandsUp,
      category: "Dance Floor",
      alt: "Wedding guests with hands up on the dance floor",
      width: 1600,
      height: 1067,
    },
    {
      id: 3,
      image: weddingDanceFloor2,
      category: "Dance Floor",
      alt: "Wedding dance floor with energy and movement",
      width: 600,
      height: 400,
    },
    {
      id: 4,
      image: danceFloorCrowd,
      category: "Dance Floor",
      alt: "Packed wedding dance floor crowd",
      width: 1600,
      height: 1067,
    },
    {
      id: 5,
      image: danceFloorHandsUpWave,
      category: "Dance Floor",
      alt: "Wedding guests waving hands up on the dance floor",
      width: 1600,
      height: 1067,
    },
    {
      id: 6,
      image: weddingDanceFloor3,
      category: "Dance Floor",
      alt: "Wedding guests dancing",
      width: 600,
      height: 400,
    },
    {
      id: 7,
      image: weddingDanceFloor4,
      category: "Dance Floor",
      alt: "Dance floor celebration",
      width: 800,
      height: 600,
    },
    {
      id: 8,
      image: djDecks,
      category: "Dance Floor",
      alt: "DJ equipment and turntables",
      width: 800,
      height: 328,
    },
    {
      id: 9,
      image: djSetupDancefloor,
      category: "Dance Floor",
      alt: "DJ setup at dance floor",
      width: 800,
      height: 533,
    },
    {
      id: 10,
      image: weddingDanceFloorGuys,
      category: "Dance Floor",
      alt: "Grooms dancing at wedding reception",
      width: 800,
      height: 669,
    },
    {
      id: 11,
      image: weddingDanceFloorLaugh,
      category: "Dance Floor",
      alt: "Guests laughing and dancing at wedding",
      width: 800,
      height: 533,
    },
    {
      id: 12,
      image: weddingCeremonyAudio2,
      category: ["Couples", "Ceremony"],
      alt: "Ceremony audio equipment setup",
      width: 800,
      height: 1000,
    },
    {
      id: 13,
      image: wedding1,
      category: "Ceremony",
      alt: "Wedding ceremony moment",
      width: 600,
      height: 533,
    },
    {
      id: 14,
      image: danceFloorBrideGroom,
      category: "Couples",
      alt: "Bride and groom on the dance floor",
      width: 1600,
      height: 1067,
    },
    {
      id: 15,
      image: ashleyAndMe,
      category: "Couples",
      alt: "Couple portrait",
      width: 800,
      height: 600,
    },
    {
      id: 16,
      image: wedding3,
      category: "Wedding",
      alt: "Wedding couple",
      width: 800,
      height: 533,
    },
  ];

  // Filter items based on active filter
  const filteredItems =
    activeFilter === "All"
      ? galleryItems
      : galleryItems.filter((item) =>
          Array.isArray(item.category)
            ? item.category.includes(activeFilter)
            : item.category === activeFilter
        );

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="container">
          <h1 className="section-title">Real Weddings Across the Twin Cities & MN</h1>
          <p className="section-description">
            Every wedding tells a unique story. From intimate Minneapolis
            ceremonies to packed dance floors in St. Paul, here's a glimpse
            into the moments we've helped create across Minnesota.
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
                className={`gallery-item ${item.id === 12 ? "shift-down" : ""} ${item.id === 8 ? "zoom-in" : ""}`}
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

      {/* About Our Work */}
      <section className="gallery-about-section">
        <div className="container">
          <div className="gallery-about-content">
            <h2>Wedding DJ Moments Across Minnesota</h2>
            <p>
              Every photo here represents a real couple and a real celebration.
              From intimate lakeside ceremonies near St. Cloud to packed dance
              floors at Minneapolis venue halls, we've had the privilege of
              providing expert audio and high-energy entertainment for weddings
              across the Twin Cities and beyond. Our approach is simple: arrive
              early, test everything in your actual space, and deliver flawless
              sound from your first dance to the last song of the night. Whether
              it's a 50-person gathering in a St. Paul garden or a 300-guest
              reception in a Duluth ballroom, we bring the same obsessive
              attention to audio quality and the same commitment to reading the
              room and keeping your guests on the dance floor.
            </p>
          </div>
        </div>
      </section>

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
