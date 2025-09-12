# app.py
from flask import Flask, send_file, Response
from flask_cors import CORS
from picamera2 import Picamera2, Preview
import time
import io

app = Flask(__name__)
CORS(app)

# Initialize Camera
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
picam2.start()

# Homepage route
@app.route("/")
def index():
    return "<h1>?? Photobooth</h1><p><a href='/capture'>Take a Photo</a></p>"

# Capture a snapshot
@app.route("/capture")
def capture():
    filename = f"photo_{int(time.time())}.jpg"
    picam2.capture_file(filename)
    return send_file(filename, mimetype="image/jpeg")

# MJPEG streaming generator
def gen_frames():
    while True:
        frame = picam2.capture_array()  # get frame as numpy array
        # Encode as JPEG
        import cv2
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# Live preview endpoint
@app.route("/preview")
def preview():
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

