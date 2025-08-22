#!/bin/bash

# Check if sources.json exists
if [ ! -f "sources.json" ]; then
    echo "sources.json file not found!"
    exit 1
fi

# Read sources.json and parse it
sources=$(jq -c '.sources' sources.json)

# Iterate over each source
echo "$sources" | jq -c '.[]' | while read -r source; do
    submoduleName=$(echo "$source" | jq -r '.submoduleName')
    
    # Iterate over guides array
    echo "$source" | jq -c '.guides[]' | while read -r guide; do
        guide_path=$(echo "$guide" | jq -r '.guideDir')
        target_directory=$(echo "$guide" | jq -r '.targetDir')

        # Check if guide path exists
        if [ ! -d "$submoduleName/$guide_path" ]; then
            echo "Guide path $guide_path not found in repository $repo_url!"
            continue
        fi

        # Create target directory if it doesn't exist
        mkdir -p "$target_directory"

        # Copy all jpg, jpeg, and png files to static/img
        mkdir -p static/img
        find "$submoduleName/$guide_path" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -exec cp {} static/img/ \;

        # Copy guide path to target directory
        find "$submoduleName/$guide_path" -type f \( -iname "*.md" -o -iname "*.mdx" \) -exec cp {} "$target_directory/" \;
        
        echo "Pulled and copied content from $guide_path to $target_directory"
    done
done