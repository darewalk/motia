cp README.md dist/README.md
cp index.html dist/index.html
cp components.json dist/components.json
cp -r public/ dist/public
cp src/index.css dist/src/index.css
cp tailwind.config.js dist/tailwind.config.js
# cp postcss.config.mjs dist/postcss.config.mjs
cp postcss.config.js dist/postcss.config.js

# Replacing TSX to JS for dist bundling
if [[ "$OSTYPE" == "darwin"* ]]; then # Mac OS X
  sed -i '' 's/main\.tsx/main.js/g' dist/index.html
else # Linux and others
  sed -i 's/main\.tsx/main.js/g' dist/index.html
fi