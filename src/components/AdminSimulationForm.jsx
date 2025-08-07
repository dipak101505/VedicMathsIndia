import React from 'react';

const AdminSimulationForm = ({ simulationState, dispatchSimulation }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="simulation"
          className="text-sm font-medium text-gray-700"
        >
          Simulation URL
        </label>
        <input
          id="simulation"
          type="text"
          value={simulationState.simUrl}
          placeholder="Enter simulation URL"
          onChange={(e) => dispatchSimulation({ type: 'SET_SIM_URL', payload: e.target.value })}
          className="
            w-64
            px-3 py-2
            bg-white
            border border-gray-300
            rounded-md
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
            text-sm
          "
          style={{
            height: "40px",
            marginLeft: "10px",
            transition: "all 0.2s ease",
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="simulation_name"
          className="text-sm font-medium text-gray-700"
        >
          Simulation Name
        </label>
        <input
          id="simulation_name"
          type="text"
          value={simulationState.simName}
          placeholder="Enter simulation Name"
          onChange={(e) => dispatchSimulation({ type: 'SET_SIM_NAME_INPUT', payload: e.target.value })}
          className="
            w-64
            px-3 py-2
            bg-white
            border border-gray-300
            rounded-md
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
            text-sm
          "
          style={{
            height: "40px",
            marginLeft: "10px",
            transition: "all 0.2s ease",
          }}
        />
      </div>
    </div>
  );
};

export default AdminSimulationForm;