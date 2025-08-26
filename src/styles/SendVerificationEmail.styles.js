import styled from "styled-components";
import { theme } from "./theme";

// Container for the main form wrapper
export const Container = styled.div`
  max-width: 400px;
  margin: ${theme.spacing.xxl} auto;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

// Title heading
export const Title = styled.h2`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes["2xl"]};
  font-weight: ${theme.typography.fontWeights.semibold};
`;

// Message container for success/error messages
export const MessageContainer = styled.div`
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => 
    props.isError ? theme.colors.errorLight : theme.colors.successLight
  };
  color: ${props => 
    props.isError ? theme.colors.error.main : theme.colors.success.main
  };
  border: 1px solid ${props => 
    props.isError ? theme.colors.error.light : theme.colors.success.light
  };
`;

// Form group wrapper
export const FormGroup = styled.div`
  margin-bottom: ${props => props.marginBottom || theme.spacing.lg};
`;

// Form labels
export const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeights.medium};
`;

// Form inputs
export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
  background-color: ${theme.colors.inputBackground};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.base};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
`;

// Submit button
export const SubmitButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${props => 
    props.disabled ? theme.colors.neutral.gray400 : theme.colors.primary.main
  };
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  transition: ${theme.transitions.normal};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  
  &:hover:not(:disabled) {
    background-color: ${theme.colors.primary.light};
  }
  
  &:active:not(:disabled) {
    background-color: ${theme.colors.primary.dark};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
`;
