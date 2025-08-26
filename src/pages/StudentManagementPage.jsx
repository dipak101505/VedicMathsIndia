import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import StudentForm from "../components/StudentForm";
import BatchForm from "../components/BatchForm";
import SubjectForm from "../components/SubjectForm";
import CentreForm from "../components/CentreForm";
import EditStudentForm from "../components/EditStudentForm";
import ZenithForm from "../components/ZenithForm";
import InvoiceForm from "../components/InvoiceForm";
import { useAuth } from "../contexts/AuthContext";
import { deleteStudent } from "../services/studentService";
import { AiFillDelete } from "react-icons/ai";
import {
  PageContainer,
  HeaderSection,
  PageTitle,
  PageSubtitle,
  TabContainer,
  TabButton,
  SearchFilterSection,
  SearchInput,
  FilterSelect,
  StudentCount,
  AddButtonSection,
  AddStudentButton,
  TableContainer,
  TableWrapper,
  StyledTable,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
  StudentNameCell,
  StudentAvatar,
  StudentName,
  EmailCell,
  TagsContainer,
  Tag,
  AmountCell,
  AmountBadge,
  ActionsCell,
  ActionButton,
  ModalOverlay,
  ModalContent,
  FullScreenModalContent,
  PaymentHistoryModalContent,
  PaymentHistoryTitle,
  CloseButton,
  LoadingContainer,
  TabContentContainer,
  PaymentHistoryTooltip as StyledPaymentHistoryTooltip,
  PaymentItem,
  PaymentMonth,
  PaymentAmount,
  PaymentReceipt,
  PaymentMode
} from "../styles/studentManagementPage.styles";
import { theme } from "../styles/theme";

