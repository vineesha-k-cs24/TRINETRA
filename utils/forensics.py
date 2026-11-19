import os
import base64
import io
from PIL import Image, ImageChops, ImageEnhance
from PIL.ExifTags import TAGS

def perform_ela(image_path, quality=90, multiplier=15):
    """
    Error Level Analysis (ELA) identifies areas within an image that are at
    different levels of compression, highlighting potential digital alterations.
    """
    try:
        original = Image.open(image_path).convert("RGB")
        
        # Save temporary resaved JPEG in memory
        buffer = io.BytesIO()
        original.save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer)

        # Compute difference
        ela_img = ImageChops.difference(original, resaved)

        # Enhance difference to make artifacts visually distinct
        extrema = ela_img.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        scale = multiplier if max_diff == 0 else max(multiplier, int(255.0 / (max_diff + 1e-5)))
        
        enhancer = ImageEnhance.Brightness(ela_img)
        ela_enhanced = enhancer.enhance(scale)

        # Convert ELA image to base64 for direct web rendering
        out_buffer = io.BytesIO()
        ela_enhanced.save(out_buffer, format="JPEG")
        ela_base64 = base64.b64encode(out_buffer.getvalue()).decode("utf-8")

        # Compute anomaly score based on pixel difference distribution
        diff_data = list(ela_img.getdata())
        avg_diff = sum([sum(px) / 3 for px in diff_data]) / len(diff_data)
        
        # Normalized anomaly index (0 - 100)
        anomaly_index = min(100.0, round(avg_diff * 4.5, 2))

        return {
            "ela_image": f"data:image/jpeg;base64,{ela_base64}",
            "anomaly_index": anomaly_index,
            "status": "success"
        }
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }

def extract_metadata_forensics(file_path):
    """
    Extracts forensic metadata (EXIF, software traces, camera info)
    to detect AI generation or editing tools like Photoshop, Midjourney, etc.
    """
    forensic_tags = {}
    tamper_signals = []

    try:
        with Image.open(file_path) as img:
            exif_data = img.getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    tag_name = TAGS.get(tag_id, str(tag_id))
                    # Convert binary/bytes or unparseable values to string
                    if isinstance(value, bytes):
                        try:
                            value = value.decode("utf-8", errors="ignore").strip("\x00")
                        except Exception:
                            value = str(value)[:40]
                    forensic_tags[tag_name] = str(value)

        # Forensic checks for known generation or editing software
        software = forensic_tags.get("Software", "").lower()
        make = forensic_tags.get("Make", "")
        model = forensic_tags.get("Model", "")
        
        ai_signatures = ["midjourney", "stable diffusion", "dall-e", "adobe photoshop", "gimp", "canva", "novelai"]
        for sig in ai_signatures:
            if sig in software:
                tamper_signals.append(f"Editing / Generative signature detected: '{sig.title()}' in metadata software header.")

        if not exif_data or len(exif_data) == 0:
            tamper_signals.append("EXIF metadata stripped or missing (common in AI-generated and social media web media).")

        return {
            "metadata": forensic_tags,
            "has_exif": bool(exif_data),
            "camera": f"{make} {model}".strip() if (make or model) else "None / Stripped",
            "signals": tamper_signals,
            "status": "success"
        }
    except Exception as e:
        return {
            "status": "failed",
            "metadata": {},
            "signals": [f"Metadata extraction note: {str(e)}"],
            "camera": "Unknown"
        }
