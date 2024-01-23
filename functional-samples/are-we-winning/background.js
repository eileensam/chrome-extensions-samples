// background.js

// Set the initial condition state
chrome.storage.local.set({ condition: true });

// Function to perform the API call and update the condition state
async function updateConditionBasedOnAPI() {
  try {
    const api = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard'
    const response = await fetch(api);
    const data = await response.json();

    // Extract relevant information from the API response
    team_one = data.events[0].competitions[0].competitors[0];
    team_one_score = team_one.score
    team_one_name = team_one.team.abbreviation;
    team_two = data.events[0].competitions[0].competitors[1];
    team_two_score = team_two.score;
    team_two_name = team_two.team.abbreviation;

    unc = null
    other = null
    if (team_one_name == "UNC") {
        unc = team_one
        other = team_two
    } else {
        unc = team_two
        other = team_one
    }

    const isTeamWinning = Number(unc.score) > Number(other.score);
    console.log("isTeamWinning: " + isTeamWinning)

    console.log(team_one_name + " score: " + team_one_score)
    console.log(team_two_name + " score: " + team_two_score)

    // Update the condition state in chrome.storage.local
    chrome.storage.local.set({ condition: isTeamWinning });
  } catch (error) {
    console.error('Error fetching API:', error);
  }
}

// Perform the API update every 5 ms (adjust the interval as needed)
game_still_active = true;
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