function StudentManagementPage() {
  const [activeTab, setActiveTab] = useState("students");
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [centres, setCentres] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCentre, setSelectedCentre] = useState("");
      const [showZenithForm, setShowZenithForm] = useState(false);
    const [selectedStudentForForm, setSelectedStudentForForm] = useState(null);
    const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
    const [studentForPaymentHistory, setStudentForPaymentHistory] = useState(null);
    const { user, isFranchise } = useAuth();

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesSnap, subjectsSnap, centresSnap, studentsSnap] =
          await Promise.all([
            getDocs(collection(db, "batches")),
            getDocs(collection(db, "subjects")),
            getDocs(collection(db, "centres")),
            getDocs(collection(db, "students")),
          ]);

        setBatches(
          batchesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
        setSubjects(
          subjectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
        setCentres(
          centresSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
        setStudents(
          studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
        if (isFranchise)
          setSelectedCentre(capitalizeFirstLetter(user.email.split("@")[0]));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStudentAdded = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
    setShowAddForm(false);
  };

  const handleStudentUpdate = (updatedStudent) => {
    setStudents(
      students.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student,
      ),
    );
    setSelectedStudent(null);
  };

  const handleClickOutside = (e) => {
    if (e.target.className === "modal-overlay") {
      setShowAddForm(false);
      setSelectedStudent(null);
    }
  };

  const filteredStudents = students.filter((student) => {
    const normalizedCentre = selectedCentre?.replace(/\s+/g, "");
    const matchesName = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBatch = selectedBatch
      ? student.batch.includes(selectedBatch)
      : true;
    const matchesCentre = selectedCentre
      ? student.centres?.map((centre) => centre.replace(/\s+/g, ""))
          .includes(normalizedCentre)
      : true;
    return matchesName && matchesBatch && matchesCentre;
  });

  const handleDelete = async (student) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteDoc(doc(db, "students", student.id));
        await deleteStudent(student.email);
        setStudents(students.filter((stud) => stud.id !== student.id));
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Error deleting student. Please try again.");
      }
    }
  };

  const handleEmailClick = (student) => {
    // Create a new URL with student data as query parameters
    const params = new URLSearchParams({
      studentData: JSON.stringify(student),
    });

    // Open in new tab
    window.open(`/receipt?${params.toString()}`, "_blank");
  };

  const handleNameClick = (student) => {
    setStudentForPaymentHistory(student);
    setShowPaymentHistoryModal(true);
  };


  // Add this near the top of the component
  const PaymentHistoryTooltip = ({ payments }) => {
    if (!payments?.length) return "No payment history";

    return (
      <StyledPaymentHistoryTooltip>
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
          {payments.map((payment, index) => (
            <PaymentItem key={index}>
              <PaymentMonth>
                {new Date(payment.month).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </PaymentMonth>
              <PaymentAmount>
                ₹{payment.amount}
              </PaymentAmount>
              <PaymentReceipt>
                Receipt: #{payment.receiptId}
              </PaymentReceipt>
              <PaymentMode>
                {payment.paymentMode}
              </PaymentMode>
            </PaymentItem>
          ))}
        </div>
      </StyledPaymentHistoryTooltip>
    );
  };

  const renderZenithFormModal = () => {
    if (!showZenithForm) return null;

    return (
      <ModalOverlay
        className="modal-overlay"
        onClick={(e) => {
          if (e.target.className === "modal-overlay") {
            setShowZenithForm(false);
            setSelectedStudentForForm(null);
          }
        }}
      >
        <FullScreenModalContent className="modal-content">
          <ZenithForm
            studentData={selectedStudentForForm}
            onClose={() => {
              setShowZenithForm(false);
              setSelectedStudentForForm(null);
            }}
          />
        </FullScreenModalContent>
      </ModalOverlay>
    );
  };

  const renderPaymentHistoryModal = () => {
    if (!showPaymentHistoryModal) return null;

    return (
      <ModalOverlay
        className="modal-overlay"
        onClick={(e) => {
          if (e.target.className === "modal-overlay") {
            setShowPaymentHistoryModal(false);
            setStudentForPaymentHistory(null);
          }
        }}
      >
        <PaymentHistoryModalContent className="modal-content">
          <PaymentHistoryTitle>Payment History for {studentForPaymentHistory.name}</PaymentHistoryTitle>
          <PaymentHistoryTooltip payments={studentForPaymentHistory.payments} />
          <CloseButton
            onClick={() => {
              setShowPaymentHistoryModal(false);
              setStudentForPaymentHistory(null);
            }}
          >
            Close
          </CloseButton>
        </PaymentHistoryModalContent>
      </ModalOverlay>
    );
  };


  if (loading) {
    return (
      <LoadingContainer>
        Loading...
      </LoadingContainer>
    );
  }

  const tabs = isFranchise
    ? ["students", "invoice"]
    : ["students", "batches", "subjects", "centres", "invoice"];

  return (
    <PageContainer>
      <HeaderSection>
        <PageTitle>
          Student Management
        </PageTitle>
        <PageSubtitle>
          Manage students, batches, subjects, and centres
        </PageSubtitle>
      </HeaderSection>

      {/* Tab Navigation */}
      <TabContainer>
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </TabButton>
        ))}
      </TabContainer>

      {activeTab === "students" && (
        <div>
          {/* Search and Filter Section - Now only visible in students tab */}
          <SearchFilterSection>
            <SearchInput
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterSelect
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.name}>
                  {batch.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              disabled={isFranchise}
            >
              <option value="">All Centres</option>
              {centres.map((centre) => (
                <option key={centre.id} value={centre.name}>
                  {centre.name}
                </option>
              ))}
            </FilterSelect>
            <StudentCount>Displaying {filteredStudents?.length} students</StudentCount>
          </SearchFilterSection>

          {/* Add Student Button */}
          <AddButtonSection>
            <AddStudentButton onClick={() => setShowAddForm(true)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Student
            </AddStudentButton>
          </AddButtonSection>

          {/* Students Table */}
          <TableContainer>
            <TableWrapper>
              <StyledTable>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Batch</TableHeaderCell>
                    <TableHeaderCell>Centres</TableHeaderCell>
                    <TableHeaderCell>Subjects</TableHeaderCell>
                    <TableHeaderCell>Amount Pend.</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </tr>
                </TableHeader>
                                  <tbody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <StudentNameCell>
                          <StudentAvatar
                            src={student.imageUrl || "/default-avatar.png"}
                            alt={student.name}
                          />
                          <StudentName onClick={() => handleNameClick(student)}>
                            {student.name}
                          </StudentName>
                        </StudentNameCell>
                        <EmailCell onClick={() => handleEmailClick(student)}>
                          {student.email}
                        </EmailCell>
                        <TableCell>
                          {student.batch}
                        </TableCell>
                        <TableCell>
                          <TagsContainer>
                            {student.centres?.map((centre) => (
                              <Tag key={centre}>
                                {centre}
                              </Tag>
                            ))}
                          </TagsContainer>
                        </TableCell>
                        <TableCell>
                          <TagsContainer>
                            {student.subjects?.map((subject) => (
                              <Tag key={subject}>
                                {subject}
                              </Tag>
                            ))}
                          </TagsContainer>
                        </TableCell>
                        <AmountCell hasPending={student.amountPending > 0}>
                          <AmountBadge hasPending={student.amountPending > 0}>
                            ₹{student.amountPending || 0}
                          </AmountBadge>
                        </AmountCell>
                        <ActionsCell>
                          <ActionButton onClick={() => setSelectedStudent(student)}>
                            Edit
                          </ActionButton>
                          {!isFranchise && (
                            <ActionButton
                              variant="danger"
                              onClick={() => handleDelete(student)}
                            >
                              <AiFillDelete />
                            </ActionButton>
                          )}
                        </ActionsCell>
                      </TableRow>
                    ))}
                  </tbody>
                </StyledTable>
              </TableWrapper>
            </TableContainer>

          {/* Modal Forms */}
          {showAddForm && (
            <ModalOverlay className="modal-overlay" onClick={handleClickOutside}>
              <ModalContent className="modal-content">
                <StudentForm
                  onStudentAdded={handleStudentAdded}
                  onClose={() => setShowAddForm(false)}
                  batches={batches}
                  subjects={subjects}
                  centres={centres}
                />
              </ModalContent>
            </ModalOverlay>
          )}

          {selectedStudent && (
            <ModalOverlay className="modal-overlay" onClick={handleClickOutside}>
              <ModalContent className="modal-content">
                <EditStudentForm
                  student={selectedStudent}
                  onClose={() => setSelectedStudent(null)}
                  onUpdate={handleStudentUpdate}
                  batches={batches}
                  subjects={subjects}
                  centres={centres}
                />
              </ModalContent>
            </ModalOverlay>
          )}
          {renderZenithFormModal()}
          {renderPaymentHistoryModal()}
        </div>
      )}

      {/* Other tabs content */}
      {activeTab === "batches" && (
        <TabContentContainer>
          <BatchForm batches={batches} setBatches={setBatches} />
        </TabContentContainer>
      )}
      {activeTab === "subjects" && (
        <TabContentContainer>
          <SubjectForm subjects={subjects} setSubjects={setSubjects} />
        </TabContentContainer>
      )}
      {activeTab === "centres" && (
        <TabContentContainer>
          <CentreForm centres={centres} setCentres={setCentres} />
        </TabContentContainer>
      )}
      {activeTab === "invoice" && (
        <TabContentContainer>
          <InvoiceForm students={students} />
        </TabContentContainer>
      )}
    </PageContainer>
  );
}

export default StudentManagementPage;
