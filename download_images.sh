#!/bin/bash

# Input file containing URLs
INPUT_FILE="$1"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
  echo "File not found: $INPUT_FILE"
  exit 0
fi

FILENAME_NO_EXTENSION="${INPUT_FILE%.*}"

if [[ $FILENAME_NO_EXTENSION == *"quad"* ]]; then
    TYPE="quad"
elif [[ $FILENAME_NO_EXTENSION == *"upscaled"* ]]; then
    TYPE="upscaled"
else
    TYPE="none"
fi

# Read each line (URL) from the input file
while IFS= read -r URL; do

    # Extract the part of the URL after the last slash and before the first question mark
    FILENAME=$(basename "$URL" | awk -F '?' '{print $1}')
    
    # Remove the suffix to get the descriptive part
    DESCRIPTIVE_PART=$(echo "$FILENAME" | sed -E 's/[_-][[:alnum:]]{8}-[[:alnum:]]{4}-[[:alnum:]]{4}-[[:alnum:]]{4}-[[:alnum:]]{12}\.png//')

    # Get new timestamp
    TIMESTAMP=$(date +%s)

    # Format the output filename with sequential suffix
    OUTPUT_FILE=$(printf "mj_%s_%s_%s.png" "$TYPE" "$DESCRIPTIVE_PART" "$TIMESTAMP")
    
    # Download the image using curl
    curl -# -o "$OUTPUT_FILE" "$URL"

done < "$INPUT_FILE"

echo "All images downloaded."