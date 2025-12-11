const textarea = document.getElementById("sco-content");
const fileInput = document.getElementById("sco-file");
const fileNameDisplay = document.getElementById("file-name");
const analyzeBtn = document.getElementById("analyze-btn");

// Mutually exclusive behavior
textarea.addEventListener("input", () => {
    if (textarea.value.trim().length > 0) {
        fileInput.disabled = true;
        fileNameDisplay.textContent = "File upload disabled while pasting text";
    } else {
        fileInput.disabled = false;
        fileNameDisplay.textContent = "No file chosen";
    }
});

fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        textarea.value = "";
        textarea.disabled = true;
        fileNameDisplay.textContent = fileInput.files[0].name;
    } else {
        textarea.disabled = false;
        fileNameDisplay.textContent = "No file chosen";
    }
});

// Analyze button click
analyzeBtn.addEventListener("click", () => {
    let content = "";

    if (!textarea.disabled && textarea.value.trim().length > 0) {
        content = textarea.value.trim();
    } else if (!fileInput.disabled && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            content = e.target.result;
            sendForAnalysis(content);
        };
        reader.readAsText(fileInput.files[0]);
        return;
    } else {
        alert("Please paste text or upload a SCO file.");
        return;
    }

    sendForAnalysis(content);
});

function sendForAnalysis(content) {
    chrome.runtime.sendMessage({ action: "analyzeDocument", content }, (response) => {
        if (!response) return;

        // Risk Score
        const riskScoreEl = document.getElementById("risk-score");
        const riskExplanationEl = document.getElementById("risk-explanation");
        let color = "#2a73ff";
        let riskText = "Low Risk – Standard verification";

        if (response.score >= 70) {
            color = "#ff4d4f";
            riskText = "High Risk – Do not proceed";
        } else if (response.score >= 40) {
            color = "#faad14";
            riskText = "Medium Risk – Extra due diligence required";
        } else {
            color = "#52c41a";
            riskText = "Low Risk – Standard verification";
        }

        riskScoreEl.innerText = response.score;
        riskScoreEl.style.color = color;
        riskExplanationEl.innerText = riskText;

        // Red Flags
        const redFlagsEl = document.getElementById("red-flags");
        const redFlagsExplanationEl = document.getElementById("redflags-explanation");
        if (response.redFlags.length > 0) {
            redFlagsEl.innerHTML = response.redFlags.map(f => `<li>${f}</li>`).join("");
            redFlagsExplanationEl.innerText = "Issues detected that may require attention.";
        } else {
            redFlagsEl.innerHTML = "<li>None detected</li>";
            redFlagsExplanationEl.innerText = "No obvious risks found in the document.";
        }

        // Recommendation
        const recommendationEl = document.getElementById("recommendation");
        const recommendationExplanationEl = document.getElementById("recommendation-explanation");
        recommendationEl.innerText = response.recommendation;
        recommendationEl.style.color = color;
        recommendationExplanationEl.innerText = "Suggested next step based on risk analysis.";
    });
}
