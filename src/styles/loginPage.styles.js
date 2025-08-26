import styled from "styled-components";
import { theme } from "./theme";
import { Link } from "react-router-dom";

// Main container
export const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100vh;
  gap: ${theme.spacing.xl};
  padding: 0 ${theme.spacing.xl};
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

// Form container
export const FormContainer = styled.div`
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
`;

// Logo and title section
export const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

export const Logo = styled.img`
  width: 50px;
  height: auto;
  margin-bottom: ${theme.spacing.sm};
`;

export const PageTitle = styled.h3`
  color: ${theme.colors.primary.main};
  margin: 0;
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.semibold};
`;

// Error message
export const ErrorMessage = styled.div`
  color: ${theme.colors.error.main};
  font-weight: ${theme.typography.fontWeights.bold};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  font-size: ${theme.typography.fontSizes.sm};
`;

// Success message
export const SuccessMessage = styled.div`
  color: ${theme.colors.success.main};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  font-size: ${theme.typography.fontSizes.sm};
`;

// Form
export const Form = styled.form`
  width: 100%;
`;

// Form groups
export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeights.medium};
  font-size: ${theme.typography.fontSizes.sm};
`;

export const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.base};
  transition: ${theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
  
  &:required {
    border-color: ${theme.colors.primary.main};
  }
`;

// Submit button
export const SubmitButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${props => props.isHovered ? theme.colors.background.primary : theme.colors.primary.main};
  color: ${props => props.isHovered ? theme.colors.primary.main : theme.colors.primary.contrast};
  border: ${props => props.isHovered ? `1px solid ${theme.colors.primary.main}` : 'none'};
  border-radius: ${theme.borderRadius.sm};
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: ${theme.transitions.normal};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  
  &:hover {
    background-color: ${theme.colors.background.primary};
    color: ${theme.colors.primary.main};
    border: 1px solid ${theme.colors.primary.main};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Links section
export const LinksSection = styled.div`
  margin-top: ${theme.spacing.md};
  text-align: center;
`;

export const LinkRow = styled.div`
  margin-bottom: ${theme.spacing.sm};
`;

export const StyledLink = styled(Link)`
  color: ${theme.colors.primary.main};
  text-decoration: none;
  font-size: ${theme.typography.fontSizes.sm};
  
  &:hover {
    text-decoration: underline;
  }
`;

// Image container
export const ImageContainer = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const LoginImage = styled.img`
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  border-radius: ${theme.borderRadius.lg};
`;
