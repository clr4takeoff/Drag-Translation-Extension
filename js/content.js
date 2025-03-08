let lastRequestText = null;
let lastRequestTime = 0;
const REQUEST_COOLDOWN = 1000; // 1초 쿨다운

document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    const currentTime = Date.now();
    // 중복 요청 방지: 동일한 텍스트를 1초 이내에 다시 요청하지 않음
    if (selectedText === lastRequestText && (currentTime - lastRequestTime) < REQUEST_COOLDOWN) {
        console.log("Ignoring duplicate request for:", selectedText);
        return;
    }

    console.log("Selected text:", selectedText);
    try {
        if (chrome.runtime && chrome.runtime.sendMessage && chrome.runtime.id) {
            console.log("Sending message to background.js");
            chrome.runtime.sendMessage(
                { action: "translateText", text: selectedText },
                response => {
                    if (chrome.runtime.lastError) {
                        console.error("Message sending failed:", chrome.runtime.lastError.message);
                        alert("Error: Extension communication failed. Please reload the extension.");
                    } else if (response && response.translation) {
                        console.log("Received translation:", response.translation);
                        alert(`Translated: ${response.translation}`);
                    } else {
                        console.error("Translation failed:", response);
                        alert("Error: Translation failed.");
                    }
                }
            );
            lastRequestText = selectedText;
            lastRequestTime = currentTime;
        } else {
            throw new Error("Extension context unavailable");
        }
    } catch (error) {
        console.error("Error in content.js:", error.message);
        alert("Error: Extension context unavailable. Please reload the extension.");
    }
});