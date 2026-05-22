import React, { useEffect, useState, useRef } from "react";
import axiosSC from "../../../axiosSC";
import "../../css/Damayan.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Damayan() {
  const idNumber = localStorage.getItem("id_number");
  const [profile, setProfile] = useState(null);
  const [isDamayanMember, setIsDamayanMember] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrImage, setQrImage] = useState(null);
  const [gcashName, setGcashName] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [qrOverlayOpen, setQrOverlayOpen] = useState(false);

  // claim state: if true => disable payment controls / show message
  const [claimProcessing, setClaimProcessing] = useState(false);
  const [claimDetails, setClaimDetails] = useState(null);

  // refs for safe polling / abort
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const intervalRef = useRef(null);
  const lastFetchTsRef = useRef(0);

  const showMessage = (text, type = "info", duration = 3000) => {
    setMessage({ text, type });
    if (!["confirm", "confirmDelete"].includes(type)) {
      setTimeout(() => setMessage({ text: "", type: "" }), duration);
    }
  };

  // Heuristic to detect active claim using only endpoints citizen token can call
  const detectClaimFromData = ({ pendingPayments = [], history = [], userProfile = null }) => {
    // 1) If backend gives a direct flag on profile (preferred)
    if (userProfile && (userProfile.has_claimed === true || userProfile.has_active_claim === true)) {
      setClaimProcessing(true);
      setClaimDetails({ reason: "flag on profile", citizen: userProfile });
      return true;
    }

    // 2) Search pending payments for claim-looking entries
    const pending = Array.isArray(pendingPayments) ? pendingPayments : [];
    const hist = Array.isArray(history) ? history : [];

    const isClaimEntry = (p) => {
      if (!p) return false;

      const status = (p.status || "").toString().toLowerCase();
      const type = (p.type || "").toString().toLowerCase();
      const notes = (
        (p.reject_reason || p.remarks || p.note || p.description) || ""
      )
        .toString()
        .toLowerCase();

      // dapat claim-related talaga
      const isClaimType =
        type.includes("claim") ||
        notes.includes("claim");

      const claimStatuses = [
        "processing",
        "claiming",
        "already claiming",
        "pending_claim",
        "for budget approval",
        "for_budget_approval",
        "ready for release",
        "approved"
      ];

      return (
        isClaimType &&
        claimStatuses.some((s) => status.includes(s))
      );
    };

    // const isClaimEntry = (p) => {
    //   if (!p) return false;
    //   const status = (p.status || "").toString().toLowerCase();
    //   const type = (p.type || "").toString().toLowerCase();
    //   const notes = ((p.reject_reason || p.remarks || p.note || p.description) || "").toString().toLowerCase();

    //   // if backend uses 'claim' word or 'processing' statuses
    //   const claimWords = ["claim", "processing", "claiming", "for release", "for budget"];
      
      
    //   // const statusClaim = [
    //   //   "processing",
    //   //   "claiming",
    //   //   "already claiming",
    //   //   "pending_claim",
    //   //   "for_budget_approval",
    //   //   "for budget approval",
    //   //   "for budget",
    //   //   "ready for release",
    //   // ];
    //   if (claimWords.some((w) => type.includes(w) || notes.includes(w))) return true;
    //   if (statusClaim.some((s) => status.includes(s))) return true;
    //   return false;
    // };

    // if any pending item matches
    const foundPendingClaim = pending.find(isClaimEntry);
    if (foundPendingClaim) {
      setClaimProcessing(true);
      setClaimDetails(foundPendingClaim);
      return true;
    }

    // also inspect history for processing / claim statuses
    const foundHistoryClaim = hist.find(isClaimEntry);
    if (foundHistoryClaim) {
      setClaimProcessing(true);
      setClaimDetails(foundHistoryClaim);
      return true;
    }

    // else no active claim detected
    setClaimProcessing(false);
    setClaimDetails(null);
    return false;
  };

  // fetch payments and history (throttled)
  const fetchPayments = async (signal) => {
    if (fetchingRef.current) return;
    const now = Date.now();
    // throttle to avoid repeated calls during fast re-render loops
    if (now - lastFetchTsRef.current < 900) return;
    fetchingRef.current = true;
    lastFetchTsRef.current = now;

    try {
      const token = localStorage.getItem("citizenToken");
      if (!token) return;

      const reqRes = await axiosSC.get(`/SeniorConnect/citizendamayanpaymentrequest/me/`, {
        headers: { Authorization: `Token ${token}` },
        signal,
      });
      const pending = Array.isArray(reqRes.data) ? reqRes.data.filter((p) => p.status === "pending") : [];
      setPendingPayments(pending);

      const historyRes = await axiosSC.get(`/SeniorConnect/damayan_member_history_citizen/`, {
        headers: { Authorization: `Token ${token}` },
        signal,
      });
      const sorted = Array.isArray(historyRes.data)
        ? historyRes.data.sort((a, b) => new Date(b.date || b.date_paid || 0) - new Date(a.date || a.date_paid || 0))
        : [];
      setPaymentHistory(sorted);

      // detect claim using these results + current profile
      detectClaimFromData({ pendingPayments: pending, history: sorted, userProfile: profile });

    } catch (err) {
      if (!(err && (err.name === "CanceledError" || err.name === "AbortError"))) {
        console.error("❌ Failed to fetch payments:", err);
      }
    } finally {
      fetchingRef.current = false;
    }
  };

  // initial fetch + QR + requests + claim detection
  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("citizenToken");
        if (!token) {
          setLoading(false);
          return;
        }

        // profile
        const res = await axiosSC.get(`/SeniorConnect/citizens/me/`, {
          headers: { Authorization: `Token ${token}` },
          signal,
        });
        if (!mountedRef.current) return;
        const user = res.data || {};
        console.log("Damayan: fetched profile ->", user);
        setProfile(user);
        setIsDamayanMember(Boolean(user?.is_damayan_member));

        // === NEW: honor a backend flag if available ===
        // place immediately after setting profile so UI will reflect claim state quickly
        if (user?.has_active_claim === true || user?.has_claimed === true) {
          setClaimProcessing(true);
          setClaimDetails({ source: "profile_flag", citizen: user });
          console.log("Damayan: claimProcessing set from profile flag");
        } else {
          // don't aggressively overwrite other detection if you prefer server truth;
          // safe to clear here because we'll run fetchPayments() next which also calls detectClaimFromData.
          setClaimProcessing(false);
          setClaimDetails(null);
        }

        // damayan approval requests (to set pending/rejected)
        const reqs = await axiosSC.get(`/SeniorConnect/damayan-approval-request/me/`, {
          headers: { Authorization: `Token ${token}` },
          signal,
        });
        const myRequests = Array.isArray(reqs.data)
          ? reqs.data.filter((r) => {
              if (!r) return false;
              try {
                if (r.citizen?.id_number && user?.id_number && r.citizen.id_number === user.id_number) return true;
                if (typeof r.citizen === "number" && r.citizen === user?.id) return true;
                if (r.citizen_id && user?.id && r.citizen_id === user.id) return true;
              } catch (e) { /* ignore */ }
              return false;
            })
          : [];
        myRequests.sort((a, b) => (b?.id || 0) - (a?.id || 0));
        const mine = myRequests[0];
        const status = mine?.status?.toString().toLowerCase().trim() || null;
        if (mine) {
          if (status === "pending") {
            setPendingApproval(true);
            setIsRejected(false);
          } else if (status === "rejected") {
            setPendingApproval(false);
            setIsRejected(true);
            setRejectionReason(mine.reject_reason || mine.remarks || "No reason provided.");
          } else if (status === "approved") {
            setPendingApproval(false);
            setIsRejected(false);
            setIsDamayanMember(true);
          } else {
            setPendingApproval(false);
            setIsRejected(false);
          }
        } else {
          setPendingApproval(false);
          setIsRejected(false);
        }

        // QR details (guard against undefined)
        try {
          const qrRes = await axiosSC.get(`/SeniorConnect/citizendamayanqr/`, {
            headers: { Authorization: `Token ${token}` },
            signal,
          });
          if (qrRes && qrRes.data) {
            setQrImage(qrRes.data.qr_image_url || null);
            setGcashName(qrRes.data.gcash_name || "");
            setGcashNumber(qrRes.data.gcash_number || "");
          }
        } catch (e) {
          // ignore QR errors (non-critical)
        }

        // fetch payments/history and detect claim
        await fetchPayments(signal);

        // If profile explicitly indicates a claim state, respect it (again)
        if (user && (user.has_claimed || user.has_active_claim)) {
          setClaimProcessing(true);
          setClaimDetails(user);
        }

      } catch (err) {
        if (!(err && (err.name === "CanceledError" || err.name === "AbortError"))) {
          console.error("❌ Error fetching Damayan data:", err);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    if (idNumber) fetchData();

    return () => {
      mountedRef.current = false;
      try {
        controller.abort();
      } catch (e) {}
    };
    // run once when idNumber changes
  }, [idNumber]);

  // polling payments only while member; safe cleanup
  useEffect(() => {
    // clear any previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!idNumber || !isDamayanMember) return;

    // initial fetch
    fetchPayments();

    // set interval (10s)
    intervalRef.current = setInterval(() => {
      fetchPayments();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [idNumber, isDamayanMember]); // only recreate when these change

  // Join request overlay
  const handleJoinDamayan = () => {
    setMessage({ type: "confirm", text: "Are you sure you want to join Damayan?" });
  };

  const confirmJoin = async () => {
    try {
      const token = localStorage.getItem("citizenToken");
      await axiosSC.post("/SeniorConnect/damayan-approval-request/", { citizen_id: idNumber }, {
        headers: { Authorization: `Token ${token}` },
      });
      setPendingApproval(true);
      showMessage("Request sent! Please wait for admin approval.", "success");
    } catch {
      showMessage("Failed to send request. Try again later.", "error");
    }
  };

  // Submit payment proof (disabled when claimProcessing)
  const handleSubmitPayment = async () => {
    if (!proofFile) return showMessage("Please select a proof image first.", "error");
    if (claimProcessing) return showMessage("Payments are disabled while a claim is processing.", "error");

    setSubmittingPayment(true);
    try {
      const token = localStorage.getItem("citizenToken");
      const formData = new FormData();
      formData.append("amount", "");
      formData.append("proof_image", proofFile);

      await axiosSC.post("/SeniorConnect/citizendamayanpaymentrequest/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      });

      showMessage("Payment submitted! Waiting for admin approval.", "success");
      setProofFile(null);
      await fetchPayments();
    } catch (err) {
      console.error("Submit payment error:", err);
      showMessage("Failed to submit payment. Try again later.", "error");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Delete all payments
  const handleDeleteAllPayments = () => {
    setMessage({
      type: "confirmDelete",
      text: "Are you sure you want to delete ALL payment history?",
    });
  };

  const confirmDeleteAllPayments = async () => {
    try {
      const token = localStorage.getItem("citizenToken");
      await axiosSC.delete("/SeniorConnect/citizen/damayanpayment/delete-all/", {
        headers: { Authorization: `Token ${token}` },
      });
      setPaymentHistory([]);
      setPendingPayments([]);
      showMessage("All payment history deleted successfully.", "success");
    } catch {
      showMessage("Failed to delete all payments. Try again later.", "error");
    }
  };

  // Download PDF
  const downloadHistoryPDF = () => {
    if (!paymentHistory.length) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Damayan Payment History", 14, 20);

    const tableColumn = ["#", "Amount", "Date", "Paid Via", "Status", "Year Covered", "Reference"];

    const tableRows = paymentHistory.map((entry, index) => [
      index + 1,
      `₱${entry.amount_paid || entry.amount}`,
      new Date(entry.date || entry.date_paid || Date.now()).toLocaleDateString(),
      entry.paid_via || (entry.type === "payment" ? "Office" : "GCash"),
      entry.status || "—",
      entry.year_covered ||
      (entry.date
        ? new Date(entry.date).getFullYear()
        : "—"),
      entry.reference_number || "—",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "striped",
      styles: { fontSize: 10 },
    });

    doc.save("damayan_payment_history.pdf");
  };

  // Render
  if (!idNumber) return <div className="cdamayan-notMember">Please log in first to view Damayan.</div>;
  if (loading) return <div className="cdamayan-notMember">Loading...</div>;

  return (
    <div className="damC-container">

      {/* Overlay Messages */}
      {message.text && (
        <div className="damC-overlay">
          <div className={`damC-modal damC-${message.type}`}>
            <p>{message.text}</p>

            {message.type === "confirm" && (
              <div className="damC-modalActions">
                <button onClick={confirmJoin} className="damC-btnPrimary">Yes</button>
                <button onClick={() => setMessage({ text: "", type: "" })} className="damC-btnDanger">No</button>
              </div>
            )}

            {message.type === "confirmDelete" && (
              <div className="damC-modalActions">
                <button onClick={confirmDeleteAllPayments} className="damC-btnDanger">Delete</button>
                <button onClick={() => setMessage({ text: "", type: "" })} className="damC-btnPrimary">Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile (only shown for members) */}
      {isDamayanMember && profile ? (
        <div>
          <h2 className="damC-header">My Damayan Dashboard</h2>
          <div className="damC-userInfo">
            <p><strong>Full Name:</strong> {profile.first_name} {profile.middle_name} {profile.last_name} {profile.suffix}</p>
            <p><strong>ID Number:</strong> {profile.id_number}</p>
          </div>
        </div>
      ) : null}

      {/* MEMBER UI */}
      {isDamayanMember ? (
        <>
          {/* Replace pay button with message when claimProcessing */}
          {claimProcessing ? (
            <div
              className="damC-claimMessage"
              style={{
                padding: "14px 18px",
                background: "#fff4e5",
                border: "1px solid #ffd89b",
                borderRadius: 8,
                color: "#8a4b00",
                marginBottom: 12,
              }}
            >
              <h3 style={{ marginBottom: 8 }}>
                Damayan Claim Status
              </h3>

              <p>
                Current Status:
                <strong style={{ marginLeft: 5 }}>
                  {claimDetails?.status || "On Process"}
                </strong>
              </p>

              <small>
                Payment features are disabled while your claim is being processed.
              </small>
            </div>
          ) : (
            <button
              className="damC-btnPrimary"
              onClick={() => setShowQR((s) => !s)}
            >
              {showQR ? "Hide GCash Details" : "Pay via GCash"}
            </button>
          )}

          {showQR && (
            <div className="damC-qrSection" style={{ opacity: claimProcessing ? 0.6 : 1, pointerEvents: claimProcessing ? "none" : "auto" }}>
              <div className="damC-qrLeft">
                {qrImage ? (
                  <>
                    <img
                      src={qrImage}
                      alt="Damayan QR"
                      className="damC-qrImage"
                      onClick={() => setQrOverlayOpen(true)}
                      style={{ cursor: "pointer" }}
                    />
                    {qrOverlayOpen && (
                      <div className="qrOverlay" onClick={() => setQrOverlayOpen(false)}>
                        <img src={qrImage} alt="QR Preview" className="qrOverlayImage" />
                      </div>
                    )}
                  </>
                ) : (
                  <p>No QR uploaded yet.</p>
                )}

                {(gcashName || gcashNumber) && (
                  <div className="damC-gcashInfo">
                    <p><strong>GCash Name:</strong> {gcashName || "N/A"}</p>
                    <p><strong>GCash Number:</strong> {gcashNumber || "N/A"}</p>
                  </div>
                )}
              </div>

              <div className="damC-qrRight">
                <p>Upload screenshot of your GCash payment</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  disabled={claimProcessing}
                />
                <button
                  onClick={handleSubmitPayment}
                  disabled={claimProcessing || !proofFile || submittingPayment}
                  className="damC-btnSuccess"
                >
                  {claimProcessing ? "Disabled (Claim in process)" : submittingPayment ? "Submitting..." : "Submit for Approval"}
                </button>

                <div className="damC-noteBox">
                  <p>
                    <strong>Note:</strong> Please make sure the <b>amount</b>, <b> GCash number</b>, and <b>GCash name</b> are correct before sending your payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="damC-sectionHeader">
            <h3>Payment History</h3>
            <div className="damC-btnGroup">
              <button onClick={downloadHistoryPDF} className="damC-btnPrimary" disabled={claimProcessing}>
                Download History
              </button>
            </div>
          </div>

          <div className="damC-tableWrap">
            <div className="table-responsive">
              <table className="damC-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Amount Paid</th>
                    <th>Date Paid</th>
                    <th>Paid Via</th>
                    <th>Status</th>
                    <th>Year Covered</th>
                    <th>Reference #</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.length === 0 ? (
                    <tr><td colSpan={7}>No payments yet.</td></tr>
                  ) : (
                    paymentHistory.map((entry, index) => (
                      <tr key={index}>
                        <td data-label="#"> {index + 1} </td>

                        <td data-label="Amount Paid">
                          ₱{entry.amount_paid || entry.amount}
                        </td>

                        <td data-label="Date Paid">
                          {entry.date
                            ? new Date(entry.date).toLocaleDateString()
                            : "—"}
                        </td>

                        <td data-label="Paid Via">
                          {entry.paid_via ||
                            (entry.type === "payment"
                              ? "Office (Manual)"
                              : entry.type === "request"
                              ? "GCash"
                              : "—")}
                        </td>

                        <td data-label="Status">
                          {entry.status || "—"}
                        </td>

                        <td data-label="Year Covered">
                          {entry.year_covered ||
                            (entry.date
                              ? new Date(entry.date).getFullYear()
                              : "—")}
                        </td>

                        <td data-label="Reference #">
                          {entry.reference_number || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        // NOT A MEMBER UI
        <div className="damC-notMember">
          {pendingApproval ? (
            <div className="status-card">
              <div className="status-icon">⏳</div>
              <h2>Your Damayan membership request has been submitted</h2>
              <p className="sub">Please wait for admin approval.</p>
            </div>
          ) : isRejected ? (
            <div className="damC-encourageBox">
              <p className="damC-rejectedText">Your previous request was <b>REJECTED</b>.</p>

              <div className="damC-topImagePlaceholder" style={{ backgroundImage: "url('/banners/sariaya.jpg')" }}></div>
              <h3 className="damC-encourageTitle">Join the Damayan Assistance Program</h3>
              <p className="damC-encourageText">
                The Damayan program is a community-based fund that helps support your loved ones during difficult moments.
              </p>
              <div className="damC-featureGrid">
                <div className="damC-featureCardSq" style={{ backgroundImage: "url('/banners/guaranteed.png')" }}>
                  Guaranteed benefit for your beneficiaries
                </div>
                <div className="damC-featureCardSq" style={{ backgroundImage: "url('/banners/double.png')" }}>
                  Doubles your contribution for your beneficiaries.
                </div>
                <div className="damC-featureCardSq" style={{ backgroundImage: "url('/banners/yearly.png')" }}>
                  Yearly contribution
                </div>
                <div className="damC-featureCardSq" style={{ backgroundImage: "url('/banners/transparent.png')" }}>
                  Fast and transparent processing
                </div>
              </div>

              <p className="damC-rejectionReason">
                <strong>Reason:</strong> {rejectionReason}
              </p>

              <button onClick={handleJoinDamayan} className="damC-btnPrimary">Send New Request</button>
            </div>
          ) : (
            <div className="damC-encourageBox">
              <div className="damC-topImagePlaceholder" style={{ backgroundImage: "url('/banners/sariaya.jpg')" }}></div>
              <h3 className="damC-encourageTitle">Join the Damayan Assistance Program</h3>
              <p className="damC-encourageText">
                The Damayan program is a community-based fund that helps support your loved ones during difficult moments.
              </p>
              <div className="damC-featureGrid">
                <div className="damC-featureCardSq" style={{ backgroundImage: "url('/banners/guaranteed.png')" }}>
                  Guaranteed benefit for your beneficiaries
                </div>
                <div className="damC-featureCardSq" style={{ backgroundImage: "url('/banners/double.png')" }}>
                  Doubles your contribution for your beneficiaries.
                </div>
                <div className="damC-featureCardSq" style={{ backgroundImage: "url('/banners/yearly.png')" }}>
                  Yearly contribution
                </div>
                <div className="damC-featureCardSq" style={{ backgroundImage: "url('/banners/transparent.png')" }}>
                  Fast and transparent processing
                </div>
              </div>

              <button onClick={handleJoinDamayan} className="damC-btnPrimary">Join Damayan Now</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Damayan;
