import React, { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
} from "@mui/material";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logo from "/image.png";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const primaryLinks = [
  { route: "/", label: "Home" },
  { route: "/About", label: "About" },
  { route: "/InciLog", label: "InciLog" },
];

const featureLinks = [
  { route: "/report-incident", label: "Report Incident" },
  { route: "/heatmap", label: "Heatmaps" },
  { route: "/heatmap2", label: "Incident Type Heatmap" },
  { route: "/voice-report", label: "Voice Report" },
  { route: "/chatbot", label: "Saathi AI" },
  { route: "/upload", label: "VR Viewer" },
  { route: "/pothole", label: "Pothole Analyzer" },
  { route: "/video", label: "Video Analysis" },
];

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const activeLink = location.pathname === "/" ? "/" : location.pathname;
  const featureActive = featureLinks.some((item) => item.route === activeLink);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const toggleDrawer = (open) => setDrawerOpen(open);

  const handleNavigation = (route) => {
    navigate(route);
  };

  const navButtonSx = (route) => ({
    color: activeLink === route ? "#f2f7ff" : "#b5c7de",
    fontWeight: 600,
    fontFamily: "Outfit, sans-serif",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderBottom: activeLink === route ? "2px solid rgba(54,217,255,0.8)" : "2px solid transparent",
    borderRadius: 0,
    px: 1,
    py: 1.5,
    mx: 1.5,
    minWidth: "fit-content",
    transition: "all 0.25s ease",
    "&:hover": {
      color: "#eef8ff",
      borderBottom: "2px solid rgba(54,217,255,0.55)",
      backgroundColor: "transparent",
      textShadow: "0 0 18px rgba(54,217,255,0.35)",
    },
  });

  const sideMenu = (
    <Box
      sx={{
        width: 300,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(180deg, rgba(15,22,34,0.96), rgba(8,12,20,0.98))",
        backdropFilter: "blur(18px)",
        borderRight: "1px solid rgba(141,180,230,0.2)",
        p: 2,
      }}
    >
      <List sx={{ pt: 1 }}>
        {primaryLinks.map((item) => (
          <ListItemButton
            key={item.route}
            onClick={() => {
              handleNavigation(item.route);
              toggleDrawer(false);
            }}
            sx={{
              mb: 1,
              borderRadius: 2,
              backgroundColor:
                activeLink === item.route ? "rgba(54,217,255,0.2)" : "transparent",
              border: activeLink === item.route ? "1px solid rgba(54,217,255,0.4)" : "1px solid transparent",
              color: activeLink === item.route ? "#f0f8ff" : "#b5c7de",
              "&:hover": {
                backgroundColor: "rgba(54,217,255,0.14)",
                color: "#eef8ff",
              },
            }}
          >
            <ListItemText
              primary={item.label}
              sx={{
                textAlign: "left",
                "& .MuiTypography-root": {
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                },
              }}
            />
          </ListItemButton>
        ))}

        <ListItemButton
          onClick={() => setMobileFeaturesOpen((prev) => !prev)}
          sx={{
            mb: 1,
            borderRadius: 2,
            backgroundColor: featureActive ? "rgba(25,247,194,0.12)" : "transparent",
            border: featureActive
              ? "1px solid rgba(25,247,194,0.35)"
              : "1px solid transparent",
            color: "#d6e6ff",
            "&:hover": {
              backgroundColor: "rgba(25,247,194,0.14)",
            },
          }}
        >
          <ListItemText
            primary="Features"
            sx={{
              "& .MuiTypography-root": {
                fontFamily: "Sora, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.03em",
              },
            }}
          />
          {mobileFeaturesOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={mobileFeaturesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {featureLinks.map((item) => (
              <ListItemButton
                key={item.route}
                sx={{
                  pl: 3,
                  mb: 0.5,
                  borderRadius: 2,
                  color: activeLink === item.route ? "#eef8ff" : "#b5c7de",
                  backgroundColor:
                    activeLink === item.route ? "rgba(54,217,255,0.15)" : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(54,217,255,0.12)",
                    color: "#eef8ff",
                  },
                }}
                onClick={() => {
                  handleNavigation(item.route);
                  toggleDrawer(false);
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    "& .MuiTypography-root": {
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "0.88rem",
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>

      <Box sx={{ textAlign: "left", px: 1, pb: 1 }}>
        <Divider sx={{ borderColor: "rgba(141,180,230,0.2)", mb: 1.5 }} />
        <Typography
          variant="caption"
          sx={{
            color: "#8fa6c7",
            letterSpacing: "0.05em",
            fontFamily: "Outfit, sans-serif",
            textTransform: "uppercase",
          }}
        >
          BharatSecure {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        background:
          "linear-gradient(120deg, rgba(10,14,22,0.78), rgba(14,22,35,0.88))",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(141,180,230,0.2)",
        boxShadow:
          "0 12px 34px rgba(2,6,16,0.48), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 78,
            px: { xs: 0.5, sm: 1.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => handleNavigation("/")}
              sx={{
                p: 0.5,
                borderRadius: "50%",
                border: "1px solid rgba(141,180,230,0.35)",
                boxShadow: "0 0 0 4px rgba(54,217,255,0.09)",
                "&:hover": {
                  backgroundColor: "rgba(54,217,255,0.1)",
                },
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{ width: 42, height: 42, borderRadius: "50%" }}
              />
            </IconButton>

            <Link to="/" style={{ textDecoration: "none" }}>
              <Typography
                variant="h6"
                sx={{
                  ml: 1.5,
                  color: "#f2f7ff",
                  fontFamily: "Sora, sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  fontSize: { xs: "1.25rem", sm: "1.55rem" },
                  textShadow: "0 0 24px rgba(54,217,255,0.22)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    color: "#dcf4ff",
                  },
                }}
              >
                BharatSecure
              </Typography>
            </Link>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              ml: 3,
            }}
          >
            {primaryLinks.map((item) => (
              <Button
                key={item.route}
                sx={navButtonSx(item.route)}
                onClick={() => handleNavigation(item.route)}
              >
                {item.label}
              </Button>
            ))}

            <Button
              sx={{
                ...navButtonSx("/feature-anchor"),
                color: featureActive ? "#f2f7ff" : "#b5c7de",
                borderBottom: featureActive
                  ? "2px solid rgba(25,247,194,0.75)"
                  : "2px solid transparent",
                "&:hover": {
                  color: "#eef8ff",
                  borderBottom: "2px solid rgba(25,247,194,0.5)",
                  backgroundColor: "transparent",
                },
              }}
              onMouseEnter={handleMenuOpen}
              onClick={handleMenuOpen}
            >
              Features
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {!isLoggedIn ? (
              <Link to="/login" style={{ textDecoration: "none" }}>
                <Button
                  sx={{
                    color: "#e8f4ff",
                    border: "1px solid rgba(54,217,255,0.45)",
                    background:
                      "linear-gradient(130deg, rgba(20,28,43,0.92), rgba(12,16,27,0.95))",
                    px: { xs: 1.8, sm: 2.5 },
                    py: 1,
                    fontFamily: "Outfit, sans-serif",
                    "&:hover": {
                      borderColor: "rgba(25,247,194,0.55)",
                      boxShadow:
                        "0 10px 20px rgba(7,16,32,0.6), 0 0 0 1px rgba(25,247,194,0.24)",
                    },
                  }}
                >
                  Login
                </Button>
              </Link>
            ) : (
              <Button
                sx={{
                  color: "#e8f4ff",
                  border: "1px solid rgba(25,247,194,0.45)",
                  background:
                    "linear-gradient(130deg, rgba(17,28,31,0.92), rgba(11,19,23,0.95))",
                  px: { xs: 1.8, sm: 2.5 },
                  py: 1,
                  fontFamily: "Outfit, sans-serif",
                  "&:hover": {
                    borderColor: "rgba(54,217,255,0.55)",
                    boxShadow:
                      "0 10px 20px rgba(7,16,32,0.6), 0 0 0 1px rgba(54,217,255,0.24)",
                  },
                }}
                onClick={() => {
                  const userType = localStorage.getItem("userType");
                  handleNavigation(userType === "user" ? "/my-reports" : "/admin");
                }}
              >
                Dashboard
              </Button>
            )}

            <IconButton
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: "#d8ecff",
                border: "1px solid rgba(141,180,230,0.35)",
                backgroundColor: "rgba(15,22,34,0.7)",
                "&:hover": {
                  backgroundColor: "rgba(25,36,57,0.9)",
                },
              }}
              onClick={() => toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          onMouseEnter: () => setAnchorEl(anchorEl),
          onMouseLeave: handleMenuClose,
        }}
        sx={{
          "& .MuiPaper-root": {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 250,
            background:
              "linear-gradient(150deg, rgba(18, 25, 38, 0.95), rgba(9, 13, 24, 0.98))",
            border: "1px solid rgba(141, 180, 230, 0.24)",
            boxShadow:
              "0 20px 44px rgba(3, 7, 16, 0.62), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(14px)",
          },
          "& .MuiMenuItem-root": {
            color: "#d7e8ff",
            fontFamily: "Outfit, sans-serif",
            py: 1.1,
            borderRadius: 1,
            margin: "4px 6px",
            "&:hover": {
              color: "#f2f8ff",
              backgroundColor: "rgba(54,217,255,0.14)",
            },
          },
        }}
      >
        {featureLinks.map((item) => (
          <MenuItem
            key={item.route}
            onClick={() => {
              handleNavigation(item.route);
              handleMenuClose();
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
        {sideMenu}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
