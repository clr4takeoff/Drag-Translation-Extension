chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translateText") {
        console.log("Received request to translate:", request.text);
        const apiKey = "";
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: request.text, target: "ko" })
        })
        .then(response => {
            console.log("API response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("API response data:", data);
            if (data.data && data.data.translations) {
                const translatedText = data.data.translations[0].translatedText;
                console.log("Translated text:", translatedText);
                chrome.storage.local.get({ wordList: [] }, storedData => {
                    const words = storedData.wordList;
                    words.push({ original: request.text, translation: translatedText });
                    chrome.storage.local.set({ wordList: words }, () => {
                        console.log("Word list saved in storage:", words);
                        // 팝업 갱신 메시지 전송 (로그 최소화)
                        chrome.runtime.sendMessage({ action: "updatePopup" }, () => {
                            if (chrome.runtime.lastError) {
                                // 팝업이 닫혀 있을 때 발생하는 오류는 무시
                                if (chrome.runtime.lastError.message !== "Could not establish connection. Receiving end does not exist.") {
                                    console.error("Failed to send updatePopup:", chrome.runtime.lastError.message);
                                }
                            } else {
                                console.log("updatePopup message sent successfully");
                            }
                        });
                    });
                });
                sendResponse({ translation: translatedText });
            } else {
                console.error("Invalid API response:", data);
                sendResponse({ error: "Invalid API response" });
            }
        })
        .catch(error => {
            console.error("Translation error:", error);
            sendResponse({ error: "Translation failed" });
        });

        return true;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url && (tab.url.startsWith("http") || tab.url.startsWith("https"))) {
        console.log("Re-injecting content.js into tab:", tabId);
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["js/content.js"]
        }).then(() => {
            console.log("Successfully injected content.js into tab:", tabId);
        }).catch(err => {
            console.error("Injection error in tab", tabId, ":", err);
        });
    }
});