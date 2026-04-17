import { Navigate, Outlet } from "react-router-dom";

const UserRoute = () => {
  const userType = localStorage.getItem("userType");
  const profileComplete = localStorage.getItem("profileComplete");

  if (userType !== "user") {
    return <Navigate to="/" replace />;
  }

  if (profileComplete !== "true") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
