#!/usr/bin/env node

const path = require("path");
const fs = require("fs-extra");

const package = require("../package.json");
const { download } = require("../src/index.js");

console.log(`bbdl version: ${package.version}`);
let cwd = process.cwd();
const targetPath = path.resolve(cwd, "bbdl");
fs.ensureDirSync(targetPath);
process.chdir(targetPath);
cwd = process.cwd();

console.log(`输出目录为: ${cwd}`);

const urls = process.argv.slice(2);
download(urls)
