import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserActions, useUserState } from "@/contexts/user/UserContext";
import { useAppDispatch } from "@/app/hooks";
import { clearUser } from "@/features/auth/authSlice";
import Navbar from "@/components/Navbar/Navbar";
import AuthFooter from "@/components/Footer/AuthFooter";
import "./account.css";

const AccountOverview = () => {
  const user = useUserState();
  const actions = useUserActions();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user?.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    actions?.logout?.();
    dispatch(clearUser());
    navigate("/login", { replace: true });
  };

  if (!isLoggedIn) {
    return null;
  }

  const name = user?.name?.trim() || "Guest";
  const email = user?.email?.trim() || "Not provided";
  const phone = user?.phone?.trim() || "Not provided";

  return (
    <div className="account-container">
      <Navbar />

      <main className="account-main">
        <section className="account-card">
          <h2 className="account-title">Account overview</h2>
          <p className="account-subtitle">Welcome back, {name}.</p>

          <div className="account-details">
            <div className="account-detail-row">
              <span>Name</span>
              <strong>{name}</strong>
            </div>
            <div className="account-detail-row">
              <span>Email</span>
              <strong>{email}</strong>
            </div>
            <div className="account-detail-row">
              <span>Phone</span>
              <strong>{phone}</strong>
            </div>
          </div>

          <button
            type="button"
            className="account-logout"
            onClick={handleLogout}
          >
            Log out
          </button>

          <Link to="/profile" className="account-profile-link">
            Edit profile
          </Link>
        </section>
      </main>

      <AuthFooter />
    </div>
  );
};

export default AccountOverview;
