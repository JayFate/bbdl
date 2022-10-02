const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");

const DouyinVideo = require("./douyinVideo.js");

const moveFile = (filename) => {
  let cwd = process.cwd();
  // 【五五开】穷开挂
  const ext = ".mp4";
  filename = filename.replace(ext, "") + ext;
  const newName = filename.replace(/【|】/gm, "-").replace(/^-/, "");
  const origin = path.resolve(cwd, filename);
  const fullpath = path.resolve(cwd, newName);
  // console.log(`origin`, origin);
  // console.log(`fullpath`, fullpath);
  fs.ensureFileSync(fullpath);
  if (origin === fullpath) return;
  fs.move(origin, fullpath, { overwrite: true }, (err) => {
    if (err) console.log(`err111`, err);
  });
};

let counter = 0;
let len = 0;
const dlDouyin = async (url) => {
  let video = new DouyinVideo(url);
  await video.parse();
  const outputName = `${video.videoTitle}.mp4`;

  let file = fs.createWriteStream(outputName);
  let data = await video.downloadVideo();
  data.pipe(file);
  moveFile(outputName);
  console.log(`finashed ${++counter}/${len}`);
};

const binaryPath = path.resolve(
  __dirname,
  "../files/",
  process.platform,
  "BBDown"
);

const dlBiliBili = async (url) => {
  const cmd = `${binaryPath} ${url}`;
  // console.log(cmd);
  return new Promise((resolve, reject) => {
    exec(cmd, {}, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec cmd error: ${error}`);
        reject(error);
        return;
      }
      const filename = stdout.replace(/[^]+视频标题: (.+)[^]+/, "$1");
      moveFile(filename);
      resolve("success");
      console.log(`finashed ${++counter}/${len}`);
    });
  });
};

const download = async (urls) => {
  len = urls.length;
  const biliUrls = [];
  const dyUrls = [];
  urls.forEach((url) => {
    if (url.match(/bilibili\.com/)) biliUrls.push(url);
    if (url.match(/douyin\.com/)) dyUrls.push(url);
  });

  biliUrls.forEach(dlBiliBili);
  dyUrls.forEach(dlDouyin);
};

module.exports = {
  dlBiliBili,
  dlDouyin,
  download,
};
