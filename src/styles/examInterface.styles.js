import styled, { css } from "styled-components";

// Modal component
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  padding: 20px;
`;

// Styled Components
export const ExamContainer = styled.div`
  font-family: OpenSans-Regular;
  font-size: 12px;
  overflow: hidden;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

export const Header1 = styled.div`
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  background-color: #363636;
  color: #f7f64e;
  padding: 8px 10px;
  overflow: auto;
`;

export const LeftSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: auto;

  @media (min-width: 768px) {
    width: calc(100% - 250px);
    margin-right: 250px;
    height: 100vh;
  }
`;

export const Sidebar = styled.div`
  width: 100%;
  background: #fff;
  border-left: none;
  border-top: 1px solid #c3c3c1;
  overflow-y: auto;
  height: auto;

  @media (min-width: 768px) {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 250px;
    border-left: 1px solid #c3c3c1;
    border-top: none;
    height: 100vh;
  }
`;

export const ExamName = styled.div`
  background-color: #fff;
  padding: 10px;
  border-bottom: 1px solid #c3c3c1;
`;

export const TimeSection = styled.div`
  background-color: #fff;
  padding: 10px;
  border-bottom: 1px solid #c3c3c1;
`;

export const SectionNames = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #fff;
  border-bottom: 1px solid #c3c3c1;
  padding: 5px;
`;

export const SectionItem = styled.div`
  flex: 1;
  padding: 8px;
  cursor: pointer;
  font-size: 11px;
  text-align: center;
  border-right: 1px solid #c3c3c1;

  &:last-child {
    border-right: none;
  }

  &.section_selected {
    background-color: #ff9800;
    color: white;
  }

  &.section_unselected {
    &:hover {
      background-color: #e6e6e6;
    }
  }

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

export const QuestionArea = styled.div`
  overflow: auto;
  flex: 1;
  height: auto;
  padding: 10px;

  @media (min-width: 768px) {
    height: calc(100vh - 200px);
    margin: 0;
    padding: 0;
  }
`;

export const QuestionTitle = styled.div`
  border-bottom: 1px solid #dbdbdb;
  font-weight: bold;
  padding: 7px;
  text-align: left;
  font-size: 17px;
`;

export const NavigationButtons = styled.div`
  background: white;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid #c3c3c1;
  overflow: auto;
  padding-left: 10px;
`;

export const Button = styled.div`
  color: #252525;
  background-color: #fff;
  border: 1px solid #c8c8c8;
  border-radius: 2px;
  display: inline-block;
  font-size: 11px;
  font-weight: 400;
  padding: 8px 15px;
  text-align: center;
  vertical-align: middle;
  margin: 8px 2px;
  float: left;
  font-family: arial, verdana, helvetica, sans-serif;
  cursor: pointer;

  &:hover {
    background-color: #ff9800;
    color: #ffffff;
    border-color: #0a68b4;
  }

  &#next {
    background-color: #ff9800;
    color: #ffffff;
    float: right;
    margin-right: 10px;
  }

  @media (min-width: 768px) {
    font-size: 15px;
    padding: 10px 20px;
  }

  ${(props) =>
    props.$mobileOnly &&
    css`
      @media (min-width: 768px) {
        display: none;
      }
    `}

  ${(
    props,
  ) =>
    props.$desktopOnly &&
    css`
       @media (max-width: 767px) {
        display: none;
      }
    `}
`;

export const PersonInfo = styled.div`
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #c3c3c1;

  ${(
    props,
  ) =>
    props.$desktopOnly &&
    css`
       @media (max-width: 767px) {
        display: none;
      }
    `}
`;

export const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

export const ColorInfo = styled.div`
  width: 100%;
  padding-left: 9px;
  padding-bottom: 12px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
`;

export const InfoItem = styled.div`
  width: 48%;
  margin-top: 10px;

  &.long {
    width: 100%;
  }

  @media (min-width: 480px) {
    width: 43%;
  }
