# TRINETRA: AI-Assisted Digital Authenticity Verification and Forensic Traceability System

**Visvesvaraya Technological University (VTU)**  
**Sahyadri College of Engineering & Management, Mangaluru**  
*Department of Computer Science & Engineering (2025–2026)*

---

## 👥 Project Team & Guide
- **Guide:** Dr. Deepti Rai, Associate Professor, Department of CSE
- **Students:**
  - Nagarjun Chadaga CV (`4SF23CS125`)
  - Srinivasa Puranik (`4SF24CS219`)
  - Chiruvella Jishvitha (`4SF24CS044`)
  - Vineesha K (`4SF24CS247`)

---

## 📌 Abstract & Overview
With the proliferation of generative artificial intelligence and deepfake manipulation tools, authenticating digital multimedia is crucial for preserving trust, evidence integrity, and preventing misinformation. 

**TRINETRA** is an end-to-end digital authenticity and forensic traceability platform combining:
1. **AI Deepfake Detection:** Powered by a Vision Transformer (`ViT-Base`) neural model for synthetic face and manipulation detection.
2. **Forensic Explainability:** Implementing **Error Level Analysis (ELA)** to uncover compression and tampering discrepancies, alongside metadata (EXIF) inspection.
3. **Cryptographic Traceability:** Computing unique **SHA-256 digital fingerprints** for verification, tamper alerts, and generation of official forensic verification certificates.
4. **Multimedia Handling:** Support for images (`.jpg`, `.png`, `.webp`) and multi-frame video extraction (`.mp4`, `.avi`, `.mov`).

---

## ⚙️ Project Architecture
```
TRINETRA/
├── app.py                      # Flask backend and API routing
├── requirements.txt            # System dependencies
├── detection/
│   ├── detector.py             # Vision Transformer (ViT) deepfake inference engine
│   └── video_detector.py       # OpenCV multi-frame extraction & temporal analysis
├── utils/
│   ├── fingerprint.py          # SHA-256 cryptographic hashing & integrity verification
│   └── forensics.py            # Error Level Analysis (ELA) & EXIF metadata inspection
├── templates/
│   └── index.html              # Frontend user interface
├── static/
│   ├── style.css               # Modern dark-mode forensic styling
│   └── script.js               # Reactive asynchronous client logic & certificate printer
└── uploads/                    # Secure local directory for analyzed media
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Virtual Environment (`venv`)

### 2. Setup & Installation
```powershell
# Clone or navigate to the repository directory
cd TRINETRA

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Running the Server
```powershell
python app.py
```
Open your browser and navigate to:
**`http://127.0.0.1:5000`**

---

## 🛡️ Key Features
- **Authenticity Assessment:** Get immediate Real / Fake classification with probabilistic confidence percentages.
- **Explainable Evidence:** Visual heatmap highlighting localized pixel and compression inconsistencies via Error Level Analysis.
- **Traceability Verification:** Compare candidate files against registered SHA-256 hashes to guarantee chain-of-custody and prevent tampering.
- **Forensic Audit Certificate:** Export printable forensic audit records containing complete provenance details.

---

## 🎯 Alignment with UN Sustainable Development Goals (SDGs)
- **SDG 16 (Peace, Justice and Strong Institutions):** Promotes trustworthy, verifiable, and accountable digital media.
- **SDG 9 (Industry, Innovation and Infrastructure):** Applies cutting-edge AI for digital security and media authentication.
"# TRINETRA" 
"# TRINETRA" 
