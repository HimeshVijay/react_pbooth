from flask import Flask, send_from_directory, send_file, Response, request, jsonify
from flask_cors import CORS
from picamera2 import Picamera2
import time
import os
import cv2
import razorpay
from razorpay.errors import SignatureVerificationError

# ---------------- Flask Setup ----------------
# Make sure your React build/ folder is located next to this file
app = Flask(__name__, static_folder="build", static_url_path="")
CORS(app)

# ---------------- Razorpay Setup ----------------
# REPLACE these with your keys (key_id is public; secret stays on server)
RAZORPAY_KEY_ID = "rzp_test_R8Pjr1V054idbz"
RAZORPAY_KEY_SECRET = "mifvbSWk8SLhiOdejqOCRyeZ"
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# ---------------- Camera Setup ----------------
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
picam2.start()

# ---------------- API Routes ----------------

# Create a Razorpay order (called by frontend)
@app.route("/api/create-order")
def create_order():
    # Amount in paise (100 paise = ?1). Change to desired cost.
    order_amount = 100  # example: ?1
    order_currency = "INR"
    order_receipt = f"receipt_{int(time.time())}"

    order = razorpay_client.order.create(dict(
        amount=order_amount,
        currency=order_currency,
        receipt=order_receipt
    ))
    return jsonify(order)

# Verify payment signature (called by frontend after Razorpay handler)
@app.route("/api/verify-payment", methods=["POST"])
def verify_payment():
    data = request.json or {}
    # expected keys: razorpay_payment_id, razorpay_order_id, razorpay_signature
    verify_payload = {
        "razorpay_order_id": data.get("razorpay_order_id"),
        "razorpay_payment_id": data.get("razorpay_payment_id"),
        "razorpay_signature": data.get("razorpay_signature"),
    }
    try:
        razorpay_client.utility.verify_payment_signature(verify_payload)
        return jsonify({"status": "ok"})
    except SignatureVerificationError as e:
        return jsonify({"status": "failed", "error": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

# Capture a snapshot (camera)
@app.route("/api/capture")
def capture():
    filename = f"photo_{int(time.time())}.jpg"
    picam2.capture_file(filename)
    return send_file(filename, mimetype="image/jpeg")

# MJPEG streaming generator (camera preview)
def gen_frames():
    while True:
        frame = picam2.capture_array()  # numpy array
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route("/api/preview")
def preview():
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# ---------------- Serve React (after all /api routes) ----------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    # Prevent returning index.html for API paths
    if path.startswith("api/"):
        return jsonify({"error": "API endpoint not found"}), 404

    # If the requested file exists inside /build, serve it directly
    file_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)

    # Otherwise, always serve index.html (for React Router routes like /photobooth)
    return send_from_directory(app.static_folder, "index.html")

# ---------------- Run ----------------
if __name__ == "__main__":
    # In production set debug=False
    app.run(host="0.0.0.0", port=5000)
