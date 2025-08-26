import styled from "styled-components";
import { theme, getButtonStyles } from "./theme";

// Main Container
export const UploadPageContainer = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${theme.colors.background.secondary};
`;

// Header Section
export const HeaderSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
`;

export const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSizes["2xl"]};
  color: ${theme.colors.text.primary};
  margin: 0;
  font-weight: ${theme.typography.fontWeights.semibold};
`;

export const PageSubtitle = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.base};
  margin: 0;
`;

// Form Container
export const FormContainer = styled.div`
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  max-width: 700px;
  margin: 0 auto;
`;

// Form Grid
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

// Form Field
export const FormField = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
`;

// Input Fields
export const StyledSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${theme.colors.border.light};
  background-color: ${theme.colors.inputBackground};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.base};
  transition: ${theme.transitions.normal};
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${theme.colors.primary.main};
    background-color: ${theme.colors.background.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

export const StyledInput = styled.input`
  width: 95%;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${theme.colors.border.light};
  background-color: ${theme.colors.inputBackground};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.base};
  transition: ${theme.transitions.normal};
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary.main};
    background-color: ${theme.colors.background.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
`;

// Topic Search Container
export const TopicSearchContainer = styled.div`
  margin-bottom: ${theme.spacing.md};
  position: relative;
`;

export const TopicDropdown = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background.primary};
  box-shadow: ${theme.shadows.sm};
  display: ${props => props.show ? "block" : "none"};
`;

export const TopicOption = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  cursor: pointer;
  transition: background-color ${theme.transitions.fast};
  background-color: ${props => props.selected ? theme.colors.background.secondary : theme.colors.background.primary};

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }
`;

export const AddTopicOption = styled(TopicOption)`
  border-top: 1px solid ${theme.colors.border.light};
  color: ${theme.colors.primary.main};
`;

// File Upload Area
export const FileUploadArea = styled.div`
  border: 2px dashed ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xl};
  text-align: center;
  background-color: ${theme.colors.inputBackground};
  cursor: pointer;
  transition: ${theme.transitions.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background-color: ${theme.colors.background.primary};
  }
`;

export const FileUploadInput = styled.input`
  display: none;
`;

export const FileUploadLabel = styled.label`
  cursor: pointer;
`;

export const UploadIcon = styled.div`
  margin-bottom: ${theme.spacing.sm};
`;

export const UploadText = styled.div`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

export const UploadSubtext = styled.div`
  color: ${theme.colors.text.disabled};
  font-size: ${theme.typography.fontSizes.sm};
`;

export const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
`;

export const RemoveFileButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: transparent;
  color: ${theme.colors.error.main};
  border: 1px solid ${theme.colors.error.main};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  transition: ${theme.transitions.normal};

  &:hover {
    background-color: ${theme.colors.errorLight};
  }
`;

// Error Message
export const ErrorMessage = styled.div`
  color: ${theme.colors.error.main};
  font-size: ${theme.typography.fontSizes.sm};
  margin-top: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

// Upload Progress
export const ProgressContainer = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${theme.colors.neutral.gray200};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: ${theme.colors.primary.main};
  transition: width 0.3s ease;
`;

export const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
`;

export const CancelUploadButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.error.main};
  border: 2px solid ${theme.colors.error.main};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: ${theme.transitions.normal};

  &:hover {
    background-color: ${theme.colors.error.main};
    color: ${theme.colors.error.contrast};
  }
`;

// Submit Button
export const SubmitButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${props => props.disabled ? theme.colors.neutral.gray400 : theme.colors.primary.main};
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  font-size: ${theme.typography.fontSizes.lg};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: ${theme.transitions.normal};
  margin-top: ${theme.spacing.sm};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px ${theme.colors.primary.main}20;
  }
`;

// Status Messages
export const StatusMessage = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  font-size: ${theme.typography.fontSizes.sm};
`;

export const SuccessMessage = styled(StatusMessage)`
  background-color: ${theme.colors.successLight};
  color: ${theme.colors.success.dark};
`;

export const ErrorStatusMessage = styled(StatusMessage)`
  background-color: ${theme.colors.errorLight};
  color: ${theme.colors.error.dark};
`;

// File Type Icons
export const FileIcon = styled.svg`
  width: 24px;
  height: 24px;
  stroke: ${props => props.fileType === "pdf" ? theme.colors.pdfIcon : theme.colors.videoIcon};
  stroke-width: 2;
`;

export const UploadIconSvg = styled.svg`
  width: 40px;
  height: 40px;
  stroke: ${theme.colors.primary.main};
  stroke-width: 2;
`;

export const ErrorIcon = styled.svg`
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 2;
`;
