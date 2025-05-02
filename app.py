from flask import Flask, render_template, request, jsonify
from detox_logic import calculate_detox_scores  # Ensure this file exists and function is defined
import requests  # To make requests to the Gemini API
from dotenv import load_dotenv
import os
import google.generativeai as genai

app = Flask(__name__)

# Load environment variables for the API key
load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("API key for Gemini not found in environment variables.")

# Configure the Gemini API
genai.configure(api_key=gemini_api_key)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-2.0-flash')

def gemini_detox_qa(user_question):
    try:
        prompt = f"Answer the following user question with short, health-based detox advice. Focus on liver, brain, or heart detox:\n\n{user_question}"
        response = model.generate_content(prompt, generation_config={"max_output_tokens": 900})
        return response.text.strip() if hasattr(response, 'text') else "No valid response from Gemini."
        print(response.text.strip() if hasattr(response, 'text') else "No valid response from Gemini.")
    except Exception as e:
        return f"Error: {str(e)}"

# Function to simulate a request to the Gemini API using the prompt method
def gemini_prompt_suggestion(detox_scores):
    try:
        # Detailed prompt for generating suggestions
        prompt_text = f"""
        Based on the following detox scores, provide lifestyle and health suggestions for improvement:

        - Brain Detox Score: {detox_scores['brain']}%
        - Heart Detox Score: {detox_scores['heart']}%
        - Liver Detox Score: {detox_scores['liver']}%

        Suggest lifestyle, diet, or exercise changes that can help improve these scores in small and short tips as points for each organ specific (max 3 points for each organ)
        """

        # Call Gemini API for suggestions
        response = model.generate_content(prompt_text, generation_config={"max_output_tokens": 9000})

        # Check if the response has the 'text' attribute
        if hasattr(response, 'text'):
            return response.text.strip()
        else:
            return "Error: Invalid response format from Gemini API."
    
    except Exception as e:
        return f"Error generating detox suggestions: {str(e)}"

# Home route to render the HTML dashboard
@app.route('/')
def index():
    return render_template('index.html')

# Detox score calculation route
@app.route('/get-detox-score', methods=['POST'])
def get_detox_score():
    try:
        data = request.get_json()
        
        # Extracting the data
        brain, liver, heart, suggestion = calculate_detox_scores(data)
        
        # Prepare detox scores for the suggestion
        detox_scores = {'brain': brain, 'heart': heart, 'liver': liver}
        
        # Fetch suggestion from Gemini using the prompt method
        gemini_suggest = gemini_prompt_suggestion(detox_scores)
        
        # Return detox scores and suggestion in response
        return jsonify({
            'brain': brain,
            'liver': liver,
            'heart': heart,
            'suggestion': gemini_suggest  # Include suggestion from Gemini
        })
    
    except Exception as e:
        return jsonify({'error': f"Error: {str(e)}"})

# This route will serve the data dynamically to be displayed on frontend cards
@app.route('/get-detox-data', methods=['POST'])
def get_detox_data():
    try:
        user_data = request.get_json()  # Fetch user data sent from frontend (from chatbot)
        
        # Get detox scores based on data
        brain, liver, heart= calculate_detox_scores(user_data)

        # Prepare detox scores for the suggestion
        detox_scores = {'brain': brain, 'heart': heart, 'liver': liver}
        
        # Fetch suggestion from Gemini using the prompt method
        gemini_suggest = gemini_prompt_suggestion(detox_scores)

        # Pass the scores and suggestion back to frontend
        return jsonify({
            'brain_score': brain,
            'liver_score': liver,
            'heart_score': heart,
            'suggestion': gemini_suggest  # Include suggestion from Gemini
        })
    
    except Exception as e:
        print(f"Error in /get-detox-data route: {str(e)}")  # Debugging: Log exception
        return jsonify({'error': f"Error: {str(e)}"})
    
@app.route('/gemini-detox-qa', methods=['POST'])
def gemini_detox_qa_route():
    try:
        user_input = request.get_json().get('query')
        answer = gemini_detox_qa(user_input)  # Your custom Q&A handler
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'answer': f"Error: {str(e)}"})
    
if __name__ == '__main__':
    app.run(debug=True)