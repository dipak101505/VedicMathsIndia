import styled from "styled-components";
import { Link } from "react-router-dom";
import { theme, getButtonStyles } from "./theme";

// Styled Components for StudentMeetingsPage
export const StudentMeetingsContainer = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.secondary};
  min-height: 100vh;
`;

export const PageTitle = styled.h1`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes["3xl"]};
  font-weight: ${theme.typography.fontWeights.bold};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.lg};
`;

export const MeetingsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

export const MeetingCard = styled.div`
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border.light};
  transition: ${theme.transitions.normal};
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

export const MeetingDetails = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

export const MeetingTitle = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.lg};
  font-weight: ${theme.typography.fontWeights.semibold};
  margin-bottom: ${theme.spacing.sm};
`;

export const MeetingInfo = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.base};
  margin-bottom: ${theme.spacing.xs};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const MeetingActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

export const JoinButton = styled.a`
  ${getButtonStyles("primary", "md")}
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const WatchRecordingButton = styled(Link)`
  ${getButtonStyles("secondary", "md")}
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  text-transform: capitalize;
  
  ${props => {
    switch (props.status) {
      case 'scheduled':
        return `
          background-color: ${theme.colors.infoLight};
          color: ${theme.colors.infoDark};
          border: 1px solid ${theme.colors.info.main};
        `;
      case 'completed':
        return `
          background-color: ${theme.colors.successLight};
          color: ${theme.colors.success.dark};
          border: 1px solid ${theme.colors.success.main};
        `;
      case 'cancelled':
        return `
          background-color: ${theme.colors.errorLight};
          color: ${theme.colors.error.dark};
          border: 1px solid ${theme.colors.error.main};
        `;
      default:
        return `
          background-color: ${theme.colors.neutral.gray100};
          color: ${theme.colors.neutral.gray700};
          border: 1px solid ${theme.colors.neutral.gray300};
        `;
    }
  }}
`;
