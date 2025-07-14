import json

# Path to the downloaded countries.json file
input_file = 'flag.json'
output_file = 'flag_extracted.json'

with open(input_file, 'r', encoding='utf-8') as f:
    countries = json.load(f)

simplified = []
for country in countries:
    name = country.get('name', {}).get('common', None)
    code = country.get('cca3', None)
    if name and code:
        simplified.append({
            'country': name,
            'code': code.lower()
        })

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(simplified, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(simplified)} countries to '{output_file}'")
