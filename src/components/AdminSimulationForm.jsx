import React from 'react';
import {
  AdminSimulationFormContainer,
  AdminFormField,
  AdminFormLabel,
  AdminFormInput,
  AdminFormSelect,
  AdminFormRow,
  AdminFormActions,
  AdminButton,
  AdminFormSection,
  AdminFormSectionTitle,
  AdminFormSectionIcon,
  AdminFormHelpText,
} from '../styles/videoList.styles';

const AdminSimulationForm = ({ simulationState, dispatchSimulation }) => {
  return (
    <AdminFormSection>
      <AdminFormSectionTitle>
        <AdminFormSectionIcon>🔧</AdminFormSectionIcon>
        Simulation Configuration
      </AdminFormSectionTitle>
      
      <AdminFormRow>
        <AdminFormField>
          <AdminFormLabel htmlFor="simulation">
            Simulation URL
          </AdminFormLabel>
          <AdminFormInput
            id="simulation"
            type="text"
            value={simulationState.simUrl}
            placeholder="Enter simulation URL"
            onChange={(e) => dispatchSimulation({ type: 'SET_SIM_URL', payload: e.target.value })}
          />
          <AdminFormHelpText>
            Enter the full URL to the simulation (e.g., https://example.com/sim)
          </AdminFormHelpText>
        </AdminFormField>

        <AdminFormField>
          <AdminFormLabel htmlFor="simulation_name">
            Simulation Name
          </AdminFormLabel>
          <AdminFormInput
            id="simulation_name"
            type="text"
            value={simulationState.simName}
            placeholder="Enter simulation name"
            onChange={(e) => dispatchSimulation({ type: 'SET_SIM_NAME_INPUT', payload: e.target.value })}
          />
          <AdminFormHelpText>
            Give this simulation a descriptive name for students
          </AdminFormHelpText>
        </AdminFormField>
      </AdminFormRow>

      <AdminFormRow>
        <AdminFormField>
          <AdminFormLabel htmlFor="subject">
            Subject
          </AdminFormLabel>
          <AdminFormSelect
            id="subject"
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
          </AdminFormSelect>
          <AdminFormHelpText>
            Choose the subject this simulation belongs to
          </AdminFormHelpText>
        </AdminFormField>

        <AdminFormField>
          <AdminFormLabel htmlFor="topic">
            Topic
          </AdminFormLabel>
          <AdminFormSelect
            id="topic"
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
          </AdminFormSelect>
          <AdminFormHelpText>
            Choose the specific topic for this simulation
          </AdminFormHelpText>
        </AdminFormField>
      </AdminFormRow>

      <AdminFormActions>
        <AdminButton
          onClick={() => {
            if (simulationState.selectedSimName) {
              document.getElementById("iframe")?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          disabled={!simulationState.selectedSimName}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Preview Simulation
        </AdminButton>
      </AdminFormActions>
    </AdminFormSection>
  );
};

export default AdminSimulationForm;