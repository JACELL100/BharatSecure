import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL from "@/lib/apiBase";

const FIELD_LABELS = {
  first_name: "First Name",
  last_name: "Last Name",
  phone_number: "Phone Number",
  address: "Address",
  aadhar_number: "Aadhar Number",
};

const CompleteProfile = () => {
  const API_URL = API_BASE_URL;
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { logout } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    aadharNumber: "",
    emergencyContact1: "",
    emergencyContact2: "",
  });

  const missingFieldText = useMemo(() => {
    if (!missingFields.length) {
      return "";
    }

    return missingFields
      .map((fieldName) => FIELD_LABELS[fieldName] || fieldName)
      .join(", ");
  }, [missingFields]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userType = localStorage.getItem("userType");

    if (!token || userType !== "user") {
      navigate("/login", { replace: true });
      return;
    }

    let isMounted = true;

    const fetchCurrentProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/profile/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) {
          return;
        }

        const profileData = response.data || {};
        const isProfileComplete = Boolean(profileData.profile_complete);

        localStorage.setItem("profileComplete", isProfileComplete ? "true" : "false");

        if (isProfileComplete) {
          navigate("/my-reports", { replace: true });
          return;
        }

        setFormData({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          phoneNumber: profileData.phone_number || "",
          address: profileData.address || "",
          aadharNumber: profileData.aadhar_number || "",
          emergencyContact1: profileData.emergency_contact1 || "",
          emergencyContact2: profileData.emergency_contact2 || "",
        });
        setMissingFields(
          Array.isArray(profileData.missing_fields) ? profileData.missing_fields : []
        );
      } catch (err) {
        localStorage.removeItem("profileComplete");
        if (!isMounted) {
          return;
        }

        setError(
          err.response?.data?.error ||
            "Unable to load your profile details. Please sign in again."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCurrentProfile();

    return () => {
      isMounted = false;
    };
  }, [API_URL, navigate]);

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    const numericFields = [
      "phoneNumber",
      "aadharNumber",
      "emergencyContact1",
      "emergencyContact2",
    ];

    if (numericFields.includes(name)) {
      value = value.replace(/\D/g, "");
    }

    if (name === "phoneNumber" || name === "emergencyContact1" || name === "emergencyContact2") {
      value = value.slice(0, 10);
    }

    if (name === "aadharNumber") {
      value = value.slice(0, 12);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First Name is required";
    }
    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last Name is required";
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      nextErrors.phoneNumber = "Valid 10-digit phone number is required";
    }
    if (!formData.address.trim()) {
      nextErrors.address = "Address is required";
    }
    if (!/^\d{12}$/.test(formData.aadharNumber)) {
      nextErrors.aadharNumber = "Valid 12-digit Aadhar number is required";
    }

    if (
      formData.emergencyContact1 &&
      !/^\d{10}$/.test(formData.emergencyContact1)
    ) {
      nextErrors.emergencyContact1 =
        "Emergency Contact 1 must be a valid 10-digit number";
    }
    if (
      formData.emergencyContact2 &&
      !/^\d{10}$/.test(formData.emergencyContact2)
    ) {
      nextErrors.emergencyContact2 =
        "Emergency Contact 2 must be a valid 10-digit number";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formData.phoneNumber,
        address: formData.address.trim(),
        aadhar_number: formData.aadharNumber,
      };

      if (formData.emergencyContact1) {
        payload.emergency_contact1 = formData.emergencyContact1;
      }

      if (formData.emergencyContact2) {
        payload.emergency_contact2 = formData.emergencyContact2;
      }

      await axios.patch(`${API_URL}/api/profile/me/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("profileComplete", "true");
      setMessage("Profile completed successfully. Redirecting...");
      navigate("/my-reports", { replace: true });
    } catch (err) {
      const apiData = err.response?.data || {};
      const nextErrors = {};

      if (apiData.phone_number) {
        nextErrors.phoneNumber = apiData.phone_number;
      }
      if (apiData.aadhar_number) {
        nextErrors.aadharNumber = apiData.aadhar_number;
      }
      if (apiData.emergency_contact1) {
        nextErrors.emergencyContact1 = apiData.emergency_contact1;
      }
      if (apiData.emergency_contact2) {
        nextErrors.emergencyContact2 = apiData.emergency_contact2;
      }

      setErrors(nextErrors);
      setError(apiData.error || "Unable to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    localStorage.removeItem("profileComplete");
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return (
      <>
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            minHeight: "88vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(900px 420px at 12% 18%, rgba(54,217,255,0.15), transparent 70%), radial-gradient(800px 420px at 90% 0%, rgba(25,247,194,0.12), transparent 68%), linear-gradient(165deg, rgba(10,14,24,0.98), rgba(6,9,15,0.98))",
          }}
        >
          <Box sx={{ textAlign: "center", color: "#ecf3ff" }}>
            <CircularProgress sx={{ color: "#72deff", mb: 2 }} />
            <Typography>Loading your profile...</Typography>
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "20px" : "40px",
          background:
            "radial-gradient(900px 420px at 12% 18%, rgba(54,217,255,0.15), transparent 70%), radial-gradient(800px 420px at 90% 0%, rgba(25,247,194,0.12), transparent 68%), linear-gradient(165deg, rgba(10,14,24,0.98), rgba(6,9,15,0.98))",
        }}
      >
        <Box
          sx={{
            width: isMobile ? "92%" : "700px",
            mx: "auto",
            textAlign: "center",
            padding: isMobile ? 3 : 5,
            borderRadius: "20px",
            background:
              "linear-gradient(150deg, rgba(18,25,38,0.82), rgba(8,12,20,0.92))",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(141,180,230,0.2)",
            boxShadow:
              "0px 24px 56px rgba(4,8,16,0.62), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: "bold",
              color: "#ecf3ff",
              mb: 2,
              fontFamily: "Sora, sans-serif",
              textShadow: "0 0 16px rgba(54,217,255,0.2)",
            }}
          >
            Complete Your Profile
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#b5c8e3",
              mb: 2,
              fontSize: isMobile ? "0.9rem" : "1rem",
            }}
          >
            We need a few additional details to finish your account setup.
          </Typography>

          {!!missingFieldText && (
            <Typography
              sx={{
                color: "#fbbf24",
                mb: 2,
                fontSize: isMobile ? "0.85rem" : "0.95rem",
              }}
            >
              Missing details: {missingFieldText}
            </Typography>
          )}

          <Divider
            sx={{
              mb: 4,
              borderColor: "rgba(141,180,230,0.24)",
              width: isMobile ? "84%" : "52%",
              mx: "auto",
            }}
          />

          {message && (
            <Typography sx={{ color: "#22c55e", mb: 2, fontWeight: "medium" }}>
              {message}
            </Typography>
          )}

          {error && (
            <Typography sx={{ color: "#f87171", mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 3}>
              {[
                { label: "First Name", name: "firstName" },
                { label: "Last Name", name: "lastName" },
                { label: "Phone Number", name: "phoneNumber", type: "tel" },
                {
                  label: "Address",
                  name: "address",
                  multiline: true,
                  rows: 2,
                },
                { label: "Aadhar Number", name: "aadharNumber", type: "tel" },
                {
                  label: "Emergency Contact 1 (optional)",
                  name: "emergencyContact1",
                  type: "tel",
                },
                {
                  label: "Emergency Contact 2 (optional)",
                  name: "emergencyContact2",
                  type: "tel",
                },
              ].map((field) => (
                <Grid
                  item
                  xs={12}
                  sm={field.name === "firstName" || field.name === "lastName" ? 6 : 12}
                  key={field.name}
                >
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    value={formData[field.name]}
                    onChange={handleChange}
                    error={!!errors[field.name]}
                    helperText={errors[field.name]}
                    sx={{
                      "& .MuiInputBase-root": {
                        color: "white",
                        backgroundColor: "rgba(9,14,23,0.78)",
                        borderRadius: "12px",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(130,166,212,0.35)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(54,217,255,0.55)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(54,217,255,0.62)",
                        boxShadow: "0 0 0 2px rgba(54,217,255,0.14)",
                      },
                      "& .MuiFormHelperText-root": {
                        color: "#f87171",
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        color: "rgba(255,255,255,0.7)",
                        "&.Mui-focused": {
                          color: "#72deff",
                        },
                      },
                    }}
                  />
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    background:
                      "linear-gradient(90deg, rgba(20,152,197,0.92), rgba(36,197,255,0.86))",
                    color: "white",
                    padding: isMobile ? "10px" : "14px 20px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    boxShadow:
                      "0px 10px 20px rgba(8,16,35,0.55), 0px 0px 0px 1px rgba(54,217,255,0.26)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, rgba(29,175,226,0.9), rgba(54,217,255,0.88))",
                    },
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save and Continue"}
                </Button>

                <Button
                  type="button"
                  variant="text"
                  onClick={handleSignOut}
                  sx={{
                    mt: 1,
                    color: "#9adfff",
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      color: "#c4efff",
                    },
                  }}
                >
                  Sign out
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default CompleteProfile;