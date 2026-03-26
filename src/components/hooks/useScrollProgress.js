import { useEffect } from 'react';

/**
 * Custom hook to track scroll progress through a section
 * @param {React.RefObject} sectionRef - Reference to the section element
 * @param {Function} setProgress - State setter for scroll progress (0-1)
 * @param {Function} setActiveFeature - State setter for active feature index
 * @param {Object} options - Configuration options
 * @returns {void}
 */
export function useScrollProgress(sectionRef, setProgress, setActiveFeature, options = {}) {
  const {
    startThreshold = 0.7,
    endThreshold = -0.2,
    feature1Threshold = 0.65,  // Feature 0 gets 65% of scroll journey (15% later than 0.50)
    feature2Threshold = 0.825, // Feature 1 gets ~17.5% of scroll journey
    onScroll = null,
  } = options;

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top;

      const start = windowHeight * startThreshold;
      const end = windowHeight * endThreshold;

      // Only track when section is in the active range
      if (sectionTop > start || sectionTop < end) {
        return;
      }

      // Calculate progress through the visible range
      const scrollRange = start - end;
      const scrollProgress = start - sectionTop;
      const progress = Math.max(0, Math.min(1, scrollProgress / scrollRange));

      // Update scroll progress
      setProgress(progress);

      // Update active feature based on progress
      if (progress < feature1Threshold) {
        setActiveFeature(0);
      } else if (progress < feature2Threshold) {
        setActiveFeature(1);
      } else {
        setActiveFeature(2);
      }

      // Call optional callback
      if (onScroll) {
        onScroll(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Don't call handleScroll() immediately - only on actual scroll events
    // This prevents overriding manual button clicks
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionRef, setProgress, setActiveFeature, startThreshold, endThreshold, feature1Threshold, feature2Threshold, onScroll]);
}

/**
 * Helper function to check if element is in viewport
 */
export function isInViewport(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
