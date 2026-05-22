import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import "../../css/MemberRequest.css";
import "../../css/MemberRequest.css"; // Your CSS

const barangayList = [
  "Antipolo", "Balubal", "Barangay 3", "Barangay 4", "Bibanga", "Bignay 1", "Bignay 2",
  "Bogon", "Bucal", "Cada", "Canada", "Canda", "Carnation", "Casta", "Castañas", "Centro Bucal",
  "Concepcion", "Concepcion 1", "Concepcion Banahaw", "Concepcion Palasan", "Concepcion Pinag",
  "Concepcion Pinagbakuran", "Gibanga", "Guis-Guis", "Guis-Guis San Roque", "Guis-Guis Talon",
  "Janagdong", "Janagdong 1", "Janagdong 2", "Limbon", "Lutucan", "Lutucan 1", "Lutucan Bata",
  "Lutucan Malabag", "Manggalang", "Manggalang 1", "Manggalang Bantilan", "Manggalang Kiling",
  "Manggalang Tulo-Tulo", "Mamala", "Mamala 1", "Mamala 2", "Marichi Subdivision", "Montecillo",
  "Morong", "Pantoc", "Pili", "Poblacion", "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4",
  "Poblacion 5", "Poblacion 6", "S. Marilag Montecillo", "Sampaloc", "Sampaloc 1", "Sampaloc 2",
  "Sampaloc B", "Sampaloc Bagon", "San Roque", "Sto. Cristo", "Talaan", "Talaan Aplaya", "Talaan Pantoc",
  "Tumabaga 1", "Tumabaga 2"
];

const sexOptions = ["Male", "Female", "Other"];

