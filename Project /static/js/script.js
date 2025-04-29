// Store user input data for detox calculation
let userData = {};
let detoxScores = { brain: 'N/A', heart: 'N/A', liver: 'N/A' };
let questionIndex = 0;
let inTestMode = false; // NEW FLAG

// Questions for the chatbot to ask
const questions = [
  "How many glasses of water did you drink today?",
  "On a scale of 1 to 10, how would you rate your stress level?",
  "How many hours of screen time did you have before bed?",
  "How many hours of sleep did you get last night?",
  "How many hours of exercise did you do today?",
  "At what time did you have your dinner today? (Please enter in HH:MM format)"
];

// Keywords to trigger detox test
const detoxKeywords = ['detox test', 'detox score', 'start test', 'start detox'];

// Toggle chatbot popup visibility
function toggleChatbot() {
  const chatbotPopup = document.getElementById('chatbot-popup');

  if (chatbotPopup.style.display === 'none' || chatbotPopup.style.display === '') {
    chatbotPopup.style.display = 'block';

    // Reset conversation and start fresh
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML = '';

    userData = {};
    detoxScores = { brain: 'N/A', heart: 'N/A', liver: 'N/A' };
    questionIndex = 0;
    inTestMode = false;

    startConversation();
    document.getElementById('user-input').focus();
  } else {
    chatbotPopup.style.display = 'none';
  }
}

// Append a message to the chatbox
function appendMessage(sender, text) {
  const chatbox = document.getElementById('chatbox');
  const msg = document.createElement('div');
  msg.classList.add('chat-message', sender);
  msg.textContent = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Start the conversation
function startConversation() {
  appendMessage('bot', "👋 Hello! I'm your Detox Assistant. How can I help you today? (Type 'start test' for detox test) ");
}

// Send message to chatbot and handle input
function sendMessage() {
  const input = document.getElementById('user-input');
  const userMessage = input.value.trim();
  if (userMessage === '') return;

  appendMessage('user', userMessage);
  input.value = '';

  // Process user input
  processUserInput(userMessage);
}

// Process user input
function processUserInput(input) {
  const lowerInput = input.toLowerCase();
  
  if (!inTestMode) {
    // Check if user wants to start detox test
    if (detoxKeywords.some(keyword => lowerInput.includes(keyword))) {
      inTestMode = true;
      questionIndex = 0;
      appendMessage('bot', "🧪 Starting your Detox Test!");
      setTimeout(() => {
        appendMessage('bot', questions[questionIndex]);
      }, 800);
    } else {
      // Otherwise, handle as general question
      answerGeneralQuery(input);
    }
  } else {
    // User is in test mode, continue asking questions
    handleTestQuestions(input);
  }
}

// Handle detox survey questions
function handleTestQuestions(input) {
  let userMessageProcessed = false;

  if (questionIndex === 0 && !isNaN(parseFloat(input))) {
    userData.water = parseFloat(input);
    appendMessage('bot', `Got it! Water intake: ${input} glasses.`);
    userMessageProcessed = true;
  } else if (questionIndex === 1 && !isNaN(parseInt(input)) && parseInt(input) >= 1 && parseInt(input) <= 10) {
    userData.stress = parseInt(input);
    appendMessage('bot', `Stress level recorded: ${input}/10.`);
    userMessageProcessed = true;
  } else if (questionIndex === 2 && !isNaN(parseFloat(input))) {
    userData.screen = parseFloat(input);
    appendMessage('bot', `Screen time noted: ${input} hour(s).`);
    userMessageProcessed = true;
  } else if (questionIndex === 3 && !isNaN(parseFloat(input))) {
    userData.sleep = parseFloat(input);
    appendMessage('bot', `Sleep duration: ${input} hour(s).`);
    userMessageProcessed = true;
  } else if (questionIndex === 4 && !isNaN(parseFloat(input))) {
    userData.exercise = parseFloat(input);
    appendMessage('bot', `Exercise duration: ${input} hour(s).`);
    userMessageProcessed = true;
  } else if (questionIndex === 5 && input.match(/\d{1,2}:\d{2}/)) {
    userData.meal = input;
    appendMessage('bot', `Dinner time recorded as ${input}.`);
    userMessageProcessed = true;
  } else {
    appendMessage('bot', `⚠️ Please provide a valid response.`);
    return;
  }

  if (userMessageProcessed && questionIndex < questions.length - 1) {
    questionIndex++;
    setTimeout(() => {
      appendMessage('bot', questions[questionIndex]);
    }, 600);
  } else if (questionIndex === questions.length - 1) {
    fetchDetoxScores(userData);
    inTestMode = false; // Reset mode
  }
}

// Fetch detox scores from backend
function fetchDetoxScores(data) {
  fetch('/get-detox-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('brain-score').textContent = data.brain !== undefined ? `${data.brain}%` : 'N/A';
      document.getElementById('heart-score').textContent = data.heart !== undefined ? `${data.heart}%` : 'N/A';
      document.getElementById('liver-score').textContent = data.liver !== undefined ? `${data.liver}%` : 'N/A';

      appendMessage('bot', ` Calculating your detox score... `);
      setTimeout(() => {
        appendMessage('bot', `✅ Your detox scores are ready! 🧠: ${data.brain}% 💓: ${data.heart}% 🩺: ${data.liver}%`);
      }, 1000);

      setTimeout(() => {
        appendMessage('bot', 'Let\'s improve these scores!');
      }, 2000);

      const suggestionElement = document.getElementById('suggestion');
      if (suggestionElement) {
        suggestionElement.textContent = 'Fetching suggestions...';
        fetchGeminiSuggestions(data)
          .then(suggestion => {
            suggestionElement.textContent = `Suggestion: ${suggestion}`;
          })
          .catch(err => {
            suggestionElement.textContent = 'No suggestion available.';
            console.error('Error fetching Gemini suggestions:', err);
          });
      }
      setTimeout(() => {
        appendMessage('bot', `${data.suggestion}`);
      }, 3000);

      detoxScores = { brain: data.brain, heart: data.heart, liver: data.liver };
    })
    .catch(error => console.error('Error fetching detox scores:', error));
}

// Handle general sleep detox queries
function answerGeneralQuery(input) {
  fetch('/gemini-detox-qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: input }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.answer) {
        appendMessage('bot', data.answer);
      } else {
        appendMessage('bot', 'Sorry, I could not find a good answer.');
      }
    })
    .catch(error => {
      console.error('Error answering query:', error);
      appendMessage('bot', 'An error occurred while fetching the answer.');
    });
}

// Fetch Gemini suggestions (no changes)
async function fetchGeminiSuggestions(userData) {
  return fetch('/get-detox-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return response.json();
    })
    .then(data => {
      return data.suggestion || 'No suggestions available.';
    })
    .catch(error => {
      console.error('Error fetching suggestions:', error);
      return 'Sorry, there was an error fetching suggestions.';
    });
}

// Initialize input listeners
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('user-input');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
});
