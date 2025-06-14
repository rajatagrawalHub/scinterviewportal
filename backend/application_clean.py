import pandas as pd
import json

# Load the Excel file
df = pd.read_excel("Response.xlsx")  # Update the path if needed

applications = []

for _, row in df.iterrows():
    register_no = row.get("Register No")
    if pd.isna(register_no):
        continue  # Skip if no register number

    # Create response map with only non-empty responses
    response_map = {
        str(col).strip(): str(row[col]).strip()
        for col in df.columns
        if col not in ["Name", "Register No", "School"] and pd.notna(row[col]) and str(row[col]).strip()
    }

    applications.append({
        "registerNo": str(register_no).strip(),
        "responses": response_map
    })

# Save the applications list as JSON
with open("applications.json", "w") as f:
    json.dump(applications, f, indent=2)

print("applications.json has been created.")
