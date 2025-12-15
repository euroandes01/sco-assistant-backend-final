document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('sco-file');
    const fileNameSpan = document.getElementById('file-name');
    const analyzeBtn = document.getElementById('analyze-btn');
    const scoContentInput = document.getElementById('sco-content');
    const reportSection = document.getElementById('report-section');
    const scrollableContent = document.getElementById('scrollable-content');

    // Clear textarea and report when selecting a new file
    fileInput.addEventListener('change', () => {
        scoContentInput.value = '';        // Clear textarea
        reportSection.innerHTML = '';      // Clear report

        const file = fileInput.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            readFile(file);
        } else {
            fileNameSpan.textContent = 'No file chosen';
        }
    });

    // Read file content
    function readFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            scoContentInput.value = e.target.result;
        };
        reader.readAsText(file);
    }

    // Analyze button click
    analyzeBtn.addEventListener('click', () => {
        const content = scoContentInput.value.trim();
        if (!content) {
            alert('Please enter SCO content or select a file first.');
            return;
        }
        const report = generateReport(content);
        displayReport(report);
    });

    // Generate report (simple example, replace with your logic)
    function generateReport(text) {
        const words = text.split(/\s+/).length;
        const isFake = /urgent|act now|limited/i.test(text);
        return {
            wordCount: words,
            fakeOffer: isFake ? 'Possible Scam' : 'Looks OK',
        };
    }

    // Display report
    function displayReport(report) {
        reportSection.innerHTML = `
            <p><strong>Word Count:</strong> ${report.wordCount}</p>
            <p><strong>Scam Check:</strong> ${report.fakeOffer}</p>
        `;
        scrollableContent.scrollTop = 0;
    }
});
