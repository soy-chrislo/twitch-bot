const exec = require('child_process').exec;
const path = require('path');

const playSound = (soundName) => {
  const soundPath = path.join('sounds', `${soundName}.mp3`);
  const process = exec(`ffplay -nodisp ${soundPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`stdout:\n${stdout}`);
  });  
  setTimeout(() => {
    exec(`kill -9 ${process.pid}`);
  }, 5000)
}

module.exports = {
  playSound
}
