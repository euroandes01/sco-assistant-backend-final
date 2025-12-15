chrome.runtime.onInstalled.addListener(() => {
    console.log("✅ Background loaded");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== "analyzeDocument") return true;

    const content = (request.content || "").trim();
    const docType = request.docType || "letter"; // default Letter / Contract
    console.log("Background analyzing content, type:", docType);

    // --- Map points to Score using yesterday's weighted scoring ---
    function getScore(points) {
        if (points >= 80) return "Scam";       // Very high risk
        if (points >= 60) return "Unfair";     // High risk
        if (points >= 40) return "Neutral";    // Medium risk
        if (points >= 20) return "Fair";       // Low risk
        return "Very Fair";                     // Minimal risk
    }

    function getConclusion(score) {
        switch(score) {
            case "Very Fair": return "The Buyer can trust the document.";
            case "Fair": return "The Buyer can conditionally trust the document. Due Diligence for every transaction step is recommended.";
            case "Neutral": return "The Buyer cannot trust the document blindly. Probability of legitimacy vs scam is 50/50.";
            case "Unfair": return "The Buyer cannot trust the document. The document is probably a scam.";
            case "Scam":
            default: return "The Buyer cannot trust or approve the document. The document is a scam.";
        }
    }

    function getRedFlagScores(content) {
        let redFlags = [];
        let scorePoints = 0;

        // Yesterday's weighted scoring
        if (/act now|limited|last chance/i.test(content)) {
            redFlags.push('"Act Now"/"Limited"/"Last Chance"');
            scorePoints += 5;
        }
        if (/urgent|immediate/i.test(content)) {
            redFlags.push('"Urgent"/"Immediate"');
            scorePoints += 5;
        }
        if (/tt payment/i.test(content)) {
            redFlags.push('High-risk TT payment');
            scorePoints += 20;
        }
        if (/missing contact info/i.test(content)) {
            redFlags.push('Missing contact info');
            scorePoints += 30;
        }
        if (/suspicious wording/i.test(content)) {
            redFlags.push('Suspicious wording');
            scorePoints += 30;
        }
        if (/fob/i.test(content)) {
            scorePoints += 10;
        }

        // --- Additional checks for known high-risk companies/documents ---
        if (/saurida/i.test(content)) {
            redFlags.push('Company Saurida detected — verify legitimacy');
            scorePoints += 40; // bump into Neutral/Unfair range
        }

        if (/kg oil/i.test(content)) {
            redFlags.push('KG Oil detected — verify legitimacy');
            scorePoints += 30;
        }

        if (/allocation-based/i.test(content)) {
            redFlags.push('Allocation-based structure indicates conditional arrangements');
            scorePoints += 20;
        }

        return { scorePoints, redFlags };
    }

    const { scorePoints, redFlags } = getRedFlagScores(content);
    const score = getScore(scorePoints);
    const explanation = redFlags.length ? "The document failed the following checks: " + redFlags.join(", ") : "No critical issues detected.";
    const conclusion = getConclusion(score);

    sendResponse({ score, redFlags, explanation, conclusion });
    return true; // important for async
});
