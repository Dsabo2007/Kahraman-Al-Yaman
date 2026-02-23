const { execSync } = require('child_process');
const fs = require('fs');

try {
    let log = 'Starting push.js\n';
    fs.writeFileSync('node_push_log.txt', log);

    log += 'Running npm install...\n';
    fs.writeFileSync('node_push_log.txt', log);
    execSync('npm install', { stdio: 'ignore' });

    log += 'Adding files...\n';
    fs.writeFileSync('node_push_log.txt', log);
    execSync('git add package-lock.json package.json script.js', { stdio: 'ignore' });

    log += 'Committing...\n';
    fs.writeFileSync('node_push_log.txt', log);
    execSync('git commit -m "Fix: Sync package-lock.json for Railway build and connect Railway URL in frontend" || exit 0', { stdio: 'ignore' });

    log += 'Pushing...\n';
    fs.writeFileSync('node_push_log.txt', log);
    execSync('git push origin main --force', { stdio: 'ignore' });

    log += 'Done!\n';
    fs.writeFileSync('node_push_log.txt', log);
} catch (e) {
    fs.appendFileSync('node_push_log.txt', 'Error: ' + e.message + '\n');
}
