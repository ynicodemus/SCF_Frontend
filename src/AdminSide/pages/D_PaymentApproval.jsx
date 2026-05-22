import React, { useEffect, useState } from "react";
import api from "../../axios";
import "../css/DpaymentApproval.css";

function D_PaymentApproval() {
  const [payments, setPayments] = useState([]);
  const [approvedPayments, setApprovedPayments] = useState([]);
  const [rejectedPayments, setRejectedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [qr, setQr] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [qrName, setQrName] = useState("");
  const [qrNumber, setQrNumber] = useState("");
  const [preview, setPreview] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectName, setRejectName] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveName, setApproveName] = useState("");
  const [selectedApprovePayment, setSelectedApprovePayment] = useState(null);
  const [approveAmount, setApproveAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [approveYearCovered, setApproveYearCovered] = useState(new Date().getFullYear());


  useEffect(() => {
    fetchCurrentQR();
    fetchPayments();
  }, []);

 const fetchPayments = async () => {
  try {
    const pendingRes = await api.get("/SeniorConnect/admin/damayanpaymentrequests/pending/");
    setPayments(pendingRes.data);

    // FETCH APPROVED PAYMENTS FROM DAMAYANPAYMENT
    const approvedRes = await api.get("/SeniorConnect/damayanpayment/");
    const BASE_URL = "https://scf-backend-92qq.onrender.com";
    setApprovedPayments(
      approvedRes.data
        .filter((p) => p.paid_by === "citizen")
        .map((p) => ({
        id: p.id,
    
        // ✔ CITIZEN NAME
        citizen_name: p.citizen_info
          ? `${p.citizen_info.first_name} ${p.citizen_info.last_name}`
          : "N/A",
    
        // ✔ CITIZEN ID NUMBER (from your serializer)
        citizen_id: p.citizen_info?.id_number || "N/A",
    
        // ✔ AMOUNT
        amount: p.amount_paid || 0,
    
        // ✔ PROOF IMAGE
        proof_image: p.proof_image_url || null,

    
        // ✔ DATE
        date_submitted: p.date_paid || null,
    
        // ✔ REFERENCE NUMBER
        reference_number: p.reference_number || "—",
    
        // ✔ APPROVED BY
        approved_by: p.approved_by || "—",
      }))
    );
    
    

    const rejectedRes = await api.get("/SeniorConnect/admin/damayanpaymentrequests/rejected/");

    // 🔍 Debug: Check actual response from backend
    console.log("🔎 REJECTED DATA:", rejectedRes.data);

    setRejectedPayments(
      rejectedRes.data.map((p) => {
        // find matching citizen in pending list
        const match = pendingRes.data.find(
          (x) => x.citizen?.id === p.citizen
        );

        return {
          id: p.id,

          // name from backend OR fallback from pending
          citizen_name:
            p.citizen_name ||
            (match ? `${match.citizen.first_name} ${match.citizen.last_name}` : "N/A"),

          // ID number from pending match
          citizen_id: p.citizen_id_number || "N/A",


          amount: p.amount ?? 0,
          proof_image: p.proof_image || null,
          date_submitted: p.date_submitted || p.date_paid || null,

          rejected_by: p.rejected_by || "—",
          reject_reason: p.reason || p.reject_reason || "No reason",
        };
      })
    );





  } catch (error) {
    console.error("Error fetching payments:", error);
  } finally {
    setLoading(false);
  }
};


  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const fetchCurrentQR = async () => {
    try {
      const res = await api.get("/SeniorConnect/damayanpaymentqr/");
      if (res.data && res.data.length > 0) {
        setQr(res.data.find((q) => q.active) || res.data[0]);
      }
    } catch (error) {
      console.error("Error fetching QR:", error);
    }
  };

  const handleQRUpload = async (e) => {
    e.preventDefault();
    if (!qrImage) return alert("Please upload a QR image.");

    const formData = new FormData();
    formData.append("qr_image", qrImage);
    formData.append("gcash_name", qrName);
    formData.append("gcash_number", qrNumber);

    try {
      setUploading(true);
      await api.post("/SeniorConnect/damayanpaymentqr/", formData);
      showNotification("QR uploaded successfully!", "success");
      fetchCurrentQR();

      setQrImage(null);
      setQrName("");
      setQrNumber("");
    } catch (error) {
      console.error(error);
      showNotification("Failed to upload QR.", "error");
    } finally {
      setUploading(false);
    }
  };


  const handleRejectClick = (payment) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };

const handleRejectConfirm = async () => {
  if (!rejectName.trim()) {
    showNotification("Please enter your name.", "error");
    return;
  }

  if (!rejectReason.trim()) {
    showNotification("Please enter a reason for rejection.", "error");
    return;
  }

  try {
    await api.post(
      `/SeniorConnect/admin/damayanpaymentrequests/${selectedPayment.id}/reject/`,
      {
        reason: rejectReason,
        rejected_by: rejectName,
      }
    );

    showNotification("Payment rejected successfully.", "success");

    // CLOSE MODAL + RESET INPUTS
    setShowRejectModal(false);
    setRejectReason("");
    setRejectName("");
    setSelectedPayment(null);

    // REFRESH LIST
    fetchPayments();

  } catch (error) {
    console.error("Error rejecting payment:", error);
    showNotification("Failed to reject payment.", "error");
  }
};


  const handleApproveClick = (payment) => {
    setSelectedApprovePayment(payment);
    setApproveName("");
    setApproveAmount(payment.amount || "");
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!approveName.trim()) return alert("Please enter your name to approve.");
    if (!approveAmount || isNaN(Number(approveAmount)) || Number(approveAmount) <= 0) {
      return alert("Please enter a valid amount greater than 0.");
    }

    try {
      await api.post(
        `/SeniorConnect/admin/damayanpaymentrequests/${selectedApprovePayment.id}/approve/`,
        { 
          approved_by: approveName, 
          amount: Number(approveAmount),
          reference_number: referenceNumber,
          year_covered: approveYearCovered,
        }
      );

      alert("Payment approved!");

      // ✨✨ AUTO-SWITCH TO APPROVED TAB ✨✨
      setActiveTab("approved");

      setShowApproveModal(false);
      setSelectedApprovePayment(null);
      setApproveName("");
      setApproveAmount("");
      setReferenceNumber("");

      // refresh data
      fetchPayments();
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment.");
    }
  };


  const currentPayments =
    activeTab === "pending" ? payments :
    activeTab === "approved" ? approvedPayments :
    rejectedPayments;

  const handleDeleteApproved = async () => {
    if (!window.confirm("Are you sure you want to delete ALL approved payments? This cannot be undone.")) return;
    try {
      await api.delete("/SeniorConnect/admin/damayanpaymentrequests/delete-approved/");
      showNotification("All approved payments deleted successfully.", "success");
      fetchPayments();
    } catch (error) {
      console.error("Error deleting approved payments:", error);
      showNotification("Failed to delete approved payments.", "error");
    }
  };

  const handleDeleteRejected = async () => {
    if (!window.confirm("Are you sure you want to delete ALL rejected payments? This cannot be undone.")) return;
    try {
      await api.delete("/SeniorConnect/admin/damayanpaymentrequests/delete-rejected/");
      showNotification("All rejected payments deleted successfully.", "success");
      fetchPayments();
    } catch (error) {
      console.error("Error deleting rejected payments:", error);
      showNotification("Failed to delete rejected payments.", "error");
    }
  };

  const openDeleteModal = () => setShowDeleteModal(true);

  const handleDeleteOldRecords = async () => {
    try {
      const res = await api.delete("/SeniorConnect/admin/damayanpaymentrequests/delete_old_records/");
      setNotification({
        message: res.data.message || "✅ Old payment records deleted successfully.",
        type: "success",
      });
      setShowDeleteModal(false);
      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
      fetchPayments();
    } catch (error) {
      console.error("Error deleting old records:", error);
      setNotification({
        message: "❌ Failed to delete old payment records.",
        type: "error",
      });
      setShowDeleteModal(false);
      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    }
  };

  return (
    <div className="damaPA-container">
      {notification.message && (
        <div className={`damaPA-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <h2 className="damaPA-title">
        <span className="damaPA-title-accent"></span>
        Damayan Payment Approval
      </h2>

      {/* QR Section */}
      <div className="damaPA-qr-section">
        <h3>GCash QR Management</h3>
        <div className="damaPA-qr-two-column">
          <div className="damaPA-qr-left">
            <h4>Current GCash QR</h4>
            {qr ? (
              <>
                <img src={qr.qr_image} alt="Current QR" className="damaPA-qr-current-image" />
                <div className="damaPA-qr-info">
                  <p><strong>Account Name:</strong> {qr.gcash_name || "N/A"}</p>
                  <p><strong>GCash Number:</strong> {qr.gcash_number || "N/A"}</p>
                </div>
              </>
            ) : (
              <p>No current QR uploaded.</p>
            )}
          </div>

          <div className="damaPA-qr-right">
            <h4>Upload New GCash QR</h4>
            <form onSubmit={handleQRUpload} className="damaPA-qr-upload-form">
              <div className="damaPA-qr-form-group">
                <label>Upload QR Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setQrImage(e.target.files[0]);
                    if (e.target.files[0]) {
                      const previewURL = URL.createObjectURL(e.target.files[0]);
                      setPreview(previewURL);
                    }
                  }}
                  required
                />
                {preview && (
                  <img src={preview} alt="Preview QR" className="damaPA-qr-preview-image" />
                )}
              </div>

              <div className="damaPA-qr-form-group">
                <label>GCash Account Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  required
                />
              </div>

              <div className="damaPA-qr-form-group">
                <label>GCash Number:</label>
                <input
                  type="text"
                  placeholder="e.g. 09XXXXXXXXX"
                  value={qrNumber}
                  onChange={(e) => setQrNumber(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload QR"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="damaPA-tab-buttons">
        <button onClick={() => setActiveTab("pending")}
          className={activeTab === "pending" ? "damaPA-tab-active-pending" : "damaPA-tab"}>
          Pending Payments
        </button>
        <button onClick={() => setActiveTab("approved")}
          className={activeTab === "approved" ? "damaPA-tab-active-approved" : "damaPA-tab"}>
          Approved Payments
        </button>
        <button onClick={() => setActiveTab("rejected")}
          className={activeTab === "rejected" ? "damaPA-tab-active-rejected" : "damaPA-tab"}>
          Rejected Payments
        </button>
        {/* <button onClick={openDeleteModal} className="damaPA-btn-delete-old">
          🧹 Delete Old Records
        </button> */}
      </div>

      {showDeleteModal && (
        <div className="damaPA-modal-overlay">
          <div className="damaPA-modal-content">
            <h3>Delete Old Payment Records</h3>
            <p>Are you sure you want to permanently delete all approved/rejected payment records older than <strong>6 months</strong>?</p>
            <div className="damaPA-modal-buttons">
              <button onClick={handleDeleteOldRecords} className="damaPA-confirm-reject">Yes, Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="damaPA-cancel-reject">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* {activeTab === "approved" && (
        <button className="damaPA-delete-btn" onClick={handleDeleteApproved}>
          🗑 Delete All Approved Payments
        </button>
      )} */}
      {/* {activeTab === "rejected" && (
        <button className="damaPA-delete-btn damaPA-rejected" onClick={handleDeleteRejected}>
          🗑 Delete All Rejected Payments
        </button>
      )} */}

      <div className="damaPA-table-container">
        {loading ? <p>Loading payments...</p> :
          currentPayments.length === 0 ? (
            <p>No {activeTab} payments.</p>
          ) : (
            <table className="damaPA-payment-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID Number</th>
                  <th>Citizen</th>
                  <th>Amount</th>
                  <th>Proof</th>
                  <th>Date</th>
                  {activeTab === "approved" && (
                    <>
                      <th>Reference No.</th>
                      <th>Approved By</th>
                    </>
                  )}

                  {activeTab === "rejected" && <th>Rejected By</th>}
                  {activeTab === "pending" && <th>Actions</th>}
                  {activeTab === "rejected" && <th>Reason</th>}
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((p, index) => (
                  <tr key={p.id}>
                    <td>{index + 1}</td>
                    <td>{p.citizen_id || p.citizen_id_number || "N/A"}</td>
                    <td>{p.citizen_name || "N/A"}</td>
                    <td>₱{p.amount}</td>
                    <td>
                      {p.proof_image ? (
                        <span
                          className="damaPA-view-image"
                          onClick={() => setPreviewImage(p.proof_image)}
                        >
                          View
                        </span>
                      ) : (
                        "No image"
                      )}
                    </td>

                    <td>{new Date(p.date_submitted).toLocaleDateString()}</td>
                    {activeTab === "approved" && (
                      <>
                        <td>{p.reference_number || "—"}</td>
                        <td>{p.approved_by || "—"}</td>
                      </>
                    )}

                    {activeTab === "rejected" && <td>{p.rejected_by || "—"}</td>}
                    {activeTab === "pending" && (
                      <td>
                        <button className="damaPA-approve-btn" onClick={() => handleApproveClick(p)}>Approve</button>
                        <button className="damaPA-reject-btn" onClick={() => handleRejectClick(p)}>Reject</button>
                      </td>
                    )}
                    {activeTab === "rejected" && <td>{p.reject_reason || "No reason"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {previewImage && (
        <div className="damaPA-image-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="damaPA-image-modal">
            <img src={previewImage} alt="Proof" />
          </div>
        </div>
      )}


      {showApproveModal && (
        <div className="damaPA-modal-overlay">
          <div className="damaPA-modal-content">
            <h3>Approve Payment</h3>

            {/* APPROVER NAME */}
            <p>Enter your name to approve this payment:</p>
            <input
              type="text"
              value={approveName}
              onChange={(e) => setApproveName(e.target.value)}
              placeholder="Your name"
            />

            {/* AMOUNT */}
            <p style={{ marginTop: "10px" }}>Enter amount to record (₱):</p>
            <input
              type="number"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              placeholder="e.g. 100"
              min="0"
              step="0.01"
            />

            <p style={{ marginTop: "10px" }}>Year Covered:</p>

            <select
              value={approveYearCovered}
              onChange={(e) => setApproveYearCovered(e.target.value)}
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

            {/* REFERENCE NUMBER - NEW FIELD */}
            <p style={{ marginTop: "10px" }}>Reference Number:</p>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Enter GCash Reference Number"
            />

            <div className="damaPA-modal-buttons">
              <button onClick={handleApproveConfirm} className="damaPA-confirm-approve">
                Approve
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApproveName("");
                  setApproveAmount("");
                  setReferenceNumber(""); // reset
                }}
                className="damaPA-cancel-approve"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {showRejectModal && (
        <div className="damaPA-modal-overlay">
          <div className="damaPA-modal-content">
            <h3>Reject Payment</h3>
            <p>Enter your name:</p>
            <input
              type="text"
              value={rejectName}
              onChange={(e) => setRejectName(e.target.value)}
              placeholder="Your name"
            />
            <p style={{ marginTop: "10px" }}>Reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="4"
              placeholder="Enter reason here..."
            />
            <div className="damaPA-modal-buttons">
              <button onClick={handleRejectConfirm} className="damaPA-confirm-reject">
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRejectName("");
                }}
                className="damaPA-cancel-reject"
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

export default D_PaymentApproval;