`;

export const StatusIcon = styled.span`
  background: url("https://www.digialm.com/OnlineAssessment/images/questions-sprite.png");
  float: left;
  height: 26px;
  margin-right: 10px;
  width: 29px;
  color: #fff;
  padding-top: 6px;
  text-align: center;
  vertical-align: middle;
  font-family: Arial, Helvetica, sans-serif;
`;

export const StatusText = styled.span`
  font-family: Arial, Helvetica, sans-serif;
`;

export const QuestionPalette = styled.div`
  background: #e5f6fd;
  font-weight: bold;
  overflow: auto;
  padding: 10px;
  min-height: auto;

  @media (min-width: 768px) {
    min-height: 183px;
  }
`;

export const PaletteHeader = styled.div`
  background: #4e85c5;
  color: #fff;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
`;

export const ChooseText = styled.div`
  padding: 10px;
  font-weight: bold;
`;

export const PaletteGrid = styled.div`
  margin-top: 12px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 2px;
`;

export const QuestionNumber = styled.div`
  font-family: Arial, Helvetica, sans-serif;
  background: url("https://www.digialm.com/OnlineAssessment/images/questions-sprite.png");
  width: 40px;
  height: 30px;
  color: #fff;
  cursor: pointer;
  float: left;
  font-size: 14px;
  font-weight: normal;
  margin-right: 2px;
  text-align: center;
  padding-top: 8px;
  display: inline-block;

  &.a {
    margin-bottom: 5px;
    background-position: -4px -5px;
    color: #ffffff;
    &:hover {
      background-position: -4px -126px;
    }
  }
  &.na {
    margin-bottom: 5px;
    background-position: -57px -6px;
    color: #ffffff;
    &:hover {
      background-position: -57px -127px;
    }
  }
  &.nv {
    margin-bottom: 5px;
    background-position: -157px -4px;
    color: #000000;
    &:hover {
      background-position: -157px -4px;
    }
  }
  &.mr {
    margin-bottom: 0px;
    height: 35px;
    background-position: -108px -1px;
    padding-top: 10px;
    color: #ffffff;
    &:hover {
      background-position: -108px -122px;
    }
  }
  &.amr {
    margin-bottom: 0px;
    height: 35px;
    background-position: -66px -178px;
    padding-top: 10px;
    color: #ffffff;
  }

  @media (min-width: 768px) {
    width: 49px;
    height: 33px;
    font-size: 16px;
    padding-top: 12px;
    &.a,
    &.na,
    &.nv {
      margin-bottom: 10px;
    }
    &.mr,
    &.amr {
      height: 40px;
      padding-top: 15px;
    }
  }
`;

// Add this new styled component with the other styled components
export const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px;
  border-radius: 4px;
  ${(props) => {
    if (props.$hasSubmitted) {
      if (props.$isCorrect) {
        return `
          background-color: #e6ffe6;
          border: 1px solid #4CAF50;
        `;
      } else if (props.$isSelected && !props.$isCorrect) {
        return `
          background-color: #ffe6e6;
          border: 1px solid #f44336;
        `;
      }
    }
    return "border: 1px solid transparent;";
  }}
`;

// Add new styled component at the top with other styled components
export const TimeSpentBox = styled.div`
  background-color: #f5f5f5;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  text-align: right;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (min-width: 600px) {
    padding: 30px;
    min-width: 400px;
  }
`;

export const ModalButton = styled.button`
  padding: 10px 24px;
  background: ${(props) => (props.$secondary ? "#6B7280" : "#ff9800")};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin: 0 10px;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) => (props.$secondary ? "#4B5563" : "#f57c00")};
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
`;

// Add this new styled component near the other styled components
export const ResultsSummaryContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin: 15px;
  width: 90%; // Use percentage width
  max-width: 800px; // Maximum width on larger screens
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 767px) {
    margin: 10px;
    padding: 10px;
    width: calc(100% - 20px); // Account for margins
  }
`;

export const ResultsHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 10px;
  text-align: center;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
  }
`;

