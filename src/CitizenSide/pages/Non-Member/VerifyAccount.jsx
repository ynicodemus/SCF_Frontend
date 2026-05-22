import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../axios";
import "./VerifyAccount.css";

function CitizenVerifyAcc() {
  const navigate = useNavigate();

  const [idNumber, setIdNumber] = useState("");
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ AUTO PREFILL FROM REQUEST MEMBER
  useEffect(() => {
    const prefill = localStorage.getItem("verifyIdPrefill");
    if (prefill) {
      setIdNumber(prefill);
      localStorage.removeItem("verifyIdPrefill");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const idResponse = await api.get("/SeniorConnect/citizens/check_id/", {
        params: { id_number: idNumber },
      });

      if (!idResponse.data.exists) {
        setErrorMessage("ID not found. Please check your input.");
        setLoading(false);
        return;
      }

      const email = localStorage.getItem("userEmail");

      const verifyResponse = await api.post(
        "/SeniorConnect/citizens/verify_member/",
        { email, id_number: idNumber }
      );

      const backendMsg = verifyResponse.data?.message || "";

      if (backendMsg.includes("successfully")) {
        setIsIdVerified(true);
        setFullName(idResponse.data.full_name);
        localStorage.setItem("isMember", "true");
        localStorage.setItem("id_number", idNumber);

        setTimeout(() => {
          window.location.href = "/citizen/MyProfile";
        }, 2000);
      } else {
        setErrorMessage(backendMsg);
      }
    } catch (err) {
      setErrorMessage("Error verifying ID. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="verifyAcc-container">
      <h2 className="verifyAcc-title">Verify Your Federation ID</h2>

      {!isIdVerified && (
        <form className="verifyAcc-form" onSubmit={handleSubmit}>
          <input
            className="verifyAcc-input"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="Enter your ID number"
            required
          />

          {errorMessage && <p className="verifyAcc-error">{errorMessage}</p>}

          <button className="verifyAcc-button" disabled={loading}>
            {loading ? "Verifying..." : "Verify ID"}
          </button>
        </form>
      )}

      {isIdVerified && (
        <div className="verifyAcc-success">
          <h3>✅ Account verified!</h3>
          <p>Welcome, {fullName}! Redirecting…</p>
        </div>
      )}
    </div>
  );
}

export default CitizenVerifyAcc;
