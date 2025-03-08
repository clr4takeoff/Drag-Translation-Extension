document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['wordList'], (result) => {
      const wordList = result.wordList || [];
      const ul = document.getElementById('wordList');
      wordList.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.original} -> ${item.translated} (${new Date(item.timestamp).toLocaleString()})`;
        ul.appendChild(li);
      });
    });
  });