import { useEffect, useRef, useState } from "react";

const PI_BASE = "http://<PI_HOST>:5000"; // e.g., http://raspberrypi.local:5000

export default function App() {
  const [capturedFilename, setCapturedFilename] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const previewRef = useRef(null);

  // Auto-capture once when the app mounts
  useEffect(() => {
    const autoCapture = async () => {
      setIsCapturing(true);
      try {
        const resp = await fetch(`${PI_BASE}/capture`, {
          method: "POST",
        });
        if (!resp.ok) throw new Error(`Capture failed: ${resp.status}`);
        const data = await resp.json();
        setCapturedFilename(data.filename);
      } catch (e) {
        console.error(e);
        alert("Capture failed. Check server logs.");
      } finally {
        setIsCapturing(false);
      }
    };
    autoCapture();
  }, []);

  const handleRetake = async () => {
    // Show preview again while capturing a fresh still
    setCapturedFilename(null);
    // Force-reload the MJPEG <img> to ensure stream reconnects cleanly
    if (previewRef.current) {
      previewRef.current.src = `${PI_BASE}/video_feed?ts=${Date.now()}`;
    }
    setIsCapturing(true);
    try {
      const resp = await fetch(`${PI_BASE}/capture`, { method: "POST" });
      if (!resp.ok) throw new Error(`Capture failed: ${resp.status}`);
      const data = await resp.json();
      setCapturedFilename(data.filename);
    } catch (e) {
      console.error(e);
      alert("Capture failed. Check server logs.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1>?? Photobooth</h1>

      {!capturedFilename && (
        <div style={styles.previewWrap}>
          <img
            ref={previewRef}
            style={styles.preview}
            src={`${PI_BASE}/video_feed`}
            alt="Live Preview"
          />
        </div>
      )}

      {capturedFilename && (
        <div style={styles.previewWrap}>
          <img
            style={styles.preview}
            src={`${PI_BASE}/photos/${capturedFilename}?ts=${Date.now()}`}
            alt="Captured"
          />
        </div>
      )}

      <div style={styles.controls}>
        <button onClick={handleRetake} disabled={isCapturing} style={styles.button}>
          {isCapturing ? "Capturing..." : capturedFilename ? "Retake" : "Capture"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 16 },
  previewWrap: { display: "inline-block", border: "1px solid #ccc", padding: 4 },
  preview: { maxWidth: "90vw", height: "auto" },
  controls: { marginTop: 12 },
  button: { padding: "10px 16px", fontSize: 16, cursor: "pointer" },
};

