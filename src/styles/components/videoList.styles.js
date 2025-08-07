import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Main container for the video list page
export const VideoListContainer = styled.div`
  padding: 24px;
  background-color: #f8f9fa;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
`;

// Header section
export const VideoListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
  border-bottom: 2px solid #e9ecef;
`;

export const Title = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
`;

export const Subtitle = styled.p`
  color: #6c757d;
  font-size: 1.1rem;
  margin: 8px 0 0 0;
`;

// Search and filter section
export const SearchFilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  align-items: center;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #6c757d;
  }
`;

export const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  min-width: 150px;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

export const ActionButton = styled.button`
  padding: 12px 24px;
  background-color: ${props => props.variant === 'primary' ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#0056b3' : '#545b62'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Video grid section
export const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

export const VideoCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

export const VideoThumbnail = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${props => props.bgImage ? `url(${props.bgImage})` : '#e9ecef'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PlayButton = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(0, 123, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 123, 255, 1);
    transform: scale(1.1);
  }
`;

export const VideoInfo = styled.div`
  padding: 20px;
`;

export const VideoTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const VideoDescription = styled.p`
  color: #6c757d;
  font-size: 14px;
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
  font-size: 12px;
  color: #6c757d;
`;

export const VideoDuration = styled.span`
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
`;

export const VideoDate = styled.span`
  font-weight: 500;
`;

// File item components
export const FileItemContainer = styled.div`
  padding: 10px;
  margin-top: 5px;
  background-color: ${props => props.isHovered ? '#f8f9fa' : '#fff'};
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${props => props.isHovered 
    ? '0 2px 4px rgba(0,0,0,0.1)' 
    : '0 1px 3px rgba(0,0,0,0.1)'};
  transition: all 0.2s ease-in-out;
  border: 1px solid ${props => props.isHovered ? '#e2e8f0' : 'transparent'};
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
  color: #333;
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
  color: ${props => props.isHovered ? '#4a5568' : '#666'};
`;

export const FileActionButton = styled.button`
  padding: 6px 12px;
  background-color: ${props => {
    if (props.variant === 'test') return '#ffa600';
    if (props.variant === 'delete') return props.isHovered ? '#c82333' : '#dc3545';
    return '#007bff';
  }};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

// Section components
export const ContentWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const VideoSectionContainer = styled.div`
  flex: 0 0 20%;
  min-width: 0; /* Prevents flex item from overflowing */
  height: calc(100vh - 160px); /* Adjusted for new container padding */
  overflow-y: auto; /* Enable internal scrolling */
  padding: 0 8px; /* Add some padding for better spacing */
  
  @media (max-width: 768px) {
    height: calc(100vh - 200px);
    flex: 0 0 100%;
    margin-bottom: 16px;
  }
`;

export const AdjacentContainer = styled.div`
  flex: 0 0 80%;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0;
  height: calc(100vh - 160px); /* Adjusted for new container padding */
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none; /* Hide adjacent container on mobile - videos navigate directly */
  }
`;

export const AdjacentHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  }
  
  &.active {
    background: linear-gradient(135deg, #4f5bd5 0%, #5e397e 100%);
  }
`;

// Tab-style navigation for adjacent container
export const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
`;

export const Tab = styled.div`
  padding: clamp(8px, 1vh, 15px) clamp(15px, 2vw, 30px);
  cursor: pointer;
  font-weight: 500;
  font-size: clamp(12px, 1.2vw, 16px);
  color: #6c757d;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: clamp(4px, 0.8vw, 10px);
  
  &:hover {
    color: #495057;
    background-color: #e9ecef;
  }
  
  &.active {
    color: #f59e0b;
    border-bottom-color: #f59e0b;
    background-color: #ffffff;
    font-weight: 600;
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
  background-color: #ffffff;
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
  margin-right: 8px;
  font-size: 16px;
`;

export const ToggleIcon = styled.span`
  font-size: 12px;
  transition: transform 0.2s ease;
  
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
  background-color: ${props => props.level === 'batch' ? '#f8f9fa' : '#fff'};
  cursor: pointer;
  border-radius: ${props => props.level === 'batch' ? '5px' : '4px'};
  display: flex;
  align-items: center;
  font-weight: ${props => {
    if (props.level === 'batch') return 'bold';
    if (props.level === 'subject') return '500';
    return 'normal';
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
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

export const TopicTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  flex: 1;
`;

export const ExpandIcon = styled.span`
  transform: ${props => props.expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.3s;
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
  padding: 6px 6px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  margin-left: 16px;
  width: 80px;
`;

export const AddSimulationButton = styled.button`
  padding: 6px 12px;
  background-color: #ffa600;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: fit-content;
  min-width: 140px;
  margin-left: 16px;

  &:hover {
    background-color: #f59e0b;
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
  font-weight: 600;
  margin-bottom: 16px;
  color: #2c3e50;
`;
export const SimulationControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

export const SimulationField = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
`;

export const SimulationLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #4a5568;
`;

export const SimulationSelect = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e0;
  background-color: ${props => props.disabled ? '#f1f5f9' : 'white'};
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  width: 100%;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

export const SimulationButtonContainer = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const SimulationButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.disabled ? '#e2e8f0' : '#ffa600'};
  color: ${props => props.disabled ? '#a0aec0' : 'white'};
  border: none;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: 500;
  transition: all 0.2s ease;
  height: 38px;

  &:hover {
    background-color: ${props => !props.disabled && '#f59e0b'};
  }
`;

export const SimulationFrame = styled.div`
  width: 98vw;
  max-width: calc(80vw - 40px);
  height: 70vh;
  min-height: 40vh;
  max-height: 75vh;
  margin: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
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
  background-color: #fff3e0;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid #ffd699;

  span {
    color: #f59e0b;
    font-size: 14px;
    font-weight: 500;
  }
`;

// Text and utility components
export const SearchResultText = styled.span`
  color: #6c757d;
  margin-left: 16px;
  font-size: 0.9rem;
`;

export const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: #dc2626;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 20px;
  font-size: 16px;
`;

export const LoadingText = styled.p`
  margin: ${props => props.primary ? '0 0 8px 0' : '0'};
  font-weight: ${props => props.primary ? '500' : 'normal'};
  font-size: ${props => props.secondary ? '0.9rem' : '1rem'};
  opacity: ${props => props.secondary ? 0.8 : 1};
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ffa600;
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
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

export const AdminInput = styled.input`
  width: 64px;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  font-size: 14px;
  height: 40px;
  margin-left: 10px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const SaveButton = styled.button`
  max-width: 20vw;
  background-color: orange;
  color: white;
  padding: 10px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f59e0b;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #9ca3af;
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
  background-color: #f8f9fa;
  color: #6c757d;
  font-size: 1.1rem;
  text-align: center;
  padding: 20px;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
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
  margin-top: 32px;
`;

export const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  background-color: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: #007bff;
    background-color: ${props => props.active ? '#0056b3' : '#f8f9fa'};
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
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.3s ease;

  &:hover {
    color: #dc3545;
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
      gap: 16px;
    }
    
    ${Title} {
      font-size: 2rem;
    }
  }
  
  @media (max-width: 480px) {
    ${VideoListContainer} {
      padding: 16px;
    }
    
    ${Title} {
      font-size: 1.75rem;
    }
    
    ${VideoInfo} {
      padding: 16px;
    }
  }
`;