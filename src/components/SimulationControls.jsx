import React from 'react';
import {
  SimulationSection,
  SimulationControls as StyledSimulationControls,
  SimulationField,
  SimulationLabel,
  SimulationSelect,
  SimulationButtonContainer,
  SimulationButton,
  SimulationFrame,
} from '../styles/videoList.styles';

const SimulationControls = ({ simulationState, dispatchSimulation }) => {
  return (
    <SimulationSection>
      <StyledSimulationControls>
        <SimulationField>
          <SimulationLabel>
            Subject
          </SimulationLabel>
          <SimulationSelect
            value={simulationState.selectedSubject}
            onChange={(e) => {
              dispatchSimulation({ type: 'SET_SUBJECT', payload: e.target.value });
            }}
          >
            <option value="">Select Subject</option>
            {simulationState.subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </SimulationSelect>
        </SimulationField>
        
        <SimulationField>
          <SimulationLabel>
            Topic
          </SimulationLabel>
          <SimulationSelect
            value={simulationState.selectedTopic}
            onChange={(e) => {
              dispatchSimulation({ type: 'SET_TOPIC', payload: e.target.value });
            }}
            disabled={!simulationState.selectedSubject}
          >
            <option value="">Select Topic</option>
            {simulationState.topicOptions.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </SimulationSelect>
        </SimulationField>
        
        <SimulationField>
          <SimulationLabel>
            Simulation
          </SimulationLabel>
          <SimulationSelect
            value={simulationState.selectedSimName}
            onChange={(e) => dispatchSimulation({ type: 'SET_SIM_NAME', payload: e.target.value })}
            disabled={!simulationState.selectedTopic}
          >
            <option value="">Select Simulation</option>
            {simulationState.nameOptions.map((option) => (
              <option key={option.url} value={option.name}>
                {option.name}
              </option>
            ))}
          </SimulationSelect>
        </SimulationField>
        
        <SimulationButtonContainer>
          <SimulationButton
            onClick={() => {
              if (simulationState.selectedSimName) {
                document.getElementById("iframe")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            disabled={!simulationState.selectedSimName}
          >
            View Simulation
          </SimulationButton>
        </SimulationButtonContainer>
      </StyledSimulationControls>
      
      <SimulationFrame>
        <iframe
          src={simulationState.iframeUrl}
          id="iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Vignam Labs Simulation"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML =
              "Failed to load simulation. Please check your internet connection or try again later.";
          }}
        />
      </SimulationFrame>
    </SimulationSection>
  );
};

export default SimulationControls;