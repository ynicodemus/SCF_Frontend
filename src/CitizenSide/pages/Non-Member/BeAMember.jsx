// RequestMember.jsx
import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import "./BeAMember.css";
import axiosSC from "../../../axiosSC";

const barangayList = [
  "Antipolo", "Balubal", "Barangay 3", "Barangay 4", "Bibanga", "Bignay 1", "Bignay 2",
  "Bogon", "Bucal", "Cada", "Canada", "Canda", "Carnation", "Casta", "Castañas",
  "Centro Bucal", "Concepcion", "Concepcion 1", "Concepcion Banahaw",
  "Concepcion Palasan", "Concepcion Pinag", "Concepcion Pinagbakuran", "Gibanga",
  "Guis-Guis", "Guis-Guis San Roque", "Guis-Guis Talon", "Janagdong", "Janagdong 1",
  "Janagdong 2", "Limbon", "Lutucan", "Lutucan 1", "Lutucan Bata", "Lutucan Malabag",
  "Manggalang", "Manggalang 1", "Manggalang Bantilan", "Manggalang Kiling",
  "Manggalang Tulo-Tulo", "Mamala", "Mamala 1", "Mamala 2", "Marichi Subdivision",
  "Montecillo", "Morong", "Pantoc", "Pili", "Poblacion", "Poblacion 1", "Poblacion 2",
  "Poblacion 3", "Poblacion 4", "Poblacion 5", "Poblacion 6", "S. Marilag Montecillo",
  "Sampaloc", "Sampaloc 1", "Sampaloc 2", "Sampaloc B", "Sampaloc Bagon",
  "San Roque", "Sto. Cristo", "Talaan", "Talaan Aplaya", "Talaan Pantoc",
  "Tumabaga 1", "Tumabaga 2"
];

const sexOptions = ["Male", "Female"];

function RequestMember() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    barangay: "",
    street: "",
    birthDate: "",
    age: "",
    sex: "",
    dateApplied: "",
    beneficiaryContact: "",
    beneficiaryName: "",
    beneficiaryRelationship: "",
    id1Front: null,
    id1Back: null,
    selfieWithIds: null,
    ownPicture: null,
    email: localStorage.getItem("userEmail") || localStorage.getItem("email") || "",
  });

  const [preview, setPreview] = useState({});
  const [disqualified, setDisqualified] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [approvedByAdmin, setApprovedByAdmin] = useState(false);
  const [approvedIdNumber, setApprovedIdNumber] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);

  const openCamera = async (target) => {
    try {
      setCameraTarget(target);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraOpen(true);
    } catch (err) {
      alert("Camera access denied.");
    }
  };
  

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
  
    canvas.toBlob((blob) => {
      const file = new File([blob], `${cameraTarget}.jpg`, {
        type: "image/jpeg",
      });
  
      if (cameraTarget === "idFront") {
        setForm(prev => ({ ...prev, id1Front: file }));
        setPreview(prev => ({ ...prev, id1Front: URL.createObjectURL(file) }));
      }
  
      if (cameraTarget === "idBack") {
        setForm(prev => ({ ...prev, id1Back: file }));
        setPreview(prev => ({ ...prev, id1Back: URL.createObjectURL(file) }));
      }
  
      if (cameraTarget === "selfie") {
        setForm(prev => ({ ...prev, selfieWithIds: file }));
        setCapturedImage(file);
      }
    }, "image/jpeg");
  
    // stop camera
    const stream = video.srcObject;
    stream.getTracks().forEach(track => track.stop());
    setCameraOpen(false);
    setCameraTarget(null);
  };
  
  
  
// optional helper to resync server state (used in submit retry)
const fetchRequests = async (emailToCheck) => {
  const email = (emailToCheck || localStorage.getItem("email") || localStorage.getItem("userEmail") || "").trim();
  if (!email) return null;
  try {
    const res = await axiosSC.get(`/SeniorConnect/memberrequests/?email=${encodeURIComponent(email)}`);
    console.log("[RequestMember] fetchRequests server response:", res.data);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("[RequestMember] fetchRequests error:", err);
    return null;
  }
};

