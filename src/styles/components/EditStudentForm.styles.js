import styled from "styled-components";
import { theme, getButtonStyles } from "../theme";

// Modal Overlay
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${theme.colors.background.overlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// Modal Content
export const ModalContent = styled.div`
  background-color: ${theme.colors.background.primary};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: ${theme.shadows.xl};
`;

// Close Button
export const CloseButton = styled.button`
  position: absolute;
  right: ${theme.spacing.sm};
  top: ${theme.spacing.sm};
  background: none;
  border: none;
  font-size: ${theme.typography.fontSizes.xl};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  color: ${theme.colors.text.secondary};
  transition: ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

// Modal Title
export const ModalTitle = styled.h2`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes["2xl"]};
  font-weight: ${theme.typography.fontWeights.semibold};
  margin-bottom: ${theme.spacing.md};
`;

// Last Updated Text
export const LastUpdatedText = styled.div`
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

// Form Container
export const FormContainer = styled.form`
  // Form styles
`;

// Form Group
export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

// Form Label
export const FormLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeights.medium};
  font-size: ${theme.typography.fontSizes.base};
`;

// Form Input
export const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.inputBackground};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
  
  &:disabled {
    background-color: ${theme.colors.neutral.gray100};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

// Form Select
export const FormSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.inputBackground};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
  
  &[multiple] {
    height: 120px;
  }
`;

// Form Textarea
export const FormTextarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.inputBackground};
  min-height: 100px;
  resize: vertical;
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
`;

// Help Text
export const HelpText = styled.small`
  color: ${theme.colors.text.secondary};
  display: block;
  margin-top: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSizes.sm};
`;

// User Type Container
export const UserTypeContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

// User Type Label
export const UserTypeLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.base};
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 0;
  }
`;

// Status Container
export const StatusContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  margin-bottom: ${theme.spacing.xs};
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 0;
  }
`;

// Payment Type Container
export const PaymentTypeContainer = styled.div`
  margin-top: ${theme.spacing.xs};
`;

// Payment Type Label
export const PaymentTypeLabel = styled.label`
  margin-right: ${theme.spacing.lg};
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.base};
  
  input[type="radio"] {
    margin-right: ${theme.spacing.xs};
    margin: 0 ${theme.spacing.xs} 0 0;
  }
`;

// Image Preview Container
export const ImagePreviewContainer = styled.div`
  margin-top: ${theme.spacing.sm};
  text-align: center;
`;

// Image Preview
export const ImagePreview = styled.img`
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.sm};
  border: 2px solid ${theme.colors.border.light};
`;

// Upload Status
export const UploadStatus = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
`;

// Button Container
export const ButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

// Submit Button
export const SubmitButton = styled.button`
  ${getButtonStyles("primary", "md")}
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md} !important;
  
  &:disabled {
    background-color: ${theme.colors.neutral.gray400};
    border-color: ${theme.colors.neutral.gray400};
    cursor: not-allowed;
  }
`;

// Status Messages
export const StatusMessage = styled.div`
  margin-top: ${theme.spacing.sm};
  text-align: center;
  font-weight: ${theme.typography.fontWeights.medium};
  
  &.success {
    color: ${theme.colors.success.main};
  }
  
  &.error {
    color: ${theme.colors.error.main};
  }
`;

// Monthly Installment Input
export const MonthlyInstallmentInput = styled(FormInput)`
  margin-top: ${theme.spacing.xs};
`;
