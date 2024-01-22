console.log('This is a popup!');

// Assuming you have a condition to determine which icon to use
const condition = true; // Replace with your actual condition

// Set the icon based on the condition
if (condition) {
  chrome.action.setIcon({ path: {
  16: "winning.png"
  } });
} else {
  chrome.action.setIcon({ path: {
  16: "losing.png"
  } });
}

