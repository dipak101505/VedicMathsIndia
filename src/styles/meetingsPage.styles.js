import styled from 'styled-components';
import { theme } from './theme';

// Main Container Styles
export const MainContainer = styled.div`
  padding-top: 10px;
  padding: 32px;
  max-width: 1200px;
  margin: 10px auto;
  min-height: 80vh;
  background-color: ${theme.colors.background.light};
`;

export const GridContainer = styled.div`
  display: grid;
  gap: 32px;
  grid-template-columns: ${props => props.isAdmin ? '1fr 1fr' : '1fr'};
  align-items: start;
`;

// Admin Panel Styles
export const AdminPanel = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const FormSection = styled.div`
  margin-bottom: 24px;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid ${theme.colors.borderColor};
  background-color: ${theme.colors.inputBackground};
  color: ${theme.colors.text.primary};
  font-size: 15px;
  transition: all 0.2s ease;
  outline: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:focus {
    border-color: ${theme.colors.primary.main};
    background-color: white;
    box-shadow: 0 0 0 3px rgba(255, 166, 0, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid ${theme.colors.borderColor};
  background-color: ${theme.colors.inputBackground};
  color: ${theme.colors.text.primary};
  font-size: 15px;
  transition: all 0.2s ease;
  outline: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:focus {
    border-color: ${theme.colors.primary.main};
    background-color: white;
    box-shadow: 0 0 0 3px rgba(255, 166, 0, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const StreamButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${props => props.isActive ? theme.colors.error.main : theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const StatusMessage = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: ${theme.colors.success.light};
  border-radius: 8px;
  border: 1px solid ${theme.colors.success.main};
  color: ${theme.colors.success.main};
  font-size: 14px;
  text-align: center;
`;

// Main Content Panel
export const MainPanel = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Access Denied Message
export const AccessDeniedMessage = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${theme.colors.text.secondary};
  font-size: 16px;
  background-color: ${theme.colors.background.light};
  border-radius: 8px;
  border: 1px solid ${theme.colors.borderColor};
`;

// Class Info Panel
export const ClassInfoPanel = styled.div`
  margin-bottom: 20px;
  padding-top: 0px;
  padding: 16px;
  background-color: ${theme.colors.info.light};
  border-radius: 8px;
  border: 1px solid ${theme.colors.info.main};
`;

export const ClassTitle = styled.h2`
  font-size: 20px;
  color: ${theme.colors.info.main};
  margin-bottom: 8px;
`;

export const ClassSubtitle = styled.p`
  font-size: 16px;
  color: ${theme.colors.info.dark};
  margin: 0;
  padding-left: 2px;
`;

// Meeting Controls
export const MeetingControls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const MeetingButton = styled.button`
  padding: 12px 24px;
  background-color: ${props => props.variant === 'primary' ? theme.colors.primary.main : 
                       props.variant === 'info' ? theme.colors.info.main : 
                       props.variant === 'disabled' ? theme.colors.borderColor : theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 16px;
  flex: 1;
  min-width: 150px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

// Instructions Panel
export const InstructionsPanel = styled.div`
  padding: 12px;
  background-color: ${theme.colors.info.light};
  border: 1px solid ${theme.colors.info.main};
  border-radius: 8px;
  margin-bottom: 16px;
`;

export const InstructionsTitle = styled.h4`
  margin: 0 0 8px 0;
  color: ${theme.colors.info.main};
`;

export const InstructionsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: ${theme.colors.info.dark};
  font-size: 14px;
`;

// Transcript Modal
export const TranscriptModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const TranscriptContent = styled.div`
  background-color: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  position: relative;
  min-width: 500px;
`;

export const TranscriptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const TranscriptTitle = styled.h2`
  margin: 0;
  color: ${theme.colors.text.primary};
`;

export const CloseButton = styled.button`
  background-color: ${theme.colors.error.main};
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

export const TranscriptInfo = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  background-color: ${theme.colors.info.light};
  border-radius: 8px;
`;

export const TranscriptRoomTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${theme.colors.info.main};
`;

export const TranscriptMessage = styled.p`
  margin: 0;
  color: ${theme.colors.info.dark};
`;

export const InstructionsSection = styled.div`
  margin-bottom: 16px;
`;

export const InstructionsSectionTitle = styled.h4`
  color: ${theme.colors.text.secondary};
  margin-bottom: 12px;
`;

export const InstructionsSectionList = styled.ul`
  color: ${theme.colors.text.secondary};
  padding-left: 20px;
`;

export const DownloadButton = styled.a`
  padding: 12px 24px;
  background-color: ${theme.colors.success.main};
  color: white;
  text-decoration: none;
  border-radius: 8px;
  display: inline-block;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

// Upload Section
export const UploadSection = styled.div`
  margin-top: 24px;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const UploadTitle = styled.h3`
  margin-bottom: 16px;
  color: ${theme.colors.text.primary};
`;

export const UploadArea = styled.div`
  border: 2px dashed ${theme.colors.borderColor};
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  background-color: ${theme.colors.background.light};
  margin-bottom: 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary.main};
    background-color: ${theme.colors.primary.light}10;
  }
`;

export const UploadIcon = styled.svg`
  margin-bottom: 8px;
  stroke: ${theme.colors.primary.main};
`;

export const UploadText = styled.div`
  color: ${theme.colors.text.secondary};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${theme.colors.background.light};
  border-radius: 2px;
  margin-bottom: 16px;
`;

export const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: ${theme.colors.primary.main};
  border-radius: 2px;
  transition: width 0.3s ease;
`;

export const UploadButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${props => !props.hasFile || props.isUploading ? theme.colors.borderColor : theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${props => !props.hasFile || props.isUploading ? 'not-allowed' : 'pointer'};
  font-size: 15px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const SuccessMessage = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: ${theme.colors.success.light};
  color: ${theme.colors.success.main};
  border-radius: 8px;
  text-align: center;
`;

export const ErrorMessage = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: ${theme.colors.error.light};
  color: ${theme.colors.error.main};
  border-radius: 8px;
  text-align: center;
`;

// Hidden file input
export const HiddenFileInput = styled.input`
  display: none;
`;

// File upload label
export const FileUploadLabel = styled.label`
  cursor: pointer;
`;
