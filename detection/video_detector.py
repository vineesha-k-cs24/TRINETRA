import os
import cv2
from PIL import Image
from detection.detector import detect_image

def analyze_video(video_path, max_frames=5):
    """
    Samples frames uniformly across the video, runs inference on each frame,
    and produces an aggregated temporal authenticity assessment.
    """
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"status": "failed", "error": "Unable to open video file."}

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
        duration_sec = round(total_frames / fps, 2) if total_frames > 0 else 0

        if total_frames <= 0:
            cap.release()
            return {"status": "failed", "error": "Video contains 0 readable frames."}

        # Select frame indices evenly
        step = max(1, total_frames // max_frames)
        sampled_indices = [min(i * step, total_frames - 1) for i in range(max_frames)]

        frame_results = []
        fake_scores = []
        temp_dir = os.path.dirname(video_path)

        for idx, frame_no in enumerate(sampled_indices):
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_no)
            ret, frame = cap.read()
            if not ret or frame is None:
                continue

            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(rgb_frame)
            
            temp_frame_path = os.path.join(temp_dir, f"_temp_frame_{idx}.jpg")
            img.save(temp_frame_path)

            pred = detect_image(temp_frame_path)
            
            if os.path.exists(temp_frame_path):
                try:
                    os.remove(temp_frame_path)
                except Exception:
                    pass

            if pred.get("status") == "success":
                fake_prob = pred["probabilities"].get("fake", 0.0)
                fake_scores.append(fake_prob)
                frame_results.append({
                    "frame_number": frame_no,
                    "timestamp": round(frame_no / fps, 2),
                    "verdict": pred["prediction"],
                    "fake_probability": fake_prob
                })

        cap.release()

        if not fake_scores:
            return {"status": "failed", "error": "Could not analyze any video frames."}

        avg_fake_prob = sum(fake_scores) / len(fake_scores)
        is_fake = avg_fake_prob >= 50.0
        confidence = round(avg_fake_prob if is_fake else (100.0 - avg_fake_prob), 2)

        return {
            "prediction": "Potentially Fake" if is_fake else "Authentic / Real",
            "verdict_raw": "Fake" if is_fake else "Real",
            "is_fake": is_fake,
            "confidence": confidence,
            "duration_sec": duration_sec,
            "total_frames": total_frames,
            "sampled_frames_count": len(frame_results),
            "frame_results": frame_results,
            "status": "success"
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}
