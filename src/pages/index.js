/* eslint-disable import/no-unresolved */
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import ThemedImage from "@theme/ThemedImage";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeProviderFeature, setActiveProviderFeature] = useState(0);
  const [activeAnywhereFeature, setActiveAnywhereFeature] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [providerScrollProgress, setProviderScrollProgress] = useState(0);
  const [anywhereScrollProgress, setAnywhereScrollProgress] = useState(0);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);

  useEffect(() => {
    const innersourceText = document.getElementsByClassName("typing-open-source")[0];
    const essentialCards = document.querySelectorAll(".essentials-card");

    const onScroll = () => {
      if (innersourceText && isInViewport(innersourceText)) {
        innersourceText.classList.add("animate");
      }

      essentialCards.forEach((card) => {
        if (isInViewport(card)) {
          card.classList.add("visible");
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle scroll-based feature switching based on main page scroll
  useEffect(() => {
    const handleMainScroll = () => {
      const section = section1Ref.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const sectionBottom = rect.bottom;
      const sectionTop = rect.top;

      // Start when bottom is visible and end when content is still visible
      // We need a range where the visual content (images) is fully in view

      // Start: section top at 40% viewport (content becoming centered)
      // End: section top at -20% viewport (top exiting but bottom still visible)
      const startThreshold = windowHeight * 0.4;
      const endThreshold = -windowHeight * 0.2;

      // Only track when section is in the active range
      if (sectionTop > startThreshold || sectionTop < endThreshold) {
        return;
      }

      // Calculate progress through the visible range
      const scrollRange = startThreshold - endThreshold;
      const scrollProgress = startThreshold - sectionTop;
      const progress = Math.max(0, Math.min(1, scrollProgress / scrollRange));

      // Update scroll progress for visual indicator
      setScrollProgress(progress);

      // Feature 1: 30%, Feature 2: 30%, Feature 3: 40%
      if (progress < 0.30) {
        setActiveFeature(0);
      } else if (progress < 0.60) {
        setActiveFeature(1);
      } else {
        setActiveFeature(2);
      }
    };

    window.addEventListener('scroll', handleMainScroll, { passive: true });
    handleMainScroll();
    return () => window.removeEventListener('scroll', handleMainScroll);
  }, []);

  // Handle scroll-based feature switching for providers section
  useEffect(() => {
    const handleProviderScroll = () => {
      const section = section2Ref.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const sectionTop = rect.top;

      // Start: section top at 40% viewport (content becoming centered)
      // End: section top at -20% viewport (top exiting but bottom still visible)
      const startThreshold = windowHeight * 0.4;
      const endThreshold = -windowHeight * 0.2;

      if (sectionTop > startThreshold || sectionTop < endThreshold) {
        return;
      }

      const scrollRange = startThreshold - endThreshold;
      const scrollProgress = startThreshold - sectionTop;
      const progress = Math.max(0, Math.min(1, scrollProgress / scrollRange));

      // Update scroll progress for visual indicator
      setProviderScrollProgress(progress);

      // Feature 1: 30%, Feature 2: 30%, Feature 3: 40%
      if (progress < 0.30) {
        setActiveProviderFeature(0);
      } else if (progress < 0.60) {
        setActiveProviderFeature(1);
      } else {
        setActiveProviderFeature(2);
      }
    };

    window.addEventListener('scroll', handleProviderScroll, { passive: true });
    handleProviderScroll();
    return () => window.removeEventListener('scroll', handleProviderScroll);
  }, []);

  // Handle scroll-based feature switching for anywhere section
  useEffect(() => {
    const handleAnywhereScroll = () => {
      const section = section3Ref.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const sectionTop = rect.top;

      // Start: section top at 40% viewport (content becoming centered)
      // End: section top at -20% viewport (top exiting but bottom still visible)
      const startThreshold = windowHeight * 0.4;
      const endThreshold = -windowHeight * 0.2;

      if (sectionTop > startThreshold || sectionTop < endThreshold) {
        return;
      }

      const scrollRange = startThreshold - endThreshold;
      const scrollProgress = startThreshold - sectionTop;
      const progress = Math.max(0, Math.min(1, scrollProgress / scrollRange));

      // Update scroll progress for visual indicator
      setAnywhereScrollProgress(progress);

      // Feature 1: 30%, Feature 2: 30%, Feature 3: 40%
      if (progress < 0.30) {
        setActiveAnywhereFeature(0);
      } else if (progress < 0.60) {
        setActiveAnywhereFeature(1);
      } else {
        setActiveAnywhereFeature(2);
      }
    };

    window.addEventListener('scroll', handleAnywhereScroll, { passive: true });
    handleAnywhereScroll();
    return () => window.removeEventListener('scroll', handleAnywhereScroll);
  }, []);

  // Handle button clicks
  const handleFeatureClick = (featureIndex) => {
    setActiveFeature(featureIndex);
  };

  // Handle provider button clicks
  const handleProviderFeatureClick = (featureIndex) => {
    setActiveProviderFeature(featureIndex);
  };

  // Handle anywhere button clicks
  const handleAnywhereFeatureClick = (featureIndex) => {
    setActiveAnywhereFeature(featureIndex);
  };

  useEffect(() => {
    const navbar = document.querySelector(".navbar");
    const axolotl = document.querySelector(".image-src");
    const controlPlanes = document.querySelectorAll(".flying-cp");
    const clouds = document.querySelectorAll(".cp-cloud-projection");

    // Trigger animation immediately
    axolotl?.classList.add("scrolled");
    controlPlanes.forEach((cp) => cp.classList.add("visible"));
    clouds.forEach((cloud) => cloud.classList.add("visible"));

    const handleScroll = () => {
      if (window.scrollY < 10) {
        navbar?.classList.add("navbar--transparent");
      } else {
        navbar?.classList.remove("navbar--transparent");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function FeatureCard({ children }) {
    const cardRef = useRef(null);
    const glowRef = useRef(null);

    const handleMouseMove = (e) => {
      if (!cardRef.current || !glowRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      glowRef.current.style.left = `${e.clientX - rect.left}px`;
      glowRef.current.style.top = `${e.clientY - rect.top}px`;
    };

    return (
      <div className="lp-feature-card" ref={cardRef} onMouseMove={handleMouseMove}>
        <div className="mouse-glow" ref={glowRef} />
        {children}
      </div>
    );
  }

  return (
    <Layout title={`${siteConfig.title}`} description="Documentation for open control plane">
      <div className="lp-home">
        <div className="flex-container">
          <div className="main">
            <h1 className="heading">
              <span className="name clip">open control plane docs</span>
              <span className="text">Give your teams the power to run robust, compliant clouds. Public, private, or Sovereign.</span>
            </h1>
            <div className="container" style={{ padding: "0" }}>
              <div className="actions">
                <div className="action medium alt">
                  <a href="/docs/users/getting-started">Get Started</a>
                </div>
                <div className="action medium alt">
                  <a href="/docs/operators/getting-started">Run Your Platform</a>
                </div>
                <div className="action medium alt">
                  <a href="/docs/developers/getting-started">Build Together</a>
                </div>
              </div>
            </div>
          </div>
          <div className="image">
            <div className="image-container">
              <div className="image-bg"></div>
              <img
                className="image-src"
                src={require("/img/co_axolotl.png").default}
                alt="Crossplane Axolotl"
                style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 1 }}
              />
              <img
                className="flying-cp flying-cp-1"
                src={require("/img/cp1.png").default}
                alt="Control Plane"
              />
              {/* Cloud 1 - Purple/Blue */}
              <svg className="cp-cloud-projection cp-cloud-1" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cloudGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(123, 97, 255, 0.12)', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: 'rgba(147, 51, 234, 0.15)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(168, 85, 247, 0.1)', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="glow1">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Badge: EU-gov - top left */}
                <g className="cloud-badge">
                  <rect x="20" y="5" width="24" height="6" rx="3" fill="rgba(147, 51, 234, 0.3)" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="0.5" />
                  <text x="32" y="9" fontSize="3.5" fill="#000000" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">EU-gov</text>
                </g>
                <line className="cloud-connection" x1="60" y1="75" x2="60" y2="20" stroke="rgba(147, 51, 234, 0.25)" strokeWidth="1" strokeDasharray="3,3" />
                <g className="cloud-shape" filter="url(#glow1)">
                  <path className="cloud-hex-1" d="M 60 10 L 75 17.5 L 75 32.5 L 60 40 L 45 32.5 L 45 17.5 Z"
                        fill="url(#cloudGradient1)" stroke="rgba(147, 51, 234, 0.4)" strokeWidth="1.5" />
                  {/* Sonar sweep line */}
                  <g className="sonar-sweep" transform-origin="60 25">
                    <circle cx="60" cy="23" r="0.8" fill="rgba(168, 85, 247, 0.7)" />
                    <circle cx="60" cy="21" r="0.7" fill="rgba(168, 85, 247, 0.5)" />
                    <circle cx="60" cy="19" r="0.6" fill="rgba(168, 85, 247, 0.4)" />
                    <circle cx="60" cy="17" r="0.5" fill="rgba(168, 85, 247, 0.3)" />
                    <circle cx="60" cy="15" r="0.4" fill="rgba(168, 85, 247, 0.2)" />
                  </g>
                  {/* User icon - top left */}
                  <g className="cloud-resource-icon icon-user" transform="translate(54, 20) scale(0.264)">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                          stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Database icon - top right */}
                  <g className="cloud-resource-icon icon-database" transform="translate(66, 20) scale(0.264)">
                    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="rgba(147, 51, 234, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"
                          stroke="rgba(147, 51, 234, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Key icon - left */}
                  <g className="cloud-resource-icon icon-key" transform="translate(51, 25) scale(0.264)">
                    <circle cx="7.5" cy="15.5" r="5.5" stroke="rgba(123, 97, 255, 0.6)" strokeWidth="2" fill="none" />
                    <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"
                          stroke="rgba(123, 97, 255, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Server icon - right */}
                  <g className="cloud-resource-icon icon-server" transform="translate(69, 25) scale(0.264)">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M6 6h.01M6 18h.01" stroke="rgba(123, 97, 255, 0.6)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Network icon - bottom center */}
                  <g className="cloud-resource-icon icon-network" transform="translate(60, 30) scale(0.264)">
                    <rect x="9" y="2" width="6" height="6" rx="1" stroke="rgba(147, 51, 234, 0.6)" strokeWidth="2" fill="none" />
                    <rect x="3" y="16" width="6" height="6" rx="1" stroke="rgba(147, 51, 234, 0.6)" strokeWidth="2" fill="none" />
                    <rect x="15" y="16" width="6" height="6" rx="1" stroke="rgba(147, 51, 234, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M12 8v8M6 16v-4h12v4" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </g>
                  <circle className="cloud-dot-1" cx="60" cy="25" r="2" fill="rgba(147, 51, 234, 0.5)" />
                  <circle className="cloud-dot-2" cx="52" cy="22" r="1.5" fill="rgba(168, 85, 247, 0.4)" />
                  <circle className="cloud-dot-3" cx="68" cy="28" r="1.5" fill="rgba(168, 85, 247, 0.4)" />
                </g>
              </svg>

              <img
                className="flying-cp flying-cp-2"
                src={require("/img/cp2.png").default}
                alt="Control Plane"
              />
              {/* Cloud 2-1 - Teal (left) */}
              <svg className="cp-cloud-projection cp-cloud-2-1" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cloudGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(4, 159, 154, 0.08)', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: 'rgba(44, 224, 191, 0.12)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(194, 252, 238, 0.08)', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="glow2">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Badge: dev - top left */}
                <g className="cloud-badge">
                  <rect x="28" y="5" width="16" height="6" rx="3" fill="rgba(4, 159, 154, 0.3)" stroke="rgba(44, 224, 191, 0.6)" strokeWidth="0.5" />
                  <text x="36" y="9" fontSize="3.5" fill="#000000" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">dev</text>
                </g>
                <line className="cloud-connection" x1="60" y1="75" x2="60" y2="20" stroke="rgba(4, 159, 154, 0.2)" strokeWidth="1" strokeDasharray="3,3" />
                <g className="cloud-shape" filter="url(#glow2)">
                  <path className="cloud-hex-1" d="M 60 10 L 75 17.5 L 75 32.5 L 60 40 L 45 32.5 L 45 17.5 Z"
                        fill="url(#cloudGradient2)" stroke="rgba(4, 159, 154, 0.3)" strokeWidth="1.5" />
                  {/* Sonar sweep line */}
                  <g className="sonar-sweep" transform-origin="60 25">
                    <circle cx="60" cy="23" r="0.8" fill="rgba(44, 224, 191, 0.7)" />
                    <circle cx="60" cy="21" r="0.7" fill="rgba(44, 224, 191, 0.5)" />
                    <circle cx="60" cy="19" r="0.6" fill="rgba(44, 224, 191, 0.4)" />
                    <circle cx="60" cy="17" r="0.5" fill="rgba(44, 224, 191, 0.3)" />
                    <circle cx="60" cy="15" r="0.4" fill="rgba(44, 224, 191, 0.2)" />
                  </g>
                  {/* CPU icon - top left */}
                  <g className="cloud-resource-icon icon-cpu" transform="translate(54, 20) scale(0.264)">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="rgba(44, 224, 191, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"
                          stroke="rgba(4, 159, 154, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Container/Docker icon - top right */}
                  <g className="cloud-resource-icon icon-docker" transform="translate(66, 20) scale(0.264)">
                    <path d="M22 7.7c-.3-.2-.8-.2-1.2-.2-1.6 0-2.8.9-3.6 1.9-.6-.2-1.2-.3-1.9-.3-3.4 0-6.1 2.7-6.1 6.1 0 .3 0 .7.1 1C5.9 17.4 3 20.5 3 24h18c3.3 0 6-2.7 6-6 0-2.8-1.9-5.2-4.6-5.9l-.4-.1v-.4c0-1.5-.7-2.9-1.8-3.9z"
                          stroke="rgba(4, 159, 154, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 17h12M8 21h8" stroke="rgba(44, 224, 191, 0.5)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Hard Drive icon - left */}
                  <g className="cloud-resource-icon icon-harddrive" transform="translate(51, 25) scale(0.264)">
                    <path d="M22 12H2l2-7h16l2 7zM2 12v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"
                          stroke="rgba(44, 224, 191, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="16" r="1" fill="rgba(4, 159, 154, 0.6)" />
                  </g>
                  {/* Settings icon - right */}
                  <g className="cloud-resource-icon icon-settings" transform="translate(69, 25) scale(0.264)">
                    <circle cx="12" cy="12" r="3" stroke="rgba(4, 159, 154, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"
                          stroke="rgba(44, 224, 191, 0.6)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <circle className="cloud-dot-1" cx="60" cy="25" r="2" fill="rgba(4, 159, 154, 0.4)" />
                  <circle className="cloud-dot-2" cx="52" cy="22" r="1.5" fill="rgba(44, 224, 191, 0.3)" />
                  <circle className="cloud-dot-3" cx="68" cy="28" r="1.5" fill="rgba(44, 224, 191, 0.3)" />
                </g>
              </svg>
              {/* Cloud 2-2 - Pink (right) */}
              <svg className="cp-cloud-projection cp-cloud-2-2" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cloudGradient2b" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(236, 72, 153, 0.1)', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: 'rgba(244, 114, 182, 0.13)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(251, 207, 232, 0.08)', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="glow2b">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Badge: prod - top right */}
                <g className="cloud-badge">
                  <rect x="76" y="5" width="18" height="6" rx="3" fill="rgba(236, 72, 153, 0.3)" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="0.5" />
                  <text x="85" y="9" fontSize="3.5" fill="#000000" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">prod</text>
                </g>
                <line className="cloud-connection" x1="60" y1="75" x2="60" y2="20" stroke="rgba(236, 72, 153, 0.25)" strokeWidth="1" strokeDasharray="3,3" />
                <g className="cloud-shape" filter="url(#glow2b)">
                  <path className="cloud-hex-1" d="M 60 10 L 75 17.5 L 75 32.5 L 60 40 L 45 32.5 L 45 17.5 Z"
                        fill="url(#cloudGradient2b)" stroke="rgba(236, 72, 153, 0.35)" strokeWidth="1.5" />
                  {/* Sonar sweep line */}
                  <g className="sonar-sweep" transform-origin="60 25">
                    <circle cx="60" cy="23" r="0.8" fill="rgba(244, 114, 182, 0.7)" />
                    <circle cx="60" cy="21" r="0.7" fill="rgba(244, 114, 182, 0.5)" />
                    <circle cx="60" cy="19" r="0.6" fill="rgba(244, 114, 182, 0.4)" />
                    <circle cx="60" cy="17" r="0.5" fill="rgba(244, 114, 182, 0.3)" />
                    <circle cx="60" cy="15" r="0.4" fill="rgba(244, 114, 182, 0.2)" />
                  </g>
                  {/* CPU icon - top left */}
                  <g className="cloud-resource-icon icon-cpu" transform="translate(54, 20) scale(0.264)">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"
                          stroke="rgba(236, 72, 153, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Container/Docker icon - top right */}
                  <g className="cloud-resource-icon icon-docker" transform="translate(66, 20) scale(0.264)">
                    <path d="M22 7.7c-.3-.2-.8-.2-1.2-.2-1.6 0-2.8.9-3.6 1.9-.6-.2-1.2-.3-1.9-.3-3.4 0-6.1 2.7-6.1 6.1 0 .3 0 .7.1 1C5.9 17.4 3 20.5 3 24h18c3.3 0 6-2.7 6-6 0-2.8-1.9-5.2-4.6-5.9l-.4-.1v-.4c0-1.5-.7-2.9-1.8-3.9z"
                          stroke="rgba(236, 72, 153, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 17h12M8 21h8" stroke="rgba(244, 114, 182, 0.5)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Hard Drive icon - left */}
                  <g className="cloud-resource-icon icon-harddrive" transform="translate(51, 25) scale(0.264)">
                    <path d="M22 12H2l2-7h16l2 7zM2 12v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"
                          stroke="rgba(244, 114, 182, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="16" r="1" fill="rgba(236, 72, 153, 0.6)" />
                  </g>
                  {/* Settings icon - right */}
                  <g className="cloud-resource-icon icon-settings" transform="translate(69, 25) scale(0.264)">
                    <circle cx="12" cy="12" r="3" stroke="rgba(236, 72, 153, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"
                          stroke="rgba(244, 114, 182, 0.6)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <circle className="cloud-dot-1" cx="60" cy="25" r="2" fill="rgba(236, 72, 153, 0.45)" />
                  <circle className="cloud-dot-2" cx="52" cy="22" r="1.5" fill="rgba(244, 114, 182, 0.35)" />
                  <circle className="cloud-dot-3" cx="68" cy="28" r="1.5" fill="rgba(244, 114, 182, 0.35)" />
                </g>
              </svg>

              <img
                className="flying-cp flying-cp-3"
                src={require("/img/cp3.png").default}
                alt="Control Plane"
              />
              {/* Cloud 3 - Orange */}
              <svg className="cp-cloud-projection cp-cloud-3" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cloudGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(249, 115, 22, 0.1)', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: 'rgba(251, 146, 60, 0.13)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(253, 186, 116, 0.08)', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="glow3">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Badge: EU-public - top right */}
                <g className="cloud-badge">
                  <rect x="66" y="5" width="30" height="6" rx="3" fill="rgba(249, 115, 22, 0.3)" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="0.5" />
                  <text x="81" y="9" fontSize="3.5" fill="#000000" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">EU-public</text>
                </g>
                <line className="cloud-connection" x1="60" y1="75" x2="60" y2="20" stroke="rgba(249, 115, 22, 0.25)" strokeWidth="1" strokeDasharray="3,3" />
                <g className="cloud-shape" filter="url(#glow3)">
                  <path className="cloud-hex-1" d="M 60 10 L 75 17.5 L 75 32.5 L 60 40 L 45 32.5 L 45 17.5 Z"
                        fill="url(#cloudGradient3)" stroke="rgba(249, 115, 22, 0.35)" strokeWidth="1.5" />
                  {/* Sonar sweep line */}
                  <g className="sonar-sweep" transform-origin="60 25">
                    <circle cx="60" cy="23" r="0.8" fill="rgba(251, 146, 60, 0.7)" />
                    <circle cx="60" cy="21" r="0.7" fill="rgba(251, 146, 60, 0.5)" />
                    <circle cx="60" cy="19" r="0.6" fill="rgba(251, 146, 60, 0.4)" />
                    <circle cx="60" cy="17" r="0.5" fill="rgba(251, 146, 60, 0.3)" />
                    <circle cx="60" cy="15" r="0.4" fill="rgba(251, 146, 60, 0.2)" />
                  </g>
                  {/* CPU icon - top left */}
                  <g className="cloud-resource-icon icon-cpu" transform="translate(54, 20) scale(0.264)">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"
                          stroke="rgba(249, 115, 22, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* User icon - top right */}
                  <g className="cloud-resource-icon icon-user" transform="translate(66, 20) scale(0.264)">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                          stroke="rgba(253, 186, 116, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Container/Docker icon - left */}
                  <g className="cloud-resource-icon icon-docker" transform="translate(51, 25) scale(0.264)">
                    <path d="M22 7.7c-.3-.2-.8-.2-1.2-.2-1.6 0-2.8.9-3.6 1.9-.6-.2-1.2-.3-1.9-.3-3.4 0-6.1 2.7-6.1 6.1 0 .3 0 .7.1 1C5.9 17.4 3 20.5 3 24h18c3.3 0 6-2.7 6-6 0-2.8-1.9-5.2-4.6-5.9l-.4-.1v-.4c0-1.5-.7-2.9-1.8-3.9z"
                          stroke="rgba(249, 115, 22, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 17h12M8 21h8" stroke="rgba(251, 146, 60, 0.5)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Memory/RAM icon - right */}
                  <g className="cloud-resource-icon icon-memory" transform="translate(69, 25) scale(0.264)">
                    <rect x="2" y="7" width="20" height="10" rx="2" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M6 7V4M10 7V4M14 7V4M18 7V4M6 17v3M10 17v3M14 17v3M18 17v3"
                          stroke="rgba(249, 115, 22, 0.6)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Globe/Network icon - bottom center */}
                  <g className="cloud-resource-icon icon-globe" transform="translate(60, 30) scale(0.264)">
                    <circle cx="12" cy="12" r="10" stroke="rgba(253, 186, 116, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                          stroke="rgba(249, 115, 22, 0.6)" strokeWidth="2" fill="none" />
                  </g>
                  <circle className="cloud-dot-1" cx="60" cy="25" r="2" fill="rgba(249, 115, 22, 0.45)" />
                  <circle className="cloud-dot-2" cx="52" cy="22" r="1.5" fill="rgba(251, 146, 60, 0.35)" />
                  <circle className="cloud-dot-3" cx="68" cy="28" r="1.5" fill="rgba(251, 146, 60, 0.35)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <main>
        <section className="features-section" style={{ background: "var(--lp-c-bg-elv)", padding: "48px 24px" }}>
          <div className="container">
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2.5rem', fontWeight: '700' }}>How it works</h2>
            <div className="lp-features">
              <FeatureCard>
                <ThemedImage
                  alt="Code icon"
                  sources={{
                    light: useBaseUrl("/img/icons/icon-code.png"),
                    dark: useBaseUrl("/img/icons/icon-code-dark.png"),
                  }}
                />
                <h3>Everything in code</h3>
                <p>Define your entire cloud landscape using code. Always know exactly what's defined and leverage review-based workflows, version control, and much more.</p>
              </FeatureCard>
              <FeatureCard>
                <ThemedImage
                  alt="Reconcile icon"
                  sources={{
                    light: useBaseUrl("/img/icons/icon-reconcile.png"),
                    dark: useBaseUrl("/img/icons/icon-reconcile-dark.png"),
                  }}
                />
                <h3>Continuous self-healing</h3>
                <p>Keep your landscape in sync. Kubernetes controllers continuously observes the desired and the actual state and reconciles any differences automatically.</p>
              </FeatureCard>
              <FeatureCard>
                <ThemedImage
                  alt="Align icon"
                  sources={{
                    light: useBaseUrl("/img/icons/icon-align.png"),
                    dark: useBaseUrl("/img/icons/icon-align-dark.png"),
                  }}
                />
                <h3>One syntax for all</h3>
                <p>
                  Use a unified approach to define and manage resources across multiple cloud providers and services, reducing infrastructure complexity significantly.
                </p>
              </FeatureCard>
              <FeatureCard>
                <ThemedImage
                  alt="Puzzle icon"
                  sources={{
                    light: useBaseUrl("/img/icons/icon-puzzle.png"),
                    dark: useBaseUrl("/img/icons/icon-puzzle-dark.png"),
                  }}
                />
                <h3>Designed for reuse</h3>
                <p>
                  Define your landscapes in modular building blocks using <i>Service Providers</i> or <i>Platform Services</i>. Replicate modules easily across different regions or stages.
                </p>
              </FeatureCard>
              <FeatureCard>
                <ThemedImage
                  alt="Platform icon"
                  sources={{
                    light: useBaseUrl("/img/icons/icon-platform.png"),
                    dark: useBaseUrl("/img/icons/icon-platform-dark.png"),
                  }}
                />
                <h3>Run a platform</h3>
                <p>
                  Prebuild your own platform tailored to the specific needs of your organization and offer it to development teams in a self-service way.
                </p>
              </FeatureCard>
              <FeatureCard>
                <ThemedImage
                  alt="Simple icon"
                  sources={{
                    light: useBaseUrl("/img/icons/icon-simple.png"),
                    dark: useBaseUrl("/img/icons/icon-simple-dark.png"),
                  }}
                />
                <h3>Built for everyone</h3>
                <p>
                  Whether you are a cloud expert or just getting started — our providers are designed to help everyone.
                  We run 100% open-source.
                </p>
              </FeatureCard>
            </div>
          </div>
        </section>

        <section className="video-section">
          <div className="container">
            <div className="video-section-inner">
              <p className="video-section-eyebrow">See it in action</p>
              <h2 className="video-section-title">Watch the KubeCon Amsterdam Talk</h2>
              <p className="video-section-subtitle">
                See how OpenControlPlane enables teams to build, share, and adopt cloud-native control planes at scale.
              </p>
              <div className="video-embed-wrapper">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/hR8hFht9sFA"
                  title="OpenControlPlane – KubeCon Amsterdam"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        <section className="get-started-section gray-white">
          <Link
            className="button button--primary button--lg"
            to="/developers/getting-started"
          >
            Start contributing
          </Link>
          <span>
            or explore{" "}
            <Link to="/users/ecosystem">
              our cloud native ecosystem
            </Link>
          </span>
        </section>

        <section className="essentials-section" ref={section1Ref}>
          <div className="container">
            {/* Full-width title header */}
            <div className="section-header">
              <div className="section-header-content">
                <h2 className="section-main-title">EMPOWER YOUR ENGINEERS</h2>
                <p className="section-subtitle">Control Planes hold everything they need to orchestrate cloud landscapes</p>
                {/* Subsection navigation */}
                <div className="section-nav-dots">
                  <button
                    className={`nav-dot ${activeFeature === 0 ? 'active' : ''}`}
                    onClick={() => handleFeatureClick(0)}
                  >
                    Declarative API
                    <span className="nav-dot-progress" style={{ width: activeFeature === 0 ? `${(scrollProgress / 0.30) * 100}%` : (activeFeature > 0 ? '100%' : '0%') }}></span>
                  </button>
                  <button
                    className={`nav-dot ${activeFeature === 1 ? 'active' : ''}`}
                    onClick={() => handleFeatureClick(1)}
                  >
                    Self-healing landscapes
                    <span className="nav-dot-progress" style={{ width: activeFeature === 1 ? `${((scrollProgress - 0.30) / 0.30) * 100}%` : (activeFeature > 1 ? '100%' : '0%') }}></span>
                  </button>
                  <button
                    className={`nav-dot ${activeFeature === 2 ? 'active' : ''}`}
                    onClick={() => handleFeatureClick(2)}
                  >
                    GitOps
                    <span className="nav-dot-progress" style={{ width: activeFeature === 2 ? `${((scrollProgress - 0.60) / 0.40) * 100}%` : (activeFeature > 2 ? '100%' : '0%') }}></span>
                  </button>
                </div>
              </div>
              <div className="section-header-right-col">
                <Link className="section-header-cta" to="/users/getting-started">Read end user guides →</Link>
                <Link className="section-header-cta" to="/developers/serviceprovider/develop">Contribute ServiceProvider →</Link>
              </div>
            </div>

            {/* Centered text content above visual */}
            <div className="section-text-content">
              <div className={`section-text-item ${activeFeature === 0 ? 'active' : ''}`}>
                <h3>Declarative API everywhere</h3>
                <p>Define your infrastructure as declarative YAML. The control plane reconciles your desired state with reality—creating, updating, and managing cloud resources automatically.</p>
              </div>
              <div className={`section-text-item ${activeFeature === 1 ? 'active' : ''}`}>
                <h3>Self-healing</h3>
                <p>The control plane continuously monitors your resources and automatically corrects drift, recovers from failures, and ensures your infrastructure matches the desired state at all times—powered by Kubernetes.</p>
              </div>
              <div className={`section-text-item ${activeFeature === 2 ? 'active' : ''}`}>
                <h3>GitOps</h3>
                <p>Store your control plane configurations in Git. Flux automatically syncs changes from your repository to live environments, providing audit trails, rollback capabilities, and declarative infrastructure management.</p>
              </div>
            </div>

            {/* Visual and buttons */}
            <div className="unified">
              {/* Visual area */}
              <div className="visual">
                {/* Feature 0: Declarative API - use cp2.png */}
                <img
                  className={`unified-cp unified-cp-declarative ${activeFeature === 0 ? 'active' : ''}`}
                  src={require("/img/cp2.png").default}
                  alt="Control Plane"
                />

                {/* Feature 1: Self-healing - use cp2-crossplane.png */}
                <img
                  className={`unified-cp unified-cp-selfhealing ${activeFeature === 1 ? 'active' : ''}`}
                  src={require("/img/platform/cp2-crossplane.png").default}
                  alt="Control Plane"
                />

                {/* Feature 2: GitOps - use cp2-flux.png */}
                <img
                  className={`unified-cp unified-cp-gitops ${activeFeature === 2 ? 'active' : ''}`}
                  src={require("/img/platform/cp2-flux.png").default}
                  alt="Control Plane"
                />

                {/* Feature 0: Declarative API - YAML left, cloud right */}
                <div className={`essentials-visual-content ${activeFeature === 0 ? 'active' : ''}`}>
                  <div className="yaml-left-container">
                    <pre className="essentials-yaml-unified">
{`apiVersion: openmcp.cloud/v1alpha1
kind: ManagedControlPlane
metadata:
  name: team-prod
spec:
  provider: gardener
---
apiVersion: openmcp.cloud/v1alpha1
kind: Database
metadata:
  name: prod-db
spec:
  engine: postgresql
---
apiVersion: openmcp.cloud/v1alpha1
kind: Subaccount
metadata:
  name: team-alpha
spec:
  region: eu-central-1`}
                    </pre>
                  </div>

                  {/* Animated line connection - same style as hero */}
                  <svg className={`yaml-connection-line ${activeFeature === 0 ? 'animate' : ''}`} style={{ position: 'absolute', right: '130px', top: '50%', transform: 'translateY(-50%)', width: '200px', height: '2px' }}>
                    <line x1="0" y1="1" x2="200" y2="1" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="2" strokeDasharray="3,3" />
                  </svg>

                  {/* Database and Account icons inside cloud */}
                  <div className="yaml-right-container">
                    <svg className={`yaml-cloud-right ${activeFeature === 0 ? 'animate' : ''}`} width="400" height="300" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="yamlCloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: 'rgba(123, 97, 255, 0.12)' }} />
                          <stop offset="100%" style={{ stopColor: 'rgba(147, 51, 234, 0.1)' }} />
                        </linearGradient>
                      </defs>
                      <path className="yaml-cloud-shape" d="M 60 20 L 75 27.5 L 75 42.5 L 60 50 L 45 42.5 L 45 27.5 Z"
                            fill="url(#yamlCloudGradient)" stroke="rgba(147, 51, 234, 0.5)" strokeWidth="2" />

                      {/* Database icon - left side */}
                      <g className="yaml-cloud-icon yaml-cloud-icon-database" transform="translate(50, 28) scale(0.22)">
                        <ellipse cx="12" cy="5" rx="9" ry="3" stroke="rgba(147, 51, 234, 0.9)" strokeWidth="2.5" fill="none" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"
                              stroke="rgba(147, 51, 234, 0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </g>

                      {/* Account/User icon - right side */}
                      <g className="yaml-cloud-icon yaml-cloud-icon-account" transform="translate(64, 28) scale(0.22)">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="rgba(147, 51, 234, 0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="7" r="4" stroke="rgba(147, 51, 234, 0.9)" strokeWidth="2.5" fill="none" />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Feature 1: Self-healing - 4 resource icons around CP */}
                <div className={`essentials-visual-content ${activeFeature === 1 ? 'active' : ''}`}>
                  <div className="selfhealing-animation-area">
                    {/* Database - top */}
                    <div className={`healing-resource healing-resource-1 ${activeFeature === 1 ? 'animate' : ''}`}>
                      <div className="healing-resource-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="12" cy="5" rx="9" ry="3" className="resource-icon-stroke" strokeWidth="2" fill="none" />
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"
                                className="resource-icon-stroke" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <svg className="healing-conn-line-simple" width="3" height="80" viewBox="0 0 3 80">
                        <line x1="1.5" y1="0" x2="1.5" y2="80" className="healing-conn-simple" strokeWidth="3" />
                      </svg>
                    </div>

                    {/* User - right */}
                    <div className={`healing-resource healing-resource-2 ${activeFeature === 1 ? 'animate' : ''}`}>
                      <div className="healing-resource-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" className="resource-icon-stroke" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="7" r="4" className="resource-icon-stroke" strokeWidth="2" />
                        </svg>
                      </div>
                      <svg className="healing-conn-line-simple" width="80" height="3" viewBox="0 0 80 3">
                        <line x1="0" y1="1.5" x2="80" y2="1.5" className="healing-conn-simple" strokeWidth="3" />
                      </svg>
                    </div>

                    {/* Server - bottom */}
                    <div className={`healing-resource healing-resource-3 ${activeFeature === 1 ? 'animate' : ''}`}>
                      <div className="healing-resource-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" className="resource-icon-stroke" strokeWidth="2" />
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" className="resource-icon-stroke" strokeWidth="2" />
                          <line x1="6" y1="6" x2="6.01" y2="6" className="resource-icon-stroke" strokeWidth="2" strokeLinecap="round" />
                          <line x1="6" y1="18" x2="6.01" y2="18" className="resource-icon-stroke" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <svg className="healing-conn-line-simple" width="3" height="80" viewBox="0 0 3 80">
                        <line x1="1.5" y1="0" x2="1.5" y2="80" className="healing-conn-simple" strokeWidth="3" />
                      </svg>
                    </div>

                    {/* Storage - left */}
                    <div className={`healing-resource healing-resource-4 ${activeFeature === 1 ? 'animate' : ''}`}>
                      <div className="healing-resource-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" className="resource-icon-stroke" strokeWidth="2" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" className="resource-icon-stroke" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="12" y1="22.08" x2="12" y2="12" className="resource-icon-stroke" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <svg className="healing-conn-line-simple" width="80" height="3" viewBox="0 0 80 3">
                        <line x1="0" y1="1.5" x2="80" y2="1.5" className="healing-conn-simple" strokeWidth="3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Feature 2: GitOps - clouds split with badges */}
                <div className={`essentials-visual-content ${activeFeature === 2 ? 'active' : ''}`}>
                  <div className="gitops-animation-area">
                    {/* Left cloud */}
                    <svg className={`gitops-cloud gitops-cloud-original ${activeFeature === 2 ? 'animate' : ''}`} width="240" height="172" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="gitopsCloudOriginal" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: 'rgba(123, 97, 255, 0.12)' }} />
                          <stop offset="100%" style={{ stopColor: 'rgba(147, 51, 234, 0.1)' }} />
                        </linearGradient>
                      </defs>
                      {/* Badge inside SVG */}
                      <g className="cloud-badge">
                        <rect x="28" y="5" width="16" height="6" rx="3" fill="rgba(4, 159, 154, 0.3)" stroke="rgba(44, 224, 191, 0.6)" strokeWidth="0.5" />
                        <text x="36" y="9" fontSize="3.5" fill="#000000" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">dev</text>
                      </g>
                      <path d="M 60 20 L 75 27.5 L 75 42.5 L 60 50 L 45 42.5 L 45 27.5 Z"
                            fill="url(#gitopsCloudOriginal)" stroke="rgba(147, 51, 234, 0.5)" strokeWidth="2" />
                      <g transform="translate(54, 30) scale(0.18)">
                        <ellipse cx="12" cy="5" rx="9" ry="3" stroke="rgba(147, 51, 234, 0.8)" strokeWidth="2" fill="none" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"
                              stroke="rgba(147, 51, 234, 0.8)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                    </svg>

                    {/* Right cloud */}
                    <svg className={`gitops-cloud gitops-cloud-replica ${activeFeature === 2 ? 'animate' : ''}`} width="240" height="172" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="gitopsCloudReplica" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: 'rgba(186, 164, 255, 0.15)' }} />
                          <stop offset="100%" style={{ stopColor: 'rgba(167, 139, 250, 0.12)' }} />
                        </linearGradient>
                      </defs>
                      {/* Badge inside SVG */}
                      <g className="cloud-badge">
                        <rect x="28" y="5" width="18" height="6" rx="3" fill="rgba(167, 139, 250, 0.3)" stroke="rgba(186, 164, 255, 0.6)" strokeWidth="0.5" />
                        <text x="37" y="9" fontSize="3.5" fill="#000000" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">live</text>
                      </g>
                      <path d="M 60 20 L 75 27.5 L 75 42.5 L 60 50 L 45 42.5 L 45 27.5 Z"
                            fill="url(#gitopsCloudReplica)" stroke="rgba(167, 139, 250, 0.6)" strokeWidth="2" />
                      <g transform="translate(54, 30) scale(0.18)">
                        <ellipse cx="12" cy="5" rx="9" ry="3" stroke="rgba(167, 139, 250, 0.9)" strokeWidth="2" fill="none" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"
                              stroke="rgba(167, 139, 250, 0.9)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                    </svg>

                    {/* Connection lines to CP - same style as hero */}
                    <svg className="gitops-conn-svg" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '420px', height: '2px', pointerEvents: 'none' }}>
                      <line className={`gitops-conn-left ${activeFeature === 2 ? 'animate' : ''}`} x1="0" y1="1" x2="140" y2="1" stroke="rgba(147, 51, 234, 0.2)" />
                      <line className={`gitops-conn-right ${activeFeature === 2 ? 'animate' : ''}`} x1="280" y1="1" x2="420" y2="1" stroke="rgba(147, 51, 234, 0.2)" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="providers-section" ref={section2Ref}>
          <div className="container">
            {/* Full-width title header */}
            <div className="section-header section-header-right">
              <div className="section-header-content">
                <h2 className="section-main-title"><i>READY-TO-USE</i> CONTROL PLANES</h2>
                <p className="section-subtitle">Provision, manage, secure all instances on open control plane platform</p>
                {/* Subsection navigation */}
                <div className="section-nav-dots">
                  <button
                    className={`nav-dot ${activeProviderFeature === 0 ? 'active' : ''}`}
                    onClick={() => handleProviderFeatureClick(0)}
                  >
                    Central onboarding API
                    <span className="nav-dot-progress" style={{ width: activeProviderFeature === 0 ? `${(providerScrollProgress / 0.30) * 100}%` : (activeProviderFeature > 0 ? '100%' : '0%') }}></span>
                  </button>
                  <button
                    className={`nav-dot ${activeProviderFeature === 1 ? 'active' : ''}`}
                    onClick={() => handleProviderFeatureClick(1)}
                  >
                    Shared tooling
                    <span className="nav-dot-progress" style={{ width: activeProviderFeature === 1 ? `${((providerScrollProgress - 0.30) / 0.30) * 100}%` : (activeProviderFeature > 1 ? '100%' : '0%') }}></span>
                  </button>
                  <button
                    className={`nav-dot ${activeProviderFeature === 2 ? 'active' : ''}`}
                    onClick={() => handleProviderFeatureClick(2)}
                  >
                    Bring own observability stack
                    <span className="nav-dot-progress" style={{ width: activeProviderFeature === 2 ? `${((providerScrollProgress - 0.60) / 0.40) * 100}%` : (activeProviderFeature > 2 ? '100%' : '0%') }}></span>
                  </button>
                </div>
              </div>
              <div className="section-header-right-col">
                <Link className="section-header-cta" to="/operators/overview">Read operator guides →</Link>
                <Link className="section-header-cta" to="/developers/general">Contribute PlatformProvider →</Link>
              </div>
            </div>

            {/* Centered text content above visual */}
            <div className="section-text-content section-text-content-right">
              <div className={`section-text-item ${activeProviderFeature === 0 ? 'active' : ''}`}>
                <h3>Central onboarding API</h3>
                <p>As an operator, provide a central onboarding API where end users can order control planes with standardized configurations. Streamline provisioning and ensure consistency across your organization.</p>
              </div>
              <div className={`section-text-item ${activeProviderFeature === 1 ? 'active' : ''}`}>
                <h3>Shared tooling</h3>
                <p>Share common tools across all control planes including Vault for secrets management, Kyverno for policy enforcement, custom IDPs for authentication, and GitHub registries for container images.</p>
              </div>
              <div className={`section-text-item ${activeProviderFeature === 2 ? 'active' : ''}`}>
                <h3>Bring own observability stack</h3>
                <p>Integrate your preferred monitoring and observability tools seamlessly with your control planes.</p>
              </div>
            </div>

            <div className="unified">
              {/* Visual area */}
              <div className="visual">
                {/* Three control planes in triangle formation */}
                <img
                  className={`providers-cp providers-cp-top providers-cp-1 ${activeProviderFeature === 0 ? 'pos-onboarding-1' : ''} ${activeProviderFeature === 1 ? 'pos-tooling-1' : ''} ${activeProviderFeature === 2 ? 'pos-obs-1' : ''}`}
                  src={require("/img/cp2.png").default}
                  alt="Control Plane 1"
                />
                <img
                  className={`providers-cp providers-cp-bottom-left providers-cp-2 ${activeProviderFeature === 0 ? 'pos-onboarding-2' : ''} ${activeProviderFeature === 1 ? 'pos-tooling-2' : ''} ${activeProviderFeature === 2 ? 'pos-obs-2' : ''}`}
                  src={require("/img/cp3.png").default}
                  alt="Control Plane 2"
                />
                <img
                  className={`providers-cp providers-cp-bottom-right providers-cp-3 ${activeProviderFeature === 0 ? 'pos-onboarding-3' : ''} ${activeProviderFeature === 1 ? 'pos-tooling-3' : ''} ${activeProviderFeature === 2 ? 'pos-obs-3' : ''}`}
                  src={require("/img/cp4.png").default}
                  alt="Control Plane 3"
                />

                {/* Central onboarding API feature - show API icon in center with lines to all CPs */}
                <div className={`providers-onboarding-container ${activeProviderFeature === 0 ? 'animate' : ''}`}>
                  <svg className="providers-onboarding-icon" width="70" height="70" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="onboardingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(147, 51, 234, 0.9)" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0.6)" />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="url(#onboardingGradient)" strokeWidth="2" />
                    <path d="M16 12l-4-4-4 4M12 16V8" fill="none" stroke="url(#onboardingGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <svg className="providers-onboarding-connections" width="100%" height="100%">
                    <line className="providers-onboarding-line providers-onboarding-line-top" x1="50%" y1="50%" x2="50%" y2="23%" />
                    <line className="providers-onboarding-line providers-onboarding-line-bl" x1="50%" y1="50%" x2="27%" y2="77%" />
                    <line className="providers-onboarding-line providers-onboarding-line-br" x1="50%" y1="50%" x2="73%" y2="77%" />
                  </svg>
                </div>

                {/* Shared tooling feature - Vault in center connecting to 3 CPs */}
                <div className={`providers-tooling-container ${activeProviderFeature === 1 ? 'animate' : ''}`}>
                  {/* Central Vault icon */}
                  <svg className="providers-vault-icon" width="80" height="80" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="vaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(147, 51, 234, 0.9)" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0.6)" />
                      </linearGradient>
                    </defs>
                    {/* Vault/Storage hexagon icon */}
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                          fill="none" stroke="url(#vaultGradient)" strokeWidth="2" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"
                              fill="none" stroke="url(#vaultGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="22.08" x2="12" y2="12"
                          fill="none" stroke="url(#vaultGradient)" strokeWidth="2" strokeLinecap="round" />
                  </svg>

                  {/* Connection lines from vault to each CP */}
                  <svg className="providers-vault-connections" width="100%" height="100%">
                    <line className="providers-vault-line providers-vault-line-top" x1="50%" y1="50%" x2="50%" y2="23%" />
                    <line className="providers-vault-line providers-vault-line-bl" x1="50%" y1="50%" x2="27%" y2="77%" />
                    <line className="providers-vault-line providers-vault-line-br" x1="50%" y1="50%" x2="73%" y2="77%" />
                  </svg>
                </div>

                {/* Observability feature - TBD */}
                <div className={`providers-observability-container ${activeProviderFeature === 2 ? 'animate' : ''}`}>
                  {/* Placeholder for observability visualization */}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="anywhere-section" ref={section3Ref}>
          <div className="container">
            {/* Full-width title header */}
            <div className="section-header">
              <div className="section-header-content">
                <h2 className="section-main-title">RUNS EVERYWHERE</h2>
                <p className="section-subtitle">Open Control Plane can be installed wherever Kubernetes is available.</p>
                {/* Subsection navigation */}
                <div className="section-nav-dots">
                  <button
                    className={`nav-dot ${activeAnywhereFeature === 0 ? 'active' : ''}`}
                    onClick={() => handleAnywhereFeatureClick(0)}
                  >
                    Anywhere
                    <span className="nav-dot-progress" style={{ width: activeAnywhereFeature === 0 ? `${(anywhereScrollProgress / 0.30) * 100}%` : (activeAnywhereFeature > 0 ? '100%' : '0%') }}></span>
                  </button>
                  <button
                    className={`nav-dot ${activeAnywhereFeature === 1 ? 'active' : ''}`}
                    onClick={() => handleAnywhereFeatureClick(1)}
                  >
                    Sovereign clouds
                    <span className="nav-dot-progress" style={{ width: activeAnywhereFeature === 1 ? `${((anywhereScrollProgress - 0.30) / 0.30) * 100}%` : (activeAnywhereFeature > 1 ? '100%' : '0%') }}></span>
                  </button>
                  <button
                    className={`nav-dot ${activeAnywhereFeature === 2 ? 'active' : ''}`}
                    onClick={() => handleAnywhereFeatureClick(2)}
                  >
                    Kind
                    <span className="nav-dot-progress" style={{ width: activeAnywhereFeature === 2 ? `${((anywhereScrollProgress - 0.60) / 0.40) * 100}%` : (activeAnywhereFeature > 2 ? '100%' : '0%') }}></span>
                  </button>
                </div>
              </div>
              <div className="section-header-right-col">
                <Link className="section-header-cta" to="/operators/overview">Read operator guides →</Link>
                <Link className="section-header-cta" to="/developers/clusterprovider/develop">Contribute ClusterProvider →</Link>
              </div>
            </div>

            {/* Centered text content above visual */}
            <div className="section-text-content">
              <div className={`section-text-item ${activeAnywhereFeature === 0 ? 'active' : ''}`}>
                <h3>Anywhere</h3>
                <p>Deploy control planes anywhere—fully compatible with open source <Link to="https://github.com/gardener/gardener" target="_blank" rel="noopener noreferrer">Gardener</Link> on any Kubernetes cluster.</p>
              </div>
              <div className={`section-text-item ${activeAnywhereFeature === 1 ? 'active' : ''}`}>
                <h3>Sovereign clouds</h3>
                <p>Meet strict data residency and compliance requirements.</p>
              </div>
              <div className={`section-text-item ${activeAnywhereFeature === 2 ? 'active' : ''}`}>
                <h3>Kind <span className="new-badge-inline">New</span></h3>
                <p>Develop and test locally using Kind clusters.</p>
              </div>
            </div>

            <div className="unified">
              {/* Visual area */}
              <div className="visual">

                {/* Feature 0: Anywhere - gardener with cloud provider badges */}
                <div className={`anywhere-feature-container ${activeAnywhereFeature === 0 ? 'active' : ''}`}>
                  <img
                    className="anywhere-hangar-gardener"
                    src={require("/img/platform/hangar_gardener.png").default}
                    alt="Gardener"
                  />

                  {/* Flying control planes - reduced to 2 */}
                  <img
                    className="anywhere-flying-cp anywhere-flying-cp-1"
                    src={require("/img/cp2.png").default}
                    alt="Flying CP"
                  />
                  <img
                    className="anywhere-flying-cp anywhere-flying-cp-2"
                    src={require("/img/cp3.png").default}
                    alt="Flying CP"
                  />

                  {/* Cloud provider badges */}
                  <div className="anywhere-badge anywhere-badge-aws">AWS</div>
                  <div className="anywhere-badge anywhere-badge-azure">Azure</div>
                  <div className="anywhere-badge anywhere-badge-gcp">GCP</div>
                  <div className="anywhere-badge anywhere-badge-other">...</div>

                  {/* Connection lines from hangar to badges - tree structure */}
                  <svg className="anywhere-connections" width="100%" height="100%">
                    <line className="anywhere-conn-line anywhere-conn-aws" x1="50%" y1="38%" x2="20%" y2="78%" />
                    <line className="anywhere-conn-line anywhere-conn-azure" x1="50%" y1="38%" x2="40%" y2="78%" />
                    <line className="anywhere-conn-line anywhere-conn-gcp" x1="50%" y1="38%" x2="60%" y2="78%" />
                    <line className="anywhere-conn-line anywhere-conn-other" x1="50%" y1="38%" x2="80%" y2="78%" />
                  </svg>
                </div>

                {/* Feature 1: Sovereign clouds - gardener with EU badges */}
                <div className={`anywhere-feature-container ${activeAnywhereFeature === 1 ? 'active' : ''}`}>
                  <img
                    className="anywhere-hangar-gardener"
                    src={require("/img/platform/hangar_gardener.png").default}
                    alt="Gardener"
                  />

                  {/* Flying control planes - reduced to 2 */}
                  <img
                    className="anywhere-flying-cp anywhere-flying-cp-1"
                    src={require("/img/cp2.png").default}
                    alt="Flying CP"
                  />
                  <img
                    className="anywhere-flying-cp anywhere-flying-cp-2"
                    src={require("/img/cp3.png").default}
                    alt="Flying CP"
                  />

                  {/* Sovereign cloud badges */}
                  <div className="anywhere-badge anywhere-badge-eu-pub-dev">EU-pub-dev</div>
                  <div className="anywhere-badge anywhere-badge-eu-pub-live">EU-pub-live</div>
                  <div className="anywhere-badge anywhere-badge-eu-gov-live">EU-gov-live</div>

                  {/* Connection lines from hangar to badges - tree structure */}
                  <svg className="anywhere-connections" width="100%" height="100%">
                    <line className="anywhere-conn-line anywhere-conn-eu-1" x1="50%" y1="38%" x2="25%" y2="78%" />
                    <line className="anywhere-conn-line anywhere-conn-eu-2" x1="50%" y1="38%" x2="50%" y2="78%" />
                    <line className="anywhere-conn-line anywhere-conn-eu-3" x1="50%" y1="38%" x2="75%" y2="78%" />
                  </svg>
                </div>

                {/* Feature 2: Kind */}
                <div className={`anywhere-feature-container ${activeAnywhereFeature === 2 ? 'active' : ''}`}>
                  <img
                    className="anywhere-hangar-kind"
                    src={require("/img/platform/hangar_kind.png").default}
                    alt="Kind"
                  />

                  {/* Kind dev mode - 2 control planes that stay and move around */}
                  <img
                    className="kind-cp kind-cp-1"
                    src={require("/img/cp2.png").default}
                    alt="Kind CP 1"
                  />
                  <img
                    className="kind-cp kind-cp-2"
                    src={require("/img/cp3.png").default}
                    alt="Kind CP 2"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="open-source-section">
          <div className={clsx("col col--8")}>
            <div className="text--center padding-horiz--md">
              <div className="open-source-wrapper">
                <div className="typing-open-source">100% open-source</div>
              </div>
              <p>
                This project started as an inner-source initiative within SAP. Thanks to <b>NeoNephos</b>, it now operates 100% publicly and has been donated to the <Link to="https://github.com/openmcp-project" target="_blank" rel="noopener noreferrer">OpenControlPlane organization</Link>.
                <br />
                <br />
                <b>
                  We believe that no single team can achieve a fully orchestrated environment on their own.
                  <br /> Only through collaboration we can make Europe's cloud services 100% orchestratable for everyone.
                </b>
                <br />
                <br />
              </p>
              <Link
                className="button button--primary button--lg"
                to="https://github.com/openmcp-project"
                target="_blank"
                rel="noopener noreferrer"
              >
                💪 See our projects
              </Link>
              <br />
              <span>
                and learn <Link to="/developers/getting-started">how to contribute</Link>
              </span>
              <br />
              <br />
            </div>
          </div>
        </section>

      </main>
    </Layout>
  );
}
