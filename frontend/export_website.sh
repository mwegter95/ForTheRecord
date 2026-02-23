#!/bin/bash

OUTPUT_FILE="website_code_export.txt"
echo "For The Record Website - Complete Code Export" > "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo "================================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to add file content
add_file() {
    if [ -f "$1" ]; then
        echo "" >> "$OUTPUT_FILE"
        echo "========================================" >> "$OUTPUT_FILE"
        echo "FILE: $1" >> "$OUTPUT_FILE"
        echo "========================================" >> "$OUTPUT_FILE"
        cat "$1" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
}

# Public HTML files
echo "=== PUBLIC HTML FILES ===" >> "$OUTPUT_FILE"
add_file "public/index.html"
add_file "public/book-now.html"
add_file "public/thank-you.html"
add_file "public/CNAME"

# React Components
echo "=== REACT COMPONENTS ===" >> "$OUTPUT_FILE"
add_file "src/App.js"
add_file "src/components/Home.js"
add_file "src/components/About.js"
add_file "src/components/Weddings.js"
add_file "src/components/Events.js"
add_file "src/components/Contact.js"
add_file "src/components/BookNow.js"
add_file "src/components/Navbar.js"

# Hooks
echo "=== HOOKS ===" >> "$OUTPUT_FILE"
add_file "src/hooks/useEmail.js"
add_file "src/hooks/useBookingForm.js"

# Styles
echo "=== STYLES ===" >> "$OUTPUT_FILE"
add_file "src/App.scss"
add_file "src/components/Home.scss"
add_file "src/components/About.scss"
add_file "src/components/Weddings.scss"
add_file "src/components/Events.scss"
add_file "src/components/Contact.scss"
add_file "src/components/BookNow.scss"
add_file "src/components/Navbar.scss"

# Configuration
echo "=== CONFIGURATION ===" >> "$OUTPUT_FILE"
add_file "package.json"
add_file ".gitignore"

echo "" >> "$OUTPUT_FILE"
echo "================================================" >> "$OUTPUT_FILE"
echo "Export complete!" >> "$OUTPUT_FILE"
echo "Total files exported: $(grep -c "^FILE:" "$OUTPUT_FILE")" >> "$OUTPUT_FILE"

echo "✅ Export saved to: $OUTPUT_FILE"
