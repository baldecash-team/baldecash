#!/bin/bash

# Script to replace hardcoded colors with CSS variables in catalog components
# Run from the root of the project

BASE_DIR="src/app/prototipos/0.6/[landing]/catalogo/components"

echo "Starting color replacement in $BASE_DIR..."

# Find all TypeScript files and replace colors
find "$BASE_DIR" -type f -name "*.tsx" -print0 | while IFS= read -r -d '' file; do
    echo "Processing: $file"

    # Replace #4654CD with var(--color-primary)
    sed -i '' 's/#4654CD/var(--color-primary)/g' "$file"

    # Replace #4654CD/XX opacity patterns
    sed -i '' 's/\[#4654CD\]\/\([0-9]\+\)/[rgba(var(--color-primary-rgb),0.\1)]/g' "$file"

    # Replace specific opacity patterns
    sed -i '' 's/bg-\[#4654CD\]\/5/bg-[rgba(var(--color-primary-rgb),0.05)]/g' "$file"
    sed -i '' 's/bg-\[#4654CD\]\/10/bg-[rgba(var(--color-primary-rgb),0.1)]/g' "$file"
    sed -i '' 's/bg-\[#4654CD\]\/20/bg-[rgba(var(--color-primary-rgb),0.2)]/g' "$file"
    sed -i '' 's/border-\[#4654CD\]\/20/border-[rgba(var(--color-primary-rgb),0.2)]/g' "$file"
    sed -i '' 's/border-\[#4654CD\]\/50/border-[rgba(var(--color-primary-rgb),0.5)]/g' "$file"
    sed -i '' 's/from-\[#4654CD\]\/5/from-[rgba(var(--color-primary-rgb),0.05)]/g' "$file"

    # Replace hover state #3a47b3 with hover:brightness-90
    sed -i '' 's/hover:bg-\[#3a47b3\]/hover:brightness-90/g' "$file"
    sed -i '' 's/hover:border-\[#3a47b3\]/hover:brightness-90/g' "$file"

    # Replace #03DBD0 with var(--color-secondary)
    sed -i '' 's/#03DBD0/var(--color-secondary)/g' "$file"

    # Replace #03DBD0/XX opacity patterns
    sed -i '' 's/bg-\[#03DBD0\]\/10/bg-[rgba(var(--color-secondary-rgb),0.1)]/g' "$file"
    sed -i '' 's/bg-\[#03DBD0\]\/20/bg-[rgba(var(--color-secondary-rgb),0.2)]/g' "$file"

done

echo "✓ Color replacement complete!"
echo ""
echo "Summary of replacements:"
echo "- #4654CD → var(--color-primary)"
echo "- #4654CD/XX → rgba(var(--color-primary-rgb),0.XX)"
echo "- #3a47b3 (hover) → hover:brightness-90"
echo "- #03DBD0 → var(--color-secondary)"
echo "- #03DBD0/XX → rgba(var(--color-secondary-rgb),0.XX)"
