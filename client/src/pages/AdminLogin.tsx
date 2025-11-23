
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard");
    } else {
      navigate("/auth");
    }
  }, [user, navigate]);

  return null;
};

export default AdminLogin;
