
from detection.detector import detect_image

image_path = input("Enter the image path: ")

result = detect_image(image_path)

print("\n--- TRINETRA AI RESULT ---")

if result["status"] == "success":

    print("Prediction:", result["prediction"])
    print("Confidence:", result["confidence"], "%")

else:

    print("Error:", result["error"])
