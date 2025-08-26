import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from './theme';

// Main container for the video list page
export const VideoListContainer = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background.secondary};
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
`;

// Header section
export const VideoListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.xl} 0;
  border-bottom: 2px solid ${theme.colors.border.medium};
`;

export const Title = styled.h1`
  color: ${theme.colors.text.primary};
  font-size: 2.5rem;
  font-weight: ${theme.typography.fontWeights.semibold};
  margin: 0;
`;

export const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: 1.1rem;
  margin: ${theme.spacing.sm} 0 0 0;
`;

// Search and filter section
export const SearchFilterSection = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  align-items: center;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: ${theme.spacing.md} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSizes.base};
  transition: border-color ${theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}1a;
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

export const FilterSelect = styled.select`
  padding: ${theme.spacing.md} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.background.primary};
  min-width: 150px;
  cursor: pointer;
  transition: border-color ${theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}1a;
  }
`;

export const ActionButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${props => props.variant === 'primary' ? theme.colors.primary.main : theme.colors.neutral.gray600};
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background-color: ${props => props.variant === 'primary' ? theme.colors.primary.dark : theme.colors.neutral.gray700};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:disabled {
    background-color: ${theme.colors.neutral.gray300};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Video grid section
export const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

export const VideoCard = styled.div`
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
  transition: all ${theme.transitions.normal};
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
  }
`;

export const VideoThumbnail = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${props => props.bgImage ? `url(${props.bgImage})` : theme.colors.border.medium};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PlayButton = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.round};
  background-color: ${theme.colors.primary.main}e6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary.contrast};
  font-size: ${theme.typography.fontSizes['2xl']};
  transition: all ${theme.transitions.normal};

  &:hover {
    background-color: ${theme.colors.primary.main};
    transform: scale(1.1);
  }
`;

export const VideoInfo = styled.div`
  padding: ${theme.spacing.xl};
`;

export const VideoTitle = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: ${theme.typography.fontWeights.semibold};
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const VideoDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
  line-height: 1.5;
  margin: 0 0 12px 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

export const VideoMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.typography.fontSizes.xs};
  color: ${theme.colors.text.secondary};
`;

export const VideoDuration = styled.span`
  background-color: ${theme.colors.background.secondary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.fontWeights.medium};
`;

export const VideoDate = styled.span`
  font-weight: ${theme.typography.fontWeights.medium};
`;

// File item components
export const FileItemContainer = styled.div`
  padding: ${theme.spacing.sm};
  margin-top: 5px;
  background-color: ${props => props.isHovered ? theme.colors.background.secondary : theme.colors.background.primary};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${props => props.isHovered 
    ? theme.shadows.sm
    : '0 1px 3px rgba(0,0,0,0.1)'};
  transition: all ${theme.transitions.fast};
  border: 1px solid ${props => props.isHovered ? theme.colors.border.light : 'transparent'};
`;

export const FileContentRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

export const FileIcon = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

export const FileLink = styled(Link)`
  text-decoration: none;
  width: 100%;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
`;

export const FileMetaContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const FileActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const FileMetaInfo = styled.div`
  font-size: 12px;
  color: ${props => props.isHovered ? theme.colors.neutral.gray600 : theme.colors.neutral.gray500};
`;

export const FileActionButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: ${props => {
    if (props.variant === 'test') return theme.colors.primary.light;
    if (props.variant === 'delete') return props.isHovered ? theme.colors.error.dark : theme.colors.error.main;
    return theme.colors.primary.main;
  }};
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

// Section components
export const ContentWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: 20px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

export const VideoSectionContainer = styled.div`
  flex: 0 0 20%;
  min-width: 0; /* Prevents flex item from overflowing */
  height: calc(100vh - 160px); /* Adjusted for new container padding */
  overflow-y: auto; /* Enable internal scrolling */
  padding: 0 ${theme.spacing.sm}; /* Add some padding for better spacing */
  
  @media (max-width: 768px) {
    height: calc(100vh - 200px);
    flex: 0 0 100%;
    margin-bottom: ${theme.spacing.md};
  }
`;

export const AdjacentContainer = styled.div`
  flex: 0 0 80%;
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  padding: 0;
  height: calc(100vh - 160px); /* Adjusted for new container padding */
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none; /* Hide adjacent container on mobile - videos navigate directly */
  }
