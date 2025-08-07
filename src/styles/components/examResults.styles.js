export const examResultsStyles = `
  body { 
    font-family: Arial, sans-serif; 
    padding: 20px; 
  }
  
  table { 
    border-collapse: collapse; 
    width: 100%; 
  }
  
  th, td { 
    border: 1px solid #ddd; 
    padding: 8px; 
    text-align: left; 
  }
  
  th { 
    background-color: #f2f2f2; 
  }
  
  tr:nth-child(even) { 
    background-color: #f9f9f9; 
  }
  
  .clickable-header { 
    cursor: pointer; 
    user-select: none; 
  }
  
  .clickable-header:hover { 
    background-color: #e0e0e0; 
  }
  
  .hidden-column { 
    display: none; 
  }
`;

export const examPageStyles = `
  .exam-page-container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .exam-form-container {
    margin-bottom: 32px;
    padding: 24px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .exam-form-title {
    margin-bottom: 20px;
    color: #2d3748;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }
  
  .form-field {
    margin-bottom: 16px;
  }
  
  .form-label {
    display: block;
    margin-bottom: 8px;
    color: #4a5568;
  }
  
  .form-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }
  
  .form-select {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background-color: white;
  }
  
  .sections-container {
    margin-bottom: 24px;
  }
  
  .sections-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .section-checkbox {
    display: flex;
    align-items: center;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .checkbox-input {
    margin-right: 8px;
  }
  
  .primary-button {
    background-color: #3182ce;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
  }
  
  .primary-button:hover {
    background-color: #2c5aa0;
  }
  
  .secondary-button {
    background-color: #e2e8f0;
    color: #4a5568;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px;
  }
  
  .secondary-button:hover {
    background-color: #cbd5e0;
  }
  
  .danger-button {
    background-color: #e53e3e;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .danger-button:hover {
    background-color: #c53030;
  }
  
  .warning-button {
    background-color: #dd6b20;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .warning-button:hover {
    background-color: #c05621;
  }
  
  .success-button {
    background-color: #38a169;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .success-button:hover {
    background-color: #2f855a;
  }
  
  .exams-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .exams-title {
    margin: 0;
    color: #2d3748;
  }
  
  .filter-container {
    margin-right: 8px;
    color: #4a5568;
  }
  
  .filter-select {
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    margin-left: 8px;
  }
  
  .no-exams {
    padding: 24px;
    text-align: center;
    color: #718096;
  }
  
  .loading {
    padding: 24px;
    text-align: center;
    color: #718096;
  }
  
  .exams-table-container {
    overflow-x: auto;
  }
  
  .exams-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .table-header {
    background-color: #f7fafc;
  }
  
  .table-cell {
    padding: 12px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .table-row:hover {
    background-color: #f7fafc;
  }
  
  .button-group {
    display: flex;
    gap: 8px;
  }
  
  .results-button {
    background-color: #805ad5;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .results-button:hover {
    background-color: #6b46c1;
  }
  
  .results-button:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
  
  .orange-button {
    margin-top: 8px;
    padding: 8px 16px;
    background-color: #ffa600;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .orange-button:hover {
    background-color: #e6950e;
  }
`;

export const examResultsScript = `
  function toggleColumn(columnClass) {
    const elements = document.querySelectorAll('.' + columnClass);
    const isCurrentlyHidden = elements[0].classList.contains('hidden-column');
    
    elements.forEach(element => {
      if (isCurrentlyHidden) {
        element.classList.remove('hidden-column');
      } else {
        element.classList.add('hidden-column');
      }
    });
    
    // Also toggle the header
    const header = document.querySelector('th[onclick*="' + columnClass + '"]');
    if (header) {
      if (isCurrentlyHidden) {
        header.classList.remove('hidden-column');
      } else {
        header.classList.add('hidden-column');
      }
    }
  }
`;