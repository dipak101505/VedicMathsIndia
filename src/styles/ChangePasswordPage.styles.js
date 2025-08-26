import styled from "styled-components";
import { theme } from "./theme";

// Container for the entire page
export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: ${theme.spacing.xl};
`;

// Main form container
export const FormContainer = styled.div`
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing.xxl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  width: 100%;
  max-width: 400px;
`;

// Page title
export const PageTitle = styled.h2`
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes["2xl"]};
  font-weight: ${theme.typography.fontWeights.semibold};
`;

// Error message container
export const ErrorMessage = styled.div`
  color: ${theme.colors.error.main};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  font-size: ${theme.typography.fontSizes.sm};
`;

// Success message container
export const SuccessMessage = styled.div`
  color: ${theme.colors.warning.main};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  font-size: ${theme.typography.fontSizes.sm};
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
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
  font-size: ${theme.typography.fontSizes.base};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
  
  &:hover {
    border-color: ${theme.colors.border.medium};
  }
`;

// Submit button
export const SubmitButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${props => props.loading ? theme.colors.neutral.gray400 : theme.colors.primary.main};
  color: ${theme.colors.primary.contrast};
  border: 2px solid ${props => props.loading ? theme.colors.neutral.gray400 : theme.colors.primary.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: ${props => props.loading ? "not-allowed" : "pointer"};
  transition: ${theme.transitions.normal};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  
  &:hover:not(:disabled) {
    background-color: ${theme.colors.primary.light};
    color: ${theme.colors.primary.contrast};
    border-color: ${theme.colors.primary.light};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
  
  &:disabled {
    opacity: 0.6;
  }
`;
