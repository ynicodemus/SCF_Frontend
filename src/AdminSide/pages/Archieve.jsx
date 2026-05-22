import React, { useEffect, useState } from "react";
import api from "../../axios";
import "../css/Archive.css";

function Archive() {
  const [archivedCitizens, setArchivedCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCitizen, setViewCitizen] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showImage, setShowImage] = useState(null);

  // 🧩 Modal controls
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedForRestore, setSelectedForRestore] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState("");
  const [restoreError, setRestoreError] = useState("");

  // 🧭 Initial Fetch
  useEffect(() => {
    fetchArchived();
  }, []);

  const fetchArchived = async () => {
    setLoading(true);
    try {
      const res = await api.get("/SeniorConnect/archived-citizens/");
      setArchivedCitizens(res.data);
    } catch (error) {
      console.error(error);
      setRestoreError("Failed to fetch archive");
    }
    setLoading(false);
  };

  // 🗑 Delete All Archive Records
  const handleDeleteAll = async () => {
    setRestoreError("");
    setRestoreMessage("");
    const confirmed = window.confirm("⚠️ Are you sure you want to permanently delete ALL archived citizens?");
    if (!confirmed) return;

    try {
      await api.delete("/SeniorConnect/delete_all_archived/");
      setRestoreMessage("✅ All archived records have been deleted successfully!");
      setArchivedCitizens([]);
    } catch (err) {
      console.error("Delete all archive error:", err);
      setRestoreError("❌ Failed to delete all archived records.");
    }
  };

  // 🔍 Filtering logic
  const getFiltered = () => {
    if (!Array.isArray(archivedCitizens)) return [];

    let filtered = archivedCitizens.filter((cit) => cit);

    if (filter !== "ALL") {
      filtered = filtered.filter(
        (cit) =>
          cit.archive_reason &&
          cit.archive_reason.toLowerCase() === filter.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (cit) =>
          cit.first_name.toLowerCase().includes(search.toLowerCase()) ||
          cit.last_name.toLowerCase().includes(search.toLowerCase()) ||
          cit.id_number?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  // ♻️ Open confirmation modal
  const openRestoreModal = (citizen) => {
    setSelectedForRestore(citizen);
    setConfirmModal(true);
  };

  // ✅ Handle actual restore
  const handleRestore = async () => {
    if (!selectedForRestore) return;
    setRestoreError("");
    setRestoreMessage("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.post(
        `/SeniorConnect/restore_archived/${selectedForRestore.id_number}/`,
        null,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setRestoreMessage(res.data.message);
      setArchivedCitizens(
        archivedCitizens.filter(
          (c) => c.id_number !== selectedForRestore.id_number
        )
      );
      setConfirmModal(false);
      setViewCitizen(null);
      setSelectedForRestore(null);
    } catch (error) {
      console.error("Error restoring citizen:", error.response?.data || error.message);
      setRestoreError(error.response?.data?.error || "Failed to restore citizen.");
    }
  };

  return (
    <div className="arc-container">
      <h2 className="arc-header-title">Archived Citizens</h2>

      {/* 🔎 Search and Filter Controls */}
      <div className="arc-controls">
        <input
          type="text"
          placeholder="Search by name or ID number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="arc-search"
        />

        <div className="arc-filter-group">
          <button
            onClick={() => setFilter("ALL")}
            className={filter === "ALL" ? "arc-filter-btn active" : "arc-filter-btn"}
          >
            Show All
          </button>
          <button
            onClick={() => setFilter("Transfer")}
            className={filter === "Transfer" ? "arc-filter-btn active" : "arc-filter-btn"}
          >
            Transfer Archive
          </button>
          <button
            onClick={() => setFilter("Decease")}
            className={filter === "Decease" ? "arc-filter-btn active" : "arc-filter-btn"}
          >
            Decease Archive
          </button>
        </div>

        {/* 🗑 Delete All Button */}
          {/* <button
          className="arc-delete-all-btn"
          onClick={handleDeleteAll}
        >
          🗑️ Delete All Records
        </button> */}
      </div>

      {/* 📋 Archived Table */}
      {loading ? (
        <div className="arc-status">Loading...</div>
      ) : getFiltered().length === 0 ? (
        <div className="arc-status">No archived records found.</div>
      ) : (
        <table className="arc-table">
          <thead>
            <tr>
              <th>ID Number</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Reason</th>
              <th>Date Archived</th>
              <th>Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFiltered().map((cit) => (
              <tr key={cit?.id || Math.random()}>
                <td>{cit?.id_number || "—"}</td>
                <td>{cit?.last_name || "—"}</td>
                <td>{cit?.first_name || "—"}</td>
                <td>{cit?.archive_reason || "—"}</td>
                <td>{cit?.date_archived ? new Date(cit.date_archived).toLocaleDateString() : "—"}</td>
                <td>
                  {cit.death_certificate && (
                    <img
                      src={cit.death_certificate}
                      alt="Death Certificate"
                      className="arc-proof-thumb"
                      onClick={() => setShowImage(cit.death_certificate)}
                    />
                  )}

                  {cit.claimant_id && (
                    <img
                      src={cit.claimant_id}
                      alt="Claimant ID"
                      className="arc-proof-thumb"
                      onClick={() => setShowImage(cit.claimant_id)}
                    />
                  )}

                  {cit.release_proof && (
                    <img
                      src={cit.release_proof}
                      alt="Release Proof"
                      className="arc-proof-thumb"
                      onClick={() => setShowImage(cit.release_proof)}
                    />
                  )}

                  {!cit.death_certificate && !cit.claimant_id && !cit.release_proof && "No proof"}
                </td>

                <td>
                  <button className="arc-view-btn" onClick={() => setViewCitizen(cit)}>
                    View Info
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🧾 View Info Modal */}
      {viewCitizen && (
        <div className="arc-modal-overlay" onClick={() => setViewCitizen(null)}>
          <div className="arc-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="arc-modal-title">Senior Citizen Information</h3>

            <p><b>ID Number:</b> {viewCitizen.id_number}</p>
            <p><b>Last Name:</b> {viewCitizen.last_name}</p>
            <p><b>First Name:</b> {viewCitizen.first_name}</p>
            <p><b>Sex:</b> {viewCitizen.sex}</p>
            <p><b>Birth Date:</b> {viewCitizen.birth_date}</p>
            <p><b>Age:</b> {viewCitizen.age}</p>
            <p><b>Barangay:</b> {viewCitizen.address}</p>
            <p><b>Date Issued:</b> {viewCitizen.date_issued}</p>
            <p><b>Emergency Contact:</b> {viewCitizen.emer_name} ({viewCitizen.emer_rel}) - {viewCitizen.emer_contact}</p>
            <p><b>Reason for Archive:</b> {viewCitizen.archive_reason}</p>
            <p><b>Date Archived:</b> {new Date(viewCitizen.date_archived).toLocaleDateString()}</p>

            {(viewCitizen.archive_reason === "Decease" || viewCitizen.damayan_member === true) && (
              <div className="arc-damayan-section">
                <h4>Damayan Information</h4>
                <p><b>Member:</b> {viewCitizen.damayan_member ? "Yes" : "No"}</p>
                <p><b>Claimant:</b> {viewCitizen?.claimant_name || "—"}</p>
                <p><b>Total Contributed:</b> ₱{viewCitizen?.damayan_total_contribution ?? "0.00"}</p>
                <p><b>Claim Amount:</b> ₱{viewCitizen?.damayan_claim_amount ?? "0.00"}</p>
                <p><b>Date Claimed:</b> {viewCitizen?.damayan_date_claimed || "—"}</p>
                <p><b>Date Released:</b> {viewCitizen?.damayan_date_released || "—"}</p>
              </div>
            )}

            <div className="arc-proofs">
              <p><b>Proofs:</b></p>

              {viewCitizen.death_certificate && (
                <div className="arc-proof-block">
                  <p>Death Certificate</p>
                  <img
                    src={viewCitizen.death_certificate}
                    className="arc-proof-thumb"
                    onClick={() => setShowImage(viewCitizen.death_certificate)}
                  />
                </div>
              )}

              {viewCitizen.claimant_id && (
                <div className="arc-proof-block">
                  <p>Claimant ID</p>
                  <img
                    src={viewCitizen.claimant_id}
                    className="arc-proof-thumb"
                    onClick={() => setShowImage(viewCitizen.claimant_id)}
                  />
                </div>
              )}

              {viewCitizen.release_proof && (
                <div className="arc-proof-block">
                  <p>Release Proof</p>
                  <img
                    src={viewCitizen.release_proof}
                    className="arc-proof-thumb"
                    onClick={() => setShowImage(viewCitizen.release_proof)}
                  />
                </div>
              )}
            </div>


            <div className="arc-modal-actions">
              {viewCitizen.archive_reason === "Transfer" && (
                <button className="arc-restore-btn" onClick={() => openRestoreModal(viewCitizen)}>
                  Restore
                </button>
              )}
              <button className="arc-close-btn" onClick={() => setViewCitizen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Confirmation Modal for Restore */}
      {confirmModal && (
        <div className="arc-modal-overlay" onClick={() => setConfirmModal(false)}>
          <div className="arc-modal arc-small" onClick={(e) => e.stopPropagation()}>
            <h3 className="arc-modal-title">Confirm Restoration</h3>
            <p>Are you sure you want to restore <b>{selectedForRestore.first_name} {selectedForRestore.last_name}</b> back to the Federation?</p>

            {restoreError && <p className="arc-error-text">{restoreError}</p>}
            {restoreMessage && <p className="arc-success-text">{restoreMessage}</p>}

            <div className="arc-modal-actions">
              <button className="arc-restore-btn" onClick={handleRestore}>
                Confirm Restore
              </button>
              <button className="arc-close-btn" onClick={() => setConfirmModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼 Image Viewer */}
      {showImage && (
        <div className="arc-image-overlay" onClick={() => setShowImage(null)}>
          <div className="arc-image-viewer">
            <img src={showImage} alt="Proof" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Archive;
