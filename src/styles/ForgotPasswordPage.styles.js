import styled from "styled-components";
import { theme } from "./theme";
import { Link } from "react-router-dom";

// Container for the entire page
export const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.md};
`;

// Main auth box container
export const AuthBox = styled.div`
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing.xxl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  width: 100%;
  max-width: 400px;
  border: 1px solid ${theme.colors.border.light};
`;

// Page title
export const AuthTitle = styled.h2`
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes["2xl"]};
  font-weight: ${theme.typography.fontWeights.semibold};
`;

// Description text
export const AuthDescription = styled.p`
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.base};
  line-height: ${theme.typography.lineHeights.normal};
`;

// Error message container
export const AuthError = styled.div`
  color: ${theme.colors.error.main};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  font-size: ${theme.typography.fontSizes.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.errorLight};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.error.light};
`;

// Success message container
export const AuthSuccess = styled.div`
  color: ${theme.colors.success.main};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  font-size: ${theme.typography.fontSizes.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.successLight};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.success.light};
`;

// Form group container
export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  &:last-of-type {
    margin-bottom: ${theme.spacing.lg};
  }
`;

// Form label
export const FormLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeights.medium};
  font-size: ${theme.typography.fontSizes.sm};
`;

// Form input
export const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
  font-size: ${theme.typography.fontSizes.base};
  transition: ${theme.transitions.fast};
  background: ${theme.colors.inputBackground};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
  
  &:hover {
    border-color: ${theme.colors.border.medium};
  }
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
`;

// Submit button
export const SubmitButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${props => props.disabled ? theme.colors.neutral.gray400 : theme.colors.primary.main};
  color: ${theme.colors.primary.contrast};
  border: 2px solid ${props => props.disabled ? theme.colors.neutral.gray400 : theme.colors.primary.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  transition: ${theme.transitions.normal};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  
  &:hover:not(:disabled) {
    background-color: ${theme.colors.primary.light};
    border-color: ${theme.colors.primary.light};
  }
  
  &:active:not(:disabled) {
    background-color: ${theme.colors.primary.dark};
    border-color: ${theme.colors.primary.dark};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
`;

// Auth links container
export const AuthLinks = styled.div`
  margin-top: ${theme.spacing.lg};
  text-align: center;
`;

// Auth link
export const AuthLink = styled(Link)`
  color: ${theme.colors.primary.main};
  text-decoration: none;
  font-size: ${theme.typography.fontSizes.sm};
  transition: ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.primary.dark};
    text-decoration: underline;
  }
  
  &:focus {
    outline: none;
    text-decoration: underline;
  }
`;
