// Store user input data for detox calculation
let userData = {};
let detoxScores = { brain: 'N/A', heart: 'N/A', liver: 'N/A' };  // Initial scores set to N/A
let questionIndex = 0;  // To track the current question index

// Questions for the chatbot to ask in sequence
const questions = [
  "How many glasses of water did you drink today?",
  "On a scale of 1 to 10, how would you rate your stress level?",
  "How many hours of screen time did you have before bed?",
  "How many hours of sleep did you get last night?",
  "How many hours of exercise did you do today?",
  "At what time did you have your dinner today? (Please enter in HH:MM format)"
];

// Toggle chatbot popup visibility
function toggleChatbot() {
  const chatbotPopup = document.getElementById('chatbot-popup');
  chatbotPopup.style.display = chatbotPopup.style.display === 'none' || chatbotPopup.style.display === '' ? 'block' : 'none';

  // Focus the input when opened
  if (chatbotPopup.style.display === 'block') {
    document.getElementById('user-input').focus();
  }
}

// Append a message to the chatbox
function appendMessage(sender, text) {
  const chatbox = document.getElementById('chatbox');
  const msg = document.createElement('div');
  msg.classList.add('chat-message', sender);
  msg.textContent = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll
}

// Start the conversation and ask the first question
function startConversation() {
  appendMessage('bot', questions[questionIndex]);
  document.getElementById('user-input').focus();
}

// Send message to chatbot and handle input
function sendMessage() {
  const input = document.getElementById('user-input');
  const userMessage = input.value.trim();
  if (userMessage === '') return;

  appendMessage('user', userMessage);
  input.value = '';

  // Process user input and store it for detox score calculation
  processUserInput(userMessage);
}

// Process user input and store it
function processUserInput(input) {
  // Flag to indicate message has been processed
  let userMessageProcessed = false;

  // Collect data based on current question
  if (questionIndex === 0 && !isNaN(parseFloat(input))) {  // Water intake
    userData.water = parseFloat(input);
    appendMessage('bot', `Got it! Your water intake is noted as ${input} glasses. Let's move on to the next question.`);
    userMessageProcessed = true;
  } else if (questionIndex === 1 && !isNaN(parseInt(input)) && parseInt(input) >= 1 && parseInt(input) <= 10) {  // Stress level
    userData.stress = parseInt(input);
    appendMessage('bot', `Noted! Your stress level is ${input}/10. Let's continue.`);
    userMessageProcessed = true;
  } else if (questionIndex === 2 && !isNaN(parseFloat(input))) {  // Screen time
    userData.screen = parseFloat(input);
    appendMessage('bot', `Got it! Your screen time before bed is recorded as ${input} hour(s). Let's continue.`);
    userMessageProcessed = true;
  } else if (questionIndex === 3 && !isNaN(parseFloat(input))) {  // Sleep hours
    userData.sleep = parseFloat(input);
    appendMessage('bot', `Got it! Your sleep duration is recorded as ${input} hour(s). Let's continue.`);
    userMessageProcessed = true;
  } else if (questionIndex === 4 && !isNaN(parseFloat(input))) {  // Exercise duration
    userData.exercise = parseFloat(input);
    appendMessage('bot', `Got it! Your exercise duration is recorded as ${input} hour(s). Let's move to the final question.`);
    userMessageProcessed = true;
  } else if (questionIndex === 5 && input.match(/\d{1,2}:\d{2}/)) {  // Meal time
    userData.meal = input;
    appendMessage('bot', `Got it! Your dinner time is recorded as ${input}. Let's calculate your detox score.`);
    userMessageProcessed = true;
  } else {
    // If input is invalid, ask again for the current question
    appendMessage('bot', `Please provide a valid response for this question.`);
    return;
  }

  // Move to the next question if processed, else stay on the current question
  if (userMessageProcessed && questionIndex < questions.length - 1) {
    questionIndex++;
    setTimeout(() => {
      appendMessage('bot', questions[questionIndex]);  // Ask next question
    }, 500);
  } else if (questionIndex === questions.length - 1) {
    // After all questions are answered, send the data to the backend for detox score calculation
    fetchDetoxScores(userData);
  }
}

// Send the collected user data to the backend for detox score calculation and suggestions
function fetchDetoxScores(data) {
  fetch('/get-detox-score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      // Update detox scores dynamically in the frontend
      document.getElementById('brain-score').textContent = data.brain !== undefined ? `${data.brain}%` : 'N/A';
      document.getElementById('heart-score').textContent = data.heart !== undefined ? `${data.heart}%` : 'N/A';
      document.getElementById('liver-score').textContent = data.liver !== undefined ? `${data.liver}%` : 'N/A';

      // Optionally display suggestion (if any)
      const suggestionElement = document.getElementById('suggestion');
      if (suggestionElement) {
        suggestionElement.textContent = 'Fetching suggestions to improve your detox...';

        // Now call the Gemini API to get improvement suggestions
        fetchGeminiSuggestions(data)
          .then(suggestion => {
            suggestionElement.textContent = `Suggestion: ${suggestion}`;
          })
          .catch(err => {
            suggestionElement.textContent = 'No suggestion available at the moment.';
            console.error('Error fetching Gemini suggestions:', err);
          });
      }

      // Display the detox scores once they are calculated
      appendMessage('bot', `Your detox scores are ready! 🧠: ${data.brain}% 💓: ${data.heart}% 🩺: ${data.liver}%`);

      appendMessage('bot', 'Let\'s see how to improve these scores!');

      appendMessage('bot', `${data.suggestion}`)

      // Store the updated scores for future use
      detoxScores = { brain: data.brain, heart: data.heart, liver: data.liver };
    })
    .catch(error => console.error('Error fetching detox scores:', error));
}

async function fetchGeminiSuggestions(userData) {
  return fetch('/get-detox-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  })
  .then(response => {
    // Check if the response is successful
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    return response.json();
  })
  .then(data => {
    const suggestion = data.suggestion || 'No suggestions available.';
    return suggestion;
  })
  .catch(error => {
    console.error('Error fetching detox suggestions:', error);
    return 'Sorry, there was an error fetching suggestions.';
  });
}

// Initialize the chatbot
document.addEventListener('DOMContentLoaded', () => {
  startConversation();  // Start the chatbot by asking the first question
  const input = document.getElementById('user-input');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
});