// 1) primary fetch-on-mount (improved + logs) — preserves pending via latestRequestId
useEffect(() => {
  const email = localStorage.getItem("email") || localStorage.getItem("userEmail");
  console.log("[RequestMember] mount check, local email:", email);
  console.log("[RequestMember] local membershipSubmitted:", localStorage.getItem("membershipSubmitted"));
  console.log("[RequestMember] local approvedIdNumber:", localStorage.getItem("approvedIdNumber"));

  if (!email) {
    localStorage.removeItem("membershipSubmitted");
    localStorage.removeItem("approvedIdNumber");
    localStorage.removeItem("latestRequestId");
    setAlreadySubmitted(false);
    setApprovedByAdmin(false);
    setApprovedIdNumber(null);
    return;
  }

  axiosSC.get(`/SeniorConnect/memberrequests/?email=${encodeURIComponent(email)}`)
    .then((res) => {
      console.log("[RequestMember] server response:", res.data);
      const requests = Array.isArray(res.data) ? res.data : [];

      if (requests.length === 0) {

        // 1️⃣ check if user JUST submitted (we stored a temporary flag)
        const pendingFlag = localStorage.getItem("membershipSubmitted") === "true";
      
        if (pendingFlag) {
          console.log("[RequestMember] No server data yet but membershipSubmitted=true → KEEP PENDING STATE");
      
          setAlreadySubmitted(true);
          setApprovedByAdmin(false);
      
          // do NOT clear pending — return early
          return;
        }
      
        // 2️⃣ otherwise normal clear
        console.log("[RequestMember] No server requests → clearing flags");
        localStorage.removeItem("membershipSubmitted");
        setAlreadySubmitted(false);
        setApprovedByAdmin(false);
        return;
      }
      

      // choose latest by created_at/date_applied or highest id
      let latest = requests[0];
      const hasDates = requests.some(r => r.created_at || r.date_applied || r.createdAt);
      if (hasDates) {
        latest = requests.reduce((a, b) => {
          const aDate = new Date(a.created_at || a.date_applied || a.createdAt || 0);
          const bDate = new Date(b.created_at || b.date_applied || b.createdAt || 0);
          return bDate > aDate ? b : a;
        });
      } else if (requests.every(r => typeof r.id !== "undefined")) {
        latest = requests.reduce((a, b) => (b.id > a.id ? b : a));
      } else {
        latest = requests[requests.length - 1];
      }

      console.log("[RequestMember] latest request chosen:", latest);

      const localEmail = (localStorage.getItem("email") || localStorage.getItem("userEmail") || "").toLowerCase();
      if (latest.email && localEmail && latest.email.toLowerCase() !== localEmail) {
        console.warn("[RequestMember] IGNORING server request for different email", {
          latestEmail: latest.email,
          localEmail
        });
        // clear stale local flags and bail out
        localStorage.removeItem("membershipSubmitted");
        localStorage.removeItem("approvedIdNumber");
        localStorage.removeItem("latestRequestId");
        setAlreadySubmitted(false);
        setApprovedByAdmin(false);
        setApprovedIdNumber(null);
        return;
      }

      const status = (latest.status || "").toLowerCase();

      if (status === "pending") {
        localStorage.setItem("membershipSubmitted", "true");   // persistent pending flag
        setAlreadySubmitted(true);
        setApprovedByAdmin(false);

        // store request id if present (helps after refresh)
        if (latest.id) localStorage.setItem("latestRequestId", String(latest.id));
      } else if (status === "approved") {
        setAlreadySubmitted(true);
        setApprovedByAdmin(true);
        setApprovedIdNumber(latest.id_number || null);
        localStorage.setItem("membershipSubmitted", "true");
        if (latest.id_number) localStorage.setItem("approvedIdNumber", latest.id_number);
        if (latest.id) localStorage.setItem("latestRequestId", String(latest.id));
      } else if (status === "rejected") {
        // clear everything and remove latestRequestId so user can reapply
        localStorage.removeItem("membershipSubmitted");
        localStorage.removeItem("approvedIdNumber");
        localStorage.removeItem("latestRequestId");
        setAlreadySubmitted(false);
        setApprovedByAdmin(false);
        setApprovedIdNumber(null);
      } else {
        // unknown / malformed status -> clear to be safe
        console.warn("[RequestMember] unknown status:", latest.status);
        localStorage.removeItem("membershipSubmitted");
        localStorage.removeItem("approvedIdNumber");
        setAlreadySubmitted(false);
        setApprovedByAdmin(false);
        setApprovedIdNumber(null);
      }
    })
    .catch((err) => {
      console.error("[RequestMember] network error fetching memberrequests:", err);
      // fallback: only trust localStorage when offline; but log details
      const localFlagFallback = localStorage.getItem("membershipSubmitted") === "true";
      const approvedId = localStorage.getItem("approvedIdNumber") || null;
      console.log("[RequestMember] fallback localFlag:", localFlagFallback, "approvedId:", approvedId);
      setAlreadySubmitted(localFlagFallback);
      setApprovedByAdmin(Boolean(approvedId));
      setApprovedIdNumber(approvedId);
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);




// 2) verification effect: whenever we think it's approved, double-check the server immediately
useEffect(() => {
  if (!alreadySubmitted || !approvedByAdmin) return;

  const email = localStorage.getItem("email") || localStorage.getItem("userEmail");
  if (!email) {
    // improbable, but be defensive
    localStorage.removeItem("membershipSubmitted");
    localStorage.removeItem("approvedIdNumber");
    setAlreadySubmitted(false);
    setApprovedByAdmin(false);
    setApprovedIdNumber(null);
    return;
  }

  // Re-check server to confirm APPROVED status for this email
  axiosSC.get(`/SeniorConnect/memberrequests/?email=${encodeURIComponent(email)}`)
    .then(res => {
      const requests = Array.isArray(res.data) ? res.data : [];
      // find any approved request
      const approved = requests.find(r => (r.status || "").toLowerCase() === "approved");
      if (!approved) {
        // server does NOT have an approved request -> clear everything
        console.warn("[RequestMember] approvedByAdmin true locally but no approved request on server -> clearing flags");
        localStorage.removeItem("membershipSubmitted");
        localStorage.removeItem("approvedIdNumber");
        setAlreadySubmitted(false);
        setApprovedByAdmin(false);
        setApprovedIdNumber(null);
      } else {
        // ensure we store the id_number from server (sync)
        if (approved.id_number) {
          localStorage.setItem("approvedIdNumber", approved.id_number);
          setApprovedIdNumber(approved.id_number);
        }
      }
    })
    .catch(err => {
      console.error("[RequestMember] verification network error:", err);
      // If verification fails, we keep the local state but log it.
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [alreadySubmitted, approvedByAdmin]);





  // form handlers (same as before)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "birthDate") {
      const birth = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      const finalAge = age >= 0 ? age : "";
      setForm((prev) => ({ ...prev, age: finalAge }));
      setDisqualified(finalAge !== "" && finalAge < 60);
    }
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    setForm((prev) => ({ ...prev, [name]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview((prev) => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreview((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (disqualified) {
      setPopupMessage("Sorry, you must be at least 60 years old to apply.");
      return;
    }
  
    if (!form.lastName || !form.firstName || !form.barangay || !form.birthDate || !form.sex) {
      setPopupMessage("Please complete all required fields.");
      return;
    }
  
    // ensure email is current and sync to form/localStorage
    const currentEmail = (localStorage.getItem("email") || localStorage.getItem("userEmail") || form.email || "").trim();
    if (!currentEmail) {
      setPopupMessage("No email found for your account. Please login again.");
      return;
    }
    setPopupMessage("");
    setLoading(true);
  
    const formData = new FormData();
    formData.append("last_name", form.lastName);
    formData.append("first_name", form.firstName);
    formData.append("middle_name", form.middleName);
    formData.append("suffix", form.suffix);
    formData.append("barangay", form.barangay);
    formData.append("street", form.street);
    formData.append("birth_date", form.birthDate);
    formData.append("sex", form.sex);
    formData.append("age", form.age);
    formData.append("date_applied", new Date().toISOString().split("T")[0]);
    formData.append("beneficiary_contact", form.beneficiaryContact);
    formData.append("beneficiary_name", form.beneficiaryName);
    formData.append("beneficiary_relationship", form.beneficiaryRelationship);
    if (form.id1Front) formData.append("id1_front", form.id1Front);
    if (form.id1Back) formData.append("id1_back", form.id1Back);
    if (form.selfieWithIds) formData.append("selfie_with_ids", form.selfieWithIds);
    if (form.ownPicture) formData.append("own_picture", form.ownPicture);
    formData.append("email", currentEmail);
  
    try {
      const res = await axiosSC.post("/SeniorConnect/memberrequests/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // Sync local flags based on server response (no double-send)
      localStorage.setItem("membershipSubmitted", "true");
      // if backend returns created object with id, persist it locally
      if (res && res.data && (res.data.id || res.data.pk)) {
        const rid = res.data.id || res.data.pk;
        localStorage.setItem("latestRequestId", String(rid));
      }
      // If backend returns status or id_number, use it
      const returnedStatus = (res?.data?.status || "").toLowerCase();
      if (returnedStatus === "approved" && res.data.id_number) {
        localStorage.setItem("approvedIdNumber", res.data.id_number);
        setAlreadySubmitted(true);
        setApprovedByAdmin(true);
        setApprovedIdNumber(res.data.id_number);
        setPopupMessage("Request approved by admin.");
      } else {
        // treat as pending by default
        setAlreadySubmitted(true);
        setApprovedByAdmin(false);
        setApprovedIdNumber(null);
        setPopupMessage("Request submitted! Please wait for admin approval.");
      }
  
      // Best-effort: refresh authoritative state after a short delay (backend may need a moment)
      setTimeout(() => {
        const email = currentEmail;
        axiosSC.get(`/SeniorConnect/memberrequests/?email=${encodeURIComponent(email)}`)
          .then(r2 => {
            console.log("[RequestMember] post-submit resync:", r2.data);
          })
          .catch(() => {});
      }, 700); // small delay to reduce race condition
  
    } catch (error) {
      console.error("Submission error:", error);
      // rollback any optimistic flags we set
      localStorage.removeItem("membershipSubmitted");
      localStorage.removeItem("latestRequestId");
      localStorage.removeItem("approvedIdNumber");
      setAlreadySubmitted(false);
      setApprovedByAdmin(false);
      setApprovedIdNumber(null);
  
      if (error.response) {
        setPopupMessage("Submission failed: " + JSON.stringify(error.response.data));
      } else {
        setPopupMessage("Network error, try again later.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyIdHere = async () => {
    setVerifyError("");
    setVerifying(true);
  
    try {
      // Step 1: check ID
      const idRes = await axiosSC.get("/SeniorConnect/citizens/check_id/", {
        params: { id_number: idNumber },
      });
  
      if (!idRes.data.exists) {
        setVerifyError("Hindi makita ang ID number. Pakiulit muli.");
        setVerifying(false);
        return;
      }
  
      // Step 2: link email + ID
      const email =
        localStorage.getItem("email") ||
        localStorage.getItem("userEmail");
  
      const verifyRes = await axiosSC.post(
        "/SeniorConnect/citizens/verify_member/",
        {
          email,
          id_number: idNumber,
        }
      );
  
      const msg = verifyRes.data?.message || "";
  
      if (msg.includes("already")) {
        setVerifyError(msg);
      } else if (msg.includes("successfully")) {
        localStorage.setItem("isMember", "true");
        localStorage.setItem("id_number", idNumber);
  
        // ✅ diretso profile
        navigate("/citizen/MyProfile");
      } else {
        setVerifyError(msg || "Hindi ma-verify ang ID.");
      }
    } catch (err) {
      setVerifyError(
        err.response?.data?.message ||
          "May error sa pag-verify. Subukan muli."
      );
    } finally {
      setVerifying(false);
    }
  };
  
  // If admin already approved — show the approved card with verify link
  if (alreadySubmitted && approvedByAdmin) {
    return (
      <div className="submitted-wrapper">
        <div className="status-card approved">
          <div className="status-icon">✅</div>
          <h2>Federation admin already approved your request</h2>
          <p className="sub">Please check your email for details from the federation.</p>
      
          <hr className="divider" />
          <p>
            To complete registration, please{" "}
            <span
              className="verify-link"
              onClick={() => navigate("/citizen/VerifyAccount")}
              style={{ cursor: "pointer", color: "#0b63ff" }}
            >
              verify your ID here
            </span>
            .
          </p>
        </div>
      </div>
    );
  }

  // If already submitted but not yet approved -> pending card
  if (alreadySubmitted && !approvedByAdmin) {
    return (
      <div className="submitted-wrapper">
        <div className="status-card">
          <div className="status-icon">⏳</div>
          <h2>Your membership request has been submitted</h2>
          <p className="sub">Please wait for admin approval.</p>
          <hr className="divider" />
          <p className="verify-text">
            Already a federation member?{" "}
            <span className="verify-link" onClick={() => navigate("/citizen/VerifyAccount")}>
              Verify your ID here.
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ✅ Verify-first screen (UI only)
if (!alreadySubmitted && !showForm) {
  return (
    <div className="submitted-wrapper">
      <div className="status-card">
        <div className="status-icon">🪪</div>

        <h2>I-verify ang iyong Senior Citizen ID</h2>
        <p className="sub">
          Kung ikaw ay isa nang miyembro ng pederasyon, ilagay ang iyong ID number sa ibaba.
        </p>

        {/* ✅ ID INPUT */}
        <input
          type="text"
          placeholder="Ilagay ang ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        {verifyError && (
          <p style={{ color: "#dc2626", marginTop: 8 }}>
            {verifyError}
          </p>
        )}

        {/* PRIMARY ACTION */}
        <button
          className="submit-btn"
          style={{ marginTop: 16 }}
          disabled={!idNumber || verifying}
          onClick={handleVerifyIdHere}
        >
          {verifying ? "Nagve-verify..." : "I-verify ang ID"}
        </button>

        <hr className="divider" />

        {/* SECONDARY ACTION */}
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          Hindi pa miyembro ng pederasyon?{" "}
          <span
            className="verify-link"
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => setShowForm(true)}
          >
            Magrehistro dito
          </span>
        </p>
      </div>
    </div>
  );
}




  // Otherwise show the form
  return (
    <div className="RequestMemberCont">
      <form className="request-member-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="LFormLogo"><img src="/images/logo.png" alt="Logo" /></div>

        <h2>Senior Citizen Federation Membership Request</h2>

        {/* PERSONAL INFO */}
        <h3 className="section-title">Personal Information</h3>

        <div className="LFormRow">
          <div className="LFormGroup">
            <label>Last Name <span className="required-asterisk">*</span></label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>

          <div className="LFormGroup">
            <label>First Name <span className="required-asterisk">*</span></label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
        </div>

        <div className="LFormRow">
          <div className="LFormGroup">
            <label>Middle Name <span className="optional-label">(Optional)</span></label>
            <input name="middleName" value={form.middleName} onChange={handleChange} />
          </div>

          <div className="LFormGroup">
            <label>Suffix <span className="optional-label">(Optional)</span></label>
            <input name="suffix" value={form.suffix} onChange={handleChange} />
          </div>
        </div>

        <div className="LFormGroup">
          <label>Barangay <span className="required-asterisk">*</span></label>
          <select name="barangay" value={form.barangay} onChange={handleChange} required>
            <option value="">Select Barangay</option>
            {barangayList.map((brgy) => (
              <option key={brgy} value={brgy}>{brgy}</option>
            ))}
          </select>
        </div>

        <div className="LFormGroup">
          <label>Street / Purok / Sitio <span className="optional-label">(Optional)</span></label>
          <input
            name="street"
            value={form.street}
            onChange={handleChange}
            placeholder="e.g. Purok 3, Rizal St."
          />
        </div>


        <div className="LFormRow">
          <div className="LFormGroup">
            <label>Birth Date <span className="required-asterisk">*</span></label>
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} required />
          </div>

          <div className="LFormGroup">
            <label>Age</label>
            <input name="age" value={form.age} readOnly placeholder="Auto-calculated" />
          </div>

          <div className="LFormGroup">
            <label>Sex <span className="required-asterisk">*</span></label>
            <select name="sex" value={form.sex} onChange={handleChange} required>
              <option value="">Select</option>
              {sexOptions.map((sx) => (
                <option key={sx} value={sx}>{sx}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="LFormGroup">
          <label>Date Applied</label>
          <input
            type="text"
            value={new Date().toLocaleDateString()}
            readOnly
            style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
          />
        </div>


        {/* EMERGENCY CONTACT */}
        <h3 className="section-title">Emergency Contact Information</h3>

        <div className="LFormRow">
          <div className="LFormGroup">
            <label>Beneficiary Name <span className="optional-label">(Optional)</span></label>
            <input name="beneficiaryName" value={form.beneficiaryName} onChange={handleChange} />
          </div>

          <div className="LFormGroup">
            <label>Relationship <span className="optional-label">(Optional)</span></label>
            <input name="beneficiaryRelationship" value={form.beneficiaryRelationship} onChange={handleChange} />
          </div>
        </div>

        <div className="LFormGroup">
          <label>Beneficiary Contact <span className="optional-label">(Optional)</span></label>
          <input name="beneficiaryContact" value={form.beneficiaryContact} onChange={handleChange} />
        </div>

        {/* DOCUMENTS */}
        <h3 className="section-title">Required Documents / Photos</h3>

        <div className="LFormGroup">
          <label>ID (Front) <span className="required-asterisk">*</span></label>

          {!preview.id1Front && !cameraOpen && (
            <div className="upload-options">
              <button
                type="button"
                className="camera-btn"
                onClick={() => openCamera("idFront")}
              >
                Open Camera
              </button>


              <input
                type="file"
                name="id1Front"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          )}

          {preview.id1Front && (
            <img className="img-preview" src={preview.id1Front} alt="ID Front" />
          )}
        </div>


        <div className="LFormGroup">
          <label>ID (Back) <span className="required-asterisk">*</span></label>

          {!preview.id1Back && !cameraOpen && (
            <div className="upload-options">
              <button
                type="button"
                className="camera-btn"
                onClick={() => openCamera("idBack")}
              >
                Open Camera
              </button>


              <input
                type="file"
                name="id1Back"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          )}

          {preview.id1Back && (
            <img className="img-preview" src={preview.id1Back} alt="ID Back" />
          )}
        </div>


        <div className="LFormGroup">
          <label>
            Selfie Holding ID <span className="required-asterisk">*</span>
          </label>

          {!cameraOpen && !capturedImage && (
            <div className="upload-options">
              <button
                type="button"
                onClick={() => openCamera("selfie")}
                className="camera-btn"
              >
                Open Camera
              </button>


              <input
                type="file"
                name="selfieWithIds"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          )}

          {cameraOpen && (
            <>
              <video ref={videoRef} autoPlay style={{ width: "100%", borderRadius: 8 }} />
              <button type="button" onClick={capturePhoto} className="submit-btn">
                Capture Photo
              </button>
            </>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {capturedImage && (
            <p style={{ color: "green" }}>Photo captured successfully ✅</p>
          )}

          {preview.selfieWithIds && <img className="img-preview" src={preview.selfieWithIds} alt="Selfie with ID" />}
        </div>

        <div className="LFormGroup">
          <label>Upload Own Picture <span className="required-asterisk">*</span></label>
          <input type="file" name="ownPicture" accept="image/*" onChange={handleImageChange} required />
          {preview.ownPicture && <img className="img-preview" src={preview.ownPicture} alt="Own Picture" />}
        </div>

        {disqualified && (
          <div className="disqualify-warning">
            Sorry, you are not qualified to request membership. Must be at least 60 years old.
          </div>
        )}

        {popupMessage && (
          <div className="popup-overlay">
            <div className="popup-box">
              <p>{popupMessage}</p>
              <button type="button" onClick={() => setPopupMessage("")}>OK</button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={disqualified || !form.age}
          style={{
            opacity: disqualified || !form.age ? 0.5 : 1,
            cursor: disqualified || !form.age ? "not-allowed" : "pointer"
          }}
        >
          Submit Request
        </button>

        <div className="verify-link-container" style={{ marginTop: 12, textAlign: 'center'}}>
          Already a federation member?{" "}
          <span
            className="verify-link"
            onClick={() => {
              setShowForm(false);      // balik sa verify screen
              setVerifyError("");     // optional: clear error
              setIdNumber("");        // optional: clear input
            }}
          >
            Verify your ID here
          </span>
        </div>
      </form>
    </div>
  );
}

export default RequestMember;
