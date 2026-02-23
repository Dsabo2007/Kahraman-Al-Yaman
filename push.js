const { execSync } = require('child_process');

try {
    console.log('Running npm install...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Adding files...');
    execSync('git add package-lock.json package.json script.js', { stdio: 'inherit' });
    console.log('Committing...');
    execSync('git commit -m "Fix: Sync package-lock.json for Railway build and connect Railway URL in frontend"', { stdio: 'inherit' });
    console.log('Pushing...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('Done!');
} catch (e) {
    console.error('Action failed:', e.message);
}
