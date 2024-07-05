#!/bin/bash

# Input file containing URLs
input_file="midjourney_image_url.txt"

# Check if input file exists
if [ ! -f "$input_file" ]; then
  echo "File not found: $input_file"
  exit 0
fi

# Initialize the counter
counter=1

# Read each line (URL) from the input file
while IFS= read -r url; do
    # Format the output filename with sequential suffix
    output_file=$(printf "midjourney_image%02d.png" "$counter")
    
    # Download the image using curl
    curl -# -o "$output_file" "$url"
    
    # Increment the counter
    counter=$((counter + 1))
done < "$input_file"

echo "All images downloaded."
