import requests
import pandas as pd
import random
from tqdm import tqdm
import time
import json

def fetch_cities_from_geonames():
    """
    Fetch top cities by population from GeoNames API.
    Requires a GeoNames account (free).
    """
    username = "YOUR_GEONAMES_USERNAME"  # Replace with your GeoNames username
    url = f"http://api.geonames.org/searchJSON?featureClass=P&featureCode=PPLA&featureCode=PPLC&orderby=population&maxRows=1000&username={username}"
    
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        cities = []
        
        # Extract city information
        for city in data.get('geonames', []):
            cities.append({
                'city': city.get('name'),
                'country': city.get('countryName'),
                'population': city.get('population'),
                'continent': city.get('continentCode')
            })
        
        return pd.DataFrame(cities)
    else:
        print(f"Error fetching data: {response.status_code}")
        return None

def fetch_cities_using_restcountries():
    """
    Alternative approach using RestCountries API for country data
    and then selecting major cities for each country.
    """
    # Get all countries
    url = "https://restcountries.com/v3.1/all"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Error fetching countries: {response.status_code}")
        return None
    
    countries_data = response.json()
    
    # Create a balanced list of countries from different regions
    regions = {}
    for country in countries_data:
        region = country.get('region', 'Other')
        if region not in regions:
            regions[region] = []
        
        # Add country with its capital
        capital = country.get('capital', [''])[0]
        if capital:
            country_name = country.get('name', {}).get('common', '')
            if country_name:
                regions[region].append({
                    'city': capital,
                    'country': country_name,
                    'is_capital': True
                })
    
    # Create a balanced dataset
    diverse_cities = []
    for region, cities in regions.items():
        # Take proportionally more cities from regions with more countries
        num_to_take = max(2, min(int(len(cities) * 0.3), 30))
        if cities:
            diverse_cities.extend(random.sample(cities, min(num_to_take, len(cities))))
    
    return diverse_cities

def fetch_cities_from_worldcities_dataset():
    """
    Use the public Simplemaps World Cities database
    This is a more reliable method as it doesn't depend on API calls
    """
    # URL for the World Cities Database (CSV format)
    url = "https://gist.githubusercontent.com/curran/13d30e855d48cdd6f22acdf0afe27286/raw/0635f14817ec634833bb904a47594cc2f5f9dbf8/worldcities_clean.csv"
    
    try:
        # Read the CSV directly from the URL
        df = pd.read_csv(url)
        
        # Clean and prepare the data
        df = df.rename(columns={
            'city': 'city',
            'country': 'country',
            'lat': 'latitude',
            'lng': 'longitude',
            'population': 'population',
        })
        
        # Remove cities with missing values
        df = df.dropna(subset=['city', 'country'])
        
        return df
    except Exception as e:
        print(f"Error fetching world cities data: {e}")
        return None

def select_diverse_cities(df, num_cities=100):
    """
    Select a diverse set of cities from the dataframe
    """
    if df is None or df.empty:
        return []
    
    selected_cities = []
    

    # If we don't have enough cities yet, add more popular cities
    if len(selected_cities) < num_cities and 'population' in df.columns:
        remaining = num_cities - len(selected_cities)
        
        # Get cities we already selected
        selected_names = [city['city'] for city in selected_cities]
        
        # Filter out already selected cities
        remaining_df = df[~df['city'].isin(selected_names)]
        
        # Sort by population and take top cities
        top_remaining = remaining_df.sort_values(by='population', ascending=False).head(remaining * 2)
        
        # Sample from these to add diversity
        additional = top_remaining.sample(min(remaining, len(top_remaining)))
        
        for _, city in additional.iterrows():
            selected_cities.append({
                'city': city['city'],
                'country': city['country']
            })
    
    # If still not enough, just take random cities
    if len(selected_cities) < num_cities:
        remaining = num_cities - len(selected_cities)
        selected_names = [city['city'] for city in selected_cities]
        remaining_df = df[~df['city'].isin(selected_names)]
        
        if len(remaining_df) > 0:
            additional = remaining_df.sample(min(remaining, len(remaining_df)))
            for _, city in additional.iterrows():
                selected_cities.append({
                    'city': city['city'],
                    'country': city['country']
                })
    
    # Return only what we need
    return selected_cities[:num_cities]

def add_placeholder_data(cities_list):
    """
    Add placeholder data for the clues, fun facts, and trivia
    """
    enhanced_cities = []
    
    for city_data in cities_list:
        enhanced_city = {
            "city": city_data["city"],
            "country": city_data["country"],
            "clues": [
                "This is a placeholder clue about this city.",
                "This is another placeholder clue about this city."
            ],
            "fun_fact": [
                "This is a placeholder fun fact about this city!",
                "This is another placeholder fun fact about this city!"
            ],
            "trivia": [
                "This is a placeholder trivia item about this city.",
                "This is another placeholder trivia item about this city."
            ]
        }
        enhanced_cities.append(enhanced_city)
    
    return enhanced_cities

def main():
    # Try the WorldCities dataset first (most reliable)
    print("Fetching cities from the WorldCities dataset...")
    cities_df = fetch_cities_from_worldcities_dataset()
    
    if cities_df is None or len(cities_df) < 100:
        print("Trying alternative sources...")
        # Try RestCountries as a backup
        cities_list = fetch_cities_using_restcountries()
        
        if not cities_list or len(cities_list) < 50:
            print("Warning: Could not fetch enough cities. Using a hardcoded list.")
            # Fallback to a hardcoded list of major global cities
            cities_list = [
                {"city": "New York", "country": "United States"},
                {"city": "London", "country": "United Kingdom"},
                {"city": "Paris", "country": "France"},
                {"city": "Tokyo", "country": "Japan"},
                {"city": "Sydney", "country": "Australia"},
                # Add more cities here as a fallback
            ]
    else:
        # Select diverse cities from the dataframe
        cities_list = select_diverse_cities(cities_df, num_cities=100)
    
    # Add placeholder data
    enhanced_cities = add_placeholder_data(cities_list)
    
    # Save to JSON file
    with open('cities_data.json', 'w', encoding='utf-8') as f:
        json.dump(enhanced_cities, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully created dataset with {len(enhanced_cities)} cities.")
    print("File saved as 'cities_data.json'")

if __name__ == "__main__":
    main()