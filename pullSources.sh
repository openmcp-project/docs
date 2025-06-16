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
    repo_url=$(echo "$source" | jq -r '.url')
    branch=$(echo "$source" | jq -r '.branch // "main"')

    # Clone the repository
    temp_dir=$(mktemp -d)
    git clone --branch "$branch" "$repo_url" "$temp_dir"
    
    # Iterate over guides array
    echo "$source" | jq -c '.guides[]' | while read -r guide; do
        guide_path=$(echo "$guide" | jq -r '.guideDir')
        target_directory=$(echo "$guide" | jq -r '.targetDir')

        # Check if guide path exists
        if [ ! -d "$temp_dir/$guide_path" ]; then
            echo "Guide path $guide_path not found in repository $repo_url!"
            continue
        fi

        # Create target directory if it doesn't exist
        mkdir -p "$target_directory"

        # Copy guide path to target directory
        cp -r "$temp_dir/$guide_path/"* "$target_directory"

        echo "Pulled and copied content from $guide_path to $target_directory"
    done
done