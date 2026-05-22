import React, { useState, useEffect } from "react";
import axios from "axios";
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

  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const response = await api.get("/SeniorConnect/citizens/");
        setCitizens(response.data);
        setDamayanMembers(
          response.data.filter((citizen) => citizen.is_damayan_member)
        );
      } catch (err) {
        setError("Failed to load citizens.");
      } finally {
        setLoading(false);
      }
    };
    fetchCitizens();
  }, []);

  const getFullName = (member) => {
    const { first_name, middle_name, last_name, suffix } = member;
    return [first_name, middle_name, last_name, suffix]
      .filter(Boolean)
      .join(" ");
  };

  const handleVerifyId = () => {
    setVerifyError("");
    const found = citizens.find(
      (c) => (c.id_number + "").trim() === verifyId.trim()
    );
    if (!found) {
      setVerifyResult(null);
      setVerifyError("No citizen found with this ID.");
      return;
    }
    if (found.is_damayan_member) {
      setVerifyError("This citizen is already a Damayan member.");
      setVerifyResult(null);
      return;
    }
    setVerifyResult(found);
  };

  const handleSubmitDamayanApproval = async () => {
    if (!verifyResult) return;
    setIsSubmittingRequest(true);
    setAddStatus("");
    try {
      console.log("Token being sent:", localStorage.getItem("adminToken"));
      await api.post("/SeniorConnect/damayan-approval-request/", {
        citizen_id: verifyResult.id,
      });
      setAddStatus("Request sent for approval!");
      setShowAddModal(false);
      setVerifyId("");
      setVerifyResult(null);
      setVerifyError("");
    } catch (error) {
      setAddStatus("Failed to send request. Please try again.");
    }
    setIsSubmittingRequest(false);
  };

  const handlePayClick = (memberId) => {
    setPayingMemberId(memberId);
    setPaymentInfo({
      amount: "",
      date_paid: "",
      covered_from: "",
      covered_to: "",
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
        covered_from: paymentInfo.covered_from || null,
        covered_to: paymentInfo.covered_to || null,
        remarks: paymentInfo.remarks || "",
        paid_by: "admin",
      };

      const response = await api.post("/SeniorConnect/damayanpayment/", payload);

      if (response.status >= 200 && response.status < 300) {
        setSubmitStatus("Payment recorded successfully!");
        setPayingMemberId(null);
        setGlobalStatus("Manual payment saved.");
        setTimeout(() => setGlobalStatus(""), 3000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setSubmitStatus("Failed to record payment. Please try again.");
    }
  };

  const handleHistoryClick = async (citizenIdNumber) => {
    try {
      const response = await api.get(
        `/SeniorConnect/damayan_member_history_admin/?citizen_id_number=${citizenIdNumber}`
      );
      setHistoryData(response.data);
      setViewingHistoryId(citizenIdNumber);
    } catch (error) {
      console.error("Error fetching member history:", error);
    }
  };

  const handleClaimClick = (memberId) => {
    setClaimingId(memberId);
    setClaimStatus("");
  };

  const handleConfirmClaim = async () => {
    setIsClaiming(true);
    setClaimStatus("");
    try {
      await axios.post("/SeniorConnect/damayanclaim/", {
        citizen_id: claimingId,
        claimed_by: "admin",
      });
      setClaimStatus("Benefit claimed successfully.");
      setTimeout(() => {
        setClaimingId(null);
        setClaimStatus("");
      }, 2000);
    } catch (err) {
      setClaimStatus("Claim failed. Please try again.");
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
  if (error) return <p className="text-red">{error}</p>;

  return (
    <div className="DamayanMainCont">
      <h2>Damayan Program Members</h2>

      {/* Header controls: Add + Search */}
      <div className="damayan-header-controls right-align">
        <button
          className="BtnAddDamayan"
          onClick={() => {
            setShowAddModal(true);
            setVerifyId("");
            setVerifyResult(null);
            setVerifyError("");
            setAddStatus("");
          }}
        >
          Add Damayan Member
        </button>

        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="damayan-search-input"
        />
      </div>

      <div className="damayan-total">
        Total Damayan Program Members: <strong>{damayanMembers.length}</strong>
      </div>


      {addStatus && <div className="DAddStatus">{addStatus}</div>}

      {globalStatus && <div className="toast-success">{globalStatus}</div>}

      {/* Damayan Members Table */}
      <table className="damayan-table">
        <thead>
          <tr>
            <th>Citizen ID</th>
            <th>Full Name</th>
            <th>Age</th>
            <th>Member Since</th>
            <th>Last Pay</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">No Damayan members found</td>
            </tr>
          ) : (
            filteredMembers.map((member) => {
              const memberHistory = historyData.filter(
                (h) => h.citizen_id_number === member.id_number
              );
              const lastPayment =
                memberHistory.length > 0
                  ? new Date(
                      memberHistory[memberHistory.length - 1].date
                    ).toLocaleDateString()
                  : "—";

              return (
                <tr key={member.id_number}>
                  <td>{member.id_number}</td>
                  <td>{getFullName(member)}</td>
                  <td>{computeAge(member.birth_date)}</td>
                  <td>
                    {member.damayan_member_since
                      ? new Date(member.damayan_member_since).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{lastPayment}</td>
                  <td className="actions-cell">
                    <button onClick={() => handleHistoryClick(member.id_number)} className="BtnHistory">
                      History
                    </button>
                    <button onClick={() => handlePayClick(member.id_number)} className="BtnPay">
                      Pay
                    </button>
                    <button onClick={() => handleClaimClick(member.id_number)} className="BtnClaim">
                      Claim
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* ADD DAMAYAN MEMBER MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Damayan Member</h3>
            <label>Enter Citizen ID Number:</label>
            <input
              type="text"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              placeholder="Enter ID Number"
            />
            <button onClick={handleVerifyId} className="btn-verify">Verify</button>

            {verifyError && <p className="error-text">{verifyError}</p>}

            {verifyResult && (
              <div className="verify-result">
                <p><strong>Name:</strong> {getFullName(verifyResult)}</p>
                <p><strong>Age:</strong> {computeAge(verifyResult.birth_date)}</p>
                <p><strong>Barangay:</strong> {verifyResult.barangay}</p>
                <button
                  onClick={handleSubmitDamayanApproval}
                  className="btn-submit"
                  disabled={isSubmittingRequest}
                >
                  {isSubmittingRequest ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            )}

            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {payingMemberId && (
        <div className="modal-overlay">
          <div className="modal-content">
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

            <div className="form-group">
              <label>Amount Paid (₱):</label>
              <input
                type="number"
                name="amount"
                value={paymentInfo.amount}
                onChange={handlePaymentChange}
                placeholder="Enter amount"
              />
            </div>

            <div className="form-group">
              <label>Date Paid:</label>
              <input
                type="date"
                name="date_paid"
                value={paymentInfo.date_paid}
                onChange={handlePaymentChange}
              />
            </div>

            <div className="form-group">
              <label>Covered From:</label>
              <input
                type="month"
                name="covered_from"
                value={paymentInfo.covered_from || ""}
                onChange={handlePaymentChange}
              />
            </div>

            <div className="form-group">
              <label>Covered To:</label>
              <input
                type="month"
                name="covered_to"
                value={paymentInfo.covered_to || ""}
                onChange={handlePaymentChange}
              />
            </div>

            <div className="form-group">
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
                className={`payment-status ${
                  submitStatus.toLowerCase().includes("success")
                    ? "success"
                    : "error"
                }`}
              >
                {submitStatus}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-submit"
                onClick={() => submitPayment(payingMemberId)}
              >
                Submit Payment
              </button>
              <button
                className="btn-cancel"
                onClick={() => setPayingMemberId(null)}
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
