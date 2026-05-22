import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Fmember.css";
import api from "../.././axios";
import html2canvas from "html2canvas";


function FederationMember() {
  const [citizens, setCitizens] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    id_number: "",
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix: "",
    address: "",
    birth_date: "",
    age: "",
    sex: "",
    date_issued: "",
    emer_name: "",
    emer_contact: "",
    emer_rel: "",
    is_damayan_member: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ ...formData });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showtempDeleteModal, setShowtempDeleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [removeReason, setRemoveReason] = useState("");
  const [deleteIdNumber, setDeleteIdNumber] = useState(null);
  const [filteredCitizens, setFilteredCitizens] = useState([]);
  const [sortField, setSortField] = useState("id");
  const [showConfirmAdd, setShowConfirmAdd] = useState(false);
  const [addStatus, setAddStatus] = useState("");
  const [claims, setClaims] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showActiveMemberModal, setShowActiveMemberModal] = useState(false);



  useEffect(() => {
  const fetchData = async () => {
    try {
      // 🧩 Fetch all citizens
      const citizensRes = await api.get("/SeniorConnect/citizens/");
      setCitizens(citizensRes.data);
      console.log(citizensRes.data);

      // 🧩 Fetch all Damayan claims (to check claiming status)
      const claimsRes = await api.get("/SeniorConnect/damayanclaims/");
      setClaims(claimsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, []);

  useEffect(() => {
    if (showForm || showDeleteModal || showtempDeleteModal) {
      setSelectedCitizen(null);
    }
  }, [showForm, showDeleteModal, showtempDeleteModal]);


  const getClaimStatusForCitizen = (idNumber) => {
    const claim = claims.find(
      (c) => c.citizen?.id_number === idNumber
    );
    if (!claim) return null;
    return claim.status;
  };


  function calculateAge(birthDateStr) {
    if (!birthDateStr) return "";
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    // 🟩 Handle birth_date (auto-calculate age)
    if (name === "birth_date") {
      setFormData((prev) => ({
        ...prev,
        birth_date: value,
        age: calculateAge(value),
      }));
    }
    // 🟦 Handle photo upload (store actual File object)
    else if (name === "photo") {
      setFormData((prev) => ({
        ...prev,
        photo: files[0], // store file instead of string
      }));
    }
    // 🟨 Handle all other inputs
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleDownload = () => {
    if (!citizens || citizens.length === 0) {
      alert("No data available to download.");
      return;
    }
  
    const headers = [
      "ID Number",
      "Last Name",
      "First Name",
      "Middle Name",
      "Suffix",
      "Barangay",
      "Birth Date",
      "Age",
      "Sex",
      "Date Issued",
      "Emergency Contact Name",
      "Emergency Contact Number",
      "Emergency Relationship",
      "Damayan Member",
    ];
  
    const rows = citizens.map((c) => [
      c.id_number || "",
      c.last_name || "",
      c.first_name || "",
      c.middle_name || "",
      c.suffix || "",
      c.address || "", // your backend field is `address` not `barangay`
      c.birth_date || "",
      c.age || "",
      c.sex || "",
      c.date_issued || "",
      c.emer_name || "",
      c.emer_contact || "",
      c.emer_rel || "",
      c.is_damayan_member ? "Yes" : "No",
    ]);
  
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SeniorCitizensData_Full.csv";
    a.click();
  };
  
  

  const handleAddSenior = async (e) => {
    e.preventDefault();
    setFormError("");

    if (formData.age < 60) {
      alert("Age must be 60 or older to join.");
      return;
    }

    try {
      // 🟦 Use FormData instead of JSON
      const formDataToSend = new FormData();
      formDataToSend.append("id_number", formData.id_number);
      formDataToSend.append("last_name", formData.last_name);
      formDataToSend.append("first_name", formData.first_name);
      formDataToSend.append("middle_name", formData.middle_name);
      formDataToSend.append("suffix", formData.suffix);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("birth_date", formData.birth_date);
      formDataToSend.append("sex", formData.sex);
      formDataToSend.append("date_issued", formData.date_issued);
      formDataToSend.append("emer_name", formData.emer_name);
      formDataToSend.append("emer_contact", formData.emer_contact);
      formDataToSend.append("emer_rel", formData.emer_rel);
      formDataToSend.append("is_damayan_member", formData.is_damayan_member);

      // 🟨 Optional picture upload
      if (formData.photo) {
        formDataToSend.append("own_picture", formData.photo);
      }

      // 🟦 Make POST request as multipart/form-data
      const res = await api.post("/SeniorConnect/citizens/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 🟢 Add new citizen to list
      setCitizens([...citizens, res.data]);

      // 🧹 Reset form
      setFormData({
        id_number: "",
        last_name: "",
        first_name: "",
        middle_name: "",
        suffix: "",
        address: "",
        birth_date: "",
        age: "",
        sex: "",
        date_issued: "",
        emer_name: "",
        emer_contact: "",
        emer_rel: "",
        is_damayan_member: false,
        photo: null, // reset photo field too
      });

      setShowForm(false);
    } catch (error) {
      console.error("Error adding citizen:", error.response?.data || error.message);
      if (error.response?.data?.id_number) {
        setFormError("ID number already exists. Please use a unique ID number.");
      } else {
        setFormError("Failed to add senior. Please check your inputs and try again.");
      }
    }
  };


  const handleEditClick = (citizen) => {
    setFormError(""); 
    setSelectedCitizen(null); 
    setEditingId(citizen.id);
    setEditFormData(citizen);
    setShowForm(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "birth_date") {
      setEditFormData((prev) => ({
        ...prev,
        birth_date: value,
        age: calculateAge(value),
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (editFormData.age < 60) {
      alert("Age must be 60 or older to join.");
      return;
    }

    try {
      // ✅ Remove image field before sending
      const {
        own_picture,
        photo,
        ...cleanData
      } = editFormData;

      const response = await api.patch(
        `/SeniorConnect/citizens/${editingId}/`,
        cleanData
      );

      setCitizens(
        citizens.map((c) =>
          c.id === editingId ? response.data : c
        )
      );

      setSelectedCitizen(response.data);

      setEditingId(null);
      setShowForm(false);

    } catch (error) {
      console.error(
        "Error updating citizen:",
        error.response?.data || error.message
      );

      if (error.response?.data?.id_number) {
        setFormError("ID number already exists. Please use a unique ID number.");
      } else {
        setFormError("Failed to update citizen.");
      }
    }
  };



  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file || !selectedCitizen) return;

    try {
      const fd = new FormData();
      fd.append("own_picture", file);

      const response = await api.patch(
        `/SeniorConnect/citizens/${selectedCitizen.id}/`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // update selected citizen
      setSelectedCitizen(response.data);

      // update table data
      setCitizens((prev) =>
        prev.map((c) =>
          c.id === selectedCitizen.id ? response.data : c
        )
      );

    } catch (error) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message
      );

      alert("Failed to upload image.");
    }
  };

  const handleDeleteClick = (citizen) => {
    setSelectedCitizen(null);
    setDeleteId(citizen.id);
    setDeleteIdNumber(citizen.id_number);
    setShowDeleteModal(true);
  };

  const handletempDeleteClick = (id) => {
    setDeleteId(id);
    setShowtempDeleteModal(true);
  };

  const confirmtempDelete = async () => {
    try {
      await api.delete(`/SeniorConnect/citizens/${deleteId}/`);
      setCitizens(citizens.filter((c) => c.id !== deleteId));
    } catch (error) {
      console.error("Error deleting citizen:", error.response?.data || error.message);
    }
    setShowDeleteModal(false);
    setShowtempDeleteModal(false);
    setDeleteId(null);
  };

  const confirmDelete = async (reason, proofFile) => {
    if (!deleteIdNumber) return;
  
    const citizenToDelete = citizens.find((c) => c.id_number === deleteIdNumber);
    if (!citizenToDelete) {
      setDeleteError("Citizen record not found.");
      return;
    }

    if (
      citizenToDelete.is_damayan_member &&
      reason !== "Transfer"
    ) {
      setShowDeleteModal(false);
      setShowActiveMemberModal(true);
      return;
    }
  
    // Block if deceased but still has active Damayan claim
    if (reason === "Decease") {
      // guard has_claimed in case backend doesn't always return it
      const claimStatus = getClaimStatusForCitizen(deleteIdNumber);
      if (claimStatus) {
        setDeleteError(
          "⚠️ This citizen already has a Damayan claim. Archiving is automatic after release."
        );
        return;
      }
    }
  
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setDeleteError("You are not authenticated. Please login as admin.");
      return;
    }
  
    try {
      // optional: set a processing state to disable UI buttons
      // setIsProcessing(true);
  
      const fd = new FormData();
      fd.append("reason", reason);
      if (proofFile) fd.append("proof", proofFile);
  
      await api.post(
        `/SeniorConnect/archive-citizen/id_number/${deleteIdNumber}/`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        }
      );
  
      // If successful, remove from active list (use functional update)
      setCitizens((prev) => prev.filter((c) => c.id_number !== deleteIdNumber));
  
      // Optional: if you want to also reflect flags on other local state (not necessary if removed)
      // if (reason !== "Transfer") {
      //   // If you kept the item in the list and wanted to update flags:
      //   // setCitizens(prev => prev.map(c => c.id_number === deleteIdNumber ? {...c, is_damayan_member: false, is_archived: true} : c));
      // }
  
      // cleanup UI state
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteIdNumber(null);
      setRemoveReason("");
      setProofFile(null);
      setDeleteError("");
    } catch (error) {
      console.error("Error archiving citizen:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        setDeleteError("Unauthorized. Please re-login as admin.");
      } else {
        const backendError =
          error.response?.data?.detail ||
          JSON.stringify(error.response?.data) ||
          "Failed to archive. Please try again.";
        setDeleteError(backendError);
      }
    } finally {
      // setIsProcessing(false);
    }
  };
  


  const cancelDelete = () => {
    setShowDeleteModal(false);
    setShowtempDeleteModal(false);
    setDeleteId(null);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSortToggle = () => {
    setSortField((prevField) => {
      if (prevField === "id") return "last_name";
      if (prevField === "last_name") return "age";
      return "id"; // loops back
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const addressOptions = [
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

  // === FILTER HANDLERS ===
  const filterNoMiddleName = () => {
    const filtered = citizens.filter(
      (c) => !c.middle_name || c.middle_name.trim() === ""
    );
    setFilteredCitizens(filtered);
  };

  const filterNotDamayan = () => {
    const filtered = citizens.filter(
      (c) => !c.is_damayan_member || c.is_damayan_member === false
    );
    setFilteredCitizens(filtered);
  };

  // Optional: Show all again
  const resetFilters = () => {
    setFilteredCitizens([]);
  };

  const handleAddToDamayan = async (idNumber) => {
    setAddStatus("");
    try {
      const token = localStorage.getItem("adminToken");
      const response = await api.post(
        "/SeniorConnect/damayan/add-member/",
        { id_number: idNumber },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setAddStatus("Citizen successfully added to Damayan Program!");
        setSelectedCitizen((prev) => ({
          ...prev,
          is_damayan_member: true,
        }));
        setTimeout(() => {
          setAddStatus("");
          setShowConfirmAdd(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding to Damayan:", error);
      setAddStatus("Failed to add. Please try again.");
    }
  };

  const handleGenerateID = async (idNumber) => {
    try {
      const res = await api.get(`/SeniorConnect/members/?id_number=${idNumber}`);
      const citizen = res.data[0];
      if (!citizen) {
        alert("No record found.");
        return;
      }

      const card = document.createElement("div");
      card.style.width = "460px";
      card.style.height = "290px";
      card.style.background = "#fff";
      card.style.border = "1px solid #000";
      card.style.padding = "20px 25px";
      card.style.fontFamily = "Arial, sans-serif";
      card.style.position = "absolute";
      card.style.left = "-9999px";
      card.style.color = "#000";

      // 🏙️ fixed city + province
      const city = "Sariaya";
      const province = "Quezon Province";

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <p style="font-size:12px;margin:0;color:#000;">Control No.: <b>${citizen.id_number}</b></p>
            <p style="font-size:12px;margin:4px 0 0;color:#000;">Republic of the Philippines</p>
            <p style="font-size:13px;font-weight:bold;margin:0;color:#000;">
              NATIONAL COORDINATING & MONITORING BOARD<br>
              OFFICE OF THE SENIOR CITIZENS AFFAIR
            </p>
            <p style="font-size:12px;margin:4px 0 0;color:#000;">
              City/Municipality of <u style="color:#000;text-decoration-color:#000;">${city}</u><br>
              ${province}
            </p>
          </div>
          <div style="width:90px;height:90px;border:1px solid #000;display:flex;justify-content:center;align-items:center;text-align:center;font-size:11px;color:#000;">
            ${
              citizen.own_picture
                ? `<img src="${citizen.own_picture}" style="width:100%;height:100%;object-fit:cover;">`
                : "Picture<br>1x1 ID"
            }
          </div>
        </div>

        <p style="font-size:12px;margin:6px 0 2px;color:#000;">
          Name <u style="color:#000;text-decoration-color:#000;">
          ${citizen.first_name} ${citizen.middle_name || ""} ${citizen.last_name}
          </u>
        </p>
        <p style="font-size:12px;margin:2px 0;color:#000;">
          Address <u style="color:#000;text-decoration-color:#000;">
          ${citizen.address || "________________________"}
          </u>
        </p>
        <p style="font-size:12px;margin:6px 0 2px;color:#000;">
          Date of Birth / Age <u style="color:#000;text-decoration-color:#000;">
          ${citizen.birth_date || "________"}
          </u> / 
          <u style="color:#000;text-decoration-color:#000;">${citizen.age || "___"}</u>
          &nbsp;&nbsp;&nbsp;
          Date Issued <u style="color:#000;text-decoration-color:#000;">
          ${citizen.date_issued || new Date().toISOString().split("T")[0]}
          </u>
        </p>

        <p style="font-size:10px;margin-top:12px;text-align:center;color:#000;">
          <i>THIS CARD IS NON-TRANSFERABLE AND VALID ANYWHERE IN THE COUNTRY</i>
        </p>

        <div style="margin-top:20px;text-align:center;">
          <hr style="width:75%;border:0;border-top:1px solid #000;margin:0 auto;">
          <p style="font-size:10px;margin-top:2px;color:#000;">
            Printed Name and Signature/Thumbmark
          </p>
        </div>
      `;

      document.body.appendChild(card);

      const canvas = await html2canvas(card, { scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `${citizen.last_name}_${citizen.first_name}_ID.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      document.body.removeChild(card);
    } catch (err) {
      console.error(err);
      alert("Error generating ID");
    }
  };

const handleGenerateBackID = async (idNumber) => {
  try {
    const res = await api.get(`/SeniorConnect/members/?id_number=${idNumber}`);
    const citizen = res.data[0];
    if (!citizen) {
      alert("No record found.");
      return;
    }

    const backCard = document.createElement("div");
    backCard.style.width = "460px";
    backCard.style.height = "290px";
    backCard.style.background = "#ffffff";
    backCard.style.border = "1px solid #000";
    backCard.style.padding = "18px 22px"; // tighter padding
    backCard.style.fontFamily = "Arial, sans-serif";
    backCard.style.color = "#000";
    backCard.style.position = "absolute";
    backCard.style.left = "-9999px";
    backCard.style.boxSizing = "border-box";
    backCard.style.overflow = "hidden";
    backCard.style.position = "relative";

    // ✅ Faint watermark
    const watermark = document.createElement("img");
    watermark.src =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Seal_of_the_Philippines_%28alternative%29.svg/512px-Seal_of_the_Philippines_%28alternative%29.svg.png";
    watermark.style.position = "absolute";
    watermark.style.top = "50%";
    watermark.style.left = "50%";
    watermark.style.transform = "translate(-50%, -50%)";
    watermark.style.width = "210px"; // slightly smaller watermark
    watermark.style.opacity = "0.06";
    watermark.style.pointerEvents = "none";
    backCard.appendChild(watermark);

    // ✅ Content
    const content = document.createElement("div");
    content.style.position = "relative";
    content.style.zIndex = "10";
    content.innerHTML = `
      <h3 style="
        font-size:11.2px;
        font-weight:bold;
        text-align:center;
        margin:0 0 6px 0;
      ">
        Benefits and Privileges Under Republic Act No. 9994
      </h3>

      <ol style="
        font-size:9px;
        line-height:1.25;
        margin:0;
        padding-left:18px;
        text-align:justify;
      ">
        <li>Free medical, dental, diagnostic & laboratory services and professional fee and aid service ward and 20% discount in private and government health facilities.</li>
        <li>20% discount on professional fees for medical and dental services in private health facilities.</li>
        <li>20% discount on professional fees of licensed health workers providing home health care services.</li>
        <li>Free medical and dental services, diagnostic and laboratory fees, smallest available room in private health facilities.</li>
        <li>20% discount on purchase of medicines with prescription of attending physician.</li>
        <li>20% discount on hotels, lodging establishments, restaurants, and other similar places of leisure.</li>
        <li>20% discount on recreation centers, theaters, cinemas, concert halls, circuses, carnivals, and other leisure activities.</li>
        <li>20% discount on air and land fares and sea travel and public transportation.</li>
        <li>20% discount on funeral and burial services for deceased senior citizens.</li>
        <li>5% discount on monthly utilization of water and electricity bills, but not more than ₱1,300/month.</li>
      </ol>

      <p style="
        font-size:8.8px;
        margin-top:6px;
        text-align:justify;
      ">
        Only for the exclusive use of Senior Citizen; abuse of privilege is punishable by law. Persons & corporations violating R.A. 9994 shall be penalized.
      </p>

      <div style="
        display:flex;
        justify-content:space-between;
        margin-top:10px;
        font-size:9.5px;
        font-weight:bold;
        text-align:center;
      ">
        <div>
          <div style="border-top:1px solid #000; width:160px; margin:auto;"></div>
          <p style="margin:2px 0 0;">Rebecca F. Aldis</p>
          <p style="font-size:8.5px; margin:0;">OSCA Head</p>
        </div>
        <div>
          <div style="border-top:1px solid #000; width:160px; margin:auto;"></div>
          <p style="margin:2px 0 0;">Marcelo P. Gayeta</p>
          <p style="font-size:8.5px; margin:0;">City/Municipality Mayor</p>
        </div>
      </div>
    `;

    backCard.appendChild(content);
    document.body.appendChild(backCard);

    const canvas = await html2canvas(backCard, { scale: 3, useCORS: true }); // increased scale for sharp small text
    const link = document.createElement("a");
    link.download = `${citizen.last_name}_${citizen.first_name}_BACK.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    document.body.removeChild(backCard);
  } catch (err) {
    console.error(err);
    alert("Error generating back ID");
  }
};






  const handleGenerateBoth = async (idNumber) => {
    // Run the front ID first
    await handleGenerateID(idNumber);

    // Wait a little bit (to make sure the download finishes cleanly)
    setTimeout(async () => {
      await handleGenerateBackID(idNumber);
    }, 1500); // ⏱️ 1.5-second delay between downloads
  };

  const processedCitizens = (
    filteredCitizens.length > 0 ? filteredCitizens : citizens
  )
  .filter((citizen) => !citizen.is_archived)
  .filter(
    (citizen) =>
      (citizen.id_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (citizen.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (citizen.first_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => {
    if (sortField === "id") {
      return (a.id_number || "").localeCompare(b.id_number || "");
    } else if (sortField === "last_name") {
      return (a.last_name || "").localeCompare(b.last_name || "");
    } else if (sortField === "age") {
      return calculateAge(a.birth_date) - calculateAge(b.birth_date);
    }
    return 0;
  });

// ✅ Pagination logic
const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const currentCitizens = processedCitizens.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(processedCitizens.length / itemsPerPage);



  return (
  <div className="fedeM-mainCont">
    <div className="fedeM-header">
      <div className="fedeM-titleRow">
        
        {/* ✅ LEFT SECTION */}
        <div>
          <h1 className="fedeM-title">
            <span className="fedeM-title-accent"></span>
            Senior Citizen’s Information
          </h1>

          {/* ✅ Subtitle + Button (now side by side) */}
          <div className="fedeM-subtitleRow">
            <span className="fedeM-subtitle">
              Member Details / Profile Summary
            </span>
            <button className="fedeM-downloadBtn" onClick={handleDownload}>
              Download CSV
            </button>
          </div>
        </div>

        {/* ✅ RIGHT TOOLBAR SECTION */}
        <div className="fedeM-toolbarRight">
          <button id="add" onClick={() => setShowForm(!showForm)}>
            {showForm ? "CLOSE FORM" : "ADD SENIOR"}
          </button>

          <button onClick={handleSortToggle}>
            SORT BY: {sortField === "id" ? "ID" : sortField === "last_name" ? "LN" : "AGE"}
          </button>

          <input
            type="text"
            placeholder="Search by ID or Last Name"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </div>




      {/* Add/Edit Citizen Form */}
      {showForm && (
        <div className="fedeM-overlay">
          <form className="fedeM-addCitizen" onSubmit={editingId ? handleEditSubmit : handleAddSenior}>
            <div id="fedeM-head">
              <div id="fedeM-name">{editingId ? "EDIT SENIOR" : "ADD SENIOR"}</div>
            </div>

            {formError && <div className="fedeM-formError">{formError}</div>}

            <div className="fedeM-inputAdd">
              <div className="fedeM-inputGroup">
                <label htmlFor="id_number">
                  ID Number<span className="fedeM-required">*</span>
                </label>
                <input
                  id="id_number"
                  name="id_number"
                  placeholder="ID Number"
                  value={editingId ? editFormData.id_number : formData.id_number}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="last_name">
                  Last Name<span className="fedeM-required">*</span>
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  placeholder="Last Name"
                  value={editingId ? editFormData.last_name : formData.last_name}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="first_name">
                  First Name<span className="fedeM-required">*</span>
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  placeholder="First Name"
                  value={editingId ? editFormData.first_name : formData.first_name}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="middle_name">Middle Name</label>
                <input
                  id="middle_name"
                  name="middle_name"
                  placeholder="Middle Name"
                  value={editingId ? editFormData.middle_name : formData.middle_name}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="suffix">Suffix</label>
                <input
                  id="suffix"
                  name="suffix"
                  placeholder="Suffix"
                  value={editingId ? editFormData.suffix : formData.suffix}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="age">
                  Age<span className="fedeM-required">*</span>
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={editingId ? editFormData.age : formData.age}
                  readOnly
                  required
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="sex">
                  Sex<span className="fedeM-required">*</span>
                </label>
                <select
                  id="sex"
                  name="sex"
                  value={editingId ? editFormData.sex : formData.sex}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="address">
                  Barangay<span className="fedeM-required">*</span>
                </label>
                <select
                  id="address"
                  name="address"
                  value={editingId ? editFormData.address : formData.address}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                >
                  <option value="">Select Barangay</option>
                  {addressOptions.map((address) => (
                    <option key={address} value={address}>
                      {address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="birth_date">
                  Birth Date<span className="fedeM-required">*</span>
                </label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={editingId ? editFormData.birth_date : formData.birth_date}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="date_issued">
                  Date Issued<span className="fedeM-required">*</span>
                </label>
                <input
                  id="date_issued"
                  name="date_issued"
                  type="date"
                  value={editingId ? editFormData.date_issued : formData.date_issued}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  required
                />
              </div>

              {/* images */}
              {/* <div className="fedeM-inputGroup">
                <label htmlFor="photo">Upload Picture (optional)</label>
                <div className="fedeM-uploadWrapper">
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={editingId ? handleEditInputChange : handleInputChange}
                  />
                  {formData.photo && (
                    <img
                      src={URL.createObjectURL(formData.photo)}
                      alt="Preview"
                      className="fedeM-photoPreview"
                    />
                  )}
                </div>
              </div> */}


            </div>

            <div id="fedeM-name">EMERGENCY CONTACT</div>
            <div className="fedeM-inputAdd">
              <div className="fedeM-inputGroup">
                <label htmlFor="emer_name">
                  Name<span></span>
                </label>
                <input
                  id="emer_name"
                  name="emer_name"
                  placeholder="Emergency Contact Name"
                  value={editingId ? editFormData.emer_name : formData.emer_name}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="emer_contact">
                  Contact Number<span></span>
                </label>
                <input
                  id="emer_contact"
                  name="emer_contact"
                  placeholder="Emergency Contact Number"
                  value={editingId ? editFormData.emer_contact : formData.emer_contact}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
                  
                />
              </div>

              <div className="fedeM-inputGroup">
                <label htmlFor="emer_rel">
                  Relationship<span></span>
                </label>
                <input
                  id="emer_rel"
                  name="emer_rel"
                  placeholder="Relationship"
                  value={editingId ? editFormData.emer_rel : formData.emer_rel}
                  onChange={editingId ? handleEditInputChange : handleInputChange}
            
                />
              </div>
            </div>

            <div id="fedeM-buttons">
              <button type="submit">{editingId ? "Update" : "Add"} Senior</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}


      {/* Citizen List Table */}
      <div className="fedeM-tableWithProfile">
        <div className={`fedeM-tableContainer ${selectedCitizen ? 'fedeM-withPanel' : ''}`}>
          <table>
            <thead>
              <tr>
                <th>ID Number</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Suffix</th>
                <th>Barangay</th>
                <th>Birth Date</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Date Issued</th>
              </tr>
            </thead>
            <tbody>
              {currentCitizens.map((citizen) => (
                <tr key={citizen.id}>
                  <td className="fedeM-clickableId" onClick={() => setSelectedCitizen(citizen)}>
                    {citizen.id_number}
                  </td>
                  <td>{citizen.last_name}</td>
                  <td>{citizen.first_name}</td>
                  <td>{citizen.middle_name}</td>
                  <td>{citizen.suffix}</td>
                  <td>{citizen.address}</td>
                  <td>{citizen.birth_date}</td>
                  <td>{calculateAge(citizen.birth_date)}</td>
                  <td>{citizen.sex}</td>
                  <td>{citizen.date_issued}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="fedeM-pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <span>Page {currentPage} of {totalPages}</span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fedeM-modalOverlay">
            <div className="fedeM-modalContent">
              <h2>Remove Participant</h2>
              <p className="fedeM-warningText">
              ⚠️ Once removed, this senior’s record will be moved to the archive and cannot be restored directly.
              </p>

              <p>Select reason for removal:</p>

              {deleteError && (
                <div className="fedeM-formError">{deleteError}</div>
              )}

              <div>
                <label>
                  <input
                    type="radio"
                    value="Decease"
                    checked={removeReason === "Decease"}
                    onChange={() => setRemoveReason("Decease")}
                  /> Decease
                </label>
                <label style={{ marginLeft: "1.5rem" }}>
                  <input
                    type="radio"
                    value="Transfer"
                    checked={removeReason === "Transfer"}
                    onChange={() => setRemoveReason("Transfer")}
                  /> Transfer
                </label>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label>
                  Proof Image: <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files[0])} />
                </label>
              </div>

              <div className="fedeM-modalBtns">
                <button
                  id="confirm"
                  onClick={() => confirmDelete(removeReason, proofFile)}
                  disabled={!removeReason || !proofFile}
                >
                  Confirm
                </button>
                <button id="cancel" onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* TEMP Delete Modal */}
        {showtempDeleteModal && (
          <div className="fedeM-modalOverlay">
            <div className="fedeM-modalContent">
              <h2>Confirm Deletion</h2>
              <p>Are you sure you want to delete this citizen?</p>
              <div className="fedeM-modalBtns">
                <button id="delete" onClick={confirmtempDelete}>Delete</button>
                <button id="cancel" onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Citizen Info Panel */}
        {selectedCitizen && (
          <div
            className="fedeM-blurOverlay"
            onClick={() => setSelectedCitizen(null)}
          />
        )}
        {selectedCitizen && (
          <div className="fedeM-sidePanel">
            <div className="fedeM-actionsInSidebar">
              <button className="fedeM-editBtn" onClick={() => handleEditClick(selectedCitizen)}>
                🖍
              </button>
              <button className="fedeM-deleteBtn" onClick={() => handleDeleteClick(selectedCitizen)}>
                🗑
              </button> 
            </div>
            <h2>Senior Information</h2>

            <div className="fedeM-imageUpload">
              {selectedCitizen.own_picture ? (
                <img
                  src={selectedCitizen.own_picture}
                  alt="Profile"
                  className="fedeM-profilePreview"
                />
              ) : (
                <div className="fedeM-profilePlaceholder">No image</div>
              )}
              <input type="file" onChange={handleImageUpload} accept="image/*" />
            </div>

            <div className="fedeM-infoDetails">
              <p><b>ID Number:</b> {selectedCitizen.id_number || "—"}</p>
              <p>
                <b>Full Name:</b>{" "}
                {selectedCitizen.first_name}{" "}
                {selectedCitizen.middle_name ? `${selectedCitizen.middle_name} ` : ""}
                {selectedCitizen.last_name}{" "}
                {selectedCitizen.suffix || ""}
              </p>
              <p><b>Barangay:</b> {selectedCitizen.address || "—"}</p>
              <p><b>Birth Date:</b> {selectedCitizen.birth_date || "—"}</p>
              <p><b>Age:</b> {calculateAge(selectedCitizen.birth_date) || "—"}</p>
              <p><b>Sex:</b> {selectedCitizen.sex || "—"}</p>
              <p><b>Date Issued:</b> {selectedCitizen.date_issued || "—"}</p>

              <hr className="fedeM-divider" />

              <h3>Emergency Contact</h3>
              <p><b>Name:</b> {selectedCitizen.emer_name || "—"}</p>
              <p><b>Contact Number:</b> {selectedCitizen.emer_contact || "—"}</p>
              <p><b>Relationship:</b> {selectedCitizen.emer_rel || "—"}</p>

              <hr className="fedeM-divider" />

              <p>
                <b>Damayan Status:</b>{" "}
                {selectedCitizen.is_damayan_member ? (
                  <span className="fedeM-statusMember">Member</span>
                ) : (
                  <>
                    {(() => {
                      const status = getClaimStatusForCitizen(selectedCitizen.id_number);

                      if (status === "Released") {
                        return (
                          <span className="fedeM-statusClaimed">
                            Claimed Contribution
                          </span>
                        );
                      } else if (
                        status === "Pending" ||
                        status === "On Process" ||
                        status === "For Budget Approval" ||
                        status === "Approved"||
                        status === "Ready for Release"
                      ) {
                        return (
                          <span className="fedeM-statusClaiming">
                            Already Claiming
                          </span>
                        );
                      } else {
                        return (
                          <>
                            <span className="fedeM-statusNonMember">Not a Member</span>
                            <br />
                            <button
                              className="fedeM-addToDamayanBtn"
                              onClick={() => setShowConfirmAdd(true)}
                            >
                              Add to Damayan
                            </button>
                          </>
                        );
                      }
                    })()}
                  </>
                )}


              </p>

              {/* ADD TO DAMAYAN CONFIRMATION MODAL */}
              {showConfirmAdd && (
                <div className="fedeM-modal-overlay">
                  <div className="fedeM-modal-content">
                    <h3>CONFIRMATION</h3>
                    <p className="fedeM-modal-desc">
                      Are you sure you want to add this citizen to the <strong>Damayan Program</strong>?
                    </p>

                    <div className="fedeM-confirm-details">
                      <p><b>Name:</b> {selectedCitizen.first_name} {selectedCitizen.middle_name} {selectedCitizen.last_name}</p>
                      <p><b>Id Number:</b> {selectedCitizen.id_number || "—"}</p>
                      <p><b>Barangay:</b> {selectedCitizen.address || "—"}</p>
                      <p><b>Age:</b> {calculateAge(selectedCitizen.birth_date) || "—"}</p>
                    </div>

                    {addStatus && (
                      <p
                        className={`fedeM-statusMsg ${
                          addStatus.toLowerCase().includes("success")
                            ? "fedeM-success"
                            : "fedeM-error"
                        }`}
                      >
                        {addStatus}
                      </p>
                    )}

                    <div className="fedeM-modal-actions">
                      <button
                        className="fedeM-btn-confirm"
                        onClick={() => handleAddToDamayan(selectedCitizen.id_number)}
                      >
                        Confirm
                      </button>
                      <button
                        className="fedeM-btn-cancel"
                        onClick={() => setShowConfirmAdd(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <button
              className="fedeM-generateIDBtn"
              onClick={() => handleGenerateBoth(selectedCitizen.id_number)}
            >
              Generate ID
            </button>

            <button id="close" onClick={() => setSelectedCitizen(null)}>Close Information</button>
          
          
          </div>
        )}

              {showActiveMemberModal && (
                <div className="fedeM-modalOverlay">
                  <div className="fedeM-modalContent">
                    <h2>Unable to Remove Member</h2>

                    <p className="fedeM-warningText">
                      This citizen is currently an active member of the
                      Damayan Program and cannot be removed.
                    </p>

                    <p>
                      Please remove the member from the Damayan Program first
                      before archiving or deleting the record.
                    </p>

                    <div className="fedeM-modalBtns">
                      <button
                        id="confirm"
                        onClick={() => setShowActiveMemberModal(false)}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}

      </div>
    </div>
  );
}

export default FederationMember;
