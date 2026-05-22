import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import "../css/Documents.css";
import api from "../../axios";

function Documents() {
  const [form, setForm] = useState({
    controlNo: "",
    city: "Sariaya",
    name: "",
    address: "",
    dob: "",
    age: "",
    dateIssued: "",
    picture: null,
  });

  const [showGenerator, setShowGenerator] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState("");

  const cardRef = useRef(null);

  // 🧮 Compute Age
  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      const computedAge = calculateAge(value);
      setForm({ ...form, dob: value, age: computedAge });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 🔍 Fetch Info by ControlNo
  const handleFetchInfo = async () => {
    if (!form.controlNo) return;
    setLoading(true);
    setNotFound("");

    try {
      const response = await api.get(`/SeniorConnect/members/?id_number=${form.controlNo}`);
      if (response.data && response.data.length > 0) {
        const citizen = response.data[0];
        const computedAge = calculateAge(citizen.birth_date);
        setForm({
          ...form,
          name: `${citizen.last_name}, ${citizen.first_name} ${citizen.middle_name || ""}`,
          address: "",
          dob: citizen.birth_date || "",
          age: computedAge || "",
          dateIssued: new Date().toISOString().split("T")[0],
          city: "Sariaya, Quezon",
          picture: null,
        });
      } else {
        setNotFound("No record found for this Control No.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotFound("Failed to fetch info. Please check your Control No.");
    } finally {
      setLoading(false);
    }
  };

  // 🖼 Manual photo upload
  const handlePhoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectURL = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, picture: objectURL }));
    }
  };

  // 💾 Download card
  const handleDownload = async () => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const clonedCard = cardElement.cloneNode(true);
    clonedCard.style.background = "#ffffff";
    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";
    wrapper.style.padding = "10px";
    wrapper.style.background = "#ffffff";
    wrapper.appendChild(clonedCard);
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      willReadFrequently: true,
      removeContainer: true,
    });

    const link = document.createElement("a");
    link.style.display = "none";
    link.download = showBack ? "senior_id_back.png" : "senior_id_card.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.body.removeChild(wrapper);
  };

  return (
    <div className="DocumentsCont">
      <div className="id-card-row">
        {/* Senior Citizen ID Generator */}
        <div className="open-id-card-btn" onClick={() => setShowGenerator(true)}>
          <div className="card-btn-icon">🪪</div>
          <div className="card-btn-title">Senior Citizen ID Generator</div>
          <div className="card-btn-desc">Create, preview, and download an ID card</div>
        </div>
      </div>

      {/* 🪪 ID Generator Modal */}
      {showGenerator && (
        <div className="generator-modal">
          <div className="generator-modal-bg" onClick={() => setShowGenerator(false)} />
          <div className="generator-modal-box">
            <button className="close-id-btn" onClick={() => setShowGenerator(false)}>
              &times;
            </button>
            <h2 style={{ marginBottom: 10 }}>ID Card Generator</h2>

            {/* FRONT / BACK TOGGLE */}
            <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 18px" }}>
              <button
                style={{
                  padding: "8px 24px",
                  background: !showBack ? "#007bff" : "#eee",
                  color: !showBack ? "#fff" : "#222",
                  border: "none",
                  borderRadius: "6px 0 0 6px",
                  fontWeight: 700,
                }}
                disabled={!showBack}
                onClick={() => setShowBack(false)}
              >
                Front
              </button>
              <button
                style={{
                  padding: "8px 24px",
                  background: showBack ? "#007bff" : "#eee",
                  color: showBack ? "#fff" : "#222",
                  border: "none",
                  borderRadius: "0 6px 6px 0",
                  fontWeight: 700,
                }}
                disabled={showBack}
                onClick={() => setShowBack(true)}
              >
                Back
              </button>
            </div>

            {!showBack && (
              <form className="id-form">
                <div>
                  <label>Control No.:</label>
                  <input
                    name="controlNo"
                    value={form.controlNo}
                    onChange={handleChange}
                    onBlur={handleFetchInfo}
                    placeholder="Enter ID number"
                  />
                  {loading && <p style={{ color: "blue" }}>Fetching info...</p>}
                  {notFound && <p style={{ color: "red" }}>{notFound}</p>}
                </div>

                <div>
                  <label>City/Municipality:</label>
                  <input name="city" value={form.city} readOnly />
                </div>

                <div>
                  <label>Name:</label>
                  <input name="name" value={form.name} onChange={handleChange} />
                </div>

                <div>
                  <label>Address:</label>
                  <input name="address" value={form.address} onChange={handleChange} />
                </div>

                <div>
                  <label>Date of Birth:</label>
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                </div>

                <div>
                  <label>Age:</label>
                  <input name="age" value={form.age} readOnly />
                </div>

                <div>
                  <label>Date of Issue:</label>
                  <input
                    type="date"
                    name="dateIssued"
                    value={form.dateIssued}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>1x1 ID Photo:</label>
                  <input type="file" accept="image/*" onChange={handlePhoto} />
                </div>
              </form>
            )}

            {/* ID CARD PREVIEW */}
            <div className="card-preview-wrapper">
              {!showBack ? (
                <div className="id-card-template" ref={cardRef}>
                  <div className="id-header">
                    <div className="controlno-block">
                      <span className="control-label">Control No.</span>
                      <span className="id-value">{form.controlNo}</span>
                    </div>

                    <div className="id-photo-box">
                      {form.picture ? (
                        <img src={form.picture} alt="1x1 ID" />
                      ) : (
                        <span>1X1<br />PHOTO</span>
                      )}
                    </div>
                  </div>

                  <div className="id-main">
                    <div className="republic">Republic of the Philippines</div>
                    <div className="office-label">
                      NATIONAL COORDINATING & MONITORING BOARD<br />
                      OFFICE OF THE SENIOR CITIZENS AFFAIR
                    </div>

                    <div className="city-row">
                      City/Municipality of <span className="id-value">{form.city}</span>
                    </div>
                    <div className="province-row">Quezon Province</div>

                    <div className="id-line-row">
                      Name <span className="line-field">{form.name}</span>
                    </div>
                    <div className="id-line-row">
                      Address <span className="line-field">{form.address}</span>
                    </div>

                    <div className="id-row">
                      <div className="id-date-col">
                        <div className="id-label">Date of Birth / Age</div>
                        <div className="id-line-combo">
                          {form.dob} / {form.age}
                        </div>
                      </div>
                      <div className="id-date-col">
                        <div className="id-label">Date of Issue</div>
                        <div className="id-line-combo">{form.dateIssued}</div>
                      </div>
                    </div>

                    <div className="id-note">
                      THIS CARD IS NON-TRANSFERABLE AND VALID ANYWHERE IN THE COUNTRY
                    </div>
                    <div className="id-signature-line">
                      Printed Name and Signature/Thumbmark
                    </div>
                  </div>
                </div>
              ) : (
                <div className="id-back-template" ref={cardRef}>
                  <div className="idback-title">
                    Benefits and Privileges Under Republic Act No. 9994
                  </div>
        <ol className="idback-list">
          <li>20% discount and VAT exemption on medicines, including influenza and pneumococcal vaccines.</li>
          <li>20% discount and VAT exemption on professional fees of attending physicians in all private hospitals, medical facilities, and outpatient clinics.</li>
          <li>20% discount and VAT exemption on professional fees of licensed health workers providing home health care services.</li>
          <li>Free medical and dental services, diagnostic and laboratory services in government facilities.</li>
          <li>20% discount and VAT exemption on transportation fares (air, sea, and land transport).</li>
          <li>20% discount and VAT exemption on hotels, lodging establishments, restaurants, and similar places of leisure.</li>
          <li>20% discount and VAT exemption on recreation centers, theaters, cinemas, and concert halls.</li>
          <li>Exemption from training fees for socio-economic programs conducted by private and government offices.</li>
          <li>20% discount and VAT exemption on funeral and burial services for the death of the senior citizen.</li>
          <li>Government assistance for employment, free vocational and technical training programs.</li>
          <li>Continuing education and retooling of senior citizens who wish to continue working.</li>
          <li>Social pension for indigent senior citizens under DSWD programs.</li>
          <li>Death benefit assistance for indigent senior citizens.</li>
          <li>Free flu and pneumococcal vaccinations for indigent senior citizens.</li>
          <li>Tax incentives for establishments employing senior citizens.</li>
          <li>Privileges and benefits are valid nationwide and non-transferable.</li>
        </ol>
                </div>
              )}

              <button onClick={handleDownload} className="download-btn">
                Download {showBack ? "Back" : "ID"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
