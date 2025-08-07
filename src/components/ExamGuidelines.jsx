import React from 'react';
import styled from 'styled-components';

const GuidelinesContainer = styled.div`
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const GuidelinesTitle = styled.h2`
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid #ffa600;
  padding-bottom: 10px;
`;

const SectionContainer = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const Section = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  color: ${props => props.$type === 'do' ? '#28a745' : '#dc3545'};
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GuidelineList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const GuidelineItem = styled.li`
  color: #495057;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  padding-left: 20px;
  position: relative;

  &:before {
    content: ${props => props.$type === 'do' ? '"✓"' : '"✗"'};
    color: ${props => props.$type === 'do' ? '#28a745' : '#dc3545'};
    font-weight: bold;
    position: absolute;
    left: 0;
    top: 0;
  }
`;

const ImportantNote = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  margin-top: 20px;
  text-align: center;
`;

const ImportantText = styled.p`
  color: #856404;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
`;

const ExamGuidelines = () => {
  const doGuidelines = [
    "Read all instructions carefully before starting",
    "Manage your time effectively across all sections",
    "Review your answers before final submission",
    "Use the 'Mark for Review' feature for doubtful questions",
    "Keep track of your progress using the question palette",
    "Submit the exam before the time expires",
    "Ensure stable internet connection throughout the exam"
  ];

  const dontGuidelines = [
    "Do not refresh or close the browser during the exam",
    "Do not use multiple browser tabs or windows",
    "Do not copy-paste or use keyboard shortcuts (Ctrl+C, Ctrl+V)",
    "Do not switch between applications or programs",
    "Do not communicate with others during the exam",
    "Do not take screenshots or record the exam",
    "Do not exit fullscreen mode during the exam"
  ];

  return (
    <GuidelinesContainer>
      <GuidelinesTitle>📋 Exam Guidelines</GuidelinesTitle>
      
      <SectionContainer>
        <Section>
          <SectionTitle $type="do">
            ✅ Do's
          </SectionTitle>
          <GuidelineList>
            {doGuidelines.map((guideline, index) => (
              <GuidelineItem key={index} $type="do">
                {guideline}
              </GuidelineItem>
            ))}
          </GuidelineList>
        </Section>

        <Section>
          <SectionTitle $type="dont">
            ❌ Don'ts
          </SectionTitle>
          <GuidelineList>
            {dontGuidelines.map((guideline, index) => (
              <GuidelineItem key={index} $type="dont">
                {guideline}
              </GuidelineItem>
            ))}
          </GuidelineList>
        </Section>
      </SectionContainer>

      <ImportantNote>
        <ImportantText>
          <strong>⚠️ Important:</strong> The exam will automatically submit when the time expires. 
          Make sure to complete and submit your exam before the timer runs out.
        </ImportantText>
      </ImportantNote>
    </GuidelinesContainer>
  );
};

export default ExamGuidelines; 