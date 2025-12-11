chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Background loaded");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "analyzeDocument") return true;

  const content = request.content || "";

  // ---- DOCUMENT ANALYSIS ----
  let score = 0;
  let redFlags = [];

  if (/TT PAYMENT/i.test(content)) {
    score += 25;
    redFlags.push("High-risk TT payment");
  }

  if (/ALLOCATION/i.test(content)) {
    score += 23;
    redFlags.push("Allocation-based structure");
  }

  // ---- RECOMMENDATION BASED ON SCORE ----
  const recommendation =
    score >= 70 ? "HIGH RISK – Do not proceed" :
    score >= 40 ? "MEDIUM RISK – Extra due diligence required" :
    "LOW RISK – Standard verification";

  sendResponse({
    score,
    redFlags,
    recommendation
  });

  return true;
});