export const ResultsTitle = styled.h2`
  color: #333;
  font-size: 20px;
  margin: 0 0 10px 0;

  @media (min-width: 768px) {
    font-size: 24px;
    margin: 0;
  }
`;

export const SectionResults = styled.div`
  margin-bottom: 30px;
`;

export const SectionTitle = styled.h3`
  color: #ff9800;
  font-size: 16px;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

export const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(150px, 1fr)
  ); // Smaller minimum size
  gap: 10px; // Reduced gap on mobile
  margin-bottom: 15px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
`;

export const ResultCard = styled.div`
  background: ${(props) => (props.$highlight ? "#fff8e1" : "#f9f9f9")};
  border-radius: 6px;
  padding: 10px;
  border: 1px solid ${(props) => (props.$highlight ? "#ffca28" : "#e0e0e0")};

  @media (min-width: 768px) {
    padding: 12px;
  }
`;

export const StatLabel = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

export const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.$color || "#333"};

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

export const ProgressBar = styled.div`
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-top: 6px;
  overflow: hidden;

  &:after {
    content: "";
    display: block;
    height: 100%;
    width: ${(props) => props.$percent}%;
    background-color: ${(props) => {
      if (props.$percent >= 80) return "#4caf50";
      if (props.$percent >= 60) return "#8bc34a";
      if (props.$percent >= 40) return "#ff9800";
      if (props.$percent >= 20) return "#ff5722";
      return "#f44336";
    }};
    transition: width 0.5s ease;
  }
`;

// Add a new styled component for the sidebar summary
export const SidebarSummary = styled.div`
  padding: 10px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #c3c3c1;
`;

export const SummaryStat = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SummaryLabel = styled.span`
  color: #666;
`;

export const SummaryValue = styled.span`
  font-weight: bold;
  color: ${(props) => props.$color || "#333"};
`;

// ADDED: Styled component for the sidebar footer
export const SidebarFooter = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
  display: none; // Hide by default

  @media (min-width: 768px) {
    display: block; // Show only on desktop
    border-top: 1px solid #c3c3c1;
  }
`;

// ADDED: Styled components for Feedback Modal
export const FeedbackModalContainer = styled(Modal)`
   z-index: 1002; // Ensure it's above other modals
