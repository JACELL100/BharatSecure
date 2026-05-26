// Remove trailing slash from API URL to prevent double slashes in requests
const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://bharatsecure-backend.onrender.com").replace(/\/+$/, "");

export default API_BASE_URL;