`;

export const AdjacentHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%);
  color: ${theme.colors.primary.contrast};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-weight: ${theme.typography.fontWeights.semibold};
  font-size: ${theme.typography.fontSizes.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${theme.colors.border.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.primary.dark} 0%, ${theme.colors.neutral.gray800} 100%);
  }
  
  &.active {
    background: linear-gradient(135deg, ${theme.colors.neutral.gray800} 0%, ${theme.colors.neutral.gray900} 100%);
  }
`;

// Tab-style navigation for adjacent container
export const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${theme.colors.border.medium};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
`;

export const Tab = styled.div`
  padding: clamp(8px, 1vh, 15px) clamp(15px, 2vw, 30px);
  cursor: pointer;
  font-weight: ${theme.typography.fontWeights.medium};
  font-size: clamp(12px, 1.2vw, 16px);
  color: ${theme.colors.text.secondary};
  border-bottom: 3px solid transparent;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: clamp(4px, 0.8vw, 10px);
  
  &:hover {
    color: ${theme.colors.neutral.gray600};
    background-color: ${theme.colors.border.light};
  }
  
  &.active {
    color: ${theme.colors.primary.main};
    border-bottom-color: ${theme.colors.primary.main};
    background-color: ${theme.colors.background.primary};
    font-weight: ${theme.typography.fontWeights.semibold};
  }
  
  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 13px;
    gap: 6px;
  }
  
  @media (min-width: 1200px) {
    padding: 12px 25px;
    font-size: 15px;
    gap: 8px;
  }
`;

export const TabIcon = styled.span`
  font-size: clamp(14px, 1.5vw, 18px);
`;

export const AdjacentContent = styled.div`
  padding: clamp(15px, 1.5vw, 25px);
  flex: 1;
  overflow-y: auto;
  background-color: ${theme.colors.background.primary};
  height: calc(100vh - 12vh);
  
  &.hidden {
    display: none;
  }
  
  /* Reduce bottom padding for simulation section to maximize iframe space */
  &.simulation-content {
    padding: clamp(10px, 1vw, 20px);
    height: calc(100vh - 10vh);
  }
  
  @media (max-width: 768px) {
    padding: clamp(12px, 2vw, 20px);
    height: calc(100vh - 15vh);
    
    &.simulation-content {
      padding: clamp(8px, 1.5vw, 15px);
      height: calc(100vh - 12vh);
    }
  }
  
  @media (min-width: 1200px) {
    padding: 20px;
    
    &.simulation-content {
      padding: 15px;
    }
  }
`;

export const HeaderIcon = styled.span`
  margin-right: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSizes.base};
`;

export const ToggleIcon = styled.span`
  font-size: 12px;
  transition: transform ${theme.transitions.fast};
  
  &.collapsed {
    transform: rotate(-90deg);
  }
`;

export const SectionContainer = styled.div`
  margin-bottom: 20px;
`;

export const SectionHeader = styled.div`
  padding: ${props => {
    if (props.level === 'batch') return '10px';
    if (props.level === 'subject') return '8px';
    return '6px';
  }};
  background-color: ${props => props.level === 'batch' ? theme.colors.background.secondary : theme.colors.background.primary};
  cursor: pointer;
  border-radius: ${props => props.level === 'batch' ? '5px' : theme.borderRadius.sm};
  display: flex;
  align-items: center;
  font-weight: ${props => {
    if (props.level === 'batch') return theme.typography.fontWeights.bold;
    if (props.level === 'subject') return theme.typography.fontWeights.medium;
    return theme.typography.fontWeights.normal;
  }};
`;

export const SectionContent = styled.div`
  margin-left: ${props => props.level === 'topic' ? '30px' : '20px'};
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
`;

export const TopicTitle = styled.div`
  font-size: 14px;
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.neutral.gray600};
  flex: 1;
