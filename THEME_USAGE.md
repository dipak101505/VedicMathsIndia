# Global Theme System - Usage Guide

## Overview

This application now uses a centralized theme system that allows you to:
- Change colors globally by modifying a single file
- Use consistent spacing, typography, and styling across components
- Easily maintain and update the application's visual design

## Files Structure

```
src/
├── styles/
│   └── theme.js              # Main theme configuration
├── components/
│   └── common/
│       ├── Button.jsx        # Reusable button component
│       ├── StyledButton.jsx  # Styled-components version
│       └── index.js          # Exports
```

## Quick Start

### 1. Import the Theme

```jsx
import { theme } from '../styles/theme';
import { Button } from '../components/common';
```

### 2. Use Theme Colors

```jsx
// Instead of hardcoded colors:
style={{ backgroundColor: "#0a6ba0" }}

// Use theme colors:
style={{ backgroundColor: theme.colors.primary.main }}
```

### 3. Use Predefined Button Component

```jsx
// Instead of custom button:
<button style={{ padding: "12px 24px", backgroundColor: "#ffa600" }}>
  Submit
</button>

// Use the Button component:
<Button variant="warning" size="lg">
  Submit
</Button>
```

## Theme Configuration

### Colors

```jsx
theme.colors.primary.main      // #0a6ba0 - Main brand color
theme.colors.primary.light     // #1e88e5 - Lighter variant
theme.colors.primary.dark      // #0d47a1 - Darker variant
theme.colors.primary.contrast  // #ffffff - Text on primary

theme.colors.success.main      // #10b981 - Success actions
theme.colors.error.main        // #dc2626 - Error/destructive actions
theme.colors.warning.main      // #f59e0b - Warning actions
theme.colors.info.main         // #3b82f6 - Informational actions

theme.colors.neutral.white     // #ffffff
theme.colors.neutral.gray50    // #f9fafb
theme.colors.neutral.gray100   // #f3f4f6
// ... more gray variants
theme.colors.neutral.black     // #000000

theme.colors.text.primary      // #1f2937 - Main text
theme.colors.text.secondary    // #6b7280 - Secondary text
theme.colors.text.disabled     // #9ca3af - Disabled text

theme.colors.background.primary    // #ffffff - Main background
theme.colors.background.secondary  // #f9fafb - Secondary background
theme.colors.background.tertiary   // #f3f4f6 - Tertiary background

theme.colors.border.light      // #e5e7eb - Light borders
theme.colors.border.medium     // #d1d5db - Medium borders
theme.colors.border.dark       // #9ca3af - Dark borders
theme.colors.border.focus      // #3b82f6 - Focus state
```

### Spacing

```jsx
theme.spacing.xs   // 4px
theme.spacing.sm   // 8px
theme.spacing.md   // 16px
theme.spacing.lg   // 24px
theme.spacing.xl   // 32px
theme.spacing.xxl  // 48px
theme.spacing.xxxl // 64px
```

### Typography

```jsx
theme.typography.fontSizes.xs      // 12px
theme.typography.fontSizes.sm      // 14px
theme.typography.fontSizes.base    // 16px
theme.typography.fontSizes.lg      // 18px
theme.typography.fontSizes.xl      // 20px
theme.typography.fontSizes["2xl"]  // 24px
theme.typography.fontSizes["3xl"]  // 30px
theme.typography.fontSizes["4xl"]  // 36px

theme.typography.fontWeights.normal   // 400
theme.typography.fontWeights.medium   // 500
theme.typography.fontWeights.semibold // 600
theme.typography.fontWeights.bold     // 700

theme.typography.lineHeights.tight   // 1.25
theme.typography.lineHeights.normal  // 1.5
theme.typography.lineHeights.relaxed // 1.75
```

### Border Radius

```jsx
theme.borderRadius.sm   // 4px
theme.borderRadius.md   // 6px
theme.borderRadius.lg   // 8px
theme.borderRadius.xl   // 12px
theme.borderRadius.xxl  // 16px
theme.borderRadius.round // 50%
```

### Shadows

```jsx
theme.shadows.sm  // 0 1px 2px rgba(0, 0, 0, 0.05)
theme.shadows.md  // 0 4px 6px rgba(0, 0, 0, 0.1)
theme.shadows.lg  // 0 10px 15px rgba(0, 0, 0, 0.1)
theme.shadows.xl  // 0 20px 25px rgba(0, 0, 0, 0.1)
```

### Transitions

