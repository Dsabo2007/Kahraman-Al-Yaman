const { execSync } = require('child_process');
const fs = require('fs');

const logFile = 'fix_repo_log.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

try {
    fs.writeFileSync(logFile, 'Starting ultimate fix...\n');

    // 1. Remove package-lock.json to avoid sync/build issues on Railway
    if (fs.existsSync('package-lock.json')) {
        log('Deleting package-lock.json to force clean install on Railway');
        fs.unlinkSync('package-lock.json');
    }

    // 2. Fix .gitignore completely
    log('Updating .gitignore to block RAR and ZIP files');
    let gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
    if (!gitignore.includes('*.rar')) gitignore += '\n*.rar\n';
    if (!gitignore.includes('*.zip')) gitignore += '*.zip\n';
    if (!gitignore.includes('node_modules')) gitignore += 'node_modules\n';
    fs.writeFileSync('.gitignore', gitignore);

    // 3. Remove .git folder completely to destroy the massive file history
    if (fs.existsSync('.git')) {
        log('Deleting .git folder to clear bloated history');
        fs.rmSync('.git', { recursive: true, force: true });
    }

    // 4. Re-initialize git and push
    log('Initializing fresh git repository...');
    execSync('git init', { stdio: 'pipe' });

    log('Creating main branch...');
    // Ensure we are on main branch
    try { execSync('git checkout -b main', { stdio: 'pipe' }); } catch (e) { }

    log('Configuring identity...');
    execSync('git config user.name "Dsabo2007"', { stdio: 'pipe' });
    execSync('git config user.email "dsabo2007@example.com"', { stdio: 'pipe' });

    log('Adding remote...');
    execSync('git remote add origin https://github.com/Dsabo2007/Kahraman-Al-Yaman.git', { stdio: 'pipe' });

    log('Adding files to git (RAR will be ignored)...');
    execSync('git add .', { stdio: 'pipe' });

    log('Committing changes...');
    execSync('git commit -m "Fix: Resolve Railway Build and remove bloated git history"', { stdio: 'pipe' });

    log('Force pushing to GitHub...');
    execSync('git push origin main --force', { stdio: 'pipe' });

    log('SUCCESS! Repository synced. Railway should rebuild successfully.');

} catch (e) {
    log('ERROR: ' + e.message);
    if (e.stdout) log('STDOUT: ' + e.stdout.toString());
    if (e.stderr) log('STDERR: ' + e.stderr.toString());
}
