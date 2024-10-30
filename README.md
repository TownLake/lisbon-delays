# LIS-Delays

LIS-Delays measures the on-time rates for departures and arrivals at the primary airport in Lisbon, Portugal

## Data Source

FlightAware's [AeroAPI](https://www.flightaware.com/aeroapi/portal/) provides real-time and historical flight data. My subscription only permits querying for flight data in the last 10 days.

## Data Processing

I handle data processing manually on my machine because I want to retain my own archive and I like to run spot checks, both of which I find easier to do with local data. I might convert these steps to a GitHub Action in the future.

1. `flight_data_processor.py` prompts for a date and then captures the departure and arrival data for that date. The script also checks to see if the origin/destination city is in the Schengen, assigns a time of day based on the scheduled departure or arrival, and extracts only the fields that I care about. Oh, finally it converts the output into two CSVs - one for departures and one for arrivals.
2. `merge-csv.py` combines multiple files and saves them to a specific folder.
3. `metrics.py` takes the mered CSV and runs the analysis that generates the `.json` file that is uploaded to Workers KV.
4. `wrangler.bash` is the Wrangler script that sends the data to KV.

Handful of important notes about data integrity and handling:
* About a dozen or so arrival flights per day lack `actual_in` values. I am not sure why (and it is not because these are overnight flights etc). I just ignore these for now.
* I implement some rounding to get the whole number percentages to add up to 100.

## Application

* The application itself is a Next.js React application [running on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/).

## Feedback

* Got ideas? Found a bug? Please open an issue!

## Author

My name is Sam Rhea and you can read more about me [here](https://blog.samrhea.com/). I built this because I love Lisbon and want other people to love it as well. That starts with being able to visit. I recognize that air travel is seriously complex and

I also think it's just fun to build things on Cloudflare Workers.