```jsx
theme.transitions.fast   // 0.15s ease
theme.transitions.normal // 0.2s ease
theme.transitions.slow   // 0.3s ease
```

### Breakpoints

```jsx
theme.breakpoints.mobile  // 768px
theme.breakpoints.tablet  // 1024px
theme.breakpoints.desktop // 1280px
```

## Button Component Usage

### Basic Usage

```jsx
import { Button } from '../components/common';

<Button onClick={handleClick}>
  Click Me
</Button>
```

### Variants

```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Sizes

```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

### Types

```jsx
<Button type="button">Button</Button>
<Button type="submit">Submit</Button>
<Button type="reset">Reset</Button>
```

### States

```jsx
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>
```

### Custom Styles

```jsx
<Button 
  variant="primary"
  customStyles={{
    marginTop: theme.spacing.lg,
    boxShadow: theme.shadows.lg,
  }}
>
  Custom Styled
</Button>
```

## Migration Guide

### Before (Hardcoded Styles)

```jsx
<button
  style={{
    padding: "12px 24px",
    backgroundColor: "#0a6ba0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  }}
>
  Submit
</button>
```

### After (Theme-Based)

```jsx
// Option 1: Use Button component
<Button variant="primary" size="lg">
  Submit
</Button>

// Option 2: Use theme values directly
<button
  style={{
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    border: "none",
    borderRadius: theme.borderRadius.lg,
    cursor: "pointer",
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.medium,
  }}
>
  Submit
</button>
```

## Common Patterns

### Form Buttons

```jsx
<div style={{ display: "flex", gap: theme.spacing.md }}>
  <Button variant="primary" type="submit">
    Save
  </Button>
  <Button variant="secondary" onClick={onCancel}>
    Cancel
  </Button>
</div>
```

### Action Buttons

```jsx
<div style={{ display: "flex", gap: theme.spacing.sm }}>
  <Button variant="success" size="sm">
    <Icon name="check" />
    Approve
  </Button>
  <Button variant="danger" size="sm">
    <Icon name="trash" />
    Delete
  </Button>
</div>
```

### Navigation Buttons

```jsx
<Button variant="ghost" onClick={goBack}>
  ← Back
</Button>
<Button variant="primary" onClick={nextStep}>
  Next →
</Button>
```

## Customizing the Theme

### Adding New Colors

```jsx
// In src/styles/theme.js
export const theme = {
  colors: {
    // ... existing colors
    custom: {
      main: "#your-color",
      light: "#your-light-color",
      dark: "#your-dark-color",
    },
  },
  // ... rest of theme
};
```

### Adding New Button Variants

```jsx
// In src/styles/theme.js
export const buttonVariants = {
  // ... existing variants
  custom: {
    backgroundColor: theme.colors.custom.main,
    color: theme.colors.custom.contrast,
    border: `2px solid ${theme.colors.custom.main}`,
    "&:hover": {
      backgroundColor: theme.colors.custom.light,
      borderColor: theme.colors.custom.light,
    },
  },
};
```

### Adding New Sizes

```jsx
// In src/styles/theme.js
export const buttonSizes = {
  // ... existing sizes
  xl: {
    padding: `${theme.spacing.xl} ${theme.spacing.xxl}`,
    fontSize: theme.typography.fontSizes.xl,
    borderRadius: theme.borderRadius.xl,
  },
};
```

## Best Practices

1. **Always use theme values** instead of hardcoded colors, spacing, or typography
2. **Use the Button component** for consistent button styling across the app
3. **Group related styles** using the theme's logical organization
4. **Use semantic color names** (success, error, warning) rather than visual descriptions
5. **Maintain consistency** by reusing existing theme values rather than creating new ones
6. **Test across different screen sizes** using the provided breakpoints

## Troubleshooting

### Common Issues

1. **Button not styling correctly**: Make sure you're using the correct variant and size names
2. **Colors not updating**: Ensure you're importing from the correct theme file
3. **Spacing inconsistencies**: Use the predefined spacing scale instead of arbitrary values

### Getting Help

- Check the theme.js file for available values
- Use the browser console to inspect theme values
- Refer to this documentation for usage examples
- Look at existing components for implementation patterns

## Examples in the Codebase

- **Navbar.jsx**: Updated to use theme colors and spacing
- **AttendancePage.jsx**: Updated to use Button component and theme
- **VideoListPage.jsx**: Can be updated to use theme system

## Future Enhancements

- Dark mode support
- CSS custom properties for dynamic theming
- Theme switching capabilities
- More component variants
- Animation presets
