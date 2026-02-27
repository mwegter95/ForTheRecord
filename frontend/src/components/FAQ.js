import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FAQ.scss";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    window.lucide?.createIcons();
  }, []);

  const faqItems = [
    {
      question: "What areas do you serve?",
      answer:
        "We primarily serve the Twin Cities metro area and surrounding Minnesota regions. However, we also love traveling for destination weddings, so don't hesitate to reach out even if your wedding is further away. We've worked with couples planning events across the country and would be honored to discuss your specific location and travel logistics.",
    },
    {
      question: "How far in advance should I book my wedding DJ?",
      answer:
        "Ideally, booking 6-12 months in advance gives you the best availability and allows plenty of time to build the perfect playlist together. That said, popular dates—particularly Saturdays from June through October—tend to fill quickly, so it's worth reaching out as soon as your date is set. Even if you're planning closer to the wedding, we encourage you to contact us. We make every effort to accommodate wonderful couples, and you might just find an available date.",
    },
    {
      question: "What happens if there's a technical issue during my wedding?",
      answer:
        "Technical issues are rare because we prevent them through obsessive preparation. We arrive early to thoroughly test all equipment in your actual venue space, account for acoustics and layout, and have professional-grade backup equipment on hand. Our approach emphasizes technique over fancy gear—proper setup, cable management, and sound knowledge go a long way. Even with the best equipment, it's the operator's skill and preparation that keeps everything running flawlessly through every moment of your day.",
    },
    {
      question: "Can I choose my own music?",
      answer:
        "Absolutely. We love working with couples to build the perfect soundtrack for their day. We have expertise across many genres and styles—not just traditional wedding hits. During our planning meetings, we'll discuss your musical vision, learn what matters to you, and curate a playlist that reflects your personalities. We're also attentive readers of the room, adjusting the vibe throughout the evening to keep the energy just right. Your music, your way.",
    },
    {
      question: "What can be included in my custom package?",
      answer:
        "Every wedding is unique, so we work with you to create a custom package that fits your vision and budget. Options include ceremony audio, reception DJing (4-8+ hours), professional MCing, wireless microphones, custom playlist curation, dance floor lighting, uplighting, and more. We have a package for any budget—let's chat about your needs and build something perfect for your day.",
    },
    {
      question: "Do you also handle ceremony audio?",
      answer:
        "Yes—ceremony audio is actually one of our specialties. Crystal-clear ceremony audio is the foundation for every wedding experience. We ensure everyone in your venue hears your vows, readings, and special moments with perfect clarity. We use proper microphone technique, eliminate feedback, and test everything in your actual ceremony space beforehand. It's one of the most important parts of the day, and we treat it with the care and expertise it deserves.",
    },
    {
      question: "How do you handle the timeline and coordination?",
      answer:
        "We work closely with you and your other vendors to build a detailed timeline that flows perfectly from ceremony through the last dance. Professional MC work, smooth transitions between events, and expert coordination of all audio elements mean you can relax and actually enjoy your day instead of worrying about logistics. We handle the technical side so you can be fully present for every moment with your partner and loved ones.",
    },
    {
      question: "What makes For the Record different from other DJs?",
      answer:
        "We're obsessed with audio quality and believe that technique and knowledge matter far more than fancy gear. We bring a BA in Music and years of live event experience to every wedding. Most importantly, we see ourselves as genuine partners in your day, not just a vendor you hire. We care about your vision, your story, and making sure every detail—from ceremony clarity to dance floor energy—is absolutely perfect. That commitment to partnership and craft is what sets us apart.",
    },
    {
      question: "Do you offer lighting as well?",
      answer:
        "Yes. We offer dance floor lighting and ambient uplighting options to create the perfect atmosphere for your celebration. These add-ons enhance the energy and visual experience of your reception. We can discuss lighting options when we talk about your complete package and vision for your day.",
    },
    {
      question: "What's the next step to book?",
      answer: (
        <span>
          Easy—just reach out! Fill out the contact form on our{" "}
          <Link
            to="/get-in-touch"
            style={{
              color: "#C9A86A",
              fontWeight: "600",
              textDecoration: "underline",
            }}
          >
            Get In Touch
          </Link>{" "}
          page or give us a call. We'll have a friendly, no-pressure
          conversation about your day, check our availability, and discuss what
          kind of custom package makes sense for you. We pride ourselves on
          quick responses; you'll hear back from us within 24 hours. Let's start
          making your day unforgettable.
        </span>
      ),
    },
  ];

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="faq-hero">
        <div className="container">
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-description">
            Everything you need to know about booking your wedding DJ. Can't
            find your answer? Reach out and let's chat.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faq-content-section">
        <div className="container">
          <div className="faq-container">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? "open" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleItem(index)}
                  aria-expanded={openIndex === index}
                >
                  <span>{item.question}</span>
                  <i
                    data-lucide="chevron-down"
                    className="faq-icon"
                    style={{
                      transition: "transform 0.3s ease",
                      transform:
                        openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  ></i>
                </button>
                <div
                  className="faq-answer"
                  style={{
                    maxHeight: openIndex === index ? "500px" : "0",
                    opacity: openIndex === index ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease, opacity 0.3s ease",
                  }}
                >
                  <div className="faq-answer-content">{item.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="faq-cta-section">
        <div className="container">
          <div className="faq-cta-content">
            <h2>Still have questions?</h2>
            <p>We'd love to hear from you. Let's talk about your day.</p>
            <div className="faq-cta-links">
              <Link to="/get-in-touch" className="btn-primary">
                Get In Touch
              </Link>
              <a href="tel:(612)389-7005" className="btn-secondary">
                <i data-lucide="phone" className="icon"></i>
                Call Us
              </a>
            </div>
            <p className="faq-cta-phone">
              <i data-lucide="phone" className="icon-small"></i>
              (612) 389-7005
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
