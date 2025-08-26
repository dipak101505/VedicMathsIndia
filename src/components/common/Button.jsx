import React from 'react';
import { getButtonStyles } from '../../styles/theme';

/**
 * Reusable Button Component
 * 
 * @param {string} variant - Button style variant (primary, secondary, success, danger, ghost, link)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} type - Button type (button, submit, reset)
 * @param {function} onClick - Click handler function
 * @param {object} style - Additional custom styles
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 * @param {object} props - Additional props
 */
const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  style = {},
  className = "",
  children,
  ...props
}) => {
  // Get base button styles from theme
  const buttonStyles = getButtonStyles(variant, size, style);
  
  // Handle disabled state
  if (disabled) {
    buttonStyles.backgroundColor = buttonStyles["&:disabled"]?.backgroundColor || "#9ca3af";
    buttonStyles.borderColor = buttonStyles["&:disabled"]?.borderColor || "#9ca3af";
    buttonStyles.cursor = "not-allowed";
    buttonStyles.opacity = 0.6;
  }
  
  // Remove pseudo-selector styles that can't be applied directly
  const { "&:hover": hoverStyles, "&:active": activeStyles, "&:focus": focusStyles, "&:disabled": disabledStyles, ...baseStyles } = buttonStyles;
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={baseStyles}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && hoverStyles) {
          Object.assign(e.target.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && hoverStyles) {
          // Reset to base styles
          Object.assign(e.target.style, baseStyles);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && activeStyles) {
          Object.assign(e.target.style, activeStyles);
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && hoverStyles) {
          Object.assign(e.target.style, hoverStyles);
        }
      }}
      onFocus={(e) => {
        if (focusStyles) {
          Object.assign(e.target.style, focusStyles);
        }
      }}
      onBlur={(e) => {
        // Reset to base styles
        Object.assign(e.target.style, baseStyles);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
