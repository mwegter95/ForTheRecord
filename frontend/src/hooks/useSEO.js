import { useEffect } from "react";

/**
 * Custom hook for per-page SEO: title, description, canonical URL.
 * Updates document head dynamically without needing react-helmet.
 */
const useSEO = ({ title, description, canonical, noindex = false }) => {
  useEffect(() => {
    // Update page title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
    }

    // Update canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    // Update Open Graph tags
    const ogTags = {
      "og:title": title,
      "og:description": description,
      "og:url": canonical,
    };
    Object.entries(ogTags).forEach(([property, content]) => {
      if (!content) return;
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // Update robots meta if noindex
    if (noindex) {
      let robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", "noindex, nofollow");
    }
  }, [title, description, canonical, noindex]);
};

export default useSEO;
