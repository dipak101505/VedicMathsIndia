import styled from 'styled-components';
import { theme } from '../theme';

// Container Components
export const ExamPageContainer = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.background.secondary} 100%);
  min-height: 100vh;
`;

export const ExamFormContainer = styled.div`
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xxl};
  margin-bottom: ${theme.spacing.xxl};
  box-shadow: ${theme.shadows.lg};
  border: 1px solid ${theme.colors.border.light};
  transition: ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.info.main});
  }
  
  &:hover {
    box-shadow: ${theme.shadows.xl};
    transform: translateY(-2px);
  }
`;

export const ExamsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
`;

// Typography Components
export const ExamFormTitle = styled.h2`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  margin-bottom: ${theme.spacing.xl};
  margin-top: 0;
  text-align: center;
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.info.main});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -${theme.spacing.md};
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.info.main});
    border-radius: 2px;
  }
`;

export const ExamsTitle = styled.h2`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes['2xl']};
  font-weight: ${theme.typography.fontWeights.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  &::before {
    content: '📚';
    font-size: ${theme.typography.fontSizes.xl};
  }
`;

// Form Components
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const FormLabel = styled.label`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeights.semibold};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.base};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  &::before {
    content: '•';
    color: ${theme.colors.primary.main};
    font-weight: bold;
    font-size: ${theme.typography.fontSizes.lg};
  }
  
  input, select {
    margin-top: ${theme.spacing.sm};
  }
`;

export const FormInput = styled.input`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSizes.base};
  background: ${theme.colors.background.primary};
  transition: ${theme.transitions.normal};
  box-shadow: ${theme.shadows.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 4px ${theme.colors.primary.main}20;
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: ${theme.colors.border.medium};
    box-shadow: ${theme.shadows.md};
  }
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
    font-style: italic;
  }
`;

export const FormSelect = styled.select`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSizes.base};
  background: ${theme.colors.background.primary};
  transition: ${theme.transitions.normal};
  box-shadow: ${theme.shadows.sm};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.md} center;
  background-size: 16px;
  padding-right: ${theme.spacing.xxl};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 4px ${theme.colors.primary.main}20;
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: ${theme.colors.border.medium};
    box-shadow: ${theme.shadows.md};
  }
`;

// Sections Components
export const SectionsContainer = styled.div`
  grid-column: 1 / -1;
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
`;

export const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

export const SectionCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  background: ${theme.colors.background.primary};
  font-weight: ${theme.typography.fontWeights.medium};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${theme.colors.primary.main}10, transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: ${theme.colors.background.secondary};
    border-color: ${theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
    
    &::before {
      left: 100%;
    }
  }
  
  input[type="checkbox"]:checked + span {
    color: ${theme.colors.primary.main};
    font-weight: ${theme.typography.fontWeights.semibold};
  }
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

export const CheckboxInput = styled.input`
  margin: 0;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: ${theme.colors.primary.main};
`;

// Button Components
export const BlueButton = styled.button`
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.info.main});
  color: ${theme.colors.primary.contrast};
  border: none;
  padding: ${theme.spacing.lg} ${theme.spacing.xxl};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSizes.lg};
  font-weight: ${theme.typography.fontWeights.semibold};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  box-shadow: ${theme.shadows.md};
  position: relative;
  overflow: hidden;
  display: block;
  margin: 0 auto;
  min-width: 200px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${theme.shadows.xl};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.lg};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px ${theme.colors.primary.main}40;
  }
`;

// Filter Components
export const FilterContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeights.medium};
  background: ${theme.colors.background.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
`;

export const FilterSelect = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.sm};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
  
  &:hover {
    border-color: ${theme.colors.primary.main};
  }
`;

// Status Components
export const Loading = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.lg};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
  
  &::before {
    content: '⏳';
    display: block;
    font-size: ${theme.typography.fontSizes['3xl']};
    margin-bottom: ${theme.spacing.md};
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const NoExams = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.lg};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
  
  &::before {
    content: '📝';
    display: block;
    font-size: ${theme.typography.fontSizes['3xl']};
    margin-bottom: ${theme.spacing.md};
  }
