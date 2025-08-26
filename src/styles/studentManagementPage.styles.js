import styled from "styled-components";
import { theme, getButtonStyles } from "./theme";

// Page Container
export const PageContainer = styled.div`
  padding: ${theme.spacing.xxl};
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${theme.colors.background.secondary};
`;

// Header Section
export const HeaderSection = styled.div`
  margin-bottom: ${theme.spacing.xxl};
  text-align: center;
`;

export const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSizes["2xl"]};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  font-weight: ${theme.typography.fontWeights.semibold};
`;

export const PageSubtitle = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.base};
`;

// Tab Navigation
export const TabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xxl};
  background-color: ${theme.colors.neutral.white};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.sm};
`;

export const TabButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background-color: ${props => props.active ? theme.colors.primary.main : 'transparent'};
  color: ${props => props.active ? theme.colors.primary.contrast : theme.colors.text.secondary};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: ${theme.transitions.normal};
  text-transform: capitalize;

  &:hover {
    background-color: ${props => props.active ? theme.colors.primary.main : theme.colors.neutral.gray100};
  }
`;

// Search and Filter Section
export const SearchFilterSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  gap: ${theme.spacing.sm};
`;

export const SearchInput = styled.input`
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.medium};
  width: 200px;
  font-size: ${theme.typography.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
`;

export const FilterSelect = styled.select`
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.medium};
  width: 150px;
  font-size: ${theme.typography.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
  }

  &:disabled {
    background-color: ${theme.colors.neutral.gray100};
    cursor: not-allowed;
  }
`;

export const StudentCount = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
  display: flex;
  align-items: center;
`;

// Add Student Button Section
export const AddButtonSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  justify-content: flex-end;
`;

export const AddStudentButton = styled.button`
  ${getButtonStyles("primary", "md")}
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  gap: ${theme.spacing.sm};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.lg};
  }
`;

// Students Table
export const TableContainer = styled.div`
  background: ${theme.colors.neutral.white};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${theme.typography.fontSizes.sm};
`;

export const TableHeader = styled.thead`
  background-color: ${theme.colors.background.secondary};
  border-bottom: 2px solid ${theme.colors.border.light};
`;

export const TableHeaderCell = styled.th`
  padding: 14px 20px;
  text-align: left;
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeights.semibold};
  white-space: nowrap;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border.light};

  &:hover {
    background-color: ${theme.colors.background.tertiary};
  }
`;

export const TableCell = styled.td`
  padding: 16px 20px;
  color: ${theme.colors.text.primary};
`;

// Student Name Cell
export const StudentNameCell = styled.td`
  padding: 16px 20px;
  display: flex;
  align-items: center;
`;

export const StudentAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${theme.borderRadius.round};
  object-fit: cover;
  border: 2px solid ${theme.colors.border.light};
`;

export const StudentName = styled.span`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-left: ${theme.spacing.sm};
  cursor: pointer;

  &:hover {
    color: ${theme.colors.primary.main};
  }
`;

// Email Cell
export const EmailCell = styled.td`
  padding: 16px 20px;
  cursor: pointer;
  color: ${theme.colors.info.main};
  text-decoration: underline;

  &:hover {
    color: ${theme.colors.info.dark};
  }
`;

// Centres and Subjects Tags
export const TagsContainer = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  background-color: ${theme.colors.background.tertiary};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSizes.xs};
  color: ${theme.colors.text.secondary};
`;

// Amount Pending Cell
export const AmountCell = styled.td`
  padding: 16px 20px;
  color: ${theme.colors.text.primary};
  font-weight: ${props => props.hasPending ? theme.typography.fontWeights.semibold : theme.typography.fontWeights.normal};
`;

export const AmountBadge = styled.span`
  color: ${props => props.hasPending ? theme.colors.error.main : theme.colors.success.main};
  background-color: ${props => props.hasPending ? theme.colors.errorLight : theme.colors.successLight};
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.sm};
`;

// Actions Cell
export const ActionsCell = styled.td`
  padding: 16px 20px;
  display: flex;
  gap: ${theme.spacing.sm};
`;

export const ActionButton = styled.button`
  padding: 6px 12px;
  background-color: transparent;
  color: ${props => props.variant === 'danger' ? theme.colors.error.main : theme.colors.primary.main};
  border: 1px solid ${props => props.variant === 'danger' ? theme.colors.error.main : theme.colors.primary.main};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.xs};
  transition: ${theme.transitions.normal};

  &:hover {
    background-color: ${props => props.variant === 'danger' ? theme.colors.errorLight : theme.colors.primary.light};
    color: ${props => props.variant === 'danger' ? theme.colors.error.main : theme.colors.primary.contrast};
  }
`;

// Modal Components
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

export const ModalContent = styled.div`
  background-color: ${theme.colors.neutral.white};
  padding: ${theme.spacing.xxl};
  border-radius: ${theme.borderRadius.xxl};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

export const FullScreenModalContent = styled.div`
  background-color: ${theme.colors.neutral.white};
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

// Payment History Modal
export const PaymentHistoryModalContent = styled.div`
  background-color: ${theme.colors.neutral.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
`;

export const PaymentHistoryTitle = styled.h2`
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.semibold};
`;

export const CloseButton = styled.button`
  ${getButtonStyles("secondary", "md")}
  margin-top: ${theme.spacing.md};
`;

// Loading State
export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: ${theme.colors.text.secondary};
`;

// Tab Content Container
export const TabContentContainer = styled.div`
  background: ${theme.colors.neutral.white};
  padding: ${theme.spacing.xxl};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.sm};
`;

// Payment History Tooltip
export const PaymentHistoryTooltip = styled.div`
  padding: ${theme.spacing.sm};
  min-width: 300px;
  max-height: 50vh;
  overflow-y: auto;
`;

export const PaymentItem = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
  margin-bottom: ${theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const PaymentMonth = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: 4px;
`;

export const PaymentAmount = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-bottom: 4px;
`;

export const PaymentReceipt = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.xs};
  margin-bottom: 2px;
`;

export const PaymentMode = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.xs};
  background-color: ${theme.colors.background.tertiary};
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
`;
