import React, { useEffect, useState } from "react";
import MyProfile from "./MyProfile";
import Damayan from "./Damayan";
import axiosSC from "../../../axiosSC";

function CDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile once on mount, and refetch after Damayan join
  const fetchProfile = async () => {
    const idNumber = localStorage.getItem("id_number");
    if (!idNumber) return setLoading(false);
    try {
      console.log("📡 Fetching profile for ID:", idNumber);
      const res = await axiosSC.get(`/SeniorConnect/citizens/`, {
        params: { id_number: idNumber },
        headers: { Authorization: `Token ${token}`},
      });
      console.log("🔑 USING TOKEN:", localStorage.getItem("citizenToken"));
      console.log("📡 FULL RESPONSE:", res);
      setProfile(res.data[0]);
    } catch {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div>
      <MyProfile profile={profile} />
      <Damayan
        userProfile={{
          fullName: `${profile.first_name} ${profile.middle_name} ${profile.last_name} ${profile.suffix}`,
          idNumber: profile.id_number,
          isDamayanMember: profile.is_damayan_member
        }}
        onJoinDamayan={fetchProfile} // let Damayan trigger profile refresh after joining
      />
    </div>
  );
}

export default CDashboard;
