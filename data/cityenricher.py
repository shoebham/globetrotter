import requests
import json
import time
import random
from bs4 import BeautifulSoup
import wikipediaapi
from tqdm import tqdm
import re
from openai import OpenAI

# Initialize OpenAI client (you'll need to set your API key)
# client = OpenAI(api_key="your-api-key-here")

class CityInfoEnricher:
    def __init__(self, input_file="cities_data.json", output_file="enriched_cities.json", openai_api_key=None):
        self.input_file = input_file
        self.output_file = output_file
        self.openai_api_key = openai_api_key
        self.wiki = wikipediaapi.Wikipedia('CityInfoBot/1.0', 'en')
        
        # Initialize OpenAI client if API key is provided
        if openai_api_key:
            self.client = OpenAI(api_key=openai_api_key)
        else:
            self.client = None
            
        # User agents for web scraping to avoid blocking
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
        ]
    
    def get_random_user_agent(self):
        """Return a random user agent from the list"""
        return random.choice(self.user_agents)
    
    def load_cities(self):
        """Load city data from JSON file"""
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading cities data: {e}")
            return []
    
    def save_enriched_cities(self, cities):
        """Save enriched city data to JSON file"""
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(cities, f, ensure_ascii=False, indent=2)
            print(f"Successfully saved enriched data to {self.output_file}")
        except Exception as e:
            print(f"Error saving enriched data: {e}")
    
    def get_wikipedia_summary(self, city, country):
        """Get basic summary from Wikipedia API"""
        try:
            # Try different page name formats
            page_titles = [
                f"{city}",
                f"{city}, {country}",
                f"{city} ({country})"
            ]
            
            page = None
            for title in page_titles:
                page = self.wiki.page(title)
                if page.exists():
                    break
            
            if page and page.exists():
                # Get summary (first few paragraphs)
                summary = page.summary[0:1000]  # Get first 1000 chars
                
                # Get page URL
                url = page.fullurl
                
                return {
                    "summary": summary,
                    "url": url
                }
            else:
                print(f"No Wikipedia page found for {city}, {country}")
                return None
        except Exception as e:
            print(f"Error getting Wikipedia summary for {city}, {country}: {e}")
            return None
    
    def scrape_fun_facts(self, city, country):
        """Scrape fun facts about the city from search results"""
        try:
            # Reduce search terms to just one for faster processing
            search_term = f"interesting facts about {city} {country}"
            
            all_facts = []
            
            url = f"https://www.google.com/search?q={search_term.replace(' ', '+')}"
            
            headers = {
                'User-Agent': self.get_random_user_agent()
            }
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Look for paragraphs that might contain facts
                paragraphs = soup.find_all(['p', 'span', 'div'], limit=50)  # Limit the search
                for p in paragraphs:
                    text = p.get_text().strip()
                    
                    # Skip if too short
                    if len(text) < 40 or len(text) > 300:
                        continue
                    
                    # Look for fact-like sentences
                    if re.search(r'\b(fact|interesting|known for|famous|largest|oldest|tallest|first|unique|popular)\b', 
                                text, re.IGNORECASE):
                        
                        # Split into sentences
                        sentences = re.split(r'(?<=[.!?])\s+', text)
                        for sentence in sentences:
                            sentence = sentence.strip()
                            if len(sentence) > 40 and len(sentence) < 200:
                                # Check if it contains the city name to ensure relevance
                                if city.lower() in sentence.lower():
                                    all_facts.append(sentence)
                                    # Stop once we have enough facts
                                    if len(all_facts) >= 10:
                                        break
            
            # Remove duplicates and limit the number of facts
            unique_facts = list(set(all_facts))
            return unique_facts[:10]  # Return up to 10 unique facts
            
        except Exception as e:
            print(f"Error scraping fun facts for {city}, {country}: {e}")
            return []
    
    def refine_with_ai(self, city, country, wiki_summary, scraped_facts):
        """Use OpenAI to refine and structure the data"""
        if not self.client:
            print("OpenAI API key not provided, skipping AI refinement")
            # Create basic structured data without AI
            clues = [
                f"This city is located in {country}.",
                f"A major city known for its culture and history."
            ]
            
            fun_facts = []
            trivia = []
            
            if scraped_facts and len(scraped_facts) >= 4:
                fun_facts = scraped_facts[:2]
                trivia = scraped_facts[2:4]
            else:
                fun_facts = ["Interesting fact about this city."] * 2
                trivia = ["Trivia about this city."] * 2
            
            return {
                "clues": clues,
                "fun_fact": fun_facts,
                "trivia": trivia
            }
        
        try:
            # Combine Wikipedia summary and scraped facts
            combined_info = f"Wikipedia summary: {wiki_summary}\n\nScraped facts:\n"
            for i, fact in enumerate(scraped_facts):
                combined_info += f"{i+1}. {fact}\n"
            
            # Create prompt for OpenAI - explicitly request NO exclamation points
            prompt = f"""
            I need to create structured information about {city}, {country} for a city guessing game.
            Here's what I've gathered about the city:
            
            {combined_info}
            
            Based on this information, please generate:
            1. Two engaging clues that would help someone guess this city without directly naming it
            2. Two interesting fun facts about the city (do NOT include exclamation points at the beginning)
            3. Two pieces of trivia about the city
            
            Format your response as valid JSON with these keys: clues, fun_facts, trivia
            Each should be an array of exactly two string items.
            """
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a travel expert creating content for a city guessing game."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            content = response.choices[0].message.content
            structured_data = json.loads(content)
            
            # Ensure we have the right format
            result = {
                "clues": structured_data.get("clues", ["", ""])[:2],
                "fun_fact": structured_data.get("fun_facts", ["", ""])[:2],
                "trivia": structured_data.get("trivia", ["", ""])[:2]
            }
            
            # Remove any exclamation points from the beginning of fun facts
            result["fun_fact"] = [
                fact.lstrip('! ') for fact in result["fun_fact"]
            ]
            
            # Ensure we have exactly 2 items for each category
            for key in result:
                while len(result[key]) < 2:
                    result[key].append("")
            
            return result
            
        except Exception as e:
            print(f"Error refining data with AI for {city}, {country}: {e}")
            # Fallback to basic structure
            return {
                "clues": [
                    f"This city is in {country}.",
                    "A city with rich history and culture."
                ],
                "fun_fact": [fact.lstrip('! ') for fact in (scraped_facts[:2] if len(scraped_facts) >= 2 else ["", ""])],
                "trivia": scraped_facts[2:4] if len(scraped_facts) >= 4 else ["", ""]
            }
    def enrich_city(self, city_data):
        """Enrich a single city with additional information"""
        city = city_data["city"]
        country = city_data["country"]
        
        print(f"Processing {city}, {country}...")
        
        # Step 1: Get Wikipedia summary
        wiki_data = self.get_wikipedia_summary(city, country)
        wiki_summary = wiki_data["summary"] if wiki_data else ""
        
        # Step 2: Web scraping for interesting facts
        scraped_facts = self.scrape_fun_facts(city, country)
        
        # Step 3: Refine data with AI
        refined_data = self.refine_with_ai(city, country, wiki_summary, scraped_facts)
        
        # Create enriched city data
        enriched_city = {
            "city": city,
            "country": country,
            "clues": refined_data["clues"],
            "fun_fact": refined_data["fun_fact"],
            "trivia": refined_data["trivia"]
        }
        
        return enriched_city
    
    def process_cities(self, limit=None):
        """Process all cities in the input file"""
        cities = self.load_cities()
        
        if limit:
            cities = cities[:limit]
        
        enriched_cities = []
        
        # Use concurrent processing
        from concurrent.futures import ThreadPoolExecutor
        
        # Define how many cities to process in parallel (adjust based on your system)
        max_workers = 5
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks and create a list of futures
            futures = [executor.submit(self.enrich_city, city_data) for city_data in cities]
            
            # Process results as they complete
            for future in tqdm(futures, desc="Enriching cities"):
                enriched_city = future.result()
                enriched_cities.append(enriched_city)
        
        self.save_enriched_cities(enriched_cities)
        return enriched_cities

# Main execution
if __name__ == "__main__":
    # Set your OpenAI API key here
    OPENAI_API_KEY = ""
    
    
    # Create the enricher
    enricher = CityInfoEnricher(
        input_file="cities_data.json",
        output_file="enriched_cities.json",
        openai_api_key=OPENAI_API_KEY
    )
    
    # Process cities (limit=5 for testing, remove limit for all cities)
    enriched_cities = enricher.process_cities(limit=100)
    
    print(f"Processed {len(enriched_cities)} cities successfully!")