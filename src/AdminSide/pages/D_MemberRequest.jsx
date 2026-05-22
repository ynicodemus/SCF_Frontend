import React, { useEffect, useState } from "react";
import api from "../../axios";
import "../css/DMemberRequest.css";

function DMemberRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);


  // Fetch pending requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          "/SeniorConnect/damayan-approval-request/list/",
          { params: { status: "pending" } }
        );
        setRequests(res.data);
      } catch (err) {
        setActionStatus("Failed to load requests.");
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  // Filtered requests based on search
  const filteredRequests = requests.filter((req) => {
    const citizen = req.citizen || {};
    const query = searchQuery.trim().toLowerCase();

    // ✅ If search is empty, show all
    if (!query) return true;

    const idNumber = citizen.id_number ? citizen.id_number.toLowerCase() : "";
    const firstName = citizen.first_name ? citizen.first_name.toLowerCase() : "";
    const lastName = citizen.last_name ? citizen.last_name.toLowerCase() : "";
    const fullName = `${firstName} ${lastName}`;

    return (
      idNumber.includes(query) ||
      firstName.includes(query) ||
      lastName.includes(query) ||
      fullName.includes(query)
    );
  });


  // Handle Approve
  const handleApprove = async (requestId) => {
    setActionLoading(true);
    setActionStatus("");
    try {
      await api.post(`/SeniorConnect/damayan-approval-request/${requestId}/approve/`);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setActionStatus("✅ Request approved!");
    } catch {
      setActionStatus("❌ Approval failed.");
    }
    setActionLoading(false);
    setConfirmAction(null);
  };

  // Handle Reject
  const handleReject = async (requestId) => {
    if (!rejectReason) {
      setActionStatus("⚠️ Please select or enter a reason before rejecting.");
      return;
    }

    setActionLoading(true);
    setActionStatus("");
    try {
      await api.post(`/SeniorConnect/damayan-approval-request/${requestId}/reject/`, {
        reason: rejectReason,
      });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setActionStatus("⚠️ Request rejected!");
      setRejectReason("");
      setShowRejectForm(false);
      setSelectedRequest(null);
    } catch {
      setActionStatus("❌ Rejection failed.");
    }
    setActionLoading(false);
    setConfirmAction(null);
  };

  const handleSearchClick = async () => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setActionStatus("⚠️ Please enter a name or ID number to search.");
      setTimeout(() => setActionStatus(""), 2500);
      return;
    }

    try {
      // ✅ Fetch all citizens
      const res = await api.get("/SeniorConnect/citizens/");
      const allCitizens = res.data || [];

      // ✅ Filter only Damayan members
      const damayanMembers = allCitizens.filter((m) => m.is_damayan_member === true);

      // ✅ Match by first name, last name, or ID number
      const matched = damayanMembers.filter((m) => {
        const firstName = (m.first_name || "").toLowerCase();
        const lastName = (m.last_name || "").toLowerCase();
        const idNumber = (m.id_number || "").toLowerCase();
        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          idNumber.includes(query)
        );
      });

      setSearchResults(matched);
      setShowSearchModal(true);
    } catch (err) {
      console.error("Error searching Damayan members:", err);
      setActionStatus("❌ Failed to search Damayan members.");
      setTimeout(() => setActionStatus(""), 2500);
    }
  };





  return (
    <div className="damaMR-container">
      {/* 🔍 Header with Search */}
      <div className="damaMR-header">
        <h2 className="damaMR-title">
          <span className="damaMR-title-accent"></span>
          Pending Damayan Membership Requests
        </h2>

        <div className="damaMR-searchWrapper">
          <input
            type="text"
            placeholder="Search to check if Already Member..."
            className="damaMR-searchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
          />
          <button className="damaMR-searchBtn" onClick={handleSearchClick}>
            🔍︎
          </button>
        </div>
      </div>

      {loading && (
        <div className="damaMR-loading-overlay">
          <div className="damaMR-spinner"></div>
          <span>Loading requests...</span>
        </div>
      )}

      {actionStatus && (
        <div
          className={`damaMR-status-message ${
            actionStatus.includes("fail") ? "damaMR-error" : "damaMR-success"
          }`}
        >
          {actionStatus}
        </div>
      )}

      <div className="damaMR-table-container">
        <table className="damaMR-member-request-table">
          <thead>
            <tr>
              <th>ID Number</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Barangay</th>
              <th>Date Requested</th>
              <th style={{ width: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="damaMR-no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="damaMR-no-data">
                  No pending requests found.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const citizen = req.citizen;
                return (
                  <tr key={req.id}>
                    <td>{citizen?.id_number || "-"}</td>
                    <td>{citizen?.last_name || "-"}</td>
                    <td>{citizen?.first_name || "-"}</td>
                    <td>{citizen?.address || "-"}</td>
                    <td>
                      {req.requested_at
                        ? new Date(req.requested_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="damaMR-action-buttons">
                      <button
                        className="damaMR-btn damaMR-btn-success"
                        disabled={actionLoading}
                        onClick={() =>
                          setConfirmAction({
                            type: "approve",
                            message: `Approve ${citizen?.first_name} ${citizen?.last_name}?`,
                            requestId: req.id,
                          })
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="damaMR-btn damaMR-btn-danger"
                        disabled={actionLoading}
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowRejectForm(true);
                        }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Approve Confirmation Modal */}
      {confirmAction && confirmAction.type === "approve" && (
        <div className="damaMR-modal-overlay">
          <div className="damaMR-modal-content small">
            <p>{confirmAction.message}</p>
            <div className="damaMR-confirm-actions">
              <button
                className="damaMR-btn damaMR-btn-success"
                onClick={() => handleApprove(confirmAction.requestId)}
                disabled={actionLoading}
              >
                Yes, Approve
              </button>
              <button
                className="damaMR-btn damaMR-btn-outline"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ❌ Reject Form Modal */}
      {showRejectForm && selectedRequest && (
        <div className="damaMR-modal-overlay">
          <div className="damaMR-modal-content">
            <p>
              Please select or enter the reason for rejecting{" "}
              <b>
                {selectedRequest.citizen.last_name},{" "}
                {selectedRequest.citizen.first_name}
              </b>
              ’s Damayan membership request:
            </p>

            <select
              className="damaMR-reject-select"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              <option value="">-- Select a reason --</option>
              <option value="Already a member">Already a member</option>
              <option value="Incomplete information">
                Incomplete information
              </option>
              <option value="Duplicate request">Duplicate request</option>
              <option value="Other">Other (specify below)</option>
            </select>

            {rejectReason === "Other" && (
              <input
                type="text"
                className="damaMR-reject-input"
                placeholder="Enter custom reason"
                onChange={(e) => setRejectReason(e.target.value)}
              />
            )}

            <div className="damaMR-confirm-actions">
              <button
                className="damaMR-btn damaMR-btn-danger"
                onClick={() => handleReject(selectedRequest.id)}
                disabled={actionLoading}
              >
                Confirm Reject
              </button>
              <button
                className="damaMR-btn damaMR-btn-outline"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 Search Result Modal */}
      {showSearchModal && (
        <div className="damaMR-modal-overlay">
          <div className="damaMR-modal-content damaMR-search-modal">
            <h3 className="damaMR-search-title">Search Results</h3>
            <p>
              Showing {searchResults.length} Damayan member
              {searchResults.length !== 1 && "s"}.
            </p>

            <div className="damaMR-search-table-container">
              <table className="damaMR-search-table">
                <thead>
                  <tr>
                    <th>ID Number</th>
                    <th>Name</th>
                    <th>Birth Date</th>
                    <th>Barangay</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="damaMR-no-data">
                        No matching Damayan members found.
                      </td>
                    </tr>
                  ) : (
                    searchResults.map((m) => (
                      <tr key={m.id_number}>
                        <td>{m.id_number}</td>
                        <td>
                          {[m.last_name, m.first_name]
                            .filter(Boolean)
                            .join(", ")}
                        </td>
                        <td>{m.birth_date || "—"}</td>
                        <td>{m.barangay || m.address || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="damaMR-modal-actions">
              <button
                className="damaMR-btn damaMR-btn-outline"
                onClick={() => setShowSearchModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DMemberRequest;
