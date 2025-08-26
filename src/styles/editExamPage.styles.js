import styled from "styled-components";
import { theme } from "./theme";

// Main container
export const Container = styled.div`
  display: flex;
  height: 100vh;
`;

// Editor section
export const EditorSection = styled.div`
  width: 40%;
  padding: ${theme.spacing.xl};
  border-right: 1px solid ${theme.colors.border.light};
  overflow-y: auto;
`;

// Preview section
export const PreviewSection = styled.div`
  width: 50%;
  padding: ${theme.spacing.xl};
  overflow-y: auto;

  .solution-preview {
    margin-top: 2px;
    padding: 5px;
    border-top: 2px solid ${theme.colors.border.light};
  }
`;

// Form sections
export const MetadataSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
  
  h3 {
    color: ${theme.colors.text.primary};
    font-size: ${theme.typography.fontSizes.lg};
    font-weight: ${theme.typography.fontWeights.semibold};
    margin-bottom: ${theme.spacing.md};
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

export const FormField = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  label {
    display: block;
    margin-bottom: ${theme.spacing.sm};
    color: ${theme.colors.text.primary};
    font-weight: ${theme.typography.fontWeights.medium};
    font-size: ${theme.typography.fontSizes.sm};
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
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

export const FormSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.base};
  background-color: ${theme.colors.background.primary};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.base};
  resize: vertical;
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

// Buttons
export const PrimaryButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrast};
  border: 2px solid ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background-color: ${theme.colors.primary.light};
    border-color: ${theme.colors.primary.light};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
`;

export const SecondaryButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  border: 2px solid ${theme.colors.warning.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background-color: ${theme.colors.warning.light};
    border-color: ${theme.colors.warning.light};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
`;

export const AddButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  border: 2px solid ${theme.colors.warning.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: ${theme.transitions.normal};
  width: 20%;
  text-align: center;
  margin-right: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  
  &:hover {
    background-color: ${theme.colors.warning.light};
    border-color: ${theme.colors.warning.light};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
`;

export const SubmitButton = styled.button`
  width: 80%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  border: 2px solid ${theme.colors.warning.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.base};
  font-weight: ${theme.typography.fontWeights.medium};
  text-align: center;
  margin-top: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background-color: ${theme.colors.warning.light};
    border-color: ${theme.colors.warning.light};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${theme.colors.border.focus}40;
  }
`;

// Content controls
export const ContentControls = styled.div`
  margin-top: ${theme.spacing.md};
  
  span {
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.text.primary};
  }
`;

export const ContentButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

export const ContentButton = styled.button`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  font-size: ${theme.typography.fontSizes.sm};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.warning.light};
  }
`;

// Options section
export const OptionsSection = styled.div`
  margin-top: ${theme.spacing.lg};
  
  span {
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.text.primary};
  }
`;

export const AddOptionButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  border: 2px solid ${theme.colors.warning.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  width: 20%;
  margin-bottom: 2vh;
  margin-left: 1vw;
  margin-top: 2vh;
  transition: ${theme.transitions.normal};
  
  &:hover {
    background-color: ${theme.colors.warning.light};
    border-color: ${theme.colors.warning.light};
  }
`;

export const OptionContainer = styled.div`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  margin-bottom: 1vh;
`;

export const OptionButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;

export const OptionButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  font-size: ${theme.typography.fontSizes.sm};
  cursor: pointer;
  width: 20%;
  text-align: center;
  margin-right: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  transition: ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.warning.light};
  }
`;

// Solution section
export const SolutionSection = styled.div`
  margin-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.light};
  padding-top: ${theme.spacing.md};
  
  span {
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.text.primary};
  }
`;

export const SolutionButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

export const SolutionButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.warning.main};
  color: ${theme.colors.warning.contrast};
  font-size: ${theme.typography.fontSizes.sm};
  cursor: pointer;
  width: 20%;
  text-align: center;
  margin-right: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  transition: ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.warning.light};
  }
`;

// Bulk questions section
export const BulkQuestionsSection = styled.div`
  margin-top: ${theme.spacing.lg};
  
  span {
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.text.primary};
  }
`;

export const BulkQuestionsTooltip = styled.span`
  margin-left: ${theme.spacing.sm};
  cursor: pointer;
  color: ${theme.colors.info.main};
`;