`;

export const ExpandIcon = styled.span`
  transform: ${props => props.expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform ${theme.transitions.normal};
  display: inline-block;
  margin-right: 10px;
`;

export const SubjectSectionContainer = styled.div`
  margin-top: 10px;
`;

export const TopicSectionContainer = styled.div`
  margin-top: 10px;
`;

// Modal row container
export const ModalButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const RemoveSimulationButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.xs};
  background-color: ${theme.colors.error.main};
  color: ${theme.colors.error.contrast};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-left: ${theme.spacing.md};
  width: 80px;
`;

export const AddSimulationButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  transition: all ${theme.transitions.fast};
  box-shadow: ${theme.shadows.sm};
  width: fit-content;
  min-width: 140px;
  margin-left: ${theme.spacing.md};

  &:hover {
    background-color: ${theme.colors.primary.dark};
    transform: translateY(-1px);
  }
`;

// Simulation components
export const SimulationSection = styled.div`
  margin-top: 30px;
  margin-bottom: 20px;
`;

export const SimulationHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: ${theme.typography.fontWeights.semibold};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
`;

export const SimulationControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: 20px;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
`;

export const SimulationField = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
`;

export const SimulationLabel = styled.label`
  font-size: 14px;
  font-weight: ${theme.typography.fontWeights.medium};
  margin-bottom: 6px;
  color: ${theme.colors.neutral.gray600};
`;

export const SimulationSelect = styled.select`
  padding: 8px 12px;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.medium};
  background-color: ${props => props.disabled ? theme.colors.neutral.gray100 : theme.colors.background.primary};
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}1a;
  }
`;

export const SimulationButtonContainer = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const SimulationButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.disabled ? theme.colors.border.light : theme.colors.primary.main};
  color: ${props => props.disabled ? theme.colors.neutral.gray400 : theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: all ${theme.transitions.fast};
  height: 38px;

  &:hover {
    background-color: ${props => !props.disabled && theme.colors.primary.dark};
  }
`;

export const SimulationFrame = styled.div`
  width: 98vw;
  max-width: calc(80vw - 40px);
  height: 70vh;
  min-height: 40vh;
  max-height: 75vh;
  margin: 0;
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  
  @media (max-width: 768px) {
    width: 95vw;
    max-width: 90vw;
    height: 50vh;
    min-height: 35vh;
    max-height: 60vh;
  }
  
  @media (min-width: 1200px) {
    width: 100%;
    max-width: none;
    height: 75vh;
    min-height: 50vh;
    max-height: 80vh;
  }
`;

export const SimulationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  padding: 4px 12px;
  background-color: ${theme.colors.warningLight};
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid ${theme.colors.warning.light};

  span {
    color: ${theme.colors.warning.main};
    font-size: 14px;
    font-weight: ${theme.typography.fontWeights.medium};
  }
`;

// Text and utility components
export const SearchResultText = styled.span`
  color: ${theme.colors.text.secondary};
  margin-left: ${theme.spacing.md};
  font-size: 0.9rem;
`;

export const ErrorContainer = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.error.main};
  background-color: ${theme.colors.errorLight};
  border: 1px solid ${theme.colors.error.light};
  border-radius: ${theme.borderRadius.lg};
  margin: ${theme.spacing.xl};
  font-size: ${theme.typography.fontSizes.base};
`;

export const LoadingText = styled.p`
  margin: ${props => props.primary ? '0 0 8px 0' : '0'};
  font-weight: ${props => props.primary ? theme.typography.fontWeights.medium : theme.typography.fontWeights.normal};
  font-size: ${props => props.secondary ? '0.9rem' : '1rem'};
  opacity: ${props => props.secondary ? 0.8 : 1};
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.round};
  border: 3px solid ${theme.colors.neutral.gray200};
  border-top: 3px solid ${theme.colors.primary.main};
  margin-bottom: 20px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { 
      transform: rotate(0deg);
    }
    100% { 
      transform: rotate(360deg);
    }
  }
`;

// Admin components
export const AdminSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
  padding: 4px;
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

export const AdminInput = styled.input`
  width: 64px;
  padding: 8px 12px;
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.fast};
  font-size: 14px;
  height: 40px;
  margin-left: 10px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.info.main};
    box-shadow: 0 0 0 3px ${theme.colors.info.main}1a;
  }
`;

export const SaveButton = styled.button`
  max-width: 20vw;
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  padding: ${theme.spacing.sm};
  border-radius: 5px;
  border: none;
  cursor: pointer;
  margin-top: ${theme.spacing.xl};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: all ${theme.transitions.normal};

  &:hover {
    background-color: ${theme.colors.warning.dark};
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: ${theme.colors.neutral.gray400};
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }
`;

// Loading and empty states
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${theme.colors.background.secondary};
  color: ${theme.colors.text.secondary};
  font-size: 1.1rem;
  text-align: center;
  padding: ${theme.spacing.xl};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxxl} ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${theme.spacing.md};
  opacity: 0.5;
`;

export const EmptyStateText = styled.p`
  font-size: 1.1rem;
  margin: 0;
`;

