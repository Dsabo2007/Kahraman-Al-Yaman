@echo off
chcp 65001 > nul
echo --- Fixing package-lock.json --- > fix_lock_log.txt
echo Running npm install... >> fix_lock_log.txt
call npm install >> fix_lock_log.txt 2>&1
echo Adding to git... >> fix_lock_log.txt
git add package-lock.json package.json >> fix_lock_log.txt 2>&1
echo Committing... >> fix_lock_log.txt
git commit -m "Fix: Sync package-lock.json with package.json to resolve Railway build failure" >> fix_lock_log.txt 2>&1
echo Pushing... >> fix_lock_log.txt
git push origin main >> fix_lock_log.txt 2>&1
echo --- Done --- >> fix_lock_log.txt
