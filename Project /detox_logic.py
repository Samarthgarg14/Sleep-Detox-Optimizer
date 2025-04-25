import random

def calculate_detox_scores(data):
    # Sample input data based on user inputs
    water = data.get("water", 0)
    dinner = data.get("meal", "20:00")  # Dinner time in HH:MM
    screen = data.get("screen_time", 0)  # Screen time in hours
    stress = data.get("stress", 3)  # Stress level (0-10 scale)
    hr = data.get("heart_rate", 70)  # Heart rate (e.g., 70 bpm)
    sleep = data.get("sleep", 6)  # Sleep duration in hours
    pulse = data.get("pulse", 75)  # Pulse rate (e.g., 75 bpm)
    exercise = data.get("exercise", 0)  # Exercise in minutes per week

    # **Brain Detox Score Calculation:**
    # Brain detox affected by screen time, stress, and sleep duration
    brain_score = max(0, 100 - (screen * 10 + stress * 5 + (8 - sleep) * 3))

    # **Heart Detox Score Calculation:**
    # Heart detox affected by heart rate, stress, and exercise levels
    optimal_heart_rate = 70
    heart_score = max(0, 100 - abs(hr - optimal_heart_rate) * 1.5 - stress * 2 + (exercise / 30) * 5)

    # **Liver Detox Score Calculation:**
    # Liver detox affected by water intake, late dinner, and stress
    liver_score = max(0, 100 - (late_dinner_penalty(dinner) + 5 * (8 - water) + stress * 2))

    # Generate suggestion logic based on the user's data
    suggestion = generate_suggestions(water, screen, stress, sleep, exercise, dinner)

    return int(brain_score), int(liver_score), int(heart_score), suggestion

def late_dinner_penalty(dinner_time):
    # Convert dinner time (HH:MM) to hour for calculation
    dinner_hour = int(dinner_time.split(":")[0]) if dinner_time else 20
    # Penalty for having dinner late
    return 15 if dinner_hour > 21 else 0

def generate_suggestions(water, screen, stress, sleep, exercise, dinner):
    # Suggestion logic based on user input
    suggestions = []

    # Liver Suggestions (Hydration & Dinner Time)
    if water < 3:
        suggestions.append("You should drink more water to improve liver function.")
    
    # Late Dinner Suggestion
    if int(dinner.split(":")[0]) > 21:
        suggestions.append("Try to have dinner earlier to support liver detox.")
    
    # Screen Time Suggestions
    if screen > 2:
        suggestions.append("Try reducing screen time, especially before bed, to support brain detox and improve sleep quality.")
    
    # Stress Level Suggestions
    if stress > 5:
        suggestions.append("Consider stress-relief techniques like meditation or deep breathing exercises.")
    
    # Sleep Suggestions
    if sleep < 7:
        suggestions.append("Aim for at least 7 hours of sleep to support brain detox and overall health.")

    # Exercise Suggestions
    if exercise < 150:
        suggestions.append("Regular exercise is crucial for cardiovascular health. Aim for at least 150 minutes of moderate activity per week.")

    # General Health and Encouragement
    if not suggestions:
        suggestions.append("Keep up the great work! Your detox scores are on track.")

    # Combine all suggestions
    return " ".join(suggestions)
