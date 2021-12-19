<?php
node_version('12');
run(
    // Update libraries
    onchange(['composer.json'], 'composer update --no-dev --no-interaction;') .
    // Update libraries
    onchange(['package-lock.json', 'src'], 'npm install;npm run build;') .
    // Application changes
    onchange(['app','server.php'], 'php server.php stop;')
);