// Pagination
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: ${theme.spacing.xl};
`;

export const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${theme.colors.border.medium};
  background-color: ${props => props.active ? theme.colors.primary.main : theme.colors.background.primary};
  color: ${props => props.active ? theme.colors.primary.contrast : theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeights.medium};
  transition: all ${theme.transitions.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background-color: ${props => props.active ? theme.colors.primary.dark : theme.colors.background.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal styles
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${theme.colors.background.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background: none;
  border: none;
  font-size: ${theme.typography.fontSizes['2xl']};
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  transition: color ${theme.transitions.normal};

  &:hover {
    color: ${theme.colors.error.main};
  }
`;

// Responsive styles
export const ResponsiveWrapper = styled.div`
  @media (max-width: 768px) {
    ${VideoGrid} {
      grid-template-columns: 1fr;
    }
    
    ${SearchFilterSection} {
      flex-direction: column;
      align-items: stretch;
    }
    
    ${SearchInput} {
      min-width: auto;
    }
    
    ${VideoListHeader} {
      flex-direction: column;
      align-items: flex-start;
      gap: ${theme.spacing.md};
    }
    
    ${Title} {
      font-size: 2rem;
    }
  }
  
  @media (max-width: 480px) {
    ${VideoListContainer} {
      padding: ${theme.spacing.md};
    }
    
    ${Title} {
      font-size: 1.75rem;
    }
    
    ${VideoInfo} {
      padding: ${theme.spacing.md};
    }
  }
`;

// Additional styled components for VideoListPage theme integration
export const SimulationModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${theme.colors.background.primary};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.xxl};
  box-shadow: ${theme.shadows.xl};
  z-index: 1000;
  min-width: 300px;
`;

export const ModalTitle = styled.h3`
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.lg};
  color: ${theme.colors.text.primary};
`;

export const ModalButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const ModalButton = styled.button`
  padding: ${theme.spacing.md};
  text-align: left;
  background-color: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  color: ${theme.colors.text.primary};
  
  &:hover {
    background-color: ${theme.colors.background.tertiary};
  }
`;

export const RemoveButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.sm};
  background-color: ${theme.colors.error.main};
  color: ${theme.colors.error.contrast};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-left: ${theme.spacing.md};
  width: 80px;
`;

export const ModalCloseButton = styled.button`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.neutral.gray200};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  color: ${theme.colors.text.secondary};
`;

export const VideoInfoContainer = styled.div`
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
`;

export const VideoInfoTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.primary};
`;

export const VideoPlayerContainer = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

export const VideoPlayerWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 380px);
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  background-color: ${theme.colors.neutral.black};
`;

export const VideoActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

export const FullPlayerButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.sm};
  cursor: pointer;
  width: 10%;
`;

export const LectureImageContainer = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

export const LectureImageTitle = styled.h5`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

export const LectureImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
`;

export const EmptyStateContainer = styled.div`
  text-align: center;
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
`;

export const EmptyStateTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text.primary};
`;

export const LoadingNotesContainer = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  color: ${theme.colors.text.secondary};
`;

export const ErrorNotesContainer = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.errorLight};
  color: ${theme.colors.error.dark};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.sm};
`;

export const NotesContainer = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

export const NotesTitle = styled.h4`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.primary};
`;

export const NotesContent = styled.div`
  font-size: ${theme.typography.fontSizes.sm};
  line-height: ${theme.typography.lineHeights.normal};
  color: ${theme.colors.text.secondary};
  background-color: ${theme.colors.background.secondary};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
  height: calc(100vh - 350px);
  overflow-y: auto;
`;

export const NoNotesContainer = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.warningLight};
  color: ${theme.colors.warning.dark};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.sm};
`;

export const PodcastInfoContainer = styled.div`
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
`;

export const PodcastInfoTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.primary};
`;

export const PodcastInfoText = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

export const AudioPlayerContainer = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
  margin-bottom: ${theme.spacing.md};
`;

export const AudioPlayer = styled.audio`
  width: 100%;
  height: 40px;
`;

export const PodcastDescriptionContainer = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
  font-size: ${theme.typography.fontSizes.sm};
  line-height: ${theme.typography.lineHeights.normal};
  color: ${theme.colors.text.secondary};
`;

export const PodcastDescriptionTitle = styled.h5`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.primary};
`;

export const PodcastDescriptionText = styled.p`
  margin: 0 0 ${theme.spacing.sm} 0;
`;

export const PodcastDescriptionMeta = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

// Enhanced Admin Controls Styling
export const AdminControlsSection = styled.div`
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.background.secondary} 100%);
  border: 2px solid ${theme.colors.primary.light};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.light} 100%);
  }
`;