function RequestMember() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    barangay: "",
    birthDate: "",
    age: "",
    sex: "",
    dateApplied: "",
    beneficiaryContact: "",
    beneficiaryName: "",
    beneficiaryRelationship: "",
    id1Front: null,
    id1Back: null,
    id2Front: null,
    id2Back: null,
    selfieWithIds: null,
    ownPicture: null,
  });

  const [preview, setPreview] = useState({
    id1Front: null,
    id1Back: null,
    id2Front: null,
    id2Back: null,
    selfieWithIds: null,
    ownPicture: null,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // If birth date, auto-compute age
    if (name === "birthDate") {
      const birth = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setForm((prev) => ({ ...prev, age: age >= 0 ? age : "" }));
    }
  };

  // Handle image change
  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    setForm((prev) => ({
      ...prev,
      [name]: file,
    }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreview((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // THE FUNCTIONAL PART: Submit data + images
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    // MANUAL mapping, not Object.entries!
    formData.append("last_name", form.lastName);
    formData.append("first_name", form.firstName);
    formData.append("middle_name", form.middleName);
    formData.append("suffix", form.suffix);
    formData.append("barangay", form.barangay);
    formData.append("birth_date", form.birthDate);
    formData.append("age", form.age);
    formData.append("sex", form.sex);
    formData.append("date_applied", form.dateApplied);
    formData.append("beneficiary_contact", form.beneficiaryContact);
    formData.append("beneficiary_name", form.beneficiaryName);
    formData.append("beneficiary_relationship", form.beneficiaryRelationship);
    formData.append("id1_front", form.id1Front);
    formData.append("id1_back", form.id1Back);
    formData.append("id2_front", form.id2Front);
    formData.append("id2_back", form.id2Back);
    formData.append("selfie_with_ids", form.selfieWithIds);
    formData.append("own_picture", form.ownPicture);
  
    try {
      await axios.post(
        "https://scf-backend-92qq.onrender.com/SeniorConnect/memberrequests/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Request submitted! Please wait for admin approval.");
      setForm({
        lastName: "",
        firstName: "",
        middleName: "",
        suffix: "",
        barangay: "",
        birthDate: "",
        age: "",
        sex: "",
        dateApplied: "",
        beneficiaryContact: "",
        beneficiaryName: "",
        beneficiaryRelationship: "",
        id1Front: null,
        id1Back: null,
        id2Front: null,
        id2Back: null,
        selfieWithIds: null,
        ownPicture: null,
      });
      setPreview({
        id1Front: null,
        id1Back: null,
        id2Front: null,
        id2Back: null,
        selfieWithIds: null,
        ownPicture: null,
      });
    } catch (error) {
      // Now log backend's actual response if 400
      if (error.response) {
        console.error("Backend error:", error.response.data);
        alert(
          "Submission failed. Error: " +
            JSON.stringify(error.response.data, null, 2)
        );
      } else {
        console.error("Error submitting member request:", error);
        alert("Submission failed. Please check your details and try again.");
      }
    }
  };

  return (
    <div className="RequestMemberCont">
      <form className="request-member-form" onSubmit={handleSubmit} encType="multipart/form-data">
          {/* BACK BUTTON */}
          <button
          type="button"
          className="back-btn"
          onClick={() => navigate('/Account')}
          style={{
            marginBottom: "16px",
            padding: "6px 20px",
            borderRadius: "7px",
            background: "#e3e7f0",
            color: "#1976d2",
            border: "none",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            alignSelf: "flex-start"
          }}
        >
          ← Back
        </button>
        
        <h2>Request Membership</h2>
        
        <div className="LFormRow">
          <div className="LFormGroup">
            <label>Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div className="LFormGroup">
            <label>First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
        </div>

        <div className="LFormRow">
          <div className="LFormGroup">
            <label>Middle Name </label>
            <input name="middleName" value={form.middleName} onChange={handleChange} />
          </div>
          <div className="LFormGroup">
            <label>Suffix </label>
            <input name="suffix" value={form.suffix} onChange={handleChange} />
          </div>
        </div>

        <div className="LFormGroup">
          <label>Barangay</label>
          <select name="barangay" value={form.barangay} onChange={handleChange} required>
            <option value="">Select Barangay</option>
            {barangayList.map((brgy) => (
              <option key={brgy} value={brgy}>{brgy}</option>
            ))}
          </select>
        </div>

        <div className="LFormRow">
          <div className="LFormGroup">
            <label>Birth Date</label>
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} required />
          </div>
          <div className="LFormGroup">
            <label>Age</label>
            <input name="age" value={form.age} readOnly placeholder="Auto-calculated" />
          </div>
          <div className="LFormGroup">
            <label>Sex</label>
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
          <input type="date" name="dateApplied" value={form.dateApplied} onChange={handleChange} required />
        </div>

        <div className="LFormRow">
          <div className="LFormGroup">
            <label>Beneficiary Name</label>
            <input name="beneficiaryName" value={form.beneficiaryName} onChange={handleChange} required />
          </div>
          <div className="LFormGroup">
            <label>Relationship</label>
            <input name="beneficiaryRelationship" value={form.beneficiaryRelationship} onChange={handleChange} required />
          </div>
        </div>

        <div className="LFormGroup">
          <label>Beneficiary Contact</label>
          <input name="beneficiaryContact" value={form.beneficiaryContact} onChange={handleChange} required />
        </div>

        <div className="LFormGroup">
          <label>ID #1 (Front)</label>
          <input type="file" name="id1Front" accept="image/*" onChange={handleImageChange} required />
          {preview.id1Front && <img className="img-preview" src={preview.id1Front} alt="ID1 Front" />}
        </div>
        <div className="LFormGroup">
          <label>ID #1 (Back)</label>
          <input type="file" name="id1Back" accept="image/*" onChange={handleImageChange} required />
          {preview.id1Back && <img className="img-preview" src={preview.id1Back} alt="ID1 Back" />}
        </div>
        <div className="LFormGroup">
          <label>ID #2 (Front)</label>
          <input type="file" name="id2Front" accept="image/*" onChange={handleImageChange} required />
          {preview.id2Front && <img className="img-preview" src={preview.id2Front} alt="ID2 Front" />}
        </div>
        <div className="LFormGroup">
          <label>ID #2 (Back)</label>
          <input type="file" name="id2Back" accept="image/*" onChange={handleImageChange} required />
          {preview.id2Back && <img className="img-preview" src={preview.id2Back} alt="ID2 Back" />}
        </div>
        <div className="LFormGroup">
          <label>Selfie Holding Two IDs</label>
          <input type="file" name="selfieWithIds" accept="image/*" onChange={handleImageChange} required />
          {preview.selfieWithIds && <img className="img-preview" src={preview.selfieWithIds} alt="Selfie with IDs" />}
        </div>
        <div className="LFormGroup">
          <label>Upload Own Picture</label>
          <input type="file" name="ownPicture" accept="image/*" onChange={handleImageChange} required />
          {preview.ownPicture && <img className="img-preview" src={preview.ownPicture} alt="Own Picture" />}
        </div>

        <button type="submit" className="submit-btn">Submit Request</button>
      </form>
    </div>
  );
}

export default RequestMember;
