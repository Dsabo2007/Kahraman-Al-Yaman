@echo off
chcp 65001 > nul
echo --- Starting Git Sync --- > sync_log.txt
echo Adding files... >> sync_log.txt
git add script.js package.json package-lock.json >> sync_log.txt 2>&1
echo Committing... >> sync_log.txt
git commit -m "Final fix: Connect frontend to Railway and fix dependencies" >> sync_log.txt 2>&1
echo Pushing... >> sync_log.txt
git push origin main --force >> sync_log.txt 2>&1
echo --- Finished --- >> sync_log.txt
