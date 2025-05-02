import random

def calculate_detox_scores(data):
    # Fetch data with fallbacks
    water = data.get("water", 0)
    dinner = data.get("meal", "20:00")
    screen = data.get("screen_time", 0)
    stress = data.get("stress", 3)
    hr = data.get("heart_rate", random.randint(45, 100))
    sleep = data.get("sleep", 6)
    pulse = data.get("pulse", 75)
    exercise = data.get("exercise", 0)

    # **Brain Detox Score Calculation**
    # Factors: Screen time ↑ bad, Stress ↑ bad, Sleep ↓ bad, Water ↓ bad
    brain_penalty = (screen * 8) + (stress * 5) + max(0, (7 - sleep) * 4) + max(0, (3 - water) * 5)
    brain_score = max(0, 100 - brain_penalty)

    # **Heart Detox Score Calculation**
    # Factors: Heart rate away from optimal, Stress ↑ bad, Screen time ↑ bad, Exercise ↓ bad
    optimal_heart_rate = 70
    heart_penalty = abs(hr - optimal_heart_rate) * 1.2 + (stress * 3) + (screen * 2) - (exercise / 30) * 4
    heart_score = max(0, 100 - heart_penalty)

    # **Liver Detox Score Calculation**
    # Factors: Late dinner ↑ bad, Water ↓ bad, Stress ↑ bad, Sleep ↓ bad
    liver_penalty = late_dinner_penalty(dinner) + max(0, (3 - water) * 8) + (stress * 2) + max(0, (7 - sleep) * 2)
    liver_score = max(0, 100 - liver_penalty)

    # Generate Suggestions
    suggestion = generate_suggestions(water, screen, stress, sleep, exercise, dinner)

    return int(brain_score), int(liver_score), int(heart_score), suggestion

def late_dinner_penalty(dinner_time):
    dinner_hour = int(dinner_time.split(":")[0]) if dinner_time else 20
    return 15 if dinner_hour > 21 else 0

def generate_suggestions(water, screen, stress, sleep, exercise, dinner):
    suggestions = []

    if water < 3:
        suggestions.append("Increase your water intake to support both brain and liver detoxification.")

    if int(dinner.split(":")[0]) > 21:
        suggestions.append("Try to have dinner earlier to support liver detox and better sleep.")

    if screen > 2:
        suggestions.append("Reduce screen time to support brain and heart detoxification.")

    if stress > 5:
        suggestions.append("Practice relaxation techniques like meditation to manage stress.")

    if sleep < 7:
        suggestions.append("Aim for at least 7 hours of sleep to support brain and liver health.")

    if exercise < 150:
        suggestions.append("Increase your physical activity to enhance heart health and overall detox.")

    if not suggestions:
        suggestions.append("Excellent habits! Keep it up to maintain optimal detox scores.")

    return " ".join(suggestions)
