#!/bin/bash

# Remove large binary files
git rm --cached -r "*.wasm" 2>/dev/null
git rm --cached -r "*.node" 2>/dev/null
git rm --cached -r "*.tar.gz" 2>/dev/null
git rm --cached -r "*.map" 2>/dev/null

# Remove build artifacts
git rm --cached -r "dist/" 2>/dev/null
git rm --cached -r "build/" 2>/dev/null
git rm --cached -r "Release/" 2>/dev/null
git rm --cached -r "*.min.js" 2>/dev/null
git rm --cached -r "*.min.css" 2>/dev/null
git rm --cached -r "*.development.js" 2>/dev/null

# Remove sensitive files
git rm --cached -r "*serviceAccountKey*.json" 2>/dev/null
git rm --cached -r "*credentials*.json" 2>/dev/null
git rm --cached -r "*key*.json" 2>/dev/null
git rm --cached -r "*.pem" 2>/dev/null
git rm --cached -r "*.key" 2>/dev/null

# Remove database files
git rm --cached -r "*.sqlite" 2>/dev/null
git rm --cached -r "*.db" 2>/dev/null
git rm --cached -r "*.data" 2>/dev/null

# Clean git's cache
git gc --prune=now
