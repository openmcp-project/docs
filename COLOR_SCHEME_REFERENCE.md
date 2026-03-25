# Role-Based Color Scheme - COMPLETE IMPLEMENTATION

## CSS Variables (Lines 39-57 in custom.css)

```css
/* Role-based Teal Spectrum */
--teal-2: #C2FCEE;
--teal-4: #2CE0BF;
--teal-6: #049F9A;
--teal-7: #07838F;  ← End User Primary
--teal-10: #02414C; ← Operator Primary
--teal-11: #012931; ← Contributor Primary

/* Role Colors */
--role-enduser-primary: var(--teal-7);      #07838F
--role-enduser-secondary: var(--teal-10);   #02414C
--role-operator-primary: var(--teal-10);    #02414C
--role-operator-secondary: var(--teal-11);  #012931
--role-contributor-primary: transparent;
--role-contributor-border: var(--teal-11);  #012931
```

## Where Colors Appear

### 1. Hero Section Buttons (Landing Page)
- **"Get Started"** → Teal 7 (#07838F), hover: Teal 10
- **"Run Your Platform"** → Teal 10 (#02414C), hover: Teal 11
- **"Build Together"** → Transparent, hover: subtle tint

### 2. Navbar Links (Top Navigation)
- Hover/Active states show role colors
- Bottom border accent appears on hover
- Colors: Teal 7 (users), Teal 10 (operators), Teal 11 (developers)

### 3. Sidebar (Documentation Sections)
- Left border shows section color
- Active menu items highlighted in role color
- Hover states use lighter tint of role color
- Different color per section: userDocs, operatorDocs, developerDocs

## Color Gradient Philosophy

Light → Dark = Beginner → Advanced

- **Teal 7** (lighter) = End users, getting started, welcoming
- **Teal 10** (medium dark) = Operators, platform management, professional
- **Teal 11** (darkest) = Contributors, developers, technical depth
- **Transparent** = Open invitation to contribute

This creates a visual progression through the documentation that mirrors the user journey.
