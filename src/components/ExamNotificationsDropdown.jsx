import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ExamNotificationsDropdown = ({ exams, pastWeekExams, isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasUpcomingExams = exams && exams.length > 0;
  const hasPastExams = pastWeekExams && pastWeekExams.length > 0;
  const hasNoExams = !hasUpcomingExams && !hasPastExams;

  // Function to render an exam item
  const renderExamItem = (exam) => {
    const isClickable = exam.hasQuestions;
    const isPast = exam.isPast;
    
    return (
      <div 
        key={exam.id}
        className={`notification-item ${isClickable ? "" : "non-clickable"}`}
        onClick={() => {
          if (isClickable) {
            navigate(`/exam-interface/${exam.id}`);
            onClose();
          }
        }}
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f7fafc',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'background-color 0.2s',
          hoverBackgroundColor: isClickable ? '#f7fafc' : 'transparent',
          opacity: isClickable ? 1 : 0.7,
          position: 'relative',
          backgroundColor: isPast ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (isClickable) {
            e.currentTarget.style.backgroundColor = isPast ? 'rgba(0, 0, 0, 0.05)' : '#f7fafc';
          }
        }}
        onMouseLeave={(e) => {
          if (isClickable) {
            e.currentTarget.style.backgroundColor = isPast ? 'rgba(0, 0, 0, 0.02)' : 'transparent';
          }
        }}
      >
        <div 
          style={{
            fontWeight: '500',
            marginBottom: '4px',
            color: '#2d3748',
          }}
        >
          {exam.name}
        </div>
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#718096',
          }}
        >
          <span>{exam.subject}</span>
          <span>{new Date(exam.date).toLocaleDateString()}</span>
        </div>
        
        {!isClickable && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              right: '15px',
              transform: 'translateY(-50%)',
              backgroundColor: '#e5e7eb',
              color: '#6b7280',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              pointerEvents: 'none',
            }}
          >
            Not Ready
          </div>
        )}
        
        {exam.isSubmitted && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              right: isClickable ? '15px' : '85px',
              transform: 'translateY(-50%)',
              backgroundColor: '#4caf50',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              pointerEvents: 'none',
            }}
          >
            Submitted
          </div>
        )}
        
        {isPast && !exam.isSubmitted && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              right: isClickable ? '15px' : '85px',
              transform: 'translateY(-50%)',
              backgroundColor: '#f44336',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              pointerEvents: 'none',
            }}
          >
            Pending
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={dropdownRef}
      className="exam-notifications-dropdown"
      style={{
        position: 'absolute',
        top: '45px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90vw',
        maxWidth: '360px',
        maxHeight: '400px',
        overflow: 'auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1050,
        border: '1px solid #e2e8f0',
      }}
    >
      <div 
        className="dropdown-header"
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          fontWeight: '600',
          fontSize: '16px',
          color: '#4a5568',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          top: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
      >
        <span>Exams</span>
      </div>

      <div className="dropdown-content">
        {hasNoExams && (
          <div 
            style={{
              padding: '16px',
              textAlign: 'center',
              color: '#718096',
              fontSize: '14px',
            }}
          >
            No upcoming or recent exams
          </div>
        )}

        {hasUpcomingExams && (
          <>
            <div 
              style={{
                padding: '8px 16px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '12px',
                fontWeight: '600',
                color: '#718096',
              }}
            >
              Upcoming Exams
            </div>
            {exams.map(renderExamItem)}
          </>
        )}

        {hasPastExams && (
          <>
            <div 
              style={{
                padding: '8px 16px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                borderTop: hasUpcomingExams ? '1px solid #e2e8f0' : 'none',
                fontSize: '12px',
                fontWeight: '600',
                color: '#718096',
              }}
            >
              Past Week Exams
            </div>
            {pastWeekExams.map(renderExamItem)}
          </>
        )}
      </div>
      
      {/* <div 
        className="dropdown-footer"
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '14px',
          color: '#ffa600',
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
        }}
        onClick={() => {
          navigate('/exams');
          onClose();
        }}
      >
        View All Exams
      </div> */}
    </div>
  );
};

export default ExamNotificationsDropdown; 