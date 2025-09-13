from flask import Flask, send_from_directory, send_file, Response
from flask_cors import CORS
from picamera2 import Picamera2
import time
import os
import cv2

# React build will be served from "build" folder
app = Flask(__name__, static_folder="build", static_url_path="")
CORS(app)

# Initialize Camera
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
picam2.start()

# Serve React frontend
@app.route("/")
def serve_react():
    return send_from_directory(app.static_folder, "index.html")

# Catch-all route (for React Router support)
@app.route("/<path:path>")
def serve_react_routes(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

# -------- API Routes --------

# Capture a snapshot
@app.route("/api/capture")
def capture():
    filename = f"photo_{int(time.time())}.jpg"
    picam2.capture_file(filename)
    return send_file(filename, mimetype="image/jpeg")

# MJPEG streaming generator
def gen_frames():
    while True:
        frame = picam2.capture_array()  # numpy array
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# Live preview endpoint
@app.route("/api/preview")
def preview():
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
