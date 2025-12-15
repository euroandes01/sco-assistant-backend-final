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

    const helpContainer = document.getElementById('help-container');
    const helpBtn = document.getElementById('help-btn');
    const helpContent = document.getElementById('help-content');

    // Show/Hide help
    helpBtn?.addEventListener('click', () => {
        helpContent.style.display = helpContent.style.display === 'none' ? 'block' : 'none';
    });

    // Premium code
    premiumBtn.addEventListener('click', () => {
        const code = premiumInput.value.trim();
        if (!code) { alert("Please enter a premium code."); return; }
        if (code === "PREMIUM2025") {
            alert("Premium activated ✅");
            localStorage.setItem("premium", "true");
        } else {
            alert("Invalid premium code ❌");
        }
    });

    // File upload
    let uploadedFileContent = "";
    fileInput.addEventListener('change', function () {
        const file = this.files[0];
        fileNameSpan.textContent = file ? file.name : 'No file chosen';
        scoContentInput.value = '';
        uploadedFileContent = "";
        if (file) {
            const reader = new FileReader();
            reader.onload = e => uploadedFileContent = e.target.result;
            reader.readAsText(file);
        }
    });

    // Analyze button
    analyzeBtn.addEventListener('click', () => {
        const content = (scoContentInput?.value || uploadedFileContent || "").trim();
        if (!content) { alert("Please paste or upload a document before analyzing."); return; }
        const docType = docTypeSelect ? docTypeSelect.value : "letter";

        chrome.runtime.sendMessage({ action: "analyzeDocument", content, docType }, (response) => {
            // Popup report
            reportSection.innerHTML = `
                <h2>Analysis Report</h2>
                <p><strong>Score:</strong> ${response.score}</p>
                <h3>Red Flags</h3>
                ${response.redFlags.length ? `<ul>${response.redFlags.map(f => `<li>${f}</li>`).join('')}</ul>` : "<p>No red flags detected.</p>"}
                <h3>Explanation</h3>
                <p>${response.explanation}</p>
                <h3>Conclusion</h3>
                <p>${response.conclusion}</p>
                <button id="back-btn">Back</button>
            `;
            reportSection.style.display = 'block';
            container.style.display = 'none';

            // Free report in new tab
            const freeReportHTML = `
                <h2>Free SCO Report</h2>
                <p><strong>Score:</strong> ${response.score}</p>
                <h3>Red Flags</h3>
                ${response.redFlags.length ? `<ul>${response.redFlags.map(f => `<li>${f}</li>`).join('')}</ul>` : "<p>No red flags detected.</p>"}
            `;
            const newTab = window.open();
            newTab.document.write(`
                <html>
                <head>
                    <title>SCO Free Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { color: #333; }
                        ul { padding-left: 20px; }
                    </style>
                </head>
                <body>
                    ${freeReportHTML}
                </body>
                </html>
            `);
            newTab.document.close();
        });
    });

    // Back button
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'back-btn') {
            reportSection.style.display = 'none';
            reportSection.innerHTML = '';
            container.style.display = 'block';
            scoContentInput.value = '';
            fileInput.value = '';
            fileNameSpan.textContent = 'No file chosen';
            uploadedFileContent = '';
            docTypeSelect.value = 'letter';
        }
    });
});
