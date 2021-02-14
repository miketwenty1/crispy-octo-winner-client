#!/bin/bash

npm run build
rm -rf ../crispy-octo-winner/public/
mkdir ../crispy-octo-winner/public

cp -R assets ../crispy-octo-winner/public/assets/
cp -R build ../crispy-octo-winner/public/build/
cp index.html ../crispy-octo-winner/public/index.html