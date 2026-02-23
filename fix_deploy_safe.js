const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const currentDir = __dirname;
// Use a clean root directory to avoid Arabic path mangling in CMD child processes
const repoDir = 'd:\\Kahraman_Temp_Fix';

try {
    console.log('--- Started Deployment Fix ---');

    if (fs.existsSync(repoDir)) {
        console.log('Cleaning old temporary directory...');
        fs.rmSync(repoDir, { recursive: true, force: true });
    }

    console.log('Cloning clean repository...');
    execSync('git clone https://github.com/Dsabo2007/Kahraman-Al-Yaman.git ' + repoDir, { stdio: 'inherit' });

    console.log('Syncing updated files...');
    fs.copyFileSync(path.join(currentDir, 'script.js'), path.join(repoDir, 'script.js'));
    fs.copyFileSync(path.join(currentDir, 'package.json'), path.join(repoDir, 'package.json'));

    console.log('Running npm install to correctly generate package-lock.json...');
    execSync('npm install axios express cors dotenv mongoose', { cwd: repoDir, stdio: 'inherit' });

    console.log('Staging files for commit...');
    execSync('git add .', { cwd: repoDir, stdio: 'inherit' });

    console.log('Committing changes...');
    execSync('git commit -m "Fix: Sync package-lock.json for Railway and update frontend API URL"', { cwd: repoDir, stdio: 'inherit' });

    console.log('Pushing to GitHub (Forcefully)...');
    execSync('git push origin main --force', { cwd: repoDir, stdio: 'inherit' });

    console.log('SUCCESS: Fix pushed to GitHub. Railway should deploy immediately.');

} catch (err) {
    console.error('ERROR:', err.message);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
}
