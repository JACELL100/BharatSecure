import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Footer from "../components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "@/lib/apiBase";

const Login = () => {
  const API_URL = API_BASE_URL;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const { isLoggedIn, signInWithPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    const resolveProfileCompletion = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        if (isMounted) {
          setErrors((prev) => ({
            ...prev,
            general: "Unable to verify session. Please sign in again.",
          }));
        }
        return;
      }

      if (isMounted) {
        setIsCheckingProfile(true);
      }

      try {
        const response = await axios.get(`${API_URL}/api/profile/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const isProfileComplete = Boolean(response.data?.profile_complete);
        localStorage.setItem("profileComplete", isProfileComplete ? "true" : "false");

        if (!isMounted) {
          return;
        }

        navigate(isProfileComplete ? "/my-reports" : "/complete-profile", {
          replace: true,
        });
      } catch (error) {
        localStorage.removeItem("profileComplete");

        if (!isMounted) {
          return;
        }

        setErrors((prev) => ({
          ...prev,
          general:
            error.response?.data?.error ||
            "Unable to verify your profile. Please try again.",
        }));
      } finally {
        if (isMounted) {
          setIsCheckingProfile(false);
        }
      }
    };

    resolveProfileCompletion();

    return () => {
      isMounted = false;
    };
  }, [API_URL, isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, rememberMe: e.target.checked });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      tempErrors.email = "Valid Email is required";
    if (!formData.password || formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters long";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        const normalizedEmail = formData.email.trim().toLowerCase();

        if (normalizedEmail.endsWith("@admin.com")) {
          const response = await axios.post(`${API_URL}/api/login/`, {
            email: normalizedEmail,
            password: formData.password,
          });

          const {
            tokens: { access, refresh },
          } = response.data;
          localStorage.setItem("accessToken", access);
          localStorage.setItem("refreshToken", refresh);
          localStorage.setItem("userType", response.data.user_type);
          navigate(response.data.user_type === "user" ? "/my-reports" : "/admin");
          return;
        }

        const { error } = await signInWithPassword(normalizedEmail, formData.password);
        if (error) {
          throw error;
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          general:
            error.response?.data?.error ||
            error.message ||
            "Unable to sign in. Please try again.",
        }));
      }
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Google sign-in failed. Please try again.",
      }));
    }
  };

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
          padding: isMobile ? "20px 0px" : "44px 0px",
          background:
            "radial-gradient(900px 420px at 16% 20%, rgba(54,217,255,0.16), transparent 70%), radial-gradient(850px 420px at 90% 0%, rgba(25,247,194,0.14), transparent 68%), linear-gradient(165deg, rgba(10,14,24,0.98), rgba(6,9,15,0.98))",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" width=\"100\" height=\"100\" opacity=\"0.1\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"none\" stroke=\"%23ffffff\" stroke-width=\"2\"/><path d=\"M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 Z\" fill=\"none\" stroke=\"%23ffffff\" stroke-width=\"1\"/><line x1=\"50\" y1=\"10\" x2=\"50\" y2=\"50\" stroke=\"%23ffffff\" stroke-width=\"1\"/><line x1=\"50\" y1=\"50\" x2=\"75\" y2=\"65\" stroke=\"%23ffffff\" stroke-width=\"1\"/></svg>')",
            opacity: 0.06,
            zIndex: 0,
          },
        }}
      >
        <Box
          sx={{
            width: isMobile ? "90%" : "500px",
            textAlign: "center",
            padding: isMobile ? 3 : 4,
            borderRadius: 3,
            backdropFilter: "blur(14px)",
            background:
              "linear-gradient(150deg, rgba(18,25,38,0.82), rgba(8,12,20,0.92))",
            boxShadow:
              "0 24px 56px rgba(4,8,16,0.62), inset 0 1px 0 rgba(255,255,255,0.06)",
            border: "1px solid rgba(141,180,230,0.2)",
            position: "relative",
            zIndex: 1,
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
            Welcome Back
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: "#b5c8e3", 
              mb: 3,
              fontSize: isMobile ? "0.9rem" : "1rem"
            }}
          >
            Sign in to your BharatSecure account
          </Typography>
          
          <Divider sx={{ mb: 4, borderColor: "rgba(141,180,230,0.24)", width: isMobile ? "80%" : "50%", mx: "auto" }} />
          
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                size={isMobile ? "small" : "medium"}
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{
                  backgroundColor: "rgba(9, 14, 23, 0.75)",
                  borderRadius: 1,
                  input: {
                    color: "#fff",
                    padding: isMobile ? "12px 14px" : "16px 14px",
                    "&::placeholder": {
                      color: "#bbb",
                      opacity: 1,
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(130,166,212,0.35)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(54,217,255,0.55)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(54,217,255,0.62)",
                      boxShadow: "0 0 0 2px rgba(54, 217, 255, 0.14)",
                    },
                  },
                  boxShadow: "inset 3px 3px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.05)",
                }}
                InputLabelProps={{
                  sx: { 
                    color: "#bbb",
                    "&.Mui-focused": {
                      color: "#72deff",
                    }
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    color: "#ff6b6b",
                    marginLeft: 0,
                    fontSize: "0.75rem",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                size={isMobile ? "small" : "medium"}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                sx={{
                  backgroundColor: "rgba(9, 14, 23, 0.75)",
                  borderRadius: 1,
                  input: {
                    color: "#fff",
                    padding: isMobile ? "12px 14px" : "16px 14px",
                    "&::placeholder": {
                      color: "#bbb",
                      opacity: 1,
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(130,166,212,0.35)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(54,217,255,0.55)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(54,217,255,0.62)",
                      boxShadow: "0 0 0 2px rgba(54, 217, 255, 0.14)",
                    },
                  },
                  boxShadow: "inset 3px 3px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.05)",
                }}
                InputLabelProps={{
                  sx: { 
                    color: "#bbb",
                    "&.Mui-focused": {
                      color: "#72deff",
                    }
                  },
                }}
                FormHelperTextProps={{
                  sx: {
                    color: "#ff6b6b",
                    marginLeft: 0,
                    fontSize: "0.75rem",
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={handleCheckboxChange}
                    sx={{ 
                      color: "#61dbff",
                      "&.Mui-checked": {
                        color: "#61dbff",
                      }
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: "#bbb", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                    Remember Me
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size={isMobile ? "medium" : "large"}
                disabled={isCheckingProfile}
                sx={{
                  backgroundColor: "rgba(20, 152, 197, 0.82)",
                  color: "#fff",
                  padding: isMobile ? "10px" : "14px 20px",
                  borderRadius: 1,
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  boxShadow: `
                    5px 5px 15px rgba(0, 0, 0, 0.5),
                    -3px -3px 10px rgba(255, 255, 255, 0.05),
                    0 0 14px rgba(54, 217, 255, 0.32)
                  `,
                  "&:hover": {
                    backgroundColor: "rgba(29, 175, 226, 0.9)",
                    boxShadow: `
                      0 0 15px rgba(54, 217, 255, 0.6),
                      0 0 25px rgba(54, 217, 255, 0.34)
                    `,
                  },
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={handleLogin}
              >
                {isCheckingProfile ? "Checking profile..." : "Log In"}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size={isMobile ? "medium" : "large"}
                disabled={isCheckingProfile}
                sx={{
                  mt: 1.5,
                  borderColor: "rgba(141,180,230,0.45)",
                  color: "#fff",
                  padding: isMobile ? "10px" : "14px 20px",
                  borderRadius: 1,
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  "&:hover": {
                    borderColor: "rgba(54,217,255,0.62)",
                    backgroundColor: "rgba(54, 217, 255, 0.12)",
                  },
                }}
                onClick={handleGoogleLogin}
              >
                Continue with Google
              </Button>
              {errors.general && (
                <Typography 
                  sx={{ 
                    mt: 2, 
                    fontSize: "0.9rem", 
                    color: "#ff6b6b",
                    textAlign: "center"
                  }}
                >
                  {errors.general}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  mt: 3,
                  color: "#bbb",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  textAlign: "center",
                }}
              >
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  style={{
                    color: "#61dbff",
                    fontWeight: "bold",
                    textDecoration: "none",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#9de9ff")}
                  onMouseLeave={(e) => (e.target.style.color = "#61dbff")}
                >
                  Sign Up
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      left: 0,
                      width: "100%",
                      height: "1px",
                      backgroundColor: "#61dbff",
                      transform: "scaleX(0)",
                      transition: "transform 0.3s ease-in-out",
                    }}
                  ></span>
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default Login;