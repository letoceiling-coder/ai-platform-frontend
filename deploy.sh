#!/bin/bash
set -e

echo "STEP 1 - repo"
cd /var/www/ai-platform-frontend

echo "STEP 2 - pull"
git pull origin main

echo "STEP 3 - install"
npm install

echo "STEP 4 - build"
npm run build

echo "STEP 5 - deploy"
rm -rf /var/www/app.siteaacess.ru/*
cp -r dist/* /var/www/app.siteaacess.ru/

echo "STEP 6 - verify"
ls -la dist

echo "DONE"
