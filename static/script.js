// Tab Switching
function switchTab(evt, tabId) {
    if (!tabId && typeof evt === 'string') {
        tabId = evt;
        evt = window.event;
    }
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add("active");

    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    } else {
        const btn = document.querySelector(`[onclick*="${tabId}"]`);
        if (btn) btn.classList.add("active");
    }
}

let selectedAnalyzeFile = null;
let selectedVerifyFile = null;
let currentAnalysisData = null;

function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        selectedAnalyzeFile = input.files[0];
        document.getElementById("fileNameDisplay").innerHTML = `Selected: <strong>${selectedAnalyzeFile.name}</strong> (${(selectedAnalyzeFile.size / 1024).toFixed(1)} KB)`;
    }
}

function handleVerifyFileSelect(input) {
    if (input.files && input.files[0]) {
        selectedVerifyFile = input.files[0];
        document.getElementById("verifyFileNameDisplay").innerHTML = `Selected: <strong>${selectedVerifyFile.name}</strong> (${(selectedVerifyFile.size / 1024).toFixed(1)} KB)`;
    }
}

// Drag & Drop Setup
function setupDragAndDrop() {
    const dropZone = document.getElementById("dropZone");
    if (!dropZone) return;

    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.borderColor = "#3b82f6";
            dropZone.style.background = "rgba(59, 130, 246, 0.1)";
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.borderColor = "";
            dropZone.style.background = "";
        }, false);
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            document.getElementById("mediaInput").files = files;
            handleFileSelect(document.getElementById("mediaInput"));
        }
    });
}
window.addEventListener("DOMContentLoaded", setupDragAndDrop);

// Forensic Analysis & AI Detection
async function runAnalysis() {
    if (!selectedAnalyzeFile) {
        alert("Please select an image or video file first.");
        return;
    }

    const analyzeBtn = document.getElementById("analyzeBtn");
    const loader = document.getElementById("analyzeLoader");
    const resultCard = document.getElementById("analysisResultCard");

    analyzeBtn.disabled = true;
    loader.style.display = "block";
    resultCard.style.display = "none";

    const formData = new FormData();
    formData.append("file", selectedAnalyzeFile);

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        loader.style.display = "none";
        analyzeBtn.disabled = false;

        if (!data.success) {
            alert(data.message || "Analysis failed.");
            return;
        }

        currentAnalysisData = data;
        renderAnalysisResults(data);
    } catch (err) {
        loader.style.display = "none";
        analyzeBtn.disabled = false;
        alert("An error occurred during analysis: " + err.message);
    }
}

function renderAnalysisResults(data) {
    const resultCard = document.getElementById("analysisResultCard");
    const banner = document.getElementById("verdictBanner");
    const verdictText = document.getElementById("verdictText");
    const verdictConfidence = document.getElementById("verdictConfidence");

    const isFake = data.detection.is_fake;
    const confidence = data.detection.confidence || 0;

    // Set Verdict
    verdictText.textContent = data.detection.prediction;
    verdictConfidence.textContent = `${confidence}% Confidence`;

    if (isFake) {
        banner.className = "verdict-banner fake";
    } else {
        banner.className = "verdict-banner real";
    }

    // Media Preview
    const mediaContainer = document.getElementById("mediaContainer");
    if (data.is_video) {
        mediaContainer.innerHTML = `<video controls style="max-width:100%; max-height:260px; border-radius:6px;" src="${data.media_url}"></video>`;
    } else {
        mediaContainer.innerHTML = `<img id="previewImg" src="${data.media_url}" style="max-width:100%; max-height:260px; border-radius:6px; object-fit:contain;" alt="Input Media">`;
    }

    document.getElementById("metaFilename").textContent = data.filename;
    document.getElementById("metaFilesize").textContent = `${data.file_size_kb} KB`;

    // ELA Explainability Preview
    const elaBox = document.getElementById("elaEvidenceBox");
    const elaImg = document.getElementById("elaImg");
    if (data.explainability.ela && data.explainability.ela.ela_image) {
        elaImg.src = data.explainability.ela.ela_image;
        if (elaBox) elaBox.style.display = "block";
    } else if (elaBox) {
        elaBox.style.display = "none";
    }

    // Fingerprint
    document.getElementById("fingerprintDisplay").textContent = data.fingerprint;

    // Signals & Metadata
    const signalsContainer = document.getElementById("signalsContainer");
    signalsContainer.innerHTML = "";

    const signals = (data.explainability.forensics && data.explainability.forensics.signals) || [];
    if (signals.length === 0) {
        signalsContainer.innerHTML = `<span style="color:#10b981; font-size:0.9rem;">✓ No suspicious metadata anomalies or editing software signatures found.</span>`;
    } else {
        signals.forEach(sig => {
            const badge = document.createElement("span");
            badge.className = "badge-tag";
            badge.textContent = `⚠️ ${sig}`;
            signalsContainer.appendChild(badge);
        });
    }

    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth" });
}

