import React, { useState, useEffect } from "react";

// Preset filters
const filters = [
  { name: "None", style: "none" },
  { name: "Grayscale", style: "grayscale(100%)" },
  { name: "Sepia", style: "sepia(100%)" },
  { name: "Invert", style: "invert(100%)" },
  { name: "Brightness", style: "brightness(150%)" },
];

function App() {
  const [photo, setPhoto] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("none");

  const takePhoto = async () => {
    try {
      const response = await fetch(`/api/capture?ts=${Date.now()}`);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setPhoto(imageUrl);
      setSelectedFilter("none");
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  // Auto-return to live preview after 8 seconds
  useEffect(() => {
    if (photo) {
      const timer = setTimeout(() => setPhoto(null), 80000);
      return () => clearTimeout(timer);
    }
  }, [photo]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #ff9a9e, #fad0c4, #fad0c4, #ffecd2)",
        color: "#333",
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "1rem",
          fontSize: "2.5rem",
          fontWeight: "700",
          textAlign: "center",
          letterSpacing: "1px",
          color: "#fff",
          textShadow: "2px 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        📸 Fun Photobooth
      </header>

      {/* Main Camera / Photo */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "1rem",
        }}
      >
        {!photo ? (
          <img
            src={`/api/preview`}
            alt="Live Camera"
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "cover",
              borderRadius: "20px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              border: "4px solid rgba(255,255,255,0.2)",
            }}
          />
        ) : (
          <img
            key={photo}
            src={photo}
            alt="Captured"
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "cover",
              borderRadius: "20px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              border: "4px solid #fff",
              filter: selectedFilter,
              transition: "filter 0.3s ease",
            }}
          />
        )}
      </main>

      {/* Footer controls */}
      <footer
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {!photo ? (
            <button
              onClick={takePhoto}
              style={{
                padding: "1rem 3rem",
                fontSize: "1.5rem",
                borderRadius: "50px",
                cursor: "pointer",
                border: "none",
                background: "linear-gradient(135deg, #f6d365, #fda085)",
                color: "#fff",
                fontWeight: "600",
                boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
            >
              📷 Take Photo
            </button>
          ) : (
            <button
              onClick={() => setPhoto(null)}
              style={{
                padding: "1rem 3rem",
                fontSize: "1.5rem",
                borderRadius: "50px",
                cursor: "pointer",
                border: "none",
                background: "linear-gradient(135deg, #f093fb, #f5576c)",
                color: "#fff",
                fontWeight: "600",
                boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
            >
              🔄 Back to Live
            </button>
          )}
        </div>

        {/* Filter selection */}
        {photo && (
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
            {filters.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFilter(f.style)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "20px",
                  border:
                    selectedFilter === f.style
                      ? "2px solid #fff"
                      : "2px solid rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
