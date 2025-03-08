function updateWordList() {
    const wordListElement = document.getElementById("wordList");
    if (!wordListElement) {
        console.error("wordList element not found in popup.html");
        return;
    }
    wordListElement.innerHTML = "";
    chrome.storage.local.get("wordList", data => {
        if (chrome.runtime.lastError) {
            console.error("Failed to load word list from storage:", chrome.runtime.lastError);
            wordListElement.innerHTML = "<li>Error loading word list.</li>";
            return;
        }
        console.log("Loaded word list from storage in popup:", data.wordList);
        if (data.wordList && data.wordList.length > 0) {
            data.wordList.forEach(entry => {
                if (typeof entry !== "object" || !entry) {
                    console.warn("Invalid entry in word list (not an object):", entry);
                    return;
                }
                const original = entry.original || entry.originalText || "Unknown";
                const translation = entry.translation || entry.translated || "Unknown";
                const li = document.createElement("li");
                li.textContent = `${original} - ${translation}`;
                wordListElement.appendChild(li);
            });
        } else {
            console.log("No word list found in storage or empty list");
            wordListElement.innerHTML = "<li>No words added yet.</li>";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup loaded, updating word list");
    updateWordList();
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updatePopup") {
        console.log("Received updatePopup message in popup");
        updateWordList();
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.wordList) {
        console.log("Storage changed, updating popup:", changes.wordList.newValue);
        updateWordList();
    }
});