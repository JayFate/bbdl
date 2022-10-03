const path = require("path");
const fs = require("fs-extra");
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

const DouyinVideo = require("./douyinVideo.js");

const cliProgress = require("cli-progress");

// note: you have to install this dependency manually since it's not required by cli-progress
const colors = require("ansi-colors");

let showProgress = false;
// create new progress bar
const bar = new cliProgress.SingleBar({
  format:
    "正在下载... |" +
    colors.cyan("{bar}") +
    "| {percentage}% || {value}/{total} 任务 || Speed: {speed}",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: true,
});

let counter = 0;
let len = 0;

const moveFile = async (filename) => {
  let cwd = process.cwd();
  // 【五五开】穷开挂
  const ext = ".mp4";
  filename = filename.replace(ext, "") + ext;
  const newName = filename.replace(/【|】/gm, "-").replace(/^-/, "");
  const origin = path.resolve(cwd, filename);
  const fullpath = path.resolve(cwd, newName);
  // console.log(`origin`, origin);
  // console.log(`fullpath`, fullpath);
  // update values
  if (showProgress) {
    bar.update(++counter);
  }
  if (origin !== fullpath) {
    fs.ensureFileSync(fullpath);
    return fs.move(origin, fullpath, { overwrite: true });
  }
  return Promise.resolve("success");
};

const dlDouyin = async (url) => {
  let video = new DouyinVideo(url);
  await video.parse();
  const outputName = `${video.videoTitle}.mp4`;

  let file = fs.createWriteStream(outputName);
  let data = await video.downloadVideo();
  data.pipe(file);
  return await moveFile(outputName);
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
  const { stdout, stderr } = await exec(cmd);
  // console.log('stdout:', stdout);
  // console.error('stderr:', stderr);
  const filename = stdout.replace(/[^]+视频标题: (.+)[^]+/, "$1");
  return await moveFile(filename);
};

const download = async (urls) => {
  len = urls.length;
  showProgress = true;
  // initialize the bar - defining payload token "speed" with the default value "N/A"
  bar.start(len, 0, {
    speed: "N/A",
  });
  const biliUrls = [];
  const dyUrls = [];
  urls.forEach((url) => {
    if (url.match(/bilibili\.com/)) biliUrls.push(url);
    if (url.match(/douyin\.com/)) dyUrls.push(url);
  });

  const promises = [...biliUrls.map(dlBiliBili), ...dyUrls.map(dlDouyin)];
  // biliUrls.forEach(dlBiliBili);
  // dyUrls.forEach(dlDouyin);
  await Promise.all(promises);
  bar.stop();
};

module.exports = {
  dlBiliBili,
  dlDouyin,
  download,
};
