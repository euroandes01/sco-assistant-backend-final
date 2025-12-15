// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('sco-file');
    const fileNameSpan = document.getElementById('file-name');
    const analyzeBtn = document.getElementById('analyze-btn');
    const scoContentInput = document.getElementById('sco-content');
    const reportSection = document.getElementById('report-section');
    const container = document.getElementById('input-section');
    const docTypeSelect = document.getElementById('doc-type');

    const premiumInput = document.getElementById('premium-code');
    const premiumBtn = document.getElementById('premium-btn');

    const isPremium = localStorage.getItem("premium") === "true";

    premiumBtn.addEventListener('click', () => {
    const code = premiumInput.value.trim();

    if (!code) {
        alert("Please enter a premium code.");
        return;
    }

    // TEMP logic (can be replaced later)
    if (code === "PREMIUM2025") {
        alert("Premium activated ✅");
        localStorage.setItem("premium", "true");
    } else {
        alert("Invalid premium code ❌");
    }
   });


    // Store uploaded file content separately
    let uploadedFileContent = "";

    // --- File input display & read content ---
    fileInput.addEventListener('change', function () {
        const file = this.files[0];
        fileNameSpan.textContent = file ? file.name : 'No file chosen';

        // Clear textarea immediately
        scoContentInput.value = '';
        uploadedFileContent = "";

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedFileContent = e.target.result; // store for analysis
            };
            reader.readAsText(file);
        }
    });

    // --- Analyze button click ---
    analyzeBtn.addEventListener('click', () => {
        // Use textarea content first, else uploaded file content
        const content = (scoContentInput?.value || uploadedFileContent || "").trim();
        if (!content) {
            alert("Please paste or upload a document before analyzing.");
            return;
        }

        const docType = docTypeSelect ? docTypeSelect.value : "letter";

        chrome.runtime.sendMessage(
            { action: "analyzeDocument", content, docType },
            (response) => {
                const reportHTML = `
                    <h2>Analysis Report</h2>
                    <p><strong>Score:</strong> ${response.score}</p>

                    <h3>Red Flags</h3>
                    ${response.redFlags.length
                        ? `<ul>${response.redFlags.map(f => `<li>${f}</li>`).join('')}</ul>`
                        : "<p>No red flags detected.</p>"}

                    <h3>Explanation</h3>
                    <p>${response.explanation}</p>

                    <h3>Conclusion</h3>
                    <p>${response.conclusion}</p>

                    <button id="back-btn">Back</button>
                `;

                reportSection.innerHTML = reportHTML;
                reportSection.style.display = 'block';
                container.style.display = 'none';
            }
        );
    });

      // Initially hide the button
         const fullReportBtn = document.getElementById("open-tab-btn");
         fullReportBtn.style.display = "none";

      // After analysis completes
         function showFullReportButton() {
         fullReportBtn.style.display = "block";
        }

      // Open report on click
         fullReportBtn.addEventListener("click", () => {
         chrome.tabs.create({
         url: chrome.runtime.getURL("report.html")
         });
      });


    // --- Back button ---
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'back-btn') {
            reportSection.style.display = 'none';
            reportSection.innerHTML = '';
            container.style.display = 'block';
            scoContentInput.value = '';
            fileInput.value = '';
            fileNameSpan.textContent = 'No file chosen';
            uploadedFileContent = '';
            docTypeSelect.value = 'letter'; // Reset to default
        }
    });
});
