# Refactored Components

This directory contains extracted, reusable components from the main index.js landing page.

## Files

### `hooks/useScrollProgress.js`
Custom hook for tracking scroll progress through sections.

**Usage:**
```javascript
import { useScrollProgress } from '@site/src/components/hooks/useScrollProgress';

// In your component:
useScrollProgress(sectionRef, setScrollProgress, setActiveFeature, {
  startThreshold: 0.7,    // Start tracking when section top is at 70% viewport
  endThreshold: -0.2,     // Stop tracking when section top is at -20% viewport
  feature1Threshold: 0.30, // Switch to feature 1 at 30% progress
  feature2Threshold: 0.60, // Switch to feature 2 at 60% progress
  onScroll: (progress) => {}, // Optional callback
});
```

### `ResourceIcons.js`
Reusable SVG icon components for resources.

**Exports:**
- `DatabaseIcon` - Database cylinder icon
- `UserIcon` - User/account icon
- `ServerIcon` - Server rack icon
- `StorageIcon` - Storage/package icon

**Usage:**
```javascript
import { DatabaseIcon, UserIcon } from '@site/src/components/ResourceIcons';

<div className="icon-container">
  <DatabaseIcon />
</div>
```

### `SelfHealingAnimation.js`
Complete self-healing animation component with rotating resources.

**Props:**
- `isActive` (boolean) - Whether the animation is active

**Usage:**
```javascript
import { SelfHealingAnimation } from '@site/src/components/SelfHealingAnimation';

<div className={`essentials-visual-content ${activeFeature === 1 ? 'active' : ''}`}>
  <SelfHealingAnimation isActive={activeFeature === 1} />
</div>
```

## CSS Improvements

The healing animations have been consolidated from 4 duplicate keyframes (`resource-heal-1` through `resource-heal-4`) into a single `resource-heal` animation, reducing CSS by ~40 lines.

## Migration Guide

To use these components in index.js:

1. Import the components:
```javascript
import { useScrollProgress, isInViewport } from '@site/src/components/hooks/useScrollProgress';
import { SelfHealingAnimation } from '@site/src/components/SelfHealingAnimation';
```

2. Replace the three scroll handling useEffect hooks with:
```javascript
// Section 1
useScrollProgress(section1Ref, setScrollProgress, setActiveFeature);

// Section 2
useScrollProgress(section2Ref, setProviderScrollProgress, setActiveProviderFeature);

// Section 3
useScrollProgress(section3Ref, setAnywhereScrollProgress, setActiveAnywhereFeature);
```

3. Replace the self-healing JSX with:
```javascript
<SelfHealingAnimation isActive={activeFeature === 1} />
```

## Benefits

- **Reduced duplication**: Eliminates ~200 lines of duplicate scroll handling code
- **Better maintainability**: Changes to scroll behavior only need to be made once
- **Reusability**: Components can be used in other pages
- **Type safety**: Easy to add TypeScript in the future
- **Testability**: Individual components can be unit tested
