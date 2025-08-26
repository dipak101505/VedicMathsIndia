import styled from "styled-components";
import { theme } from "../styles/theme";

// Layout Components
export const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

export const PageTitle = styled.h1`
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes["3xl"]};
  font-weight: ${theme.typography.fontWeights.bold};
`;

// Form Components
export const SelectorContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

export const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
  flex: 1;
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
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

export const DateInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
  flex: 1;
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
`;

export const FilterInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
`;

export const TopicInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
  flex: 1;
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  margin-left: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    margin-left: 0;
  }
`;

// Media Components
export const VideoContainer = styled.video`
  display: ${props => props.isActive ? "block" : "none"};
  width: 100%;
  max-width: 500px;
  margin: ${theme.spacing.xl} auto;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
`;

export const AttendancePhoto = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.sm};
  margin-left: auto;
  box-shadow: ${theme.shadows.sm};
`;

// Student List Components
export const StudentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

export const StudentCard = styled.div`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  background-color: ${props => 
    props.isPresent ? theme.colors.successLight : theme.colors.background.primary
  };
  transition: ${theme.transitions.fast};
  box-shadow: ${theme.shadows.sm};
  
  &:hover {
    box-shadow: ${theme.shadows.md};
  }
`;

export const StudentInfo = styled.div`
  flex: 1;
`;

export const StudentName = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

export const StudentEmail = styled.div`
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

// Interactive Components
export const CameraIcon = styled.div`
  font-size: ${theme.iconSize}px;
  color: ${theme.colors.info.main};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.info.dark};
    transform: scale(1.1);
  }
`;

export const StyledCheckbox = styled.input`
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: ${theme.colors.primary.main};
  
  &:checked {
    background-color: ${theme.colors.primary.main};
    border-color: ${theme.colors.primary.main};
  }
`;

// UI Components
export const NoStudentsMessage = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.base};
`;

export const SubmitButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: ${theme.transitions.fast};
  box-shadow: ${theme.shadows.sm};
  
  &:hover {
    background-color: ${theme.colors.warning.dark};
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

export const LoadingText = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.lg};
`;
