import pandas as pd
import numpy as np
from datetime import datetime
import json

def analyze_flight_data(arrivals_df, departures_df):
    """
    Analyze flight data and generate statistics for both arrivals and departures.
    
    Parameters:
    arrivals_df (pd.DataFrame): DataFrame containing arrival flight data
    departures_df (pd.DataFrame): DataFrame containing departure flight data
    
    Returns:
    dict: Structured analysis results in JSON format
    """
    def calculate_delay_breakdown(df, scheduled_col, actual_col):
        """Calculate delay breakdown percentages for valid flights."""
        valid_flights = df[df[scheduled_col].notna() & df[actual_col].notna()]
        total_valid = len(valid_flights)
        if total_valid == 0:
            return {"onTime": 0, "minor": 0, "medium": 0, "major": 0}
        
        # Calculate raw percentages
        on_time = (valid_flights['delay'] < 5).sum() / total_valid * 100
        minor_delay = ((valid_flights['delay'] >= 5) & (valid_flights['delay'] <= 30)).sum() / total_valid * 100
        medium_delay = ((valid_flights['delay'] > 30) & (valid_flights['delay'] <= 60)).sum() / total_valid * 100
        major_delay = (valid_flights['delay'] > 60).sum() / total_valid * 100
        
        # Use numpy.round and ensure sum equals 100
        percentages = np.array([on_time, minor_delay, medium_delay, major_delay])
        rounded = np.round(percentages)
        
        # Adjust to ensure sum is 100
        diff = 100 - rounded.sum()
        if diff != 0:
            # Add the difference to the largest category to maintain proportions
            max_idx = np.argmax(percentages)
            rounded[max_idx] += diff
        
        return {
            "onTime": int(rounded[0]),
            "minor": int(rounded[1]),
            "medium": int(rounded[2]),
            "major": int(rounded[3])
        }

    def analyze_by_time_of_day(df, scheduled_col, actual_col):
        """Calculate delay breakdown by time of day."""
        result = {}
        for time_period in ['Early', 'Morning', 'Afternoon', 'Evening']:
            period_data = df[df['time_of_day'] == time_period]
            result[time_period.lower()] = calculate_delay_breakdown(period_data, scheduled_col, actual_col)
        return result

    def analyze_weekly_trends(df, scheduled_col, actual_col):
        """Calculate delay breakdown by ISO week."""
        df['week'] = pd.to_datetime(df['date']).dt.isocalendar().week
        weekly_trends = []
        
        for week in sorted(df['week'].unique()):
            week_data = df[df['week'] == week]
            delays = calculate_delay_breakdown(week_data, scheduled_col, actual_col)
            weekly_trends.append({
                "week": f"Week {week}",
                **delays
            })
        
        return weekly_trends

    def analyze_schengen(df, scheduled_col, actual_col):
        """Calculate delay breakdown by Schengen zone status."""
        result = {}
        for is_schengen in [True, False]:
            schengen_data = df[df['schengen'] == is_schengen]
            key = "schengen" if is_schengen else "nonSchengen"
            result[key] = calculate_delay_breakdown(schengen_data, scheduled_col, actual_col)
        return result

    def calculate_heatmap_metrics(df, scheduled_col, actual_col):
        """Calculate average delays by time of day for Schengen and non-Schengen flights."""
        result = {
            "schengen": {},
            "nonSchengen": {}
        }
        
        # Filter for valid flights
        valid_flights = df[df[scheduled_col].notna() & df[actual_col].notna()]
        
        for is_schengen in [True, False]:
            key = "schengen" if is_schengen else "nonSchengen"
            schengen_data = valid_flights[valid_flights['schengen'] == is_schengen]
            
            for time_period in ['Early', 'Morning', 'Afternoon', 'Evening']:
                period_data = schengen_data[schengen_data['time_of_day'] == time_period]
                avg_delay = round(period_data['delay'].mean()) if len(period_data) > 0 else 0
                result[key][time_period.lower()] = avg_delay
                
        return result

    def analyze_direction(df, scheduled_col, actual_col):
        """Analyze flight data for one direction (arrivals or departures)."""
        valid_flights = df[df[scheduled_col].notna() & df[actual_col].notna()]
        
        days_tracked = len(valid_flights['date'].unique())
        flights_per_day = round(len(valid_flights) / days_tracked) if days_tracked > 0 else 0
        avg_delay = round(valid_flights['delay'].mean()) if len(valid_flights) > 0 else 0
        
        return {
            "flightsPerDay": flights_per_day,
            "daysTracked": days_tracked,
            "averageDelay": avg_delay,
            "delays": calculate_delay_breakdown(df, scheduled_col, actual_col),
            "timeOfDay": analyze_by_time_of_day(df, scheduled_col, actual_col),
            "heatmap": calculate_heatmap_metrics(df, scheduled_col, actual_col),
            "weeklyData": analyze_weekly_trends(df, scheduled_col, actual_col),
            "schengen": analyze_schengen(df, scheduled_col, actual_col),
            "lastUpdated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    # Generate complete analysis
    result = {
        "arrivals": analyze_direction(arrivals_df, 'scheduled_in', 'actual_in'),
        "departures": analyze_direction(departures_df, 'scheduled_off', 'actual_off'),
        "metadata": {
            "airport": "LIS",
            "timeZone": "Europe/Lisbon",
            "updateFrequency": "daily"
        }
    }
    
    return result

def save_analysis(analysis_results, output_file):
    """Save analysis results to a JSON file."""
    with open(output_file, 'w') as f:
        json.dump(analysis_results, f, indent=2)

# Example usage:
if __name__ == "__main__":
    # Read CSV files
    arrivals_df = pd.read_csv('merged_arrivals.csv')
    departures_df = pd.read_csv('merged_departures.csv')
    
    # Run analysis
    analysis_results = analyze_flight_data(arrivals_df, departures_df)
    
    # Save results
    save_analysis(analysis_results, 'flight-data.json')