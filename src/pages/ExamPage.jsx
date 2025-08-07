import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getExams, addExam, deleteExam, getUserExamResults } from "../services/questionService";
import { examResultsStyles, examResultsScript, examPageStyles } from '../styles/components/examResults.styles';
import * as XLSX from 'xlsx';
import { MdDelete, MdAssessment, MdDownload } from 'react-icons/md';

function ExamPage() {
  const location = useLocation();

  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [dateFilter, setDateFilter] = useState("week");
  const [submittedExams, setSubmittedExams] = useState([]);
  const [examResults, setExamResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    batch: "",
    date: "",
    time: "",
    duration: "",
    totalMarks: "",
    videoKey: location.state?.videoKey || "", // Auto-populate from navigation state
  });
  const { user, isAdmin } = useAuth();
  const [applications, setApplications] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
    fetchBatchesAndSubjects();
    if (!isAdmin) {
      fetchApplications();
      fetchSubmittedExams();
    }
  }, [isAdmin, user?.email, user?.uid]);

  // Fetch submitted exams
  const fetchSubmittedExams = async () => {
    if (!user) return;
    
    try {
      const results = await getUserExamResults(user.uid);
      
      // Extract exam IDs from results
      const examIds = results.map(result => result.SK.replace("EXAM#", ""));
      setSubmittedExams(examIds);
    } catch (error) {
      console.error("Error fetching submitted exams:", error);
    }
  };

  useEffect(() => {
    filterExamsByDate();
  }, [exams, dateFilter]);

  const filterExamsByDate = () => {
    if (dateFilter === "all") {
      setFilteredExams(exams);
      return;
    }
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate date for previous week (start)
    const prevWeekStart = new Date();
    prevWeekStart.setDate(today.getDate() - 7);
    const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0];
    
    // Calculate date for next week
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    // Calculate date for next month
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    
    let filtered;
    
    switch (dateFilter) {
      case "today":
        filtered = exams.filter(exam => exam.date === todayStr);
        break;
      case "prevWeek":
        filtered = exams.filter(exam => {
          return exam.date >= prevWeekStartStr && exam.date < todayStr;
        });
        break;
      case "week":
        filtered = exams.filter(exam => {
          return exam.date >= todayStr && exam.date <= nextWeekStr;
        });
        break;
      case "month":
        filtered = exams.filter(exam => {
          return exam.date >= todayStr && exam.date <= nextMonthStr;
        });
        break;
      default:
        filtered = exams;
    }
    
    setFilteredExams(filtered);
  };

  const fetchExams = async () => {
    try {
      const examsData = await getExams();
      setExams(examsData);
      setFilteredExams(examsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchBatchesAndSubjects = async () => {
    try {
      const [batchesSnapshot, subjectsSnapshot] = await Promise.all([
        getDocs(collection(db, "batches")),
        getDocs(collection(db, "subjects")),
      ]);

      setBatches(
        batchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );

      setSubjects(
        subjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    } catch (error) {
      console.error("Error fetching batches and subjects:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(
        collection(db, "examApplications"),
      );
      const applicationsData = {};
      applicationsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.userEmail === user.email) {
          applicationsData[data.examId] = {
            id: doc.id,
            status: data.status,
          };
        }
      });
      setApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const examData = {
        ...formData,
        sections: selectedSections,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
      };

      const docRef = await addExam(examData);

      setFormData({
        name: "",
        subject: "",
        batch: "",
        date: "",
        time: "",
        duration: "",
        totalMarks: "",
      });
      fetchExams();
    } catch (error) {
      console.error("Error adding exam:", error);
    }
  };

  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExam(examId);
        fetchExams();
      } catch (error) {
        console.error("Error deleting exam:", error);
      }
    }
  };

  const handleApplicationToggle = async (examId) => {
    try {
      if (!applications[examId]) {
        // Create new application
        const docRef = await addDoc(collection(db, "examApplications"), {
          examId,
          userEmail: user.email,
          status: "applied",
          appliedAt: new Date(),
        });
        setApplications((prev) => ({
          ...prev,
          [examId]: { id: docRef.id, status: "applied" },
        }));

        // Navigate to exam interface instead of opening index.html
        navigate("/exam-interface");
      } else if (applications[examId].status === "applied") {
        // Update to review
        const docRef = doc(db, "examApplications", applications[examId].id);
        await updateDoc(docRef, {
          status: "review",
          reviewedAt: new Date(),
        });
        setApplications((prev) => ({
          ...prev,
          [examId]: { ...prev[examId], status: "review" },
        }));
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  // In ExamPage.jsx, update the handleStartExam function
  const handleStartExam = (exam) => {
    exam.subject = subjects;
    if (isAdmin) {
      // Open edit-exam in a new tab/window
      const examData = JSON.stringify(exam);
      const url = `/edit-exam?examData=${encodeURIComponent(examData)}`;
      window.open(url, '_blank');
    } else {
      navigate(`/exam-interface/${exam.id}`);
    }
  };

  const fetchExamResults = async (examId) => {
    try {
      setLoadingResults(true);
      const response = await fetch('https://7tklqol24ryrcbizyb3zccrhou0hiudz.lambda-url.ap-south-1.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify({
          examId: examId
        })
      });
      
      const data = await response.json();
      
      setExamResults(data);
      
      // Display results in a modal or new window
      const resultsWindow = window.open("", "_blank");
      if (resultsWindow) {
        resultsWindow.document.write(`
          <html>
            <head>
              <title>Exam Results - ${examId}</title>
              <style>
                ${examResultsStyles}
              </style>
            </head>
            <body>
              <h1>Exam Results</h1>
              <p>${data.message}</p>
              <table>
                <thead>
                  <tr>
                    <th class="clickable-header" onclick="toggleColumn('rank')">Rank </th>
                    <th class="clickable-header" onclick="toggleColumn('name')">Name </th>
                    <th class="clickable-header" onclick="toggleColumn('submitted-at')">Submitted At </th>
                    <th class="clickable-header" onclick="toggleColumn('time-spent')">Time Spent (mins) </th>
                    <th class="clickable-header" onclick="toggleColumn('physics')">Physics </th>
                    <th class="clickable-header" onclick="toggleColumn('chemistry')">Chemistry </th>
                    <th class="clickable-header" onclick="toggleColumn('mathematics')">Mathematics </th>
                    <th class="clickable-header" onclick="toggleColumn('total-marks')">Total Marks </th>
                    <th class="clickable-header" onclick="toggleColumn('delete')">Delete </th>
                  </tr>
                </thead>
                <tbody>
                  ${data.results.map((result, index) => {
                    const userEmail = result.email || result.userEmail || result.userId || 'N/A';
                    const deleteUrl = userEmail !== 'N/A' 
                      ? `https://5jcu22ihhuqkcummoqrf3rmuqq0ilvcp.lambda-url.ap-south-1.on.aws/?userId=${encodeURIComponent(userEmail)}&examId=${encodeURIComponent(examId)}`
                      : '#';
                    
                    return `
                    <tr>
                      <td class="rank">${index + 1}</td>
                      <td class="name">${result.name}</td>
                      <td class="submitted-at">${new Date(result.submittedAt).toLocaleString()}</td>
                      <td class="time-spent">${result.timeSpent}</td>
                      <td class="physics">${result.subjectResults.Physics ? `${result.subjectResults.Physics.totalMarks} (${result.subjectResults.Physics.correct}/${parseInt(result.subjectResults.Physics.correct) + parseInt(result.subjectResults.Physics.incorrect)})` : 'N/A'}</td>
                      <td class="chemistry">${result.subjectResults.Chemistry ? `${result.subjectResults.Chemistry.totalMarks} (${result.subjectResults.Chemistry.correct}/${parseInt(result.subjectResults.Chemistry.correct) + parseInt(result.subjectResults.Chemistry.incorrect)})` : 'N/A'}</td>
                      <td class="mathematics">${result.subjectResults.Mathematics ? `${result.subjectResults.Mathematics.totalMarks} (${result.subjectResults.Mathematics.correct}/${parseInt(result.subjectResults.Mathematics.correct) + parseInt(result.subjectResults.Mathematics.incorrect)})` : 'N/A'}</td>
                      <td class="total-marks">${result.totalMarks}</td>
                      <td class="delete" style="text-align: center;">
                        ${userEmail !== 'N/A' 
                          ? `<a href="${deleteUrl}" target="_blank" style="color: #dc3545; text-decoration: none; font-size: 16px;" onclick="return confirm('Are you sure you want to delete the exam result for ${userEmail}?')" title="Delete exam result for ${userEmail}">🗑️</a>`
                          : '<span style="color: #ccc;">—</span>'
                        }
                      </td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              
              <script>
                ${examResultsScript}
              </script>
            </body>
          </html>
        `);
        resultsWindow.document.close();
      }
    } catch (error) {
      console.error("Error fetching exam results:", error);
      alert("Failed to fetch exam results. Please try again.");
    } finally {
      setLoadingResults(false);
    }
  };

  const downloadExamResults = async (examId, examName) => {
    try {
      setLoadingResults(true);
      const response = await fetch('https://7tklqol24ryrcbizyb3zccrhou0hiudz.lambda-url.ap-south-1.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify({
          examId: examId
        })
      });
      
      const data = await response.json();
      
      // Prepare data for Excel export
      const excelData = data.results.map((result, index) => ({
        'Rank': index + 1,
        'Name': result.name,
        'Submitted At': new Date(result.submittedAt).toLocaleString(),
        'Time Spent (mins)': result.timeSpent,
        'Physics Score': result.subjectResults.Physics ? `${result.subjectResults.Physics.totalMarks} (${result.subjectResults.Physics.correct}/${parseInt(result.subjectResults.Physics.correct) + parseInt(result.subjectResults.Physics.incorrect)})` : 'N/A',
        'Chemistry Score': result.subjectResults.Chemistry ? `${result.subjectResults.Chemistry.totalMarks} (${result.subjectResults.Chemistry.correct}/${parseInt(result.subjectResults.Chemistry.correct) + parseInt(result.subjectResults.Chemistry.incorrect)})` : 'N/A',
        'Mathematics Score': result.subjectResults.Mathematics ? `${result.subjectResults.Mathematics.totalMarks} (${result.subjectResults.Mathematics.correct}/${parseInt(result.subjectResults.Mathematics.correct) + parseInt(result.subjectResults.Mathematics.incorrect)})` : 'N/A',
        'Total Marks': result.totalMarks,
        'Email': result.email || result.userEmail || result.userId || 'N/A'
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Results');
      
      // Generate Excel file and trigger download
      const fileName = `${examName || examId}_Results_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error("Error downloading exam results:", error);
      alert("Failed to download exam results. Please try again.");
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <>
      <style>{examPageStyles}</style>
      <div className="exam-page-container">
      {isAdmin && (
        <div className="exam-form-container">
          <h2 className="exam-form-title">
            Add New Exam
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">
                  Exam Name
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </label>
              </div>
              <div>
                <label className="form-label">
                  Batch
                  <select
                    value={formData.batch}
                    onChange={(e) =>
                      setFormData({ ...formData, batch: e.target.value })
                    }
                    required
                    className="form-select"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.name}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="sections-container">
                <label className="form-label">
                  Sections
                </label>
                <div className="sections-grid">
                  {subjects.map((section) => (
                    <label
                      key={section.id}
                      className="section-checkbox"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSections.includes(section.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSections([
                              ...selectedSections,
                              section.id,
                            ]);
                          } else {
                            setSelectedSections(
                              selectedSections.filter(
                                (id) => id !== section.id,
                              ),
                            );
                          }
                        }}
                        className="checkbox-input"
                      />
                      {section.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">
                  Date
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </label>
              </div>
              <div>
                <label className="form-label">
                  Time
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </label>
              </div>
              <div>
                <label className="form-label">
                  Duration (minutes)
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </label>
              </div>
              <div>
                <label className="form-label">
                  Total Marks
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </label>
              </div>
              <div>
                <label className="form-label">
                  Location
                  <input
                    type="text"
                    value={formData.videoKey}
                    onChange={(e) =>
                      setFormData({ ...formData, videoKey: e.target.value })
                    }
                    required
                    className="form-input"
                  />
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="orange-button"
            >
              Add Exam
            </button>
          </form>
        </div>
      )}

      <div className="exam-form-container">
        <div className="exams-header">
          <h2 className="exams-title">
            Upcoming Exams
          </h2>
          <div>
            <label className="filter-container">
              Filter by date:
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Exams</option>
              <option value="prevWeek">Previous Week</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="loading">
            Loading exams...
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="no-exams">
            No exams found for selected date filter
          </div>
        ) : (
          <div className="exams-table-container">
            <table className="exams-table">
              <thead>
                <tr className="table-header">
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0"
                    }}
                  >
                    Exam Name
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0"
                    }}
                  >
                    Subject
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0"
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0"
                    }}
                  >
                    Time
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0"
                    }}
                  >
                    Duration
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0"
                    }}
                  >
                    Total Marks
                  </th>
                  {isAdmin && (
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #e2e8f0"
                      }}
                    >
                      Actions
                    </th>
                  )}
                  {!isAdmin && (
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #e2e8f0"
                      }}
                    >
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr
                    key={exam.id}
                    style={{ ":hover": { backgroundColor: "#f7fafc" } }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e2e8f0",
                        cursor: "pointer",
                        position: "relative"
                      }}
                      onClick={() => handleStartExam(exam)}
                    >
                      {exam.name}
                      {submittedExams.includes(exam.id) && (
                        <div 
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "10px",
                            transform: "translateY(-50%)",
                            backgroundColor: "#4caf50",
                            color: "white",
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          Submitted
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {exam.sections
                        ?.map(
                          (sectionId) =>
                            subjects.find((s) => s.id === sectionId)?.name,
                        )
                        .join(", ")}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {exam.date}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {exam.time}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {exam.duration} mins
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {exam.totalMarks}
                    </td>
                    {isAdmin && (
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(exam.id);
                            }}
                            title="Delete Exam"
                            style={{
                              padding: "8px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <MdDelete size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchExamResults(exam.id);
                            }}
                            disabled={loadingResults}
                            title="View Results"
                            style={{
                              padding: "8px",
                              backgroundColor: "#ffa600",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: loadingResults ? "not-allowed" : "pointer",
                              opacity: loadingResults ? 0.7 : 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <MdAssessment size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadExamResults(exam.id, exam.name);
                            }}
                            disabled={loadingResults}
                            title="Download Excel"
                            style={{
                              padding: "8px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: loadingResults ? "not-allowed" : "pointer",
                              opacity: loadingResults ? 0.7 : 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <MdDownload size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                    {!isAdmin && (
                      <td
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ display: "flex" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplicationToggle(exam.id);
                            }}
                            style={{
                              padding: "6px 12px",
                              backgroundColor:
                                applications[exam.id]?.status === "review"
                                  ? "#4CAF50" // Green for review
                                  : applications[exam.id]?.status === "applied"
                                    ? "#FFA500" // Orange for applied
                                    : "#2196F3", // Blue for initial state
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                            }}
                          >
                            {applications[exam.id]?.status === "review"
                              ? "Reviewed"
                              : applications[exam.id]?.status === "applied"
                                ? "Review"
                                : "Apply"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default ExamPage;
