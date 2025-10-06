#!/bin/bash

# Script to sanitize package names for use in artifact names
# Removes @ symbol and replaces / with -

if [ $# -eq 0 ]; then
    echo "Usage: $0 <package-name>"
    exit 1
fi

package_name="$1"

# Remove @ symbol if it exists at the beginning
sanitized_name="${package_name#@}"

# Replace / with -
sanitized_name="${sanitized_name//\//-}"

echo "$sanitized_name"
