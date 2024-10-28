import json
import csv
import requests
from datetime import datetime, timedelta
import os

class FlightDataProcessor:
    def __init__(self, api_key, airport_code, date_str):
        self.api_key = api_key
        self.airport_code = airport_code
        self.headers = {
            "x-apikey": api_key,
            "Accept": "application/json"
        }
        self.date_str = date_str.replace('-', '')  # Convert YYYY-MM-DD to YYYYMMDD
        self.target_date = datetime.strptime(date_str, '%Y-%m-%d')
        self.output_path = os.path.expanduser("~/Documents")  # Changed to direct path

        self.schengen_lookup = {
            'Santa Lucía': False, 'Santa Catarina': False, 'Sao Paulo': False, 'Tanger': False,
            'Rio de Janeiro': False, 'Luanda': False, 'Cairo': False, 'Faro / Algarve Int. Faro': True,
            'Malaga': True, 'Ankara': False, 'Barcelona': True, 'Algiers': False, 'Dublin': False,
            'Ponta Delgada': True, 'Sevilla': True, 'Madrid': True, 'Doha': False, 'London': False,
            'Luqa': True, 'Francisco Sa Carneiro Int.': True, 'Nice': True, 'Casablanca': False,
            'Palma de Mallorca': True, 'Dubai': False, 'Milan': True, 'Saint Exupery': True,
            'Stockholm': True, 'Diass': False, 'Bergamo': True, 'Sal': False, 'Santiago': True,
            'Budapest': True, 'Manises': True, 'Marseille': True, 'Blagnac': True, 'Amsterdam': True,
            'Rome': True, 'Brussels': True, 'Mediterranee': True, 'Paris': True, 'Geneva': True,
            'Marrakech': False, 'Nantes': True, 'Charleroi': True, 'Vitoria': True, 'Orly (near Paris)': True,
            'Agadir': False, 'Munich': True, 'Beauvais': True, 'Warsaw': True, 'Toronto': False,
            'Edinburgh': False, 'Zurich': True, 'Rotterdam': True, 'Sofia': False, 'Montreal': False,
            'Newark': False, 'Bristol': False, 'Eindhoven': True, 'Manchester': False, 'Frankfurt am Main': True,
            'Berlin': True, 'Salvador': False, 'Hamburg': True, 'Bologna': True, 'Jasionka': True,
            'Dusseldorf': True, 'Fortaleza': False, 'Belem': False, 'Boston': False, 'Recife': False,
            'New York': False, 'Washington': False, 'Vienna': True, 'Istanbul': False, 'Venice (Venezia)': True,
            'Vantaa': True, 'Nowy Dwor Mazowiecki': True, 'Sao Vicente': False, 'EuroAirport (Basel)': True,
            'Bilbao / Bilbo': True, 'Florence (Firenze)': True, 'Bordeaux/Merignac': True, 'Prague': True,
            'Florianopolis': False, 'Stuttgart': True, 'Bissau': False, 'Natal': False,
            'Santa Maria Island / Vila do Porto': True, 'Copenhagen': True, 'Luxembourg': True, 'Athens': True,
            'Hangzhou': False, 'Campinas': False, 'Miami': False, 'Philadelphia': False, 'Belo Horizonte': False,
            'Gran Canaria': True, 'Brasilia': False, 'San Francisco': False, 'Cologne/Bonn': True,
            'Balice': True, 'Tenerife': True, 'Birmingham': False, 'Abu Dhabi': False, 'Horta': True,
            'Oslo': True, 'Alicante / Benidorm / Costa Blanca': True, 'Seoul (Incheon)': False,
            'İzmir': False, 'Aviles / Gijon / Oviedo (Asturias)': True, 
            'Porto Santo Island / Vila Baleira {Porto Santo Island}': True, 'Bucharest': False,
            'Ibiza Island / Eivisa': True, 'Chicago': False, 'Menorca': True, 'Farnborough': False,
            'Palmeira': False, 'Accra': False, 'Pico Island': True, 'Naples': True, 'Tel Aviv': False,
            'Belgrade': False, 'Maputo': False, 'Pisa': True, 'Vilnius': True, 'Montijo': True,
            'Ostend': True, 'Aalborg': True, 'Bratislava': True, 'Boa Vista': False, 'Glasgow': False,
            'Split': True, 'Tunis': False, 'Keflavik': True, 'RIGA': True, 'Punta Cana': False,
            'Maiquetia': False, 'Beja': True, 'Poznan': True, 'Cancun': False, 'Cardiff': False,
            'Leipzig/Halle': True, 'Teterboro': False, 'Varadero': False, 'Girona': True,
            'Sao Tome': False, 'Lisbon': True, 'Port Gentil': False, 'Abidjan': False,
            'Cascais / Estoril': True, 'Nouadhibou': False, 'Liege': True, 'Kaunas': True,
            'Graz': True, 'Wrocław': True, 'Terceira Island /Praia da Vitoria /Angra area': True
        }

    def get_date_range(self):
        start = self.target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = self.target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        return start.strftime('%Y-%m-%dT%H:%M:%SZ'), end.strftime('%Y-%m-%dT%H:%M:%SZ')

    def fetch_data(self, flight_type):
        start_date, end_date = self.get_date_range()
        url = f"https://aeroapi.flightaware.com/aeroapi/airports/{self.airport_code}/flights/{flight_type}"
        params = {
            "start": start_date,
            "end": end_date,
            "max_pages": 1000
        }
        
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code != 200:
            raise Exception(f"API call failed with status {response.status_code}: {response.text}")
        
        return response.json()

    def format_datetime(self, dt_str):
        if not dt_str:
            return "N/A"
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M')

    def get_time_of_day(self, datetime_str):
        if datetime_str == "N/A":
            return "N/A"
        try:
            dt = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M')
            hour = dt.hour
            
            if 0 <= hour < 6:
                return "Early"
            elif 6 <= hour < 12:
                return "Morning"
            elif 12 <= hour < 18:
                return "Afternoon"
            else:  # 18 <= hour < 24
                return "Evening"
        except:
            return "N/A"

    def calculate_delay(self, scheduled_str, actual_str):
        if scheduled_str == "N/A" or actual_str == "N/A":
            return "N/A"
        try:
            scheduled = datetime.strptime(scheduled_str, '%Y-%m-%d %H:%M')
            actual = datetime.strptime(actual_str, '%Y-%m-%d %H:%M')
            delay = (actual - scheduled).total_seconds() / 60
            return round(delay)
        except:
            return "N/A"

    def is_schengen(self, city):
        """Determine if a city is in the Schengen area"""
        return self.schengen_lookup.get(city, False)  # Default to False if city not found
        
    def extract_date(self, datetime_str):
        if datetime_str == "N/A":
            return "N/A"
        try:
            dt = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M')
            return dt.strftime('%Y-%m-%d')
        except:
            return "N/A"

    def get_day_of_week(self, datetime_str):
        if datetime_str == "N/A":
            return "N/A"
        try:
            dt = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M')
            return dt.strftime('%A')
        except:
            return "N/A"

    def process_flights(self, data, flight_type):
        processed = []
        flights = data.get(flight_type, [])
        
        for flight in flights:
            if flight_type == 'arrivals':
                scheduled = self.format_datetime(flight.get('scheduled_in'))
                actual = self.format_datetime(flight.get('actual_in'))
                city = flight.get('origin', {}).get('city', 'N/A')
                processed.append({
                    'operator': flight.get('operator', 'N/A'),
                    'flight_number': flight.get('flight_number', 'N/A'),
                    'cancelled': flight.get('cancelled', False),
                    'origin_city': city,
                    'scheduled_in': scheduled,
                    'actual_in': actual,
                    'delay': self.calculate_delay(scheduled, actual),
                    'date': self.extract_date(scheduled),
                    'day_of_week': self.get_day_of_week(scheduled),
                    'time_of_day': self.get_time_of_day(scheduled),
                    'schengen': self.is_schengen(city)                    
                })
            else:  # departures
                scheduled = self.format_datetime(flight.get('scheduled_off'))
                actual = self.format_datetime(flight.get('actual_off'))
                city = flight.get('destination', {}).get('city', 'N/A')
                processed.append({
                    'operator': flight.get('operator', 'N/A'),
                    'flight_number': flight.get('flight_number', 'N/A'),
                    'cancelled': flight.get('cancelled', False),
                    'destination_city': city,
                    'scheduled_off': scheduled,
                    'actual_off': actual,
                    'delay': self.calculate_delay(scheduled, actual),
                    'date': self.extract_date(scheduled),
                    'day_of_week': self.get_day_of_week(scheduled),
                    'time_of_day': self.get_time_of_day(scheduled),
                    'schengen': self.is_schengen(city)
                })
        
        return processed

    def save_json(self, data, filename):
        dated_filename = f"{self.date_str}_{filename}"
        filepath = os.path.join(self.output_path, dated_filename)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return filepath

    def save_csv(self, data, filename):
        if not data:
            return None
            
        dated_filename = f"{self.date_str}_{filename}"
        filepath = os.path.join(self.output_path, dated_filename)
        with open(filepath, 'w', newline='') as csv_file:
            fieldnames = data[0].keys()
            writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        return filepath

    def cleanup_json_files(self, files):
        for file in files:
            try:
                os.remove(file)
                print(f"Cleaned up temporary file: {file}")
            except Exception as e:
                print(f"Warning: Could not delete {file}: {str(e)}")

    def process_all(self):
        print(f"Files will be saved to: {self.output_path}")
        json_files_to_cleanup = []
        
        for flight_type in ['arrivals', 'departures']:
            print(f"\nFetching {flight_type} data...")
            raw_data = self.fetch_data(flight_type)
            
            print(f"Processing {flight_type} data...")
            processed_data = self.process_flights(raw_data, flight_type)
            
            raw_json_path = self.save_json(raw_data, f"{flight_type}.json")
            json_files_to_cleanup.append(raw_json_path)
            print(f"Saved raw {flight_type} data to {raw_json_path}")
            
            processed_json_path = self.save_json(processed_data, f"{flight_type}_processed.json")
            json_files_to_cleanup.append(processed_json_path)
            print(f"Saved processed {flight_type} data to {processed_json_path}")
            
            csv_path = self.save_csv(processed_data, f"{flight_type}.csv")
            print(f"Saved {flight_type} CSV to {csv_path}")
        
        print("\nCleaning up temporary JSON files...")
        self.cleanup_json_files(json_files_to_cleanup)

def validate_date(date_str):
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def main():
    # Configuration
    API_KEY = "123"
    AIRPORT_CODE = "LPPT"
    
    # Get date input from user
    while True:
        date_input = input("Enter the date (YYYY-MM-DD format): ")
        if validate_date(date_input):
            break
        print("Invalid date format. Please use YYYY-MM-DD format.")
    
    try:
        processor = FlightDataProcessor(API_KEY, AIRPORT_CODE, date_input)
        processor.process_all()
        print("\nProcessing completed successfully!")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()