`;

// Table Components
export const ExamsTableContainer = styled.div`
  overflow-x: auto;
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.lg};
  background: ${theme.colors.background.primary};
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.medium};
    border-radius: 4px;
    
    &:hover {
      background: ${theme.colors.border.dark};
    }
  }
`;

export const ExamsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.background.primary};
`;

export const TableHeader = styled.tr`
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.info.main});
  
  th {
    padding: ${theme.spacing.lg};
    text-align: left;
    border-bottom: 2px solid ${theme.colors.primary.dark};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.primary.contrast};
    font-size: ${theme.typography.fontSizes.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: ${theme.colors.background.primary};
      opacity: 0.3;
    }
  }
`;

export const TableRow = styled.tr`
  transition: ${theme.transitions.normal};
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:hover {
    background: ${theme.colors.background.secondary};
    transform: scale(1.01);
    box-shadow: ${theme.shadows.md};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  td {
    padding: ${theme.spacing.lg};
    color: ${theme.colors.text.primary};
    font-size: ${theme.typography.fontSizes.sm};
    vertical-align: middle;
  }
`;

export const ClickableCell = styled.td`
  cursor: pointer;
  position: relative;
  transition: ${theme.transitions.normal};
  font-weight: ${theme.typography.fontWeights.medium};
  
  &:hover {
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.primary.main};
  }
  
  &::before {
    content: '👆';
    position: absolute;
    left: -${theme.spacing.lg};
    opacity: 0;
    transition: ${theme.transitions.normal};
    font-size: ${theme.typography.fontSizes.sm};
  }
  
  &:hover::before {
    opacity: 1;
    left: -${theme.spacing.md};
  }
`;

// Status Badge
export const SubmittedBadge = styled.div`
  position: absolute;
  top: 50%;
  right: ${theme.spacing.md};
  transform: translateY(-50%);
  background: linear-gradient(135deg, ${theme.colors.success.main}, ${theme.colors.success.light});
  color: ${theme.colors.success.contrast};
  font-size: ${theme.typography.fontSizes.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: ${theme.shadows.sm};
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: translateY(-50%) scale(1); }
    50% { transform: translateY(-50%) scale(1.05); }
  }
`;

// Action Buttons
export const ActionButton = styled.button`
  padding: ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${theme.transitions.normal};
  font-size: ${theme.typography.fontSizes.sm};
  box-shadow: ${theme.shadows.sm};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    
    &::before {
      left: 100%;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
`;

export const DeleteButton = styled(ActionButton)`
  background: linear-gradient(135deg, ${theme.colors.error.main}, ${theme.colors.error.light});
  color: ${theme.colors.error.contrast};
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.error.light}, ${theme.colors.error.main});
  }
`;

export const ViewResultsButton = styled(ActionButton)`
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.light});
  color: ${theme.colors.primary.contrast};
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.primary.light}, ${theme.colors.primary.main});
  }
  
  &:disabled {
    background: ${theme.colors.neutral.gray400};
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
  }
`;

export const DownloadButton = styled(ActionButton)`
  background: linear-gradient(135deg, ${theme.colors.success.main}, ${theme.colors.success.light});
  color: ${theme.colors.success.contrast};
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.success.light}, ${theme.colors.success.main});
  }
  
  &:disabled {
    background: ${theme.colors.neutral.gray400};
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
  }
`;

export const ApplyButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  box-shadow: ${theme.shadows.sm};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
    
    &::before {
      left: 100%;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
`;

export const AppliedButton = styled(ApplyButton)`
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.light});
  color: ${theme.colors.primary.contrast};
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.primary.light}, ${theme.colors.primary.main});
  }
`;

export const ReviewButton = styled(ApplyButton)`
  background: linear-gradient(135deg, ${theme.colors.warning.main}, ${theme.colors.warning.light});
  color: ${theme.colors.warning.contrast};
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.warning.light}, ${theme.colors.warning.main});
  }
`;

export const ReviewedButton = styled(ApplyButton)`
  background: linear-gradient(135deg, ${theme.colors.success.main}, ${theme.colors.success.light});
  color: ${theme.colors.success.contrast};
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.success.light}, ${theme.colors.success.main});
  }
`;

// Action Button Container
export const ActionButtonContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
  justify-content: center;
`;

export const ApplyButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;
