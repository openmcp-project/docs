/* eslint-disable import/no-unresolved */
import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import ThemedImage from "@theme/ThemedImage";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  useEffect(() => {
    const innersourceText = document.getElementsByClassName("typing-open-source")[0];
    const onScroll = () => {
      if (innersourceText && isInViewport(innersourceText)) {
        innersourceText.classList.add("animate");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
                  <g className="cloud-resource-icon icon-user" transform="translate(54, 20) scale(0.22)">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                          stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Database icon - top right */}
                  <g className="cloud-resource-icon icon-database" transform="translate(66, 20) scale(0.22)">
                    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="rgba(147, 51, 234, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"
                          stroke="rgba(147, 51, 234, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Key icon - left */}
                  <g className="cloud-resource-icon icon-key" transform="translate(51, 25) scale(0.22)">
                    <circle cx="7.5" cy="15.5" r="5.5" stroke="rgba(123, 97, 255, 0.6)" strokeWidth="2" fill="none" />
                    <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"
                          stroke="rgba(123, 97, 255, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Server icon - right */}
                  <g className="cloud-resource-icon icon-server" transform="translate(69, 25) scale(0.22)">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M6 6h.01M6 18h.01" stroke="rgba(123, 97, 255, 0.6)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Network icon - bottom center */}
                  <g className="cloud-resource-icon icon-network" transform="translate(60, 30) scale(0.22)">
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
                  <g className="cloud-resource-icon icon-cpu" transform="translate(54, 20) scale(0.22)">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="rgba(44, 224, 191, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"
                          stroke="rgba(4, 159, 154, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Container/Docker icon - top right */}
                  <g className="cloud-resource-icon icon-docker" transform="translate(66, 20) scale(0.22)">
                    <path d="M22 7.7c-.3-.2-.8-.2-1.2-.2-1.6 0-2.8.9-3.6 1.9-.6-.2-1.2-.3-1.9-.3-3.4 0-6.1 2.7-6.1 6.1 0 .3 0 .7.1 1C5.9 17.4 3 20.5 3 24h18c3.3 0 6-2.7 6-6 0-2.8-1.9-5.2-4.6-5.9l-.4-.1v-.4c0-1.5-.7-2.9-1.8-3.9z"
                          stroke="rgba(4, 159, 154, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 17h12M8 21h8" stroke="rgba(44, 224, 191, 0.5)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Hard Drive icon - left */}
                  <g className="cloud-resource-icon icon-harddrive" transform="translate(51, 25) scale(0.22)">
                    <path d="M22 12H2l2-7h16l2 7zM2 12v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"
                          stroke="rgba(44, 224, 191, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="16" r="1" fill="rgba(4, 159, 154, 0.6)" />
                  </g>
                  {/* Settings icon - right */}
                  <g className="cloud-resource-icon icon-settings" transform="translate(69, 25) scale(0.22)">
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
                  <g className="cloud-resource-icon icon-cpu" transform="translate(54, 20) scale(0.22)">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="rgba(244, 114, 182, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"
                          stroke="rgba(236, 72, 153, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Container/Docker icon - top right */}
                  <g className="cloud-resource-icon icon-docker" transform="translate(66, 20) scale(0.22)">
                    <path d="M22 7.7c-.3-.2-.8-.2-1.2-.2-1.6 0-2.8.9-3.6 1.9-.6-.2-1.2-.3-1.9-.3-3.4 0-6.1 2.7-6.1 6.1 0 .3 0 .7.1 1C5.9 17.4 3 20.5 3 24h18c3.3 0 6-2.7 6-6 0-2.8-1.9-5.2-4.6-5.9l-.4-.1v-.4c0-1.5-.7-2.9-1.8-3.9z"
                          stroke="rgba(236, 72, 153, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 17h12M8 21h8" stroke="rgba(244, 114, 182, 0.5)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Hard Drive icon - left */}
                  <g className="cloud-resource-icon icon-harddrive" transform="translate(51, 25) scale(0.22)">
                    <path d="M22 12H2l2-7h16l2 7zM2 12v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"
                          stroke="rgba(244, 114, 182, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="16" r="1" fill="rgba(236, 72, 153, 0.6)" />
                  </g>
                  {/* Settings icon - right */}
                  <g className="cloud-resource-icon icon-settings" transform="translate(69, 25) scale(0.22)">
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
                  <g className="cloud-resource-icon icon-cpu" transform="translate(54, 20) scale(0.22)">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"
                          stroke="rgba(249, 115, 22, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* User icon - top right */}
                  <g className="cloud-resource-icon icon-user" transform="translate(66, 20) scale(0.22)">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                          stroke="rgba(253, 186, 116, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* Container/Docker icon - left */}
                  <g className="cloud-resource-icon icon-docker" transform="translate(51, 25) scale(0.22)">
                    <path d="M22 7.7c-.3-.2-.8-.2-1.2-.2-1.6 0-2.8.9-3.6 1.9-.6-.2-1.2-.3-1.9-.3-3.4 0-6.1 2.7-6.1 6.1 0 .3 0 .7.1 1C5.9 17.4 3 20.5 3 24h18c3.3 0 6-2.7 6-6 0-2.8-1.9-5.2-4.6-5.9l-.4-.1v-.4c0-1.5-.7-2.9-1.8-3.9z"
                          stroke="rgba(249, 115, 22, 0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 17h12M8 21h8" stroke="rgba(251, 146, 60, 0.5)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Memory/RAM icon - right */}
                  <g className="cloud-resource-icon icon-memory" transform="translate(69, 25) scale(0.22)">
                    <rect x="2" y="7" width="20" height="10" rx="2" stroke="rgba(251, 146, 60, 0.6)" strokeWidth="2" fill="none" />
                    <path d="M6 7V4M10 7V4M14 7V4M18 7V4M6 17v3M10 17v3M14 17v3M18 17v3"
                          stroke="rgba(249, 115, 22, 0.6)" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Globe/Network icon - bottom center */}
                  <g className="cloud-resource-icon icon-globe" transform="translate(60, 30) scale(0.22)">
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
                <p>Keep your landscape in sync. Crossplane continuously observes the desired and the actual state and reconciles any differences automatically.</p>
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
                  Define your landscapes in modular building blocks using <i>Crossplane Compositions</i> or <i>Helm charts</i>. Replicate modules easily across different regions or stages.
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

        <section className="open-source-section">
          <div className={clsx("col col--8")}>
            <div className="text--center padding-horiz--md">
              <div className="open-source-wrapper">
                <div className="typing-open-source">100% open-source</div>
              </div>
              <img
                src={require("/img/landingpage-crossplane.png").default}
                alt="Crossplane based on CNCF"
                style={{ maxWidth: "100%", marginBottom: "24px" }}
              />
              <p>
                Through technical <b>providers</b>, we request, update and delete the cloud resources we want to
                orchestrate. They <b>allow us to describe environments in code</b>. Most SAP cloud services do not
                offer providers and are therefore not orchestrable yet. Since their APIs are public, we can build those
                ourselves.
                <br />
                <br />
                We truly believe in open standards — our solutions are based on the{" "}
                <b>
                  open-source project <Link to="https://crossplane.io/">Crossplane</Link>
                </b>
                . Crossplane is recommended by the{" "}
                <b>
                  Cloud Native Computing Foundation <Link to="https://www.cncf.io/projects/crossplane/">(CNCF)</Link>
                </b>
                .
                <br />
                <br />
                <b>
                  We believe that no single team can achieve a fully orchestrated environment by writing providers on
                  their own.
                  <br /> Only through collaboration we can make SAP's cloud services 100% orchestratable for everyone.
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