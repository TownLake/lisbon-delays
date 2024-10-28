import pandas as pd
import glob
import os
from datetime import datetime

def merge_csv_files(data_dir, file_pattern, output_filename):
    """
    Merge all CSV files matching the given pattern into a single CSV file.
    
    Args:
        data_dir (str): Directory containing the CSV files
        file_pattern (str): Pattern to match CSV files (e.g., '*_arrivals.csv')
        output_filename (str): Name of the output merged CSV file
    """
    # Get list of all matching CSV files
    search_pattern = os.path.join(data_dir, file_pattern)
    all_files = glob.glob(search_pattern)
    
    # Sort files to ensure consistent ordering
    all_files.sort()
    
    if not all_files:
        raise ValueError(f"No CSV files found matching pattern: {search_pattern}")
    
    # Create empty list to store individual dataframes
    dfs = []
    
    # Read each CSV file
    for filename in all_files:
        try:
            # Extract date from filename (assuming format YYYYMMDD)
            date_str = os.path.basename(filename).split('_')[0][-8:]
            df = pd.read_csv(filename)
            
            # Add source filename and date columns
            df['source_file'] = os.path.basename(filename)
            df['date'] = datetime.strptime(date_str, '%Y%m%d').strftime('%Y-%m-%d')
            
            dfs.append(df)
            print(f"Successfully processed: {filename}")
            
        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")
    
    # Concatenate all dataframes
    if dfs:
        merged_df = pd.concat(dfs, ignore_index=True)
        
        # Sort by date and any existing timestamp column if present
        sort_columns = ['date']
        time_columns = [col for col in merged_df.columns if 'time' in col.lower()]
        if time_columns:
            sort_columns.extend(time_columns)
        
        merged_df.sort_values(by=sort_columns, inplace=True)
        
        # Save to CSV
        merged_df.to_csv(output_filename, index=False)
        print(f"\nSuccessfully created: {output_filename}")
        print(f"Total rows: {len(merged_df)}")
    else:
        print("No data to merge!")

def main():
    # Define directory paths
    data_dir = "Flight-Data-Daily"  # Directory containing the CSV files
    output_dir = 'merged_data'      # Directory for output files
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # Check if data directory exists
        if not os.path.exists(data_dir):
            raise ValueError(f"Data directory not found: {data_dir}")
        
        # Merge arrivals
        merge_csv_files(
            data_dir,
            '*_arrivals.csv', 
            os.path.join(output_dir, 'merged_arrivals.csv')
        )
        
        # Merge departures
        merge_csv_files(
            data_dir,
            '*_departures.csv', 
            os.path.join(output_dir, 'merged_departures.csv')
        )
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()