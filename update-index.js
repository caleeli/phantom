// Generate MD5 hash for assets
const md5 = require('md5');
const fs = require('fs');

const assets = [
    'coredump.css',
    'global.css',
    'build/bundle.css',
    'pwc.css',
    'print.css',
    'build/bundle.js',
];

const hashes = {};
assets.forEach(asset => {
    hashes[asset.replace(/\W/g, "_")] = md5(fs.readFileSync(`public/${asset}`));
});

// read public/index.jhtml
let index = fs.readFileSync('public/index.jhtml', 'utf8');
// replace hashes in index.html
index = new Function(...Object.keys(hashes), `return \`${index}\``)(...Object.values(hashes));
// write to public/index.html
fs.writeFileSync('public/index.html', index);
