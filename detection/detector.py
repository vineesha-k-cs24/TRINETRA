import os
from transformers import pipeline
from PIL import Image
import torch

MODEL_NAME = "Wvolf/ViT_Deepfake_Detection"

_detector = None

def load_model():
    """
    Loads and caches the ViT Deepfake classification model.
    """
    global _detector
    if _detector is None:
        print("Loading TRINETRA Vision Transformer AI model...")
        _detector = pipeline(
            "image-classification",
            model=MODEL_NAME,
            device=-1
        )
        print("AI model loaded successfully!")
    return _detector

def detect_image(image_path):
    """
    Runs Vision Transformer inference on an image.
    Returns prediction ('Real' or 'Potentially Fake'), probability scores, and status.
    """
    try:
        image = Image.open(image_path).convert("RGB")
        model = load_model()
        predictions = model(image)

        # Build clean probabilities mapping
        probs = {}
        for item in predictions:
            lbl = item["label"].lower()
            probs[lbl] = round(item["score"] * 100, 2)

        # Get highest scoring label
        best = max(predictions, key=lambda x: x["score"])
        primary_label = best["label"].lower()
        confidence = round(best["score"] * 100, 2)

        is_fake = (primary_label == "fake")
        verdict = "Potentially Fake" if is_fake else "Authentic / Real"

        return {
            "prediction": verdict,
            "verdict_raw": "Fake" if is_fake else "Real",
            "is_fake": is_fake,
            "confidence": confidence,
            "probabilities": probs,
            "model_architecture": "Vision Transformer (ViT-Base)",
            "status": "success"
        }
    except Exception as error:
        return {
            "error": str(error),
            "status": "failed"
        }
