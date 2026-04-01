# Bruddle Neo-Brutalist Theme Implementation

## Overview
The GNN-SimMule application has been transformed to align with the **Bruddle** neo-brutalist aesthetic, featuring a dark, minimalist design with bold neon lime green accents.

## Color Palette

### Primary Colors
- **Background**: Deep Charcoal (#0a0a0a / HSL 0° 0% 5%)
- **Primary Accent**: Neon Lime Green (#BFFF00 / HSL 71° 100% 49%)
- **Foreground**: Off-white (#ffffff / HSL 0° 0% 98%)

### Secondary Colors
- **Secondary Accent**: Purple (#8B6BC4)
- **Muted**: Gray (#585858)
- **Border**: Dark Gray (#262626 / HSL 0° 0% 15%)
- **Destructive**: Red (#FF4444)

## Typography

### Font Stack
- **Headings**: Quantico (Bold, uppercase)
- **Body**: Outfit (Regular to Bold weights)
- **Monospace**: JetBrains Mono (for technical elements)
- **Alt Display**: Base Neue (for special titles)

### Text Styling
- Headings: Quantico, uppercase, 0.05-0.1em letter spacing, bold weight
- Large headings include neon glow effect: `text-shadow: 0 0 10px hsla(71, 100%, 49%, 0.5)`
- Utilitarian, high-contrast approach for readability

## Visual Elements

### Background
- Solid deep charcoal (#0a0a0a)
- Subtle noise/grain texture overlay (3% opacity SVG noise)
- No gradients except minimal gradient to black in main content area

### Glow Effects
- Primary glow: Neon lime green with 0.3-0.5 opacity blur
- Used on active elements, buttons, and interactive states
- Box shadows: `0 0 20px hsla(71, 100%, 49%, 0.3), inset 0 0 10px hsla(71, 100%, 49%, 0.1)`

### Borders
- 2px solid borders on key elements
- Border color matches primary accent when active
- Muted borders (15% brightness) for inactive states
- Rounded corners: 0.75rem (12px)

## Key Components

### Header
- Title: "DETECT: [Scenario Name]"
- Uses Quantico font, neon green color
- Centered in top bar with Bruddle styling

### Sidebar
- Branding: "SYSTEM CORRUPT" (replacing "NEO RISK LAB")
- Neon green accents on active scenarios
- Toggle button: "█ SYSTEM CORRUPT" / "█ LIGHT MODE"
- Full glow effects on all interactive elements

### Modal
- Title: "SYSTEM ANALYZE"
- Subtitle: "Neural Network Detection & Forensic Analysis Protocol"
- Bold borders and neon accents throughout

### Buttons
- Uppercase text
- Neon glow on hover and active states
- 2px borders with primary color
- Smooth transitions and shadow effects

## Implementation Details

### CSS Variables
```css
:root {
  --background: 0 0% 5%;              /* #0a0a0a */
  --primary: 71 100% 49%;             /* #BFFF00 */
  --canvas-glow-filter: drop-shadow(0 0 6px rgba(191, 255, 0, 0.3));
}
```

### Utility Classes
- `.neo-glow-cyan`: Neon lime green box shadow (updated from cyan)
- `.text-shadow-cyan`: Neon lime green text glow
- `.bruddle-heading`: Large display heading with glow
- `.bruddle-title`: Bold uppercase title styling

## Design Philosophy

The Bruddle theme emphasizes:
1. **High Contrast**: Dark background with bright neon accents ensures readability
2. **Minimalism**: No unnecessary decorations, focus on content and hierarchy
3. **Utility**: Bold, geometric typography reflects industrial/brutalist aesthetic
4. **Accessibility**: Strong color differentiation and large text sizes
5. **Engagement**: Neon effects create visual interest without being distracting

## Files Modified
- `/src/index.css` - Color variables, typography, glow effects, background texture
- `/src/pages/Index.tsx` - Heading text, component styling, glow classes
- `/tailwind.config.ts` - Font families, color additions

