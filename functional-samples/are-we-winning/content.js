// hello.js

// Retrieve the value from chrome.storage.local
chrome.storage.local.get('valueFromBackground', ({ valueFromBackground }) => {
  // Update the HTML with the retrieved value
  document.getElementById('messageFromBackground').innerText = valueFromBackground;
});
