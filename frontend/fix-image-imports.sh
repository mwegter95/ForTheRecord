#!/bin/bash

# List of images
images=(
  "Ashley_and_me.jpeg"
  "DJ_Decks.jpeg"
  "Portrait_me.jpeg"
  "community-event.jpg"
  "corporate-event.jpg"
  "djing_wedding_rings_image.jpeg"
  "private-party.jpg"
  "wedding1.jpg"
  "wedding2.jpg"
  "wedding3.jpg"
  "wedding_dance_bouqet_toss.jpg"
)

# Replace image paths in SCSS/CSS files
for file in $(find ./src -type f \( -name "*.scss" -o -name "*.css" \)); do
  for img in "${images[@]}"; do
    sed -i '' "s|url([\"']*/images/$img[\"'])|url('../images/$img')|g" "$file"
  done
done

# Replace src="" attributes and insert import statements in JS/JSX files
for file in $(find ./src -type f \( -name "*.js" -o -name "*.jsx" \)); do
  updated=0
  for img in "${images[@]}"; do
    varname=$(echo "$img" | sed -E 's/\.[^.]+$//' | tr -c 'a-zA-Z0-9' '_')
    if grep -q "$img" "$file"; then
      sed -i '' "s|[\"']/images/$img[\"']|{${varname}}|g" "$file"
      grep -q "import ${varname} from '../images/$img'" "$file" || \
        sed -i '' "1s|^|import ${varname} from '../images/$img';\n|" "$file"
      updated=1
    fi
  done
done

echo "✅ Image references updated to import from src/images/"
