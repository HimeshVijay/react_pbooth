import React, { useState } from "react";

function App() {
  const [photo, setPhoto] = useState(null);
  const backendUrl = "http://172.16.218.18:5000"; // Pi IP

  const takePhoto = async () => {
    try {
      const response = await fetch(`${backendUrl}/capture?ts=${Date.now()}`);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setPhoto(imageUrl);
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>?? Photobooth</h1>

      {/* Live camera preview */}
      <div>
        <h2>Live Preview</h2>
        <img
          src={`${backendUrl}/preview`}
          alt="Live Camera"
          style={{ maxWidth: "80%", border: "2px solid gray" }}
        />
      </div>

      {/* Capture button */}
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={takePhoto}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Take Photo
        </button>
      </div>

      {/* Display captured photo */}
      {photo && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Captured Photo</h2>
          <img
            key={photo}
            src={photo}
            alt="Captured"
            style={{ maxWidth: "80%", border: "2px solid black" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
