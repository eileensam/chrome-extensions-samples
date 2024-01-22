// background.js

// Set the initial condition state
chrome.storage.local.set({ condition: true });

// Function to toggle the condition state every 5 seconds
//setInterval(() => {
//  chrome.storage.local.get('condition', ({ condition }) => {
//    const newCondition = !condition;
//    chrome.storage.local.set({ condition: newCondition });
//  });
//}, 5000);

// Function to perform the API call and update the condition state
async function updateConditionBasedOnAPI() {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const data = await response.json();

    // Extract relevant information from the API response
    team_one = data.events[0].competitions[0].competitors[0].score
    team_two = data.events[0].competitions[0].competitors[1].score
    const isTeamWinning = Number(team_one) > Number(team_two)
;

    console.log("Bills score: " + team_one)
    console.log("Chiefs score: " + team_two)

    // Update the condition state in chrome.storage.local
    chrome.storage.local.set({ condition: isTeamWinning });
  } catch (error) {
    console.error('Error fetching API:', error);
  }
}

// Perform the API update every 5 ms (adjust the interval as needed)
game_still_active = false;
if (game_still_active) {
    setInterval(updateConditionBasedOnAPI, 5);
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.updateCondition !== undefined) {
    // Update the condition based on the message
    chrome.storage.local.set({ condition: request.updateCondition });
  }
});

// Listen for changes to the condition state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.condition) {
    const newCondition = changes.condition.newValue;

    // Set the icon based on the new condition state
    const iconPath = newCondition ? 'winning.png' : 'losing.png';
    chrome.action.setIcon({ path: { 16: iconPath } });
  }
});
