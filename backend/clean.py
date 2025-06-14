import json

# Load the data
with open("candidatedata.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Convert the rolePreferences field
for entry in data:
    prefs = entry.get("rolePreferences", "")
    # Remove surrounding brackets and split by comma
    prefs_list = [p.strip() for p in prefs.strip("[]").split(",") if p.strip()]
    entry["rolePreferences"] = prefs_list

# Save the cleaned data
with open("candidatedata_cleaned.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
