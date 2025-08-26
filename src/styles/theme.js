// Global Theme Configuration
// This file contains all the colors, spacing, and common styles used throughout the application

export const theme = {
  // Primary Colors
  colors: {
    // Brand Colors
    primary: {
      main: "#0a6ba0",        // Main brand color (navbar background)
      light: "#1e88e5",       // Lighter variant
      dark: "#0d47a1",        // Darker variant
      contrast: "#ffffff",    // Text color on primary background
    },
    
    // Secondary Colors
    secondary: {
      main: "#f8fafc",        // Light background color
      light: "#ffffff",       // White
      dark: "#e2e8f0",       // Light gray
      contrast: "#2d3748",    // Dark text on light background
    },
    
    // Success Colors
    success: {
      main: "#10b981",        // Green for success actions
      light: "#34d399",
      dark: "#059669",
      contrast: "#ffffff",
    },
    
    // Warning Colors
    warning: {
      main: "#f59e0b",        // Orange for warnings
      light: "#fbbf24",
      dark: "#d97706",
      contrast: "#ffffff",
    },
    
    // Error Colors
    error: {
      main: "#dc2626",        // Red for errors/destructive actions
      light: "#ef4444",
      dark: "#b91c1c",
      contrast: "#ffffff",
    },
    
    // Info Colors
    info: {
      main: "#3b82f6",        // Blue for informational actions
      light: "#60a5fa",
      dark: "#2563eb",
      contrast: "#ffffff",
    },
    
    // Neutral Colors
    neutral: {
      white: "#ffffff",
      gray50: "#f9fafb",
      gray100: "#f3f4f6",
      gray200: "#e5e7eb",
      gray300: "#d1d5db",
      gray400: "#9ca3af",
      gray500: "#6b7280",
      gray600: "#4b5563",
      gray700: "#374151",
      gray800: "#1f2937",
      gray900: "#111827",
      black: "#000000",
    },
    
    // Text Colors
    text: {
      primary: "#1f2937",     // Main text color
      secondary: "#6b7280",   // Secondary text color
      disabled: "#9ca3af",    // Disabled text color
      inverse: "#ffffff",     // Text on dark backgrounds
    },
    
    // Shorthand text colors for easier access
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    
    // Background Colors
    background: {
      primary: "#ffffff",     // Main background
      secondary: "#f9fafb",   // Secondary background
      tertiary: "#f3f4f6",   // Tertiary background
      overlay: "rgba(0, 0, 0, 0.5)", // Modal overlay
      light: "#f8f9fa",      // Light background variant
    },
    
    // Input Colors
    inputBackground: "#f8f9fa",
    
    // Border Colors
    border: {
      light: "#e5e7eb",
      medium: "#d1d5db",
      dark: "#9ca3af",
      focus: "#3b82f6",
    },
    
    // Shorthand border color for easier access
    borderColor: "#e0e0e0",
  },
  
  // Spacing Scale
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
    xxxl: "64px",
  },
  
  // Border Radius
  borderRadius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    xxl: "16px",
    round: "50%",
  },
  
  // Shadows
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1)",
  },
  
  // Typography
  typography: {
    fontSizes: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
    },
    fontWeights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeights: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  
  // Transitions
  transitions: {
    fast: "0.15s ease",
    normal: "0.2s ease",
    slow: "0.3s ease",
  },
  
  // Breakpoints
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1280px",
  },
  
  // Icon Sizes
  iconSize: 24,
  
  // Additional Colors
  pdfIcon: "#dc3545",
  videoIcon: "#FF9800",
  
  // Additional Colors for specific use cases
  successLight: "#f0fff4",
  errorLight: "#fff5f5",
  infoLight: "#f0f9ff",
  infoDark: "#0284c7",
};

// Button Variants - Predefined button styles
export const buttonVariants = {
  // Primary Button
  primary: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    border: `2px solid ${theme.colors.primary.main}`,
    "&:hover": {
      backgroundColor: theme.colors.primary.light,
      borderColor: theme.colors.primary.light,
    },
    "&:active": {
      backgroundColor: theme.colors.primary.dark,
      borderColor: theme.colors.primary.dark,
    },
    "&:disabled": {
      backgroundColor: theme.colors.neutral.gray400,
      borderColor: theme.colors.neutral.gray400,
      cursor: "not-allowed",
    },
  },
  
  // Secondary Button
  secondary: {
    backgroundColor: "transparent",
    color: theme.colors.primary.main,
    border: `2px solid ${theme.colors.primary.main}`,
    "&:hover": {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.primary.contrast,
    },
    "&:active": {
      backgroundColor: theme.colors.primary.dark,
      borderColor: theme.colors.primary.dark,
    },
  },
  
  // Success Button
  success: {
    backgroundColor: theme.colors.success.main,
    color: theme.colors.success.contrast,
    border: `2px solid ${theme.colors.success.main}`,
    "&:hover": {
      backgroundColor: theme.colors.success.light,
      borderColor: theme.colors.success.light,
    },
  },
  
  // Danger Button
  danger: {
    backgroundColor: theme.colors.error.main,
    color: theme.colors.error.contrast,
    border: `2px solid ${theme.colors.error.main}`,
    "&:hover": {
      backgroundColor: theme.colors.error.light,
      borderColor: theme.colors.error.light,
    },
  },
  
  // Ghost Button (minimal styling)
  ghost: {
    backgroundColor: "transparent",
    color: theme.colors.text.primary,
    border: "none",
    "&:hover": {
      backgroundColor: theme.colors.neutral.gray100,
    },
  },
  
  // Link Button (looks like a link)
  link: {
    backgroundColor: "transparent",
    color: theme.colors.primary.main,
    border: "none",
    textDecoration: "underline",
    "&:hover": {
      color: theme.colors.primary.dark,
    },
  },
};

// Size Variants
export const buttonSizes = {
  sm: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSizes.sm,
    borderRadius: theme.borderRadius.sm,
  },
  md: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    fontSize: theme.typography.fontSizes.base,
    borderRadius: theme.borderRadius.md,
  },
  lg: {
    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
    fontSize: theme.typography.fontSizes.lg,
    borderRadius: theme.borderRadius.lg,
  },
};

// Common Button Styles
export const commonButtonStyles = {
  cursor: "pointer",
  fontWeight: theme.typography.fontWeights.medium,
  transition: theme.transitions.normal,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.sm,
  outline: "none",
  "&:focus": {
    boxShadow: `0 0 0 3px ${theme.colors.border.focus}40`,
  },
};

// Helper function to get button styles
export const getButtonStyles = (variant = "primary", size = "md", customStyles = {}) => {
  const baseStyles = {
    ...commonButtonStyles,
    ...buttonVariants[variant],
    ...buttonSizes[size],
    ...customStyles,
  };
  
  return baseStyles;
};

// Helper function to get theme color
export const getThemeColor = (colorPath) => {
  const path = colorPath.split('.');
  let value = theme.colors;
  
  for (const key of path) {
    if (value && value[key] !== undefined) {
      value = value[key];
    } else {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return theme.colors.neutral.gray500; // Fallback color
    }
  }
  
  return value;
};

export default theme;
