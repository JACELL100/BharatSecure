import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/${userId}/`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch user details");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUser(null);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (!user) {
    return <div className="text-center text-cyan-300 font-bold mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel shadow-2xl rounded-2xl p-8 max-w-xl w-full text-slate-100 reveal-up">
        <h1 className="text-2xl font-bold text-slate-100 text-center mb-6 section-title">
          User Profile
        </h1>
        <p className="text-slate-200"><strong>First Name:</strong> {user.first_name}</p>
        <p className="text-slate-200"><strong>Last Name:</strong> {user.last_name}</p>
        <p className="text-slate-200"><strong>Email:</strong> {user.email}</p>
        <p className="text-slate-200"><strong>Phone:</strong> {user.phone_number}</p>
        <p className="text-slate-200"><strong>Address:</strong> {user.address}</p>
        <p className="text-slate-200"><strong>Aadhar Number:</strong> {user.aadhar_number}</p>
        <p className="text-slate-200"><strong>Emergency Contact 1:</strong> {user.emergency_contact1}</p>
        <p className="text-slate-200"><strong>Emergency Contact 2:</strong> {user.emergency_contact2}</p>
        <p className="text-slate-200"><strong>Date Joined:</strong> {user.date_joined}</p>

        <button
          className="w-full mt-5 py-3 glass-button text-white font-semibold rounded-lg transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
