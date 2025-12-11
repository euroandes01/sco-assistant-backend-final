document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyze-btn");
  const docInput = document.getElementById("doc-input");
  const docFile = document.getElementById("doc-file");

  analyzeBtn.addEventListener("click", () => {
    if (docFile.files.length > 0) {
      const file = docFile.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        analyzeDocument(content);
      };
      reader.readAsText(file);
    } else if (docInput.value.trim() !== "") {
      analyzeDocument(docInput.value.trim());
    } else {
      alert("Please paste the document content or upload a file.");
    }
  });
});

function analyzeDocument(content) {
  chrome.runtime.sendMessage({ action: "analyzeDocument", content: content }, (response) => {
    document.getElementById('risk-score').innerHTML =
      `${response.score || 'N/A'}<br><small>Indicates potential issues detected in the document (higher score = higher risk)</small>`;

    document.getElementById('red-flags').innerHTML =
      `${(response.redFlags || []).join(', ') || 'None'}<br><small>Examples: Allocation-based structure indicates conditional or limited arrangements</small>`;

    document.getElementById('procedure-quality').innerHTML =
      `Standard<br><small>Standard means the document follows usual procedure patterns</small>`;

    document.getElementById('legitimacy').innerHTML =
      `${response.recommendation || 'N/A'}<br><small>Low Risk means no high-risk content detected</small>`;
  });
}
