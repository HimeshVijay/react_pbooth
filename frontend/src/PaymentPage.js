import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-order");
      if (!res.ok) throw new Error("Create order failed");
      const order = await res.json();

      const options = {
        key: "rzp_test_R8Pjr1V054idbz",
        amount: order.amount,
        currency: order.currency,
        name: "?? Fun Photobooth",
        description: "Pay to unlock the kiosk",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json();
            if (verifyJson.status === "ok") {
              navigate("/photobooth"); // ? React Router handles it
            } else {
              alert("Payment verification failed. Please contact admin.");
              console.error("verify response", verifyJson);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification error.");
          }
        },
        theme: { color: "#ff6f61" },
        prefill: { name: "", email: "" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment start error", err);
      alert("Unable to start payment. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#ff9a9e 0%, #fecfef 25%, #f6d365 50%, #fda085 100%)",
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          color: "#fff",
          textShadow: "2px 2px 10px rgba(0,0,0,0.3)",
          marginBottom: "0.5rem",
        }}
      >
        ?? Unlock the Photobooth
      </h1>
      <p style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "2rem" }}>
        Pay a small fee to start your session and take fun photos!
      </p>
      <button
        onClick={startPayment}
        disabled={loading}
        style={{
          padding: "1rem 2.5rem",
          fontSize: "1.4rem",
          borderRadius: "999px",
          border: "none",
          background: "linear-gradient(90deg,#ff6f61,#ffb86b)",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        }}
      >
        {loading ? "Preparing..." : "Pay & Start ??"}
      </button>
      <small style={{ marginTop: "1rem", color: "rgba(255,255,255,0.9)" }}>
        (Amount configured on backend)
      </small>
    </div>
  );
}

export default PaymentPage;
