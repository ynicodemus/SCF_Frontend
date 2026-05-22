import React, { useEffect, useState } from "react";
import api from "../../axios";
import "../css/MemberRequest.css"; // renamed for clarity

function MemberRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewImage, setViewImage] = useState(null);

  // Rejection states
  const [rejectionTargetId, setRejectionTargetId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Approval states
  const [approveTarget, setApproveTarget] = useState(null);
  const [enteredId, setEnteredId] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);


  const predefinedReasons = [
    "Uploaded ID is unclear",
    "Own Picture does not match ID",
    "Incomplete information",
    "Duplicated submission",
    "Other",
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/SeniorConnect/memberrequests/");
      setRequests(res.data.filter((req) => req.status === "pending"));
    } catch (error) {
      alert("Error fetching member requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (req) => {
    const fullName = `${req.first_name} ${req.middle_name || ""} ${req.last_name} ${
      req.suffix || ""
    }`.trim();
    setApproveTarget({ id: req.id, fullName });
    setEnteredId("");
  };

  const confirmApprove = async () => {
    if (!enteredId.trim()) {
      alert("Please enter an ID number before approving.");
      return;
    }

    setActionLoading(approveTarget.id + "approved");
    try {
      await api.patch(`/SeniorConnect/memberrequests/${approveTarget.id}/`, {
        status: "approved",
        id_number: enteredId,
      });
      setApproveTarget(null);
      fetchRequests();
    } catch (error) {
      alert("Failed to approve request.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (id) => {
    setRejectionTargetId(id);
    setRejectionReason("");
    setCustomReason("");
  };

  const confirmRejection = async () => {
    const finalReason =
      rejectionReason === "Other" ? customReason : rejectionReason;

    if (!finalReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setActionLoading(rejectionTargetId + "rejected");
    try {
      await api.patch(`/SeniorConnect/memberrequests/${rejectionTargetId}/`, {
        status: "rejected",
        rejection_reason: finalReason,
      });
      setRejectionTargetId(null);
      fetchRequests();
    } catch (error) {
      alert("Failed to reject request.");
    } finally {
      setActionLoading(null);
    }
  };


    // ✅ EXPORT TO CSV HANDLER
  const handleExportCSV = () => {
    if (!requests || requests.length === 0) {
      alert("No data to export.");
      return;
    }

    // Define CSV headers
    const headers = [
      "Last Name",
      "First Name",
      "Middle Name",
      "Suffix",
      "Barangay",
      "Birth Date",
      "Sex",
      "Date Applied",
      "Beneficiary Name",
      "Beneficiary Relationship",
      "Beneficiary Contact",
      "Status",
    ];

    // Convert to CSV rows
    const rows = requests.map((req) => [
      req.last_name,
      req.first_name,
      req.middle_name || "",
      req.suffix || "",
      req.barangay,
      req.birth_date,
      req.sex,
      req.date_applied,
      req.beneficiary_name,
      req.beneficiary_relationship,
      req.beneficiary_contact,
      req.status,
    ]);

    // Join rows and headers
    const csvContent =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    // Create downloadable blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "membership_requests.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a name to search.");
      return;
    }

    try {
      const res = await api.get(`/citizens/?search=${searchQuery}`);
      if (res.data.length === 0) {
        // ✅ show friendly message
        setSearchResults([{ noResult: true }]);
      } else {
        setSearchResults(res.data);
      }
    } catch (error) {
      console.error("Error searching members:", error);
      alert("Failed to search members.");
    }
  };




  return (
    <div className="fedeMR-container">
      <div className="fedeMR-toolbar">
        <h2 className="fedeMR-title">
          <span className="fedeMR-titleAccent"></span>
          Membership Requests
        </h2>
          <div className="fedeMR-searchBar">
            <input
              type="text"
              placeholder="Search to check if Already Member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button id="search" onClick={handleSearch}>🔍︎</button>
          </div>
      </div>

      {loading ? (
        <div className="fedeMR-loading">Loading...</div>
      ) : (
        <table className="fedeMR-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Barangay</th>
              <th>Birth Date</th>
              <th>Sex</th>
              <th>Date Applied</th>
              <th>Beneficiary</th>
              <th>Valid ID</th>
              <th>Selfie</th>
              <th>Own Pic</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="10" className="fedeMR-noData">
                  No pending member requests.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td>{`${req.last_name}, ${req.first_name} ${
                    req.middle_name || ""
                  } ${req.suffix || ""}`}</td>
                  <td>{req.barangay}</td>
                  <td>{req.birth_date}</td>
                  <td>{req.sex}</td>
                  <td>{req.date_applied}</td>

                  <td className="fedeMR-beneficiary">
                    <div>
                      <span>Name:</span> {req.beneficiary_name}
                    </div>
                    <div>
                      <span>Relationship:</span> {req.beneficiary_relationship}
                    </div>
                    <div>
                      <span>Contact:</span> {req.beneficiary_contact}
                    </div>
                  </td>

                  <td>
                    <img
                      src={req.id1_front}
                      alt="ID Front"
                      className="fedeMR-clickableImg"
                      onClick={() => setViewImage(req.id1_front)}
                    />
                    <img
                      src={req.id1_back}
                      alt="ID Back"
                      className="fedeMR-clickableImg"
                      onClick={() => setViewImage(req.id1_back)}
                    />
                  </td>

                  <td>
                    <img
                      src={req.selfie_with_ids}
                      alt="Selfie"
                      className="fedeMR-clickableImg"
                      onClick={() => setViewImage(req.selfie_with_ids)}
                    />
                  </td>

                  <td>
                    <img
                      src={req.own_picture}
                      alt="Own Pic"
                      className="fedeMR-clickableImg"
                      onClick={() => setViewImage(req.own_picture)}
                    />
                  </td>

                  <td>
                    <button
                      disabled={actionLoading === req.id + "approved"}
                      onClick={() => handleApproveClick(req)}
                      className="fedeMR-approveBtn"
                    >
                      {actionLoading === req.id + "approved"
                        ? "Approving..."
                        : "Approve"}
                    </button>
                    <button
                      disabled={actionLoading === req.id + "rejected"}
                      onClick={() => handleRejectClick(req.id)}
                      className="fedeMR-rejectBtn"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* ✅ SEARCH RESULTS OVERLAY */}
      {searchResults.length > 0 && (
        <div className="fedeMR-searchOverlay">
          <div className="fedeMR-searchPopup">
            <h3>Search Results</h3>

            {/* 🧠 If noResult key exists → show "No results found" */}
            {searchResults[0].noResult ? (
              <div className="fedeMR-noResult">
                <p>No federation members found matching your search.</p>
              </div>
            ) : (
              <>
                <p className="fedeMR-noteText">
                  Showing {searchResults.length} federation member
                  {searchResults.length > 1 ? "s" : ""}.
                </p>

                {/* Scrollable table */}
                <div className="fedeMR-resultsScroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID Number</th>
                        <th>Name</th>
                        <th>Birth Date</th>
                        <th>Barangay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map(
                        (member) =>
                          !member.noResult && (
                            <tr key={member.id}>
                              <td>{member.id_number || "—"}</td>
                              <td>{`${member.last_name}, ${member.first_name}`}</td>
                              <td>{member.birth_date}</td>
                              <td>{member.address}</td>
                            </tr>
                          )
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="fedeMR-popupActions">
              <button
                onClick={() => {
                  setSearchResults([]);
                  setSearchQuery("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}




      {/* ✅ APPROVE MEMBERSHIP POPUP */}
        {approveTarget && (
          <div className="fedeMR-approvalOverlay">
            <div className="fedeMR-approvalPopup">
              {/* Header Icon */}
              <div className="fedeMR-approvalIcon">
                <i className="fa fa-check-circle"></i>
              </div>

              <h3>Approve Membership</h3>

              <p className="fedeMR-context">
                Enter ID number for <strong>{approveTarget.fullName}</strong>
              </p>

              <input
                type="text"
                placeholder="Enter ID number..."
                value={enteredId}
                onChange={(e) => setEnteredId(e.target.value)}
              />

              <p className="fedeMR-noteText">
                Once approved, this member will be added to the official senior database
                and notified automatically.
              </p>

              <div className="fedeMR-popupActions">
                <button id="approve" onClick={confirmApprove}>Confirm Approve</button>
                <button onClick={() => setApproveTarget(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}


      {/* ✅ REJECTION POPUP */}
      {rejectionTargetId && (
        <div className="fedeMR-rejectOverlay">
          <div className="fedeMR-rejectPopup">
            <h3>Provide Rejection Reason</h3>

            <div className="fedeMR-radioGroup">
              {predefinedReasons.map((reason) => (
                <label key={reason} className="fedeMR-radioOption">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason}
                    checked={rejectionReason === reason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  {reason}
                </label>
              ))}
            </div>

            {rejectionReason === "Other" && (
              <textarea
                placeholder="Type custom reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="fedeMR-customTextarea"
              />
            )}
            <p className="fedeMR-note">
              Once rejected, this application will be marked as <strong>“Rejected”</strong> 
              and the applicant will receive a notification with your selected reason.
            </p>

            <div className="fedeMR-popupActions">
              <button id="reject"
                onClick={confirmRejection}
                disabled={
                  !rejectionReason ||
                  (rejectionReason === "Other" && !customReason.trim())
                }
              >
                Confirm Reject
              </button>
              <button onClick={() => setRejectionTargetId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ IMAGE VIEWER */}
      {viewImage && (
        <div
          className="fedeMR-imageOverlay"
          onClick={() => setViewImage(null)}
        >
          <div className="fedeMR-imageContent">
            <img src={viewImage} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberRequest;
