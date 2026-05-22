import React, { useEffect, useState } from "react";
import axiosSC from "../../../axiosSC";
import "../../css/MyProfile.css";

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bannerImage, setBannerImage] = useState("/banners/default.jpg");

  useEffect(() => {
    // 🧠 Fetch citizen profile
    axiosSC
      .get("/SeniorConnect/citizens/me/")
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load profile.");
        setLoading(false);
      });

    // 🧩 Example of rotating banners (you can replace with backend fetch)
    const banners = [
      "/banners/welcome1.png",
    ];
    const randomBanner = banners[Math.floor(Math.random() * banners.length)];
    setBannerImage(randomBanner);
  }, []);

  if (loading) return <div className="prof-container">Loading...</div>;
  if (error) return <div className="prof-container">{error}</div>;

  return (
    <div className="prof-container">
      {/* 🖼 Dynamic Banner Section */}
      <header className="prof-banner">
        <img src={bannerImage} alt="Program Banner" className="prof-banner-img" />
      </header>

      {/* 🧾 Profile Body */}
      <main className="prof-body">
        {/* PERSONAL INFO */}
        <section className="prof-section">
          <h3 className="prof-section-title">Personal Information</h3>

          <div className="prof-personal-layout">
            {/* 👈 Left: Personal Info */}
            <div className="prof-info-grid">
              <div className="prof-info-item">
                <label>Full Name</label>
                <p>
                  {profile.first_name} {profile.middle_name || ""} {profile.last_name}{" "}
                  {profile.suffix || ""}
                </p>
              </div>

              <div className="prof-info-item">
                <label>Address</label>
                <p>{profile.address}</p>
              </div>

              <div className="prof-info-item">
                <label>Sex</label>
                <p>{profile.sex}</p>
              </div>

              <div className="prof-info-item">
                <label>Birth Date</label>
                <p>{profile.birth_date}</p>
              </div>

              <div className="prof-info-item">
                <label>Age</label>
                <p>{profile.age}</p>
              </div>
              
              <div className="prof-info-item">
                <label>Email Address</label>
                <p>
                  {profile.email ? (
                    <a href={`mailto:${profile.email}`} className="prof-email-link">
                      {profile.email}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>

            {/* 👉 Right: Photo and ID */}
            <div className="prof-photo-side">
              <img
                src={profile.own_picture || "/default-avatar.png"}
                alt="Profile"
                className="prof-photo"
              />
              <div className="prof-id-box">
                <span>ID No:</span> {profile.id_number || "N/A"}
              </div>
            </div>
          </div>
        </section>


        {/* EMERGENCY INFO */}
        <section className="prof-section">
          <h3 className="prof-section-title">Emergency Contact Information</h3>
          <div className="prof-info-grid">
            <div className="prof-info-item">
              <label>Contact Name</label>
              <p>{profile.emer_name}</p>
            </div>
            <div className="prof-info-item">
              <label>Contact Number</label>
              <p>{profile.emer_contact || "N/A"}</p>
            </div>
            <div className="prof-info-item">
              <label>Relationship</label>
              <p>{profile.emer_rel}</p>
            </div>
          </div>
        </section>

        {/* DAMAYAN INFO */}
        <section className="prof-section">
          <h3 className="prof-section-title">Damayan Membership</h3>
          <div className="prof-info-grid">
            <div className="prof-info-item">
              <label>Status</label>
              <p
                className={
                  profile.is_damayan_member ? "prof-status-active" : "prof-status-inactive"
                }
              >
                {profile.is_damayan_member ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="prof-info-item">
              <label>Has Claimed Assistance</label>
              <p>{profile.has_claimed ? "Yes" : "No"}</p>
            </div>

            {profile.total_damayan_allocated !== undefined && (
              <div className="prof-info-item">
                <label>Total Allocated</label>
                <p>₱{profile.total_damayan_allocated}</p>
              </div>
            )}

            {profile.total_damayan_claimed !== undefined && (
              <div className="prof-info-item">
                <label>Total Claimed</label>
                <p>₱{profile.total_damayan_claimed}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MyProfile;
