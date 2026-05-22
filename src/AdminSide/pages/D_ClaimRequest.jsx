import React, { useEffect, useState } from "react";
import api from "../../axios";
import "../css/DClaim.css";

function D_ClaimRequest() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedReleaseClaim, setSelectedReleaseClaim] = useState(null);
  const [releaseProof, setReleaseProof] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [budgetOfficeAmount, setBudgetOfficeAmount] = useState("");
  const [showBudgetModal, setShowBudgetModal] = useState(false);


  // Fetch all claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get("/SeniorConnect/damayanclaims/");
        setClaims(response.data);
      } catch (err) {
        setError("Failed to load claim requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  // Approve handler (endorse or approve)
  // inside D_ClaimRequest.jsx (admin)

  const handleApprove = async (claim) => {
    let nextStatus = "";
    let uiMessage = "";
  
    // Endorse
    if (claim.status === "On Process" || claim.status === "Pending") {
      nextStatus = "For Budget Approval";
      uiMessage = "Claim request has been forwarded to the Budget Office.";
    }
  
    // Budget approval DONE → Ready for Release
    else if (claim.status === "For Budget Approval") {
      nextStatus = "Approved";
      uiMessage = "Claim request has been approved by the Budget Office.";
    }
  
    // Approved → Ready for Release (NEW, EXTRA STEP)
    else if (claim.status === "Approved") {
      nextStatus = "Ready for Release";
      uiMessage = "Claim is ready for release.";
    }
  
    else {
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("status", nextStatus);
  
      await api.patch(
        `/SeniorConnect/damayanclaims/${claim.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      setActionStatus(uiMessage);
  
      setClaims(prev =>
        prev.map(c =>
          c.id === claim.id ? { ...c, status: nextStatus } : c
        )
      );
    } catch (err) {
      setActionStatus("❌ Failed to update claim status.");
    }
  };
  
  


  const handleRelease = async () => {
    if (!selectedReleaseClaim) return;
  
    const claim = selectedReleaseClaim;
  
    try {
      const formData = new FormData();
      formData.append("status", "Released");

      const totalAmount =
        Number(claim.total_contribution || 0) +
        Number(claim.budget_office_amount || 0);

      formData.append("benefit_amount", totalAmount);
  
      if (releaseProof) {
        formData.append("release_proof", releaseProof);
      }
  
      await api.patch(
        `/SeniorConnect/damayanclaims/${claim.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      // ✅ UI CLEANUP
      setClaims(prev => prev.filter(c => c.id !== claim.id));
      setShowReleaseModal(false);
      setSelectedReleaseClaim(null);
      setReleaseProof(null);
  
      setActionStatus("✔ Claim released and archived successfully.");
      setTimeout(() => setActionStatus(""), 3000);
  
    } catch (err) {
      console.error("Release error:", err.response?.data || err);
      setActionStatus("❌ Failed to release claim.");
      setTimeout(() => setActionStatus(""), 3000);
    }
  };
  
  
  const handleReadyForRelease = async () => {
    if (!selectedReleaseClaim || !budgetOfficeAmount) return;

    try {
      const formData = new FormData();

      formData.append("status", "Ready for Release");
      formData.append("budget_office_amount", budgetOfficeAmount);

      await api.patch(
        `/SeniorConnect/damayanclaims/${selectedReleaseClaim.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setClaims(prev =>
        prev.map(c =>
          c.id === selectedReleaseClaim.id
            ? {
                ...c,
                status: "Ready for Release",
                budget_office_amount: budgetOfficeAmount,
              }
            : c
        )
      );

      setShowBudgetModal(false);
      setBudgetOfficeAmount("");
      setSelectedReleaseClaim(null);

      setActionStatus("✔ Claim is now ready for release.");

    } catch (err) {
      setActionStatus("❌ Failed to update claim.");
    }
  };

  if (loading) return <p>Loading claims...</p>;
  if (error) return <p className="damaCR-text-red">{error}</p>;

  return (
    <div className="damaCR-container">
      <h2 className="damaCR-title">
        <span className="damaCR-title-accent"></span>
        Damayan Claim Requests
      </h2>

      {actionStatus && <div className="damaCR-status-msg">{actionStatus}</div>}

      <table className="damaCR-table">
        <thead>
          <tr>
            <th>Citizen ID</th>
            <th>Full Name</th>
            <th>Date of Claim</th>
            <th>Amount Contributed</th>
            <th>Certificate</th>
            <th>Status</th>
            <th>Claimant</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.length === 0 ? (
            <tr>
              <td colSpan="8" className="damaCR-no-data">
                No claim requests found
              </td>
            </tr>
          ) : (
            claims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.citizen?.id_number}</td>
                <td>
                  {[claim.citizen?.first_name, claim.citizen?.middle_name, claim.citizen?.last_name]
                    .filter(Boolean)
                    .join(" ")}
                </td>
                <td>{claim.date_of_claim}</td>
                <td>₱{claim.total_contribution?.toLocaleString() || "0.00"}</td>
                <td>
                  {claim.death_certificate ? (
                    <button
                      type="button"
                      className="damaCR-view-btn"
                      onClick={() => {
                        setSelectedImage(claim.death_certificate);
                        setShowImageModal(true);
                      }}
                    >
                      View
                    </button>
                  ) : (
                    "No file"
                  )}
                </td>
                <td>{claim.status}</td>
                <td>{claim.claimant_name || "—"}</td>
                <td className="damaCR-actions">
                {["On Process", "Pending"].includes(claim.status) && (
                  <button
                    onClick={() => handleApprove(claim)}
                    className="damaCR-btn-endorse"
                  >
                    Endorse to Budget Office
                  </button>
                
                )}

                {claim.status === "For Budget Approval" && (
                  <button onClick={() => handleApprove(claim)}
                  className="damaCR-btn-approve">
                    Approve (Budget Office)
                  </button>
                )}

                {claim.status === "Approved" && (
                  <button
                    onClick={() => {
                      setSelectedReleaseClaim(claim);
                      setShowBudgetModal(true);
                    }}
                    className="damaCR-btn-ready"
                  >
                    Ready for Release
                  </button>
                )}

                {claim.status === "Ready for Release" && (
                  <button
                    onClick={() => {
                      setSelectedReleaseClaim(claim);
                      setShowReleaseModal(true);
                    }}
                    className="damaCR-btn-release"
                  >
                    Mark as Released
                  </button>
                )}

                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showBudgetModal && selectedReleaseClaim && (
        <div className="damaCR-modal-overlay">
          <div className="damaCR-modal-content">

            <h3>Ready for Release</h3>

            <p>
              Enter approved amount from Budget Office:
            </p>

            <input
              type="number"
              placeholder="Enter amount"
              value={budgetOfficeAmount}
              onChange={(e) => setBudgetOfficeAmount(e.target.value)}
              className="damaCR-input"
            />

            <div className="damaCR-modal-actions">
              <button
                onClick={handleReadyForRelease}
                className="damaCR-btn-submit"
                disabled={!budgetOfficeAmount}
              >
                Confirm
              </button>

              <button
                onClick={() => {
                  setShowBudgetModal(false);
                  setBudgetOfficeAmount("");
                }}
                className="damaCR-btn-cancel"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {showImageModal && (
        <div
          className="damaCR-modal-overlay"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="damaCR-image-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Death Certificate"
              className="damaCR-preview-image"
            />

            <button
              onClick={() => setShowImageModal(false)}
              className="damaCR-btn-cancel"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showReleaseModal && selectedReleaseClaim && (
        <div className="damaCR-modal-overlay">
          <div className="damaCR-modal-content">
            <h3>Confirm Release</h3>

            <p>
              Do you confirm that claimant{" "}
              <strong>{selectedReleaseClaim.claimant_name}</strong>
              {" "}will receive:
            </p>

            <ul className="damaCR-release-summary">
              <li>
                Contribution Amount:
                <strong>
                  ₱{Number(selectedReleaseClaim.total_contribution || 0).toLocaleString()}
                </strong>
              </li>

              <li>
                Budget Office Amount:
                <strong>
                  ₱{Number(selectedReleaseClaim.budget_office_amount || 0).toLocaleString()}
                </strong>
              </li>

              <li>
                Total Release Amount:
                <strong>
                  ₱{(
                    Number(selectedReleaseClaim.total_contribution || 0) +
                    Number(selectedReleaseClaim.budget_office_amount || 0)
                  ).toLocaleString()}
                </strong>
              </li>
            </ul>


            <p className="damaCR-upload-label" >
              Upload proof of release (required):
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReleaseProof(e.target.files[0])}
              className="damaCR-file-input"
              required
            />

            <div className="damaCR-modal-actions">
              <button
                onClick={handleRelease}
                className="damaCR-btn-submit"
                disabled={!releaseProof}
              >
                Confirm Release
              </button>

              <button
                onClick={() => {
                  setShowReleaseModal(false);
                  setReleaseProof(null);
                }}
                className="damaCR-btn-cancel"
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

export default D_ClaimRequest;
