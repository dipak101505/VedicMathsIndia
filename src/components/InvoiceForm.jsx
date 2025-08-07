import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import * as XLSX from "xlsx";

function InvoiceForm({ students }) {
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    month: "",
    paymentMode: "cash",
    description: "",
  });
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoginId, setSelectedLoginId] = useState(""); // State for selected loginId
  const [loginIds, setLoginIds] = useState([]); // State for available loginIds
  const { user, isFranchise } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const receiptsRef = collection(db, "receipts");
        const q = query(receiptsRef, orderBy("createdAt", "desc"), limit(1000));
        const querySnapshot = await getDocs(q);
        const receiptsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReceipts(receiptsList);

        // Extract unique loginIds from receipts
        let uniqueLoginIds = [
          ...new Set(receiptsList.map((receipt) => receipt.loginId)),
        ];
        //filter out email domain
        uniqueLoginIds = uniqueLoginIds.map((loginId) => loginId.split("@")[0]);
        setLoginIds(uniqueLoginIds);
        if (isFranchise) setSelectedLoginId(user.email.split("@")[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching receipts:", error);
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedStudent = students.find((s) => s.id === formData.studentId);

      // Create invoice document
      await addDoc(collection(db, "invoices"), {
        ...formData,
        studentName: selectedStudent.name,
        studentEmail: selectedStudent.email,
        createdAt: new Date(),
        status: "pending",
        receiptId: `INV-${Date.now()}`,
      });

      // Reset form
      setFormData({
        studentId: "",
        amount: "",
        month: "",
        paymentMode: "cash",
        description: "",
      });

      alert("Invoice created successfully!");
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Error creating invoice. Please try again.");
    }
  };

  // Helper function to format payment mode
  const formatPaymentMode = (paymentMode) => {
    if (typeof paymentMode === "object") {
      // If it's an object, find the first true value
      return Object.keys(paymentMode).find((key) => paymentMode[key]) || "N/A";
    }
    return paymentMode || "N/A";
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    } else if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }
    return "N/A";
  };

  // Helper function to format month
  const formatMonth = (month) => {
    if (!month) return "N/A";
    return new Date(month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleReceiptClick = (receipt) => {
    // Create a new URL with student data as query parameters
    const subject = [];

    let paymentMode = "";

    if (receipt.subjects["maths"]) {
      subject.push("Mathematics");
    }
    if (receipt.subjects["physics"]) {
      subject.push("Physics");
    }
    if (receipt.subjects["chemistry"]) {
      subject.push("Chemistry");
    }
    if (receipt.subjects["biology"]) {
      subject.push("Biology");
    }
    if (receipt.subjects["AI"]) {
      subject.push("AI");
    }
    if (receipt.subjects["Robotics"]) {
      subject.push("Robotics");
    }

    const params = new URLSearchParams({
      studentData: JSON.stringify({
        id: receipt.studentId,
        name: receipt.name,
        email: receipt.studentEmail,
        registrationNo: receipt.registrationNo,
        admissionFee: receipt.admissionFee,
        detail: receipt.detail,
        monthlyInstallment: receipt.tuitionFee,
        month: receipt.month,
        subjects: subject,
        paymentMode: receipt.paymentMode,
        chequeNo: receipt.chequeNo,
        save: false,
      }),
    });

    // Open in new tab using the existing receipt page structure
    window.open(`/receipt?${params.toString()}`, "_blank");
  };

  const handleLoginIdChange = (event) => {
    setSelectedLoginId(event.target.value);
  };

  const getFilteredReceipts = () => {
    return receipts.filter((receipt) => {
      // Centre filter
      if (selectedLoginId && !receipt.loginId.includes(selectedLoginId)) {
        return false;
      }

      // Date filter
      if (startDate || endDate) {
        const receiptDate =
          receipt.createdAt instanceof Date
            ? receipt.createdAt
            : new Date(receipt.createdAt);

        if (startDate && receiptDate < new Date(startDate)) {
          return false;
        }

        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          if (receiptDate > endDateTime) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const filteredReceipts = getFilteredReceipts();

  // Function to export receipts to Excel
  const exportToExcel = () => {
    if (filteredReceipts.length === 0) {
      alert("No receipts to export");
      return;
    }

    // Prepare data for export
    const exportData = filteredReceipts.map((receipt) => {
      return {
        Date: formatDate(receipt.createdAt),
        "Receipt ID": receipt.id,
        "Student Name": receipt.name,
        Amount: `₹${receipt.total}`,
        Month: formatMonth(receipt.month),
        "Payment Mode": formatPaymentMode(receipt.paymentMode),
        Center: receipt.loginId ? receipt.loginId.split("@")[0] : "N/A",
        "Student Email": receipt.studentEmail || "N/A",
        "Registration No": receipt.registrationNo || "N/A",
      };
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receipt History");

    // Generate filename with date range if specified
    let filename = "Receipt_History";
    if (startDate && endDate) {
      filename += `_${startDate}_to_${endDate}`;
    } else if (startDate) {
      filename += `_from_${startDate}`;
    } else if (endDate) {
      filename += `_until_${endDate}`;
    }
    if (selectedLoginId) {
      filename += `_${selectedLoginId}`;
    }
    filename += ".xlsx";

    // Write the file and download
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div>
      {/* Filters Section */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {/* Centre Filter */}
        <div>
          <label
            htmlFor="loginIdFilter"
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#4a5568",
              fontSize: "14px",
            }}
          >
            Centre
          </label>
          <select
            id="loginIdFilter"
            value={selectedLoginId}
            onChange={handleLoginIdChange}
            disabled={isFranchise}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              width: "150px",
            }}
          >
            <option value="">All Centers</option>
            {loginIds.map((loginId) => (
              <option key={loginId} value={loginId}>
                {loginId}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div>
          <label
            htmlFor="startDate"
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#4a5568",
              fontSize: "14px",
            }}
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              width: "150px",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#4a5568",
              fontSize: "14px",
            }}
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              width: "150px",
            }}
          />
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setSelectedLoginId("");
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#e2e8f0",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#4a5568",
            fontSize: "14px",
          }}
        >
          Clear Filters
        </button>

        {/* Results Count */}
        <div
          style={{
            marginLeft: "auto",
            color: "#718096",
            fontSize: "14px",
          }}
        >
          Showing {filteredReceipts.length} receipts
        </div>
      </div>

      {/* Receipts List */}
      <div style={{ marginTop: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ color: "#2d3748", margin: 0 }}>Receipt History</h3>

          {/* Export to Excel Button */}
          <button
            onClick={exportToExcel}
            disabled={filteredReceipts.length === 0 || loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "orange",
              border: "none",
              borderRadius: "8px",
              cursor:
                filteredReceipts.length === 0 || loading
                  ? "not-allowed"
                  : "pointer",
              color: "white",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: filteredReceipts.length === 0 || loading ? 0.7 : 1,
              width: "10vw",
            }}
          >
            {/* Download Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Loading receipts...
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No receipts found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Receipt ID
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Student Name
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Month
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Payment Mode
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      "&:hover": { backgroundColor: "#f8fafc" },
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      {formatDate(receipt.createdAt)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        cursor: "pointer",
                        color: "#2563eb",
                        textDecoration: "underline",
                      }}
                      onClick={() => handleReceiptClick(receipt)}
                    >
                      {receipt.id}
                    </td>
                    <td style={{ padding: "12px" }}>{receipt.name}</td>
                    <td style={{ padding: "12px" }}>₹{receipt.total}</td>
                    <td style={{ padding: "12px" }}>
                      {formatMonth(receipt.month)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          textTransform: "capitalize",
                        }}
                      >
                        {formatPaymentMode(receipt.paymentMode)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceForm;
