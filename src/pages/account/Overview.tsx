import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserActions, useUserState } from "@/contexts/user/UserContext";
import Navbar from "@/components/Navbar/Navbar";
import AuthFooter from "@/components/Footer/AuthFooter";
import "./account.css";

const AccountOverview = () => {
  const user = useUserState();
  const actions = useUserActions();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user?.isLoggedIn);
  const loading = Boolean(user?.loading);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/auth/sign-in", { replace: true });
    }
  }, [loading, isLoggedIn, navigate]);

  const handleLogout = async () => {
    try {
      await actions?.logout?.();
    } catch (err) {
      console.error('[handleLogout]', err);
    }
    navigate("/auth/sign-in", { replace: true });
  };

  if (loading || !isLoggedIn) {
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
        </section>
      </main>

      <AuthFooter />
    </div>
  );
};

export default AccountOverview;
