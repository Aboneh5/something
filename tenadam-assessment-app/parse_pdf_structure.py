import re
import json

pdf_text_page_11 = """
Criteria for Performance Excellence
Items and Point Values
See pages 29–34 for the scoring system used with the Criteria items in a Baldrige assessment.
Organizational Profile
P
P.1
Organizational Description
P.2 Organizational Situation
Categories and Items
Point Values
1
Leadership
120
1.1 Senior Leadership
70
1.2
Governance and Societal Contributions
50
2
Strategy
85
2.1
Strategy Development
45
2.2
Strategy Implementation
40
3
Customers
85
3.1
Customer Expectations
40
3.2 Customer Engagement
45
4
Measurement, Analysis, and Knowledge Management
90
4.1
Measurement, Analysis, and Improvement of
Organizational Performance
45
4.2
Information and Knowledge Management
45
5
Workforce
85
5.1
Workforce Environment
40
5.2
Workforce Engagement
45
6
Operations
85
6.1 Work Processes
45
6.2
Operational Effectiveness
40
7
Results
450
7.1 Product and Process Results
120
7.2
Customer Results
80
7.3
Workforce Results
80
7.4
Leadership and Governance Results
80
7.5
Financial, Market, and Strategy Results
90
TOTAL POINTS
1,000
Criteria for Performance Excellence Items and Point Values
3
"""

categories_data = []
current_category = None

# Regex to find main categories (e.g., "1 Leadership 120")
# This will now specifically look for a number, then name, then points
numbered_category_pattern = re.compile(r'^(\d+)\s+([A-Za-z,\s&]+?)\s+(\d+)$')

# Regex to find subcategories (e.g., "P.1 Organizational Description", "1.1 Senior Leadership")
subcategory_pattern = re.compile(r'^(P\.\d+|\d+\.\d+)\s+([A-Za-z,\s&]+?)(?:\s+(\d+))?$')

lines = pdf_text_page_11.split('\n')

# First, handle Organizational Profile as a special case
# It's listed as "Organizational Profile" followed by "P" and then P.1, P.2
# I'll manually add it and then look for its subcategories
org_profile_category = {
    "id": "P",
    "name": "Organizational Profile",
    "points": None, # No points listed for P on page 11
    "subcategories": []
}
categories_data.append(org_profile_category)
current_category = org_profile_category # Set it as current to capture P.1 and P.2

# Flag to indicate if we are parsing the main numbered categories
parsing_numbered_categories = False

for line in lines:
    line = line.strip()
    if not line:
        continue

    # Detect the start of the numbered categories section
    if line == "Categories and Items":
        parsing_numbered_categories = True
        current_category = None # Reset current category for numbered ones
        continue

    # Handle Organizational Profile subcategories (P.1, P.2)
    if current_category and current_category["id"] == "P":
        match_subcategory = subcategory_pattern.match(line)
        if match_subcategory:
            subcat_id = match_subcategory.group(1)
            subcat_name = match_subcategory.group(2).strip()
            subcat_points = match_subcategory.group(3)
            if subcat_id.startswith("P."): # Ensure it's a P subcategory
                current_category["subcategories"].append({
                    "id": subcat_id,
                    "name": subcat_name,
                    "points": int(subcat_points) if subcat_points else None,
                    "questions": []
                })
        continue # Continue to next line after processing P subcategories

    # If parsing numbered categories
    if parsing_numbered_categories:
        # Try to match a main numbered category
        match_numbered_category = numbered_category_pattern.match(line)
        if match_numbered_category:
            cat_id = match_numbered_category.group(1)
            cat_name = match_numbered_category.group(2).strip()
            cat_points = match_numbered_category.group(3)
            
            current_category = {
                "id": cat_id,
                "name": cat_name,
                "points": int(cat_points) if cat_points else None,
                "subcategories": []
            }
            categories_data.append(current_category)
            continue

        # If a numbered category is active, try to match a subcategory
        if current_category:
            match_subcategory = subcategory_pattern.match(line)
            if match_subcategory:
                subcat_id = match_subcategory.group(1)
                subcat_name = match_subcategory.group(2).strip()
                subcat_points = match_subcategory.group(3)
                
                # Ensure the subcategory belongs to the current category
                if subcat_id.startswith(current_category["id"] + '.'):
                    current_category["subcategories"].append({
                        "id": subcat_id,
                        "name": subcat_name,
                        "points": int(subcat_points) if subcat_points else None,
                        "questions": []
                    })


# Refine the structure to match the desired output format (similar to baldrige-data.ts)
final_output = []
org_profile_items = []
other_categories = []

for cat in categories_data:
    if cat["id"] == "P":
        for subcat in cat["subcategories"]:
            org_profile_items.append({
                "item": subcat["id"],
                "title": subcat["name"],
                "questions": [] # Questions will be populated later
            })
    else:
        category_items = []
        for subcat in cat["subcategories"]:
            category_items.append({
                "item": subcat["id"],
                "title": subcat["name"],
                "points": subcat["points"],
                "questions": [] # Questions will be populated later
            })
        other_categories.append({
            "category": cat["id"],
            "title": cat["name"],
            "items": category_items
        })

final_output.append({"organizational-profile": org_profile_items})
final_output.append({"categories": other_categories})

print(json.dumps(final_output, indent=2))