`;

export const FeedbackModalContent = styled(ModalContent)`
  max-width: 600px;
  text-align: left;

  h3 {
    font-size: 20px;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
`;

export const StarRatingContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

export const Star = styled.span`
  font-size: 30px;
  color: ${(props) => (props.$filled ? "#ffc107" : "#e0e0e0")};
  cursor: pointer;
  margin: 0 5px;
  transition: color 0.2s;

  &:hover {
    color: #ffc107;
  }
`;

export const FeedbackTextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 20px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
`;

export const Timer = styled.div`
  /* ... other styles ... */
  ${({ $timeLeft }) => `
    color: ${$timeLeft < 300 ? "red" : "inherit"};
  `}
`;

export const WelcomeScreen = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 1000;
  padding: 15px;
  text-align: center;
  overflow-y: auto; // Allow scrolling if content is too tall

  h1 {
    font-size: 24px;
    margin-bottom: 15px;
    color: #333;

    @media (min-width: 768px) {
      font-size: 32px;
      margin-bottom: 20px;
    }
  }

  p {
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;

    @media (min-width: 768px) {
      font-size: 18px;
      margin-bottom: 25px;
    }
  }
`;

export const StartButton = styled.button`
  padding: 12px 24px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  width: 200px; // Fixed width for consistency
  transition: background 0.2s ease;

  &:hover {
    background: #f57c00;
  }

  @media (max-width: 767px) {
    width: 100%; // Full width on mobile
    max-width: 300px;
    padding: 15px;
    margin-top: 15px;
  }
`;

// Add modal component
export const SubmitModal = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
`;

// Header and Navigation Styles
export const ExamHeader = styled.header`
  background-color: #000000;
`;

export const LogoImage = styled.img`
  margin: 5px 5px;
`;

export const HeaderNavItem = styled.div`
  color: #ffffff;
  font-family: arial, verdana, helvetica, sans-serif;
  float: right;
  display: inline-block;
  margin: 0px 10px;
  font-weight: bold;
`;

// Content Area Styles
export const QuestionContentContainer = styled.div`
  background-color: #ffffff;
  font-size: 16px;
  margin-bottom: 10px;
  padding: 15px;
`;

export const OptionsContentContainer = styled.div`
  background-color: #ffffff;
  font-size: 16px;
  margin-bottom: 10px;
  padding: 15px;
`;

export const SolutionContainer = styled.div`
  background-color: #f8f8f8;
  padding: 20px;
  margin-top: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

export const SolutionHeader = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 12px;
`;

export const QuestionWrapper = styled.div`
  opacity: 1;
  z-index: 2;
  position: relative;
`;

// Modal Content Styles
export const ModalTitle = styled.h2`
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
`;

export const ModalSection = styled.div`
  margin-bottom: 20px;
`;

export const ScoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

export const ScoreLabel = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

export const ScoreValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #ff9800;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

export const StatCard = styled.div`
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
`;

export const StatCardLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

export const StatCardValue = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: ${(props) => props.$color || "inherit"};
`;

// Section Summary Styles
export const SectionSummaryWrapper = styled.div`
  margin-bottom: 20px;
`;

export const SectionSummaryTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
`;

export const SectionItemWrapper = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
`;

export const SectionItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

export const SectionName = styled.div`
  font-weight: bold;
  color: #ff9800;
`;

export const SectionScore = styled.div`
  font-weight: bold;
`;

export const SectionStats = styled.div`
  display: flex;
  font-size: 14px;
  color: #666;
`;

export const SectionStatItem = styled.div`
  margin-right: 15px;
`;

// Results Display Styles
export const ResultsSectionWrapper = styled.div`
  margin-bottom: 10px;
`;

export const ResultsSectionTitle = styled.h3`
  font-weight: bold;
  color: #ff9800;
`;

export const ResultsTotalScore = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

export const ResultsSubmissionDate = styled.div`
  color: #666;
  font-size: 14px;
`;

export const ResultsSectionDetail = styled.div`
  margin-bottom: 20px;
`;

export const ResultsSectionHeading = styled.h4`
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
`;

// Status Icon Variations
export const StatusIconAnswered = styled(StatusIcon)`
  background-position: -7px -55px;
`;

export const StatusIconNotAnswered = styled(StatusIcon)`
  background-position: -42px -56px;
`;

export const StatusIconNotVisited = styled(StatusIcon)`
  background-position: -107px -56px;
`;

export const StatusIconMarkedForReview = styled(StatusIcon)`
  background-position: -75px -54px;
`;

export const StatusIconAnsweredAndMarked = styled(StatusIcon)`
  background-position: -9px -87px;
`;

// Filter and Controls
export const FilterWrapper = styled.div`
  padding: 10px;
  background: #f5f5f5;
  display: flex;
  gap: 10px;
`;

export const FilterLabel = styled.label`
  margin-right: 10px;
`;

export const FilterSelect = styled.select`
  padding: 5px;
  border-radius: 4px;
`;

export const SidebarResultsTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
`;

// Early Submission Modal Styles
export const EarlySubmissionTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 16px;
  color: #1f2937;
`;

export const EarlySubmissionText = styled.p`
  font-size: 16px;
  color: #4b5563;
  margin-bottom: ${(props) => (props.$lastItem ? "0" : "8px")};
`;

// Navigation Button with conditional opacity
export const ConditionalButton = styled(Button)`
  opacity: ${(props) => (props.$hidden ? 0 : 1)};
`;

// Image with margin
export const ContentImage = styled.img`
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const IntegerInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

export const IntegerInputDisplay = styled.input`
  width: 100%;
  padding: 8px;
  font-size: 18px;
  text-align: left;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
`;

export const NumericKeypad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  width: 100%;
  max-width: 200px;
`;

export const KeypadButton = styled.button`
  padding: 15px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
`;
