chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    const text = request.text;
    const url = `https://translate.google.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const translatedText = data[0][0][0]; // 번역된 텍스트 추출
        saveToWordList(text, translatedText);
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "단어 추가됨",
          message: `${text} -> ${translatedText}`
        });
      })
      .catch(error => console.error('Translation error:', error));
  }
});

function saveToWordList(original, translated) {
  chrome.storage.local.get(['wordList'], (result) => {
    const wordList = result.wordList || [];
    wordList.push({ original, translated, timestamp: Date.now() });
    chrome.storage.local.set({ wordList });
  });
}