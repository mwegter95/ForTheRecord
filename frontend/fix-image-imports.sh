#!/bin/bash

set -e

echo "🔍 Starting image import rewrite..."

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

# Extensions to scan
extensions=("js" "jsx" "scss" "css")

# Track updates
updates=0

for ext in "${extensions[@]}"; do
  for file in $(find ./src -type f -name "*.${ext}"); do
    modified=0
    for img in "${images[@]}"; do
      varname=$(echo "$img" | sed -E 's/\.[^.]+$//' | tr -c 'a-zA-Z0-9' '_')

      if grep -q "$img" "$file"; then
        # For CSS/SCSS: update url(/images/...)
        if [[ "$ext" == "scss" || "$ext" == "css" ]]; then
          sed -i.bak "s|url([\"']\?/images/${img}[\"']\?)|url('../images/${img}')|g" "$file" && modified=1
        fi

        # For JS/JSX: update src="/images/... or require
        if [[ "$ext" == "js" || "$ext" == "jsx" ]]; then
          sed -i.bak "s|[\"']/images/${img}[\"']|{${varname}}|g" "$file" && modified=1
          if ! grep -q "import ${varname} from '../images/${img}';" "$file"; then
            sed -i.bak "1s|^|import ${varname} from '../images/${img}';\n|" "$file" && modified=1
          fi
        fi
      fi
    done
    if [[ "$modified" -eq 1 ]]; then
      echo "✅ Updated: $file"
      rm "${file}.bak"
      updates=$((updates + 1))
    fi
  done
done

echo "✅ $updates files updated."