export const AdminControlsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 2px solid ${theme.colors.border.light};
`;

export const AdminControlsIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%);
  border-radius: ${theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary.contrast};
  font-size: 18px;
  box-shadow: ${theme.shadows.sm};
`;

export const AdminControlsTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSizes.lg};
  font-weight: ${theme.typography.fontWeights.semibold};
  color: ${theme.colors.text.primary};
`;

export const AdminControlsSubtitle = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeights.normal};
`;

export const AdminSimulationFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

export const AdminFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  flex: 1;
  min-width: 0;
  margin-bottom: ${theme.spacing.sm};
`;

export const AdminFormLabel = styled.label`
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  display: block;
`;

export const AdminFormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.background.primary};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.sm};
  transition: all ${theme.transitions.fast};
  height: 38px;
  box-shadow: ${theme.shadows.sm};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}1a;
    transform: translateY(-1px);
  }

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }

  &:hover {
    border-color: ${theme.colors.border.medium};
  }
`;

export const AdminFormSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.background.primary};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.sm};
  transition: all ${theme.transitions.fast};
  height: 38px;
  cursor: pointer;
  box-shadow: ${theme.shadows.sm};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}1a;
    transform: translateY(-1px);
  }

  &:hover {
    border-color: ${theme.colors.border.medium};
  }

  &:disabled {
    background-color: ${theme.colors.neutral.gray100};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const AdminFormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
    gap: ${theme.spacing.xl};
  }
`;

export const AdminFormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.light};
`;

export const AdminButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%);
  color: ${theme.colors.primary.contrast};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  box-shadow: ${theme.shadows.sm};
  min-width: 140px;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, ${theme.colors.primary.dark} 0%, ${theme.colors.neutral.gray800} 100%);
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${theme.colors.neutral.gray400};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const AdminSecondaryButton = styled(AdminButton)`
  background: linear-gradient(135deg, ${theme.colors.neutral.gray500} 0%, ${theme.colors.neutral.gray600} 100%);
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.neutral.gray600} 0%, ${theme.colors.neutral.gray700} 100%);
  }
`;

export const AdminSuccessButton = styled(AdminButton)`
  background: linear-gradient(135deg, ${theme.colors.success.main} 0%, ${theme.colors.success.dark} 100%);
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.success.dark} 0%, ${theme.colors.neutral.gray800} 100%);
  }
`;

export const AdminWarningButton = styled(AdminButton)`
  background: linear-gradient(135deg, ${theme.colors.warning.main} 0%, ${theme.colors.warning.dark} 100%);
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.warning.dark} 0%, ${theme.colors.neutral.gray800} 100%);
  }
`;

export const AdminFormSection = styled.div`
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
`;

export const AdminFormSectionTitle = styled.h4`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const AdminFormSectionIcon = styled.span`
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSizes.lg};
`;

export const AdminFormHelpText = styled.p`
  margin: ${theme.spacing.sm} 0 0 0;
  font-size: ${theme.typography.fontSizes.xs};
  color: ${theme.colors.text.secondary};
  font-style: italic;
  line-height: 1.4;
`;

export const AdminFormError = styled.div`
  margin-top: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.errorLight};
  color: ${theme.colors.error.dark};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.xs};
  border-left: 3px solid ${theme.colors.error.main};
`;

export const AdminFormSuccess = styled.div`
  margin-top: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.successLight};
  color: ${theme.colors.success.dark};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.xs};
  border-left: 3px solid ${theme.colors.success.main};
`;

// Add back missing components
export const AddSimulationButtonContainer = styled.div`
  margin-top: ${theme.spacing.md};
`;

export const TooltipContent = styled.div`
  .tooltip-content {
    .text-xs {
      .mt-1 {
        .mt-2 {
          border-top: 1px solid ${theme.colors.border.light};
          padding-top: ${theme.spacing.sm};
        }
      }
    }
  }
`;

export const ExamName = styled.div`
  font-weight: ${theme.typography.fontWeights.semibold};
  font-size: ${theme.typography.fontSizes.lg};
  margin-bottom: ${theme.spacing.sm};
`;

export const SectionName = styled.div`
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.primary.main};
  padding-bottom: 2px;
  margin-bottom: 4px;
`;

export const StatisticsContainer = styled.div`
  margin-top: ${theme.spacing.sm};
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
`;

export const StatisticsTitle = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
`;

export const StatisticsMeta = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.xs};
  margin-top: ${theme.spacing.sm};
`;