export const CheckboxContainer = styled.div`
  margin-top: ${theme.spacing.md};
  display: flex;
  align-items: center;
  
  input[type="checkbox"] {
    margin-right: ${theme.spacing.sm};
  }
  
  label {
    cursor: pointer;
    font-size: ${theme.typography.fontSizes.sm};
    color: ${theme.colors.text.primary};
  }
`;

export const BulkTextarea = styled.textarea`
  margin-top: ${theme.spacing.md};
  resize: vertical;
  width: 80%;
  max-width: 800px;
`;

export const SamplePaperSection = styled.div`
  margin-top: ${theme.spacing.md};
  
  div {
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.text.primary};
    margin-bottom: ${theme.spacing.sm};
  }
`;

export const SampleTextarea = styled.textarea`
  margin-top: ${theme.spacing.md};
  resize: vertical;
  width: 80%;
  max-width: 800px;
`;

// Preview section styles
export const PreviewTitle = styled.h2`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes["2xl"]};
  font-weight: ${theme.colors.typography.fontWeights.semibold};
  margin-bottom: ${theme.spacing.lg};
`;

export const SectionFilter = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  select {
    width: 100%;
    padding: ${theme.spacing.sm};
    border: 1px solid ${theme.colors.border.light};
    border-radius: ${theme.borderRadius.sm};
    font-size: ${theme.typography.fontSizes.base};
  }
`;

export const QuestionPreview = styled.div`
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
`;

export const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    color: ${theme.colors.primary.main};
    border-radius: ${theme.borderRadius.sm};
  }
  
  span {
    cursor: pointer;
    font-size: ${theme.typography.fontSizes.base};
    font-weight: ${theme.colors.typography.fontWeights.bold};
    margin-top: 20vh;
  }
`;

export const QuestionContent = styled.div`
  margin-bottom: ${theme.spacing.md};
  cursor: pointer;
`;

export const OptionsList = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  .flex {
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
  }
  
  .option-content {
    flex: 1;
  }
`;

export const SolutionContainer = styled.div`
  border-top: 1px solid ${theme.colors.border.light};
  margin-top: ${theme.spacing.md};
  
  .solution-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.sm};
    transition: ${theme.transitions.fast};
    
    &:hover {
      background-color: ${theme.colors.neutral.gray50};
    }
    
    span {
      font-size: ${theme.typography.fontSizes.sm};
      font-weight: ${theme.colors.typography.fontWeights.semibold};
    }
  }
  
  .solution-content {
    transition: all 0.3s ease-in-out;
    
    &.expanded {
      max-height: 500px;
      opacity: 1;
    }
    
    &.collapsed {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
    }
  }
  
  .solution-preview {
    padding: ${theme.spacing.md};
    background-color: ${theme.colors.neutral.gray50};
    border-radius: ${theme.borderRadius.sm};
    margin-top: ${theme.spacing.sm};
  }
`;

export const QuestionMetadata = styled.div`
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.text.secondary};
`;

// Topic autocomplete styles
export const TopicAutocompleteContainer = styled.div`
  position: relative;
  width: 40%;
  
  input {
    width: 100%;
    padding: ${theme.spacing.sm};
    border: 1px solid ${theme.colors.border.light};
    border-radius: ${theme.borderRadius.sm};
    font-size: ${theme.typography.fontSizes.base};
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${theme.colors.border.focus}20;
    }
  }
`;

export const TopicDropdown = styled.ul`
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border.light};
  border-top: none;
  border-radius: 0 0 ${theme.borderRadius.sm} ${theme.borderRadius.sm};
  box-shadow: ${theme.shadows.md};
  z-index: 1000;
  margin: 0;
  padding: 0;
  list-style: none;
  
  li {
    padding: ${theme.spacing.sm};
    cursor: pointer;
    transition: ${theme.transitions.fast};
    
    &:hover {
      background-color: ${theme.colors.neutral.gray100};
    }
    
    &.highlighted {
      background-color: ${theme.colors.neutral.gray100};
    }
  }
`;

// Content renderer styles
export const LatexContent = styled.div`
  .latex-content {
    display: inline-block;
  }
`;

export const TextContent = styled.span`
  &.text-content {
    display: inline;
  }
`;

export const ImageContent = styled.div`
  img {
    margin-top: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
  }
`;

// Utility styles
export const Spacer = styled.div`
  margin-left: ${theme.spacing.md};
`;

export const SmallSpacer = styled.div`
  margin-left: ${theme.spacing.sm};
`;

export const TopSpacer = styled.div`
  margin-top: ${theme.spacing.md};
`;

export const SmallTopSpacer = styled.div`
  margin-top: ${theme.spacing.sm};
`;
