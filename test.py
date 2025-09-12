from flask import Flask, send_file
from picamera2 import Picamera2
import time
import os

app = Flask(__name__)

# Initialize Camera
picam2 = Picamera2()
picam2.configure(picam2.create_still_configuration())
picam2.start()

# Homepage
@app.route("/")
def index():
    return """
    <h1>?? Photobooth</h1>
    <p><a href='/capture'>Take a Photo</a></p>
    """

# Capture endpoint
@app.route("/capture")
def capture():
    filename = f"photo_{int(time.time())}.jpg"
    picam2.capture_file(filename)

    # Serve the photo
    return send_file(filename, mimetype='image/jpeg')

if __name__ == "__main__":
    # Run server on all interfaces so other devices can access
    app.run(host="0.0.0.0", port=5000)
