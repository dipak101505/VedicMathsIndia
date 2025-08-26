import styled from "styled-components";
import { Link } from "react-router-dom";
import { theme } from "./theme";

// Layout Components
export const SignupContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100vh;
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.xl};
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const FormContainer = styled.div`
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  margin-top: ${theme.spacing.md};
`;

export const RightImageContainer = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

// Header Components
export const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  margin-top: 0;
`;

export const Title = styled.h2`
  color: ${theme.colors.text.secondary};
  margin-top: 0;
  font-size: ${theme.typography.fontSizes["2xl"]};
  font-weight: ${theme.typography.fontWeights.semibold};
`;

// Form Components
export const Form = styled.form`
  // Form styles
`;

export const FormSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

export const FormField = styled.div`
  // Field container styles
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeights.medium};
  font-size: ${theme.typography.fontSizes.sm};
`;

export const Input = styled.input`
  width: 80%;
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

export const Select = styled.select`
  width: 70%;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
  background-color: ${theme.colors.background.primary};
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

// Image Components
export const ImageSection = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

export const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 70%;
`;

export const ImagePreview = styled.img`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.round};
  object-fit: cover;
  border: 1px solid ${theme.colors.border.light};
`;

export const ImageButton = styled.button`
  width: 70%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${props => props.hovered ? theme.colors.primary.main : 'transparent'};
  color: ${props => props.hovered ? theme.colors.primary.contrast : theme.colors.primary.main};
  border: 1px solid ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  
  &:hover {
    background-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.contrast};
  }
`;

export const RightImage = styled.img`
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  border-radius: ${theme.borderRadius.lg};
`;

// Button Components
export const SubmitButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${props => props.hovered ? theme.colors.background.primary : theme.colors.primary.main};
  color: ${props => props.hovered ? theme.colors.primary.main : theme.colors.primary.contrast};
  border: ${props => props.hovered ? `1px solid ${theme.colors.primary.main}` : 'none'};
  border-radius: ${theme.borderRadius.sm};
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: ${theme.transitions.normal};
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  
  &:disabled {
    background-color: ${theme.colors.neutral.gray400};
    border-color: ${theme.colors.neutral.gray400};
    cursor: not-allowed;
  }
`;

// Text Components
export const ErrorMessage = styled.div`
  color: ${theme.colors.error.main};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.sm};
`;

export const LoginLink = styled.div`
  margin-top: ${theme.spacing.md};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.base};
`;

export const StyledLink = styled(Link)`
  color: ${theme.colors.primary.main};
  text-decoration: none;
  font-weight: ${theme.typography.fontWeights.medium};
  
  &:hover {
    color: ${theme.colors.primary.dark};
    text-decoration: underline;
  }
`;
