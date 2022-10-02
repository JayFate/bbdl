#!/usr/bin/env node

const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");

const package = require("../package.json");
const DouyinVideo = require("../src/index.js");

console.log(`bbdl version: ${package.version}`);
let cwd = process.cwd();
const targetPath = path.resolve(cwd, "bbdl");
fs.ensureDirSync(targetPath);
process.chdir(targetPath);
cwd = process.cwd();

const moveFile = (filename) => {
  // 【五五开】穷开挂
  const ext = ".mp4";
  filename = filename.replace(ext, "") + ext;
  const newName = filename.replace(/【|】/gm, "-").replace(/^-/, "");
  const origin = path.resolve(cwd, filename);
  const fullpath = path.resolve(cwd, newName);
  fs.ensureFileSync(fullpath);
  if (origin === fullpath) return;
  fs.move(origin, fullpath, { overwrite: true }, (err) => {
    if (err) console.log(`err111`, err);
  });
};

main();

async function main() {
  const urls = process.argv.slice(2);
  const biliUrls = [];
  const dyUrls = [];
  urls.forEach((url) => {
    if (url.match(/bilibili\.com/)) biliUrls.push(url);
    if (url.match(/douyin\.com/)) dyUrls.push(url);
  });

  console.log(`输出目录为: ${cwd}`);
  console.log("正在下载，请稍后...");
  let counter = 0;
  let len = urls.length;
  const binaryPath = path.resolve(
    __dirname,
    "../files/",
    process.platform,
    "BBDown"
  );

  biliUrls.forEach((url) => {
    const cmd = `${binaryPath} ${url}`;
    // console.log(cmd);
    exec(cmd, {}, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec cmd error: ${error}`);
        return;
      }
      const filename = stdout.replace(/[^]+视频标题: (.+)[^]+/, "$1");
      moveFile(filename);
      console.log(`finashed ${++counter}/${len}`);
    });
  });
  dyUrls.forEach(async (url) => {
    let video = new DouyinVideo(url);
    await video.parse();
    const outputName = `${video.videoTitle}.mp4`;

    let file = fs.createWriteStream(outputName);
    let data = await video.downloadVideo();
    data.pipe(file);
    moveFile(outputName);
    console.log(`finashed ${++counter}/${len}`);
  });
}
