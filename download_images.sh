#!/bin/bash

# Input file containing URLs
input_file="midjourney_image_url.txt"

# Check if input file exists
if [ ! -f "$input_file" ]; then
  echo "File not found: $input_file"
  exit 0
fi

# Function to get the current timestamp with hhmmss and milliseconds
get_timestamp() {
  date +"%H%M%S_%3N"
}

# Initialize the counter
counter=1

# Read each line (URL) from the input file
while IFS= read -r url; do

    # Get new timestamp
    timestamp=$(get_timestamp)

    # Format the output filename with sequential suffix
    output_file=$(printf "midjourney_lg_image%02d_%s.png" "$counter" "$timestamp")
    
    # Download the image using curl
    curl -# -o "$output_file" "$url"
    
    # Increment the counter
    counter=$((counter + 1))
done < "$input_file"

echo "All images downloaded."
