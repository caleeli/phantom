<?php
run(
    // Update libraries
    onchange(['composer.json'], 'composer install --no-dev;') .
    // Update libraries
    onchange(['package-lock.json', 'src'], 'npm install;npm run build;') .
    // Application changes
    onchange(['app','server.php'], 'php server.php reload;')
);
