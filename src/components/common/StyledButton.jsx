import React from 'react';
import styled from 'styled-components';
import { getButtonStyles } from '../../styles/theme';

// Styled button component with proper hover effects
const StyledButton = styled.button`
  ${({ variant, size, customStyles }) => {
    const baseStyles = getButtonStyles(variant, size, customStyles);
    
    // Convert the styles object to CSS-in-JS format
    return `
      background-color: ${baseStyles.backgroundColor};
      color: ${baseStyles.color};
      border: ${baseStyles.border};
      padding: ${baseStyles.padding};
      font-size: ${baseStyles.fontSize};
      border-radius: ${baseStyles.borderRadius};
      cursor: ${baseStyles.cursor};
      font-weight: ${baseStyles.fontWeight};
      transition: ${baseStyles.transition};
      display: ${baseStyles.display};
      align-items: ${baseStyles.alignItems};
      justify-content: ${baseStyles.justifyContent};
      gap: ${baseStyles.gap};
      outline: ${baseStyles.outline};
      
      &:hover {
        background-color: ${baseStyles["&:hover"]?.backgroundColor || baseStyles.backgroundColor};
        color: ${baseStyles["&:hover"]?.color || baseStyles.color};
        border-color: ${baseStyles["&:hover"]?.borderColor || baseStyles.borderColor};
      }
      
      &:active {
        background-color: ${baseStyles["&:active"]?.backgroundColor || baseStyles.backgroundColor};
        border-color: ${baseStyles["&:active"]?.borderColor || baseStyles.borderColor};
      }
      
      &:focus {
        box-shadow: ${baseStyles["&:focus"]?.boxShadow || `0 0 0 3px ${baseStyles["&:focus"]?.borderColor || "#3b82f6"}40`};
      }
      
      &:disabled {
        background-color: ${baseStyles["&:disabled"]?.backgroundColor || "#9ca3af"};
        border-color: ${baseStyles["&:disabled"]?.borderColor || "#9ca3af"};
        cursor: not-allowed;
        opacity: 0.6;
      }
    `;
  }}
  
  ${({ fullWidth }) => fullWidth && `
    width: 100%;
  `}
  
  ${({ customStyles }) => customStyles && `
    ${Object.entries(customStyles).map(([key, value]) => `${key}: ${value};`).join('\n')}
  `}
`;

/**
 * Enhanced Button Component using styled-components
 * 
 * @param {string} variant - Button style variant (primary, secondary, success, danger, ghost, link)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} disabled - Whether the button is disabled
 * @param {boolean} fullWidth - Whether the button should take full width
 * @param {string} type - Button type (button, submit, reset)
 * @param {function} onClick - Click handler function
 * @param {object} customStyles - Additional custom styles
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 * @param {object} props - Additional props
 */
const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
  customStyles = {},
  className = "",
  children,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      type={type}
      onClick={onClick}
      customStyles={customStyles}
      className={className}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
