import pandas as pd
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
        
        on_time = (valid_flights['delay'] < 5).sum() / total_valid * 100
        minor_delay = ((valid_flights['delay'] >= 5) & (valid_flights['delay'] <= 30)).sum() / total_valid * 100
        medium_delay = ((valid_flights['delay'] > 30) & (valid_flights['delay'] <= 60)).sum() / total_valid * 100
        major_delay = (valid_flights['delay'] > 60).sum() / total_valid * 100
        
        return {
            "onTime": round(on_time, 0),
            "minor": round(minor_delay, 0),
            "medium": round(medium_delay, 0),
            "major": round(major_delay, 0)
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
            "weeklyData": analyze_weekly_trends(df, scheduled_col, actual_col),
            "lastUpdated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    # Generate complete analysis
    result = {
        "arrivals": analyze_direction(arrivals_df, 'scheduled_in', 'actual_in'),
        "departures": analyze_direction(departures_df, 'scheduled_off', 'actual_off'),
        "metadata": {
            "airport": "LIS",  # Could be made configurable
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