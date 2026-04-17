import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Footer from "../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    aadharNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { signUpWithPassword } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.firstName) tempErrors.firstName = "First Name is required";
    if (!formData.lastName) tempErrors.lastName = "Last Name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      tempErrors.email = "Valid Email is required";
    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber))
      tempErrors.phoneNumber = "Valid 10-digit Phone Number is required";
    if (!formData.aadharNumber || !/^\d{12}$/.test(formData.aadharNumber))
      tempErrors.aadharNumber = "Valid 12-digit Aadhar Number is required";
    if (!formData.password || formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters long";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setMessage("");
    setError("");

    try {
      const { data, error: signUpError } = await signUpWithPassword(formData);

      if (signUpError) {
        throw signUpError;
      }

      setMessage(
        data?.session
          ? "Account created successfully!"
          : "Account created. Check your email to verify your account, then sign in."
      );
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        aadharNumber: "",
        password: "",
      });

      if (data?.session) {
        navigate("/my-reports");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Error occurred while signing up.");
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
          padding: isMobile ? "20px" : "40px",
          background:
            "radial-gradient(900px 420px at 12% 18%, rgba(54,217,255,0.15), transparent 70%), radial-gradient(800px 420px at 90% 0%, rgba(25,247,194,0.12), transparent 68%), linear-gradient(165deg, rgba(10,14,24,0.98), rgba(6,9,15,0.98))",
        }}
      >
        <Box
          sx={{
            width: isMobile ? "90%" : "700px",
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
            Create Your Account
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#b5c8e3",
              mb: 3,
              fontSize: isMobile ? "0.9rem" : "1rem",
            }}
          >
            Join and start reporting issues in your community.
          </Typography>

          <Divider
            sx={{
              mb: 4,
              borderColor: "rgba(141,180,230,0.24)",
              width: isMobile ? "80%" : "50%",
              mx: "auto",
            }}
          />

          {message && (
            <Typography
              sx={{ color: "#22c55e", mb: 2, fontWeight: "medium" }}
              variant="body1"
            >
              {message}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 3}>
              {[
                { label: "First Name", name: "firstName" },
                { label: "Last Name", name: "lastName" },
                { label: "Email", name: "email", type: "email" },
                { label: "Phone Number", name: "phoneNumber", type: "tel" },
                {
                  label: "Address",
                  name: "address",
                  multiline: true,
                  rows: 2,
                },
                { label: "Aadhar Number", name: "aadharNumber" },
                {
                  label: "Create Password",
                  name: "password",
                  type: "password",
                },
              ].map((field, index) => (
                <Grid
                  item
                  xs={12}
                  sm={field.name.includes("Name") ? 6 : 12}
                  key={index}
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
                      boxShadow:
                        "0px 14px 26px rgba(8,16,35,0.62), 0px 0px 0px 1px rgba(54,217,255,0.35)",
                    },
                  }}
                >
                  Create Account
                </Button>

                {error && (
                  <Typography
                    sx={{ mt: 2, fontSize: "0.9rem", color: "#f87171" }}
                  >
                    {error}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  sx={{
                    mt: 3,
                    color: "#b5c8e3",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    textAlign: "center",
                  }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "#72deff",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
      <Footer />
    </>
  );
};
export default SignUp;