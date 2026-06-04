import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserActions, useUserState } from "@/contexts/user/UserContext";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar/Navbar";
import AuthFooter from "@/components/Footer/AuthFooter";
import SellerAnalytics from "@/components/SellerAnalytics/SellerAnalytics";
import "./account.css";

const AccountOverview = () => {
  const user = useUserState();
  const actions = useUserActions();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user?.isLoggedIn);
  const loading = Boolean(user?.loading);

  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "" }>({
    message: "",
    type: "",
  });

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/auth/sign-in", { replace: true });
    }
  }, [loading, isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("address, state, city, zip")
            .eq("id", user.id!)
            .single();

          if (error) {
            console.error("Error fetching profile details:", error);
            if (error.code === "42703") {
              setFeedback({
                message: "Note: Address columns are not created in the database yet. Send the SQL script to your teammate!",
                type: "error"
              });
            }
            return;
          }

          if (data) {
            setAddress(data.address || "");
            setState(data.state || "");
            setCity(data.city || "");
            setZip(data.zip || "");
          }
        } catch (err) {
          console.error("Failed to load profile:", err);
        }
      };
      fetchProfile();
    }
  }, [isLoggedIn, user?.id]);

  const handleLogout = async () => {
    await actions?.logout?.();
    navigate("/auth/sign-in", { replace: true });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    setFeedback({ message: "", type: "" });

    const { error } = await supabase
      .from("profiles")
      .update({
        address,
        state,
        city,
        zip
      })
      .eq("id", user.id);

    setIsSaving(false);
    if (error) {
      console.error("Error updating profile:", error);
      if (error.code === "42703") {
        setFeedback({
          message: "Could not save. The address columns are missing in the Supabase table.",
          type: "error"
        });
      } else {
        setFeedback({
          message: `Failed to save changes: ${error.message}`,
          type: "error"
        });
      }
    } else {
      setFeedback({
        message: "Address updated successfully!",
        type: "success"
      });
      setTimeout(() => {
        setFeedback({ message: "", type: "" });
      }, 3000);
    }
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

          <form onSubmit={handleSaveAddress} className="account-address-form">
            <h3 className="address-section-title">Address Details</h3>

            <div className="account-form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                className="account-input"
                placeholder="e.g. Calle 123 # 45-67"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                className="account-input"
                placeholder="e.g. Medellín / Monterrey"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="state">State / Department</label>
              <input
                type="text"
                id="state"
                className="account-input"
                placeholder="e.g. Antioquia / CDMX"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="zip">ZIP / Postal Code</label>
              <input
                type="text"
                id="zip"
                className="account-input"
                placeholder="e.g. 110111"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
            </div>

            {feedback.message && (
              <p 
                className="account-feedback-msg" 
                style={{ 
                  color: feedback.type === "success" ? "#2e7d32" : "#c62828", 
                  backgroundColor: feedback.type === "success" ? "#e8f5e9" : "#ffebee",
                  padding: "10px",
                  borderRadius: "10px",
                  fontSize: "13px", 
                  textAlign: "center",
                  fontWeight: "500",
                  marginTop: "10px",
                  border: feedback.type === "success" ? "1px solid #c8e6c9" : "1px solid #ffcdd2"
                }}
              >
                {feedback.message}
              </p>
            )}

            <button
              type="submit"
              className="account-save-btn"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Address"}
            </button>
          </form>

          <button
            type="button"
            className="account-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </section>

        {/* Add Seller Analytics here */}
        <SellerAnalytics />
      </main>

      <AuthFooter />
    </div>
  );
};

export default AccountOverview;