function copyFingerprint() {
    const text = document.getElementById("fingerprintDisplay").textContent.trim();
    if (text && text !== "-") {
        navigator.clipboard.writeText(text).then(() => {
            alert("Digital Fingerprint (SHA-256) copied to clipboard!");
        });
    }
}

// Print / Export Official Forensic Certificate
function printCertificate() {
    if (!currentAnalysisData) {
        alert("No analysis record available to generate certificate.");
        return;
    }
    const d = currentAnalysisData;
    const certWindow = window.open('', '_blank');
    const isFake = d.detection.is_fake;
    const verdictColor = isFake ? '#dc2626' : '#16a34a';

    const certHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>TRINETRA Forensic Certificate - ${d.filename}</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
            .cert-border { border: 4px double #3b82f6; padding: 35px; border-radius: 12px; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #1e3a8a; letter-spacing: 2px; }
            .header p { margin: 5px 0 0; color: #64748b; font-size: 0.95rem; }
            .badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 1.2rem; color: #fff; background: ${verdictColor}; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; }
            th { width: 35%; color: #475569; background: #f8fafc; }
            .hash { font-family: monospace; word-break: break-all; color: #0284c7; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.85rem; color: #94a3b8; }
            @media print {
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="cert-border">
            <div class="header">
                <h1>TRINETRA</h1>
                <p>Digital Authenticity Verification & Forensic Traceability Certificate</p>
                <div style="font-size: 0.8rem; margin-top: 4px; color: #475569;">Sahyadri College of Engineering & Management • Autonomous Institution</div>
            </div>
            <div style="text-align: center;">
                <div class="badge">${d.detection.prediction} (${d.detection.confidence}% Confidence)</div>
            </div>
            <table>
                <tr><th>Asset Filename</th><td>${d.filename}</td></tr>
                <tr><th>Timestamp (UTC)</th><td>${d.timestamp}</td></tr>
                <tr><th>Cryptographic Fingerprint (SHA-256)</th><td class="hash">${d.fingerprint}</td></tr>
                <tr><th>Model Architecture</th><td>Vision Transformer (ViT-Base Deepfake Detector)</td></tr>
                <tr><th>Explainability Method</th><td>Error Level Analysis (ELA) + EXIF Metadata Forensics</td></tr>
                <tr><th>Verification Status</th><td><strong>${isFake ? 'MANIPULATION DETECTED' : 'CRYPTOGRAPHIC INTEGRITY ASSURED'}</strong></td></tr>
            </table>
            <div class="footer">
                <p>This automated certificate was generated by the TRINETRA AI forensic verification framework.</p>
                <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px; font-weight: bold;">🖨️ Print / Save as PDF</button>
            </div>
        </div>
    </body>
    </html>
    `;
    certWindow.document.write(certHtml);
    certWindow.document.close();
}

// Verification against reference fingerprint
async function runVerification() {
    if (!selectedVerifyFile) {
        alert("Please select a file to verify.");
        return;
    }

    const expectedHash = document.getElementById("expectedHashInput").value.trim();
    if (!expectedHash) {
        alert("Please paste the original recorded SHA-256 fingerprint.");
        return;
    }

    const verifyBtn = document.getElementById("verifyBtn");
    const loader = document.getElementById("verifyLoader");
    const outcomeBox = document.getElementById("verifyOutcome");

    verifyBtn.disabled = true;
    loader.style.display = "block";
    outcomeBox.style.display = "none";

    const formData = new FormData();
    formData.append("file", selectedVerifyFile);
    formData.append("expected_hash", expectedHash);

    try {
        const response = await fetch("/verify", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        loader.style.display = "none";
        verifyBtn.disabled = false;

        outcomeBox.style.display = "block";
        if (data.match) {
            outcomeBox.className = "verify-alert match";
            outcomeBox.innerHTML = `
                <div>✅ <strong>MATCH! File Integrity Verified</strong></div>
                <div style="font-size: 0.85rem; font-weight: normal; margin-top: 6px;">
                    The computed SHA-256 matches the registered fingerprint exactly. The file is authentic and unaltered.
                </div>
            `;
        } else {
            outcomeBox.className = "verify-alert diff";
            outcomeBox.innerHTML = `
                <div>❌ <strong>INTEGRITY ALERT: Content Differs from Record</strong></div>
                <div style="font-size: 0.85rem; font-weight: normal; margin-top: 6px;">
                    <div><strong>Current SHA-256:</strong> <code style="word-break:break-all;">${data.current_hash}</code></div>
                    <div><strong>Expected SHA-256:</strong> <code style="word-break:break-all;">${data.expected_hash}</code></div>
                    <p style="margin-top:6px; color:#fca5a5;">The content has been modified, tampered with, or re-compressed since its original registration.</p>
                </div>
            `;
        }
    } catch (err) {
        loader.style.display = "none";
        verifyBtn.disabled = false;
        alert("Verification failed: " + err.message);
    }
}
