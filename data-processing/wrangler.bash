

wrangler kv:key put --namespace-id="123" "airport_data" "$(cat ~/Documents/Flight-App/merged_data/flight-data.json)"

wrangler kv:key get --namespace-id="123" "airport_data"
