import React from "react";
import { Box, Typography, Container } from "@mui/material";
import ScaleInComponent from "@/lib/ScaleInComponent";

const Video = () => {
  return (
    <Box sx={{
      py: 6,
      background: "transparent",
      boxShadow: "none",
    }}>
      <Typography
        variant="h3"
        align="center"
        sx={{
          fontWeight: "bold",
          mb: 4,
          fontFamily: "Sora, sans-serif",
          color: "#e9f5ff",
          textShadow: "0 0 18px rgba(54, 217, 255, 0.3)",
          transition: '0.3s',
          '&:hover': {
            textShadow: "0 0 24px rgba(54, 217, 255, 0.45)",
          }
        }}
      >
        See It in Action
      </Typography>
      <Typography
        variant="body1"
        align="center"
        sx={{ 
          mb: 4, 
          fontSize: "1.1rem", 
          color: "#b7cce8",
        }}
      >
        Watch the video below to understand how our website works and how to use it!
      </Typography>
      <ScaleInComponent>
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: 3
        }}>
          <Box
            component="video"
            sx={{
              width: "100%",
              maxWidth: "900px",
              height: "auto",
              borderRadius: "15px",
              backgroundColor: "rgba(9, 14, 23, 0.9)",
              border: "1px solid rgba(141, 180, 230, 0.25)",
              transition: 'all 0.3s ease',
              filter: "brightness(1.08) drop-shadow(0 0 12px rgba(54, 217, 255, 0.24))",
              '@keyframes videoGlow': {
                '0%': { filter: "brightness(1.05) drop-shadow(0 0 8px rgba(54, 217, 255, 0.2))" },
                '50%': { filter: "brightness(1.1) drop-shadow(0 0 14px rgba(54, 217, 255, 0.36))" },
                '100%': { filter: "brightness(1.05) drop-shadow(0 0 8px rgba(54, 217, 255, 0.2))" },
              },
              animation: "videoGlow 3s infinite",
            }}
            controls
          >
            <source src="/forestfire1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </Box>
        </Box>
      </ScaleInComponent>
    </Box>
  );
};

export default Video;
