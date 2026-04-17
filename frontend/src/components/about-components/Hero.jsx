import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { LightbulbOutlined } from "@mui/icons-material";

const Hero = ({ onLearnMore }) => {
  const theme = useTheme();

  return (
    <Box
    sx={{
      position: "relative",
      height: "70vh",
      background:
        "linear-gradient(160deg, rgba(12,18,29,0.94), rgba(6,9,15,0.98))",
      backgroundImage: "url('https://cdn.pixabay.com/photo/2019/11/19/22/24/watch-4638673_640.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      textAlign: "center",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(6, 10, 18, 0.72)",
        backdropFilter: "blur(8px)",
      }}
    />

    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        px: { xs: 3, sm: 4, md: 6 },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          mb: 2,
          animation: "fadeIn 1s ease-in-out 0.5s",
          fontFamily: "Sora, sans-serif",
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          color: "#d9ecff",
          textShadow: "0 0 28px rgba(54, 217, 255, 0.28)",
          transition: "0.3s",
          '&:hover': {
            textShadow: "0 0 30px rgba(54, 217, 255, 0.45)"
          }
        }}
      >
        About Us
      </Typography>

      <Typography
        variant="h6"
        sx={{
          maxWidth: "700px",
          margin: "0 auto",
          mb: 3,
          animation: "fadeIn 2s ease-in-out 1s",
          fontFamily: "Outfit, sans-serif",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          color: "#bdd0ea",
          textShadow: "0 0 10px rgba(54, 217, 255, 0.2)",
        }}
      >
        Our Incident Reporting and Response System is designed to ensure
        safety and quick action during critical situations. We empower users
        to report incidents through text or voice input, enabling faster
        responses and better monitoring through real-time analytics.
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
        }}
      >
        <LightbulbOutlined
          sx={{
            color: "#58ddff",
            fontSize: 45,
            mr: 2,
            animation: "fadeIn 2s ease-in-out 1.5s",
            filter: "drop-shadow(0 0 10px rgba(54, 217, 255, 0.5))",
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            fontSize: "1.2rem",
            fontFamily: "Outfit, sans-serif",
            color: "#7ae8ff",
            animation: "fadeIn 2s ease-in-out 1.5s",
            textShadow: "0 0 10px rgba(54, 217, 255, 0.3)",
          }}
        >
          Empowering Safety with Real-time Action
        </Typography>
      </Box>

      <Button
        onClick={onLearnMore}
        variant="contained"
        sx={{
          mt: 4,
          bgcolor: "rgba(10, 16, 27, 0.85)",
          color: "#dcf2ff",
          fontWeight: "bold",
          fontSize: "1.1rem",
          borderRadius: "25px",
          padding: "12px 24px",
          boxShadow: "0 14px 30px rgba(5, 10, 19, 0.62)",
          border: "1px solid rgba(126, 180, 236, 0.32)",
          transition: 'all 0.3s ease',
          animation: "fadeIn 3s ease-in-out 2s",
          "&:hover": {
            bgcolor: "rgba(12, 22, 34, 0.92)",
            boxShadow: "0 18px 36px rgba(5, 10, 19, 0.7), 0 0 0 1px rgba(54, 217, 255, 0.35)",
            transform: "scale(1.05)",
          },
        }}
      >
        Explore Features
      </Button>
    </Box>
  </Box>
  );
};

export default Hero;
