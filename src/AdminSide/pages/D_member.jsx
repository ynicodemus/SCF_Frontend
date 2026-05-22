import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../css/Dmember.css";
import api from "../../axios";


function DamayanMember() {
  const [citizens, setCitizens] = useState([]);
  const [damayanMembers, setDamayanMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingMemberId, setPayingMemberId] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    amount: "",
    date_paid: "",
    covered_from: "",
    covered_to: "",
    remarks: "",
  });

  const [claimData, setClaimData] = useState({
    claimant_name: "",
    death_certificate: null,
    claimant_id: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  

  const [submitStatus, setSubmitStatus] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [viewingHistoryId, setViewingHistoryId] = useState(null);
  const [globalStatus, setGlobalStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [addStatus, setAddStatus] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [claimStatus, setClaimStatus] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [noPaymentWarning, setNoPaymentWarning] = useState(false);
  const [selectedMemberForClaim, setSelectedMemberForClaim] = useState(null);


  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // ✅ Only close if the click was outside the action menu
      if (e.target.closest(".damaM-action-menu")) return;
      setOpenDropdown(null);
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);


  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const response = await api.get("/SeniorConnect/citizens/");
        const allCitizens = response.data;
        const members = allCitizens.filter((c) => c.is_damayan_member && !c.is_archived);
  
        // Fetch last payment for each Damayan member
        const withLastPay = await Promise.all(
          members.map(async (member) => {
            try {
              const res = await api.get(
                `/SeniorConnect/damayan_member_history_admin/?citizen_id_number=${member.id_number}`
              );
              const payments = res.data;
              if (payments.length > 0) {
                const lastPayment = payments[payments.length - 1];
                member.last_payment_date = lastPayment.date_paid || lastPayment.date || null;
              } else {
                member.last_payment_date = null;
              }
            } catch {
              member.last_payment_date = null;
            }
            return member;
          })
        );
  
        setCitizens(allCitizens);
        setDamayanMembers(withLastPay);
      } catch (err) {
        setError("Failed to load citizens.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCitizens();
  }, []);


  const [filterYear, setFilterYear] = useState("");
  const filteredHistory = filterYear
    ? historyData.filter((h) => h.year_covered == filterYear)
    : historyData;

    const cleanNumber = (val) => {
      if (val === null || val === undefined) return 0;
      // Convert to string, remove all characters except digits, dot, minus sign
      const s = String(val).trim();
      // Remove currency symbols, plus signs, commas, spaces, parentheses, letters, etc.
      // Keep only digits, dot and minus sign (first minus preserved)
      // Remove any plus signs explicitly
      const cleaned = s.replace(/\+/g, "").replace(/[^0-9.\-]/g, "");
      // If there are multiple dots, keep the first dot only
      const normalized = cleaned.replace(/\.(?=.*\.)/g, "");
      const n = parseFloat(normalized);
      return Number.isFinite(n) ? n : 0;
    };
    
    const exportToPDF = () => {
      const doc = new jsPDF();
    
      const citizen = citizens.find((c) => c.id_number === viewingHistoryId);
      const name = citizen ? getFullName(citizen) : "Unknown";
    
      // Total contribution (use cleaned absolute values)
      const totalContribution = historyData
        .reduce((total, item) => {
          const amt = cleanNumber(item.amount_paid ?? item.amount ?? 0);
          return total + Math.abs(amt);
        }, 0)
        .toFixed(2);
    
      // Header
      doc.setFontSize(16);
      doc.text("Damayan Payment History", 14, 20);
    
      doc.setFontSize(12);
      doc.text(`ID Number: ${viewingHistoryId}`, 14, 30);
      doc.text(`Name: ${name}`, 14, 37);
      doc.text(`Total Contribution: ₱${totalContribution}`, 14, 44);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 51);
    
      // Table (no year covered)
      const tableColumn = ["Type", "Amount", "Date", "Remarks", "Status"];
    
      const tableRows = historyData.map((h) => {
        const rawAmt = h.amount_paid ?? h.amount ?? 0;
        const amtNum = Math.abs(cleanNumber(rawAmt)); // cleaned and absolute
        const amtStr = `₱${amtNum.toFixed(2)}`;
    
        const dateStr = h.date_paid
          ? new Date(h.date_paid).toLocaleDateString()
          : h.date
          ? new Date(h.date).toLocaleDateString()
          : "—";
    
        return [
          h.type || "—",
          amtStr,
          dateStr,
          h.remarks || "—",
          h.status || "—",
        ];
      });
    
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [16, 66, 130] },
      });
    
      // Save
      doc.save(`${viewingHistoryId}_PaymentHistory.pdf`);
    };
    
    
    




  const getFullName = (member) => {
    const { first_name, middle_name, last_name, suffix } = member;
    return [first_name, middle_name, last_name, suffix]
      .filter(Boolean)
      .join(" ");
  };

  const handleVerifyId = async () => {
    setVerifyError("");
    setVerifyResult(null);
  
    const found = citizens.find(
      (c) => (c.id_number + "").trim() === verifyId.trim()
    );
  
    if (!found) {
      setVerifyError("No citizen found with this ID.");
      return;
    }
  
    // ✅ Already a Damayan member
    if (found.is_damayan_member) {
      setVerifyError("This citizen is already a Damayan member.");
      return;
    }
  
    try {
      // ✅ Check existing claim records
      const claimRes = await api.get("/SeniorConnect/damayanclaims/");
      const existingClaim = claimRes.data.find(
        (claim) => claim.citizen?.id_number === found.id_number
      );
  
      // 🛑 BLOCK if this person already had a released claim
      if (existingClaim && existingClaim.status === "Released") {
        setVerifyError(
          "This citizen already received a Damayan death benefit and cannot be re-added."
        );
        return;
      }
  
      // 🛑 BLOCK if this person currently has an active claim
      if (
        existingClaim &&
        ["Pending", "On Process", "For Budget Approval", "Approved"].includes(
          existingClaim.status
        )
      ) {
        setVerifyError(
          "This citizen currently has an active Damayan claim request and cannot be added."
        );
        return;
      }
  
      // ✅ Passed all checks — allow adding
      setVerifyResult(found);
    } catch (err) {
      console.error("Error verifying claim status:", err);
      setVerifyError("Failed to verify claim status. Try again later.");
    }
  };
  
  

  const handleSubmitAddMember = async () => {
    if (!verifyResult) return;
    setIsSubmittingRequest(true);
    setAddStatus("");
    try {
      const token = localStorage.getItem("adminToken");
      console.log("adminToken:", token);
  
      await api.post(
        "/SeniorConnect/damayan/add-member/",
        { id_number: verifyResult.id_number },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      setAddStatus("Citizen successfully added as Damayan member!");
      setShowAddModal(false);
      setVerifyId("");
      setVerifyResult(null);
      setVerifyError("");
  
      // Refresh Damayan members list immediately after adding
      const response = await api.get("/SeniorConnect/citizens/");
      setCitizens(response.data);
      setDamayanMembers(response.data.filter((c) => c.is_damayan_member));
    } catch (error) {
      console.error("Error adding member:", error);
      setAddStatus("Failed to add member. Please try again.");
    }
    setIsSubmittingRequest(false);
  };
  

  const handlePayClick = (memberId) => {
    setPayingMemberId(memberId);

    setPaymentInfo({
      amount: "",
      date_paid: new Date().toISOString().split("T")[0],
      year_covered: new Date().getFullYear(),
      remarks: "",
    });

    setSubmitStatus("");
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const submitPayment = async (memberId) => {
    const citizen = citizens.find((citizen) => citizen.id_number === memberId);
    if (!citizen) {
      setSubmitStatus("Citizen not found.");
      return;
    }
  
    try {
      const payload = {
        senior_citizen: citizen.id_number,
        amount_paid: parseFloat(paymentInfo.amount),
        date_paid: paymentInfo.date_paid,
        year_covered: paymentInfo.year_covered || null,
        remarks: paymentInfo.remarks || "",
        paid_by: "admin",
      };
  
      const response = await api.post("/SeniorConnect/manual_damayan_payment/", payload, {
        headers: {
          Authorization: `Token ${localStorage.getItem("adminToken")}`,
        },
      });
      


  
      if (response.status >= 200 && response.status < 300) {
        setSubmitStatus("Payment recorded successfully!");
        setPayingMemberId(null);
        setGlobalStatus("Manual payment saved.");
        setTimeout(() => setGlobalStatus(""), 3000);
  
        // Fetch updated history for this member immediately
        handleHistoryClick(citizen.id_number);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setSubmitStatus("Failed to record payment. Please try again.");
    }
  };

  const handleDeleteAllHistory = async (citizenIdNumber) => {
    if (!window.confirm("Are you sure you want to delete ALL payment history for this member?")) return;
  
    try {
      await api.delete(`/SeniorConnect/delete_damayan_history/?citizen_id_number=${citizenIdNumber}`);
      setHistoryData([]); // clear table instantly
      setGlobalStatus("All payment history deleted successfully.");
      setTimeout(() => setGlobalStatus(""), 3000);
    } catch (error) {
      console.error("Error deleting history:", error);
      alert("Failed to delete all history. Please try again.");
    }
  };
  
  
  const handleHistoryClick = async (citizenIdNumber) => {
    const response = await api.get(
      `/SeniorConnect/damayan_member_history_admin/?citizen_id_number=${citizenIdNumber}`
    );
    setHistoryData(response.data);
    setViewingHistoryId(citizenIdNumber);
  };
  

  const handleClaimClick = async (memberId) => {
    try {
      // Reset claim modal
      setClaimingId(null);

      // 🔎 Check payment history
      const res = await api.get(
        `/SeniorConnect/damayan_member_history_admin/?citizen_id_number=${memberId}`
      );

      const payments = res.data || [];

      if (payments.length === 0) {
        // ⚠️ No payment → show warning modal only
        setSelectedMemberForClaim(memberId);
        setNoPaymentWarning(true);
        return;
      }

      // ✅ Has payments → allow normal claim filing
      setClaimingId(memberId);
      setClaimStatus("");
    } catch (err) {
      console.error("Error checking payment history:", err);
      setGlobalStatus("Failed to check payment history. Please try again.");
      setTimeout(() => setGlobalStatus(""), 3000);
    }
  };




  const handleConfirmClaim = async () => {
    setIsClaiming(true);
    setClaimStatus("");
  
    if (
      !claimData.claimant_name ||
      !claimData.death_certificate ||
      !claimData.claimant_id
    ) {
      setClaimStatus("Please provide claimant name, death certificate, and claimant ID.");
      setIsClaiming(false);
      return;
    }
  
    try {
      const formData = new FormData();
  
      // ✅ ITO ANG CRITICAL FIX
      formData.append("citizen_id_number", claimingId);   // ← HINDI citizen_id
  
      formData.append("claimant_name", claimData.claimant_name);
      formData.append("claimant_id", claimData.claimant_id);
      formData.append("death_certificate", claimData.death_certificate);
  
      await api.post("/SeniorConnect/damayanclaims/", formData, {
        headers: {
          Authorization: `Token ${localStorage.getItem("adminToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      setClaimStatus("Claim submitted successfully!");
  
      setDamayanMembers(prev =>
        prev.filter(member => member.id_number !== claimingId)
      );
  
      setClaimData({
        claimant_name: "",
        death_certificate: null,
        claimant_id: null,
      });
  
      setTimeout(() => {
        setClaimingId(null);
        setClaimStatus("");
      }, 2000);
  
    } catch (err) {
      console.error("Claim error:", err.response?.data || err);
      setClaimStatus("Failed to submit claim. Please try again.");
    }
  
    setIsClaiming(false);
  };
  
  

  const filteredMembers = damayanMembers.filter((member) => {
    const term = search.toLowerCase();
    const name = [member.first_name, member.middle_name, member.last_name, member.suffix]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const id = (member.id_number || "").toLowerCase();
    return name.includes(term) || id.includes(term);
  });

  const computeAge = (birthdate) => {
    if (!birthdate) return "—";
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  if (loading) return <p>Loading citizens...</p>;
  if (error) return <p className="damaM-text-red">{error}</p>;

  const handleExportDamayanPayments = async () => {
    try {
      const response = await api.get("/SeniorConnect/damayanpayment/", {
        headers: { "Content-Type": "application/json" },
      });

      const payments = response.data;

      if (!payments || payments.length === 0) {
        alert("No Damayan payments available for export.");
        return;
      }

      // ✅ Format data for CSV
      const csvData = payments.map((p) => ({
        "ID Number": p.senior_citizen?.id_number || "N/A",
        "Full Name": p.senior_citizen
          ? `${p.senior_citizen.last_name}, ${p.senior_citizen.first_name} ${p.senior_citizen.middle_name || ""}`
          : "N/A",
        "Amount Paid": p.amount_paid,
        "Date Paid": p.date_paid,
        "Year Covered": p.year_covered,
        "Paid By": p.paid_by || "N/A",
        "Paid Via": p.paid_via || "N/A",
        "Approved By": p.approved_by_name || "—",
        "Remarks": p.remarks || "—",
        "Status": p.status || "N/A",
      }));

      // ✅ Convert to CSV
      const csv = Papa.unparse(csvData);

      // ✅ Trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", `Damayan_Payments_Backup_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting Damayan payments:", error);
      alert("Failed to export Damayan payment data.");
    }
  };




const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.max(
  1,
  Math.ceil(filteredMembers.length / itemsPerPage)
);

  return (
    <div className="damaM-main">
      <div className="damaM-header-top">
        <h2 className="damaM-title">
          <span className="damaM-title-accent"></span>
          Damayan Program Members
        </h2>

        <div className="damaM-actions-right">
          <button
            className="damaM-btn-add"
            onClick={() => {
              setShowAddModal(true);
              setVerifyId("");
              setVerifyResult(null);
              setVerifyError("");
              setAddStatus("");
            }}
          >
            Add Member
          </button>

          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="damaM-search-input"
          />
        </div>
      </div>


      <div className="damaM-summary-row">
        <div className="damaM-total">
          Total Damayan Program Members: <strong>{damayanMembers.length}</strong>
        </div>

        <button
          className="damaM-btn-download"
          onClick={handleExportDamayanPayments} // your export function
        >
          Download CSV
        </button>
      </div>


      {addStatus && <div className="damaM-add-status">{addStatus}</div>}
      {globalStatus && <div className="damaM-toast-success">{globalStatus}</div>}

      {/* Damayan Members Table */}
      <div className="damaM-table-container">
        <table className="damaM-table">
          <thead>
            <tr>
              <th>Citizen ID</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Barangay</th>
              <th>Date Joined</th>
              <th>Last Pay</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentMembers.length === 0 ? (
              <tr>
                <td colSpan="7" className="damaM-no-data">No Damayan members found</td>
              </tr>
            ) : (
              currentMembers.map((member) => (
                <tr key={member.id_number}>
                  <td>{member.id_number}</td>
                  <td>{member.last_name}</td>
                  <td>{member.first_name}</td>
                  <td>{member.barangay || member.address || "—"}</td>
                  <td>
                    {member.date_damayan_joined
                      ? new Date(member.date_damayan_joined).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className={!member.last_payment_date ? "damaM-no-pay" : ""}>
                    {member.last_payment_date
                      ? new Date(member.last_payment_date + "T00:00:00").toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "No payment yet"}
                  </td>
                  <td className="damaM-actions-cell">
                    <div className="damaM-action-menu">
                      <button
                        className="damaM-menu-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(member.id_number);
                        }}
                      >
                        ⋮
                      </button>

                      {openDropdown === member.id_number && (
                        <div className="damaM-dropdown">
                          <button onClick={() => handleHistoryClick(member.id_number)}>History</button>
                          <button onClick={() => handlePayClick(member.id_number)}>Pay</button>
                          <button onClick={() => handleClaimClick(member.id_number)}>Claim</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
        <div className="damaM-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* HISTORY MODAL */}
      {viewingHistoryId && (
        <div className="damaM-modal-overlay">
          <div className="damaM-modal-content damaM-history-modal">
            <h3 className="damaM-history-title">Payment History</h3>

            {/* Basic Info Section */}
            <div className="damaM-history-info">
              <div className="damaM-history-info-left">
                <p><strong>ID:</strong> {viewingHistoryId}</p>
                <p>
                  <strong>Name:</strong>{" "}
                  {getFullName(
                    citizens.find((c) => c.id_number === viewingHistoryId) || {}
                  )}
                </p>
                <p><strong>Total Payments:</strong> {historyData.length}</p>
              </div>

              <div className="damaM-history-info-right">
                <p>
                  <strong>Total Contribution:</strong>{" "}
                  ₱
                  {historyData
                    .reduce((total, item) => total + parseFloat(item.amount_paid || 0), 0)
                    .toFixed(2)}
                </p>
                <p>
                  <strong>Last Payment:</strong>{" "}
                  {historyData.length > 0
                    ? new Date(
                        historyData[historyData.length - 1].date_paid ||
                        historyData[historyData.length - 1].date
                      ).toLocaleDateString()
                    : "—"}
                </p>
                <button className="damaM-btn-export" onClick={exportToPDF}>
                ⬇ Download
              </button>
              </div>
            </div>

            {/* Filter + Export */}
            <div className="damaM-history-filters">

              
            </div>

            {/* Table Section */}
            <div className="damaM-history-table-container">
              <table className="damaM-history-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Year Covered</th>
                    <th>Remarks</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="damaM-no-data">
                        <div className="damaM-empty">
                          <p>No payment history available for this member.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((h, idx) => (
                      <tr key={idx}>
                        <td>{h.type || "—"}</td>
                        <td>₱{h.amount || h.amount_paid || "—"}</td>
                        <td>
                          {h.date
                            ? new Date(h.date).toLocaleDateString()
                            : h.date_paid
                            ? new Date(h.date_paid).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{h.year_covered || "—"}</td>
                        <td title={h.remarks}>{h.remarks || "—"}</td>
                        <td>{h.status || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="damaM-history-actions">
              {/* <button
                className="damaM-btn-delete-all"
                onClick={() => handleDeleteAllHistory(viewingHistoryId)}
              >
                Delete All History
              </button> */}
              <button className="damaM-btn-cancel" onClick={() => setViewingHistoryId(null)}>
                Close
              </button>
            </div>
          </div>

        </div>
      )}

      {/* CLAIM MODAL */}
      {claimingId && (
        <div className="damaM-modal-overlay">
          <div className="damaM-modal-content">
            <h3>File Damayan Claim</h3>
            <p>
              <strong>Member ID:</strong> {claimingId}
            </p>
            <p>
              <strong>Member Name:</strong>{" "}
              {getFullName(
                citizens.find((c) => c.id_number === claimingId) || {}
              )}
            </p>

            <div className="damaM-form-group">
              <label>Claimant Name:</label>
              <input
                type="text"
                value={claimData.claimant_name}
                onChange={(e) =>
                  setClaimData({ ...claimData, claimant_name: e.target.value })
                }
                placeholder="Enter claimant's full name"
              />
            </div>

            <div className="damaM-form-group">
              <label>Upload Claimant Valid ID:</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  setClaimData({
                    ...claimData,
                    claimant_id: e.target.files[0],
                  })
                }
              />
            </div>


            <div className="damaM-form-group">
              <label>Upload Death Certificate:</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setClaimData({
                    ...claimData,
                    death_certificate: e.target.files[0],
                  })
                }
              />
            </div>

            {claimStatus && (
              <div
                className={`damaM-claim-status ${
                  claimStatus.toLowerCase().includes("success")
                    ? "damaM-success"
                    : "damaM-error"
                }`}
              >
                {claimStatus}
              </div>
            )}

            <div className="damaM-modal-actions">
              <button
                className="damaM-btn-submit"
                onClick={handleConfirmClaim}
                disabled={isClaiming}
              >
                {isClaiming ? "Submitting..." : "Submit Claim"}
              </button>
              <button
                className="damaM-btn-cancel"
                onClick={() => setClaimingId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ADD DAMAYAN MEMBER MODAL */}
      {showAddModal && (
        <div className="damaM-modal-overlay">
          <div className="damaM-modal-content">
            <h3>Add Damayan Member</h3>
            <p className="damaM-modal-desc">
              Enter the <strong>Citizen ID Number</strong> of the senior you want to add to the Damayan Program.
            </p>
            <input
              type="text"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              placeholder="Enter ID Number"
            />
            <div className="damaM-verify-actions">
              <button id="verify" onClick={handleVerifyId} className="damaM-btn-verify">Verify</button>
              <button className="damaM-btn-cancel" onClick={() => setShowAddModal(false)}>Close</button>
            </div>


            {verifyError && <p className="damaM-error-text">{verifyError}</p>}

            {verifyResult && (
              <div className="damaM-verify-result">
                <p><strong>Name:</strong> {getFullName(verifyResult)}</p>
                <p><strong>Age:</strong> {computeAge(verifyResult.birth_date)}</p>
                <p><strong>Barangay:</strong> {verifyResult.barangay}</p>
                <button
                  onClick={handleSubmitAddMember}
                  className="damaM-btn-submit"
                  disabled={isSubmittingRequest}
                >
                  {isSubmittingRequest ? "Adding..." : "Add Member"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {payingMemberId && (
        <div className="damaM-modal-overlay">
          <div className="damaM-modal-content">
            <h3>Manual Payment Entry</h3>

            <p>
              <strong>Member ID:</strong> {payingMemberId}
            </p>
            <p>
              <strong>Member Name:</strong>{" "}
              {getFullName(
                citizens.find((c) => c.id_number === payingMemberId) || {}
              )}
            </p>

            <div className="damaM-form-group">
              <label>Amount Paid (₱):</label>
              <input
                type="number"
                name="amount"
                value={paymentInfo.amount}
                onChange={handlePaymentChange}
                placeholder="Enter amount"
              />
            </div>


            <div className="damaM-form-group">
              <label>Year:</label>

              <select
                name="year_covered"
                value={paymentInfo.year_covered}
                onChange={handlePaymentChange}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;

                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>

              <small className="damaM-help-text">
                Maximum contribution per year is ₱250.
                Excess payments will automatically apply to the next year(s).
              </small>
            </div>


            <div className="damaM-form-group">
              <label>Remarks (optional):</label>
              <textarea
                name="remarks"
                value={paymentInfo.remarks || ""}
                onChange={handlePaymentChange}
                placeholder="Add any note or remarks..."
                rows="2"
              ></textarea>
            </div>

            {submitStatus && (
              <div
                className={`damaM-payment-status ${
                  submitStatus.toLowerCase().includes("success")
                    ? "damaM-success"
                    : "damaM-error"
                }`}
              >
                {submitStatus}
              </div>
            )}

            <div className="damaM-modal-actions">
              <button
                className="damaM-btn-submit"
                onClick={() => submitPayment(payingMemberId)}
              >
                Submit Payment
              </button>
              <button
                className="damaM-btn-cancel"
                onClick={() => setPayingMemberId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    {/* ⚠️ NO PAYMENT WARNING MODAL */}
    {noPaymentWarning && (
      <div className="damaM-modal-overlay">
        <div className="damaM-modal-content damaM-warning-modal">
          <h3 className="damaM-warning-title">No Contribution Found</h3>
          <p className="damaM-warning-text">
            This user doesn’t have any contribution to this Damayan.
            <br />
            If you proceed on claiming, this user will no longer be a Damayan member.
          </p>
          <div className="damaM-warning-actions">
            <button
              className="damaM-btn-proceeds"
              onClick={async () => {
                try {
                  // Close modal first
                  setNoPaymentWarning(false);

                  // 🔄 Call backend endpoint to remove from Damayan
                  const token = localStorage.getItem("adminToken");
                  await api.post(
                    "/SeniorConnect/damayan/remove-member/",
                    { id_number: selectedMemberForClaim },
                    {
                      headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  // 🔔 Success message and update UI instantly
                  setGlobalStatus("Member successfully removed from Damayan Program.");

                  // Remove from frontend list immediately
                  setDamayanMembers((prev) =>
                    prev.filter((m) => m.id_number !== selectedMemberForClaim)
                  );

                  // Reset
                  setSelectedMemberForClaim(null);
                  setTimeout(() => setGlobalStatus(""), 4000);
                } catch (err) {
                  console.error("Error removing member:", err);
                  setGlobalStatus("Failed to remove member. Please try again.");
                  setTimeout(() => setGlobalStatus(""), 4000);
                }
              }}
            >
              Proceed Anyway
            </button>


            <button
              className="damaM-btn-cancels"
              onClick={() => {
                setNoPaymentWarning(false);
                setSelectedMemberForClaim(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default DamayanMember;
