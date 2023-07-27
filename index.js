const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');

const { oauthToken } = require('./env.js');
const { playSound } = require('./soundController.js');


/*
TODO:
- [CHECK] Permitir argumentos al comando !playsound para reproducir musica dinamicamente.
- Crear un anti-flood, solo suma puntos si el mensaje es diferente al anterior y fue enviado hace mas de 5 segundos.
- Consolidar la economia de puntos, con funciones CRUD: dar puntos, quitar puntos, ver puntos.
- Crear un comando para ver los puntos de un usuario en especifico.
- Crear un comando para ver los puntos de todos los usuarios.
- [CHECK] Crear un comando para ver los puntos de los 10 usuarios con mas puntos.

*/


const soundList = fs.readdirSync(path.join(__dirname, 'sounds')).map(sound => sound.replace('.mp3', ''));

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: 'soychrislo',
		password: oauthToken
	},
	channels: [ 'soychrislo' ]
});
client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
	if(self) return;
  const user = tags.username;
	if(message.toLowerCase() === '!hello') {
		client.say(channel, `@${tags.username}, heya!`);
	} else if(message.toLowerCase() === '!toppoints') {
    topPointsCommand(channel);
  } else if(message.toLowerCase().startsWith('!playsound')){
    const soundName = message.split(' ')[1];
    if(!soundList.includes(soundName)) {
      client.say(channel, `@${tags.username}, el sonido ${soundName} no existe. Los sonidos disponibles son: ${soundList.join(', ')}.`);
      return;
    }
    playSound(soundName);
  } else {
    addingPoints(user, message);
  }
});

const topPointsCommand = (channel) => {
  const topUsers = getTop();
  const topUsersString = topUsers.map((user, index) => `${index + 1}. ${user.user} - ${user.points} points`).join(', ');
  // getTop() ya viene con el user.json, removerlo
  client.say(channel, `${topUsersString.replace('.json', '')}`);
}

const getTop = () => {
  const usersPath = path.join(__dirname, 'users');
  const users = fs.readdirSync(usersPath);
  const usersWithPoints = users.map(user => {
    const userFile = fs.readFileSync(path.join(usersPath, user), 'utf8');
    const { points } = JSON.parse(userFile);
    return { user, points };
  });
  const sortedUsers = usersWithPoints.sort((a, b) => b.points - a.points);
  const topUsers = sortedUsers.slice(0, 10);
  return topUsers;
}

const addingPoints = (user, message) => {
  const messageCharCount = message.length;
  const points = messageCharCount / 3;
  addRegister(user, points);
}

const addRegister = (user, points) => {
  const userPath = path.join(__dirname, 'users', `${user}.json`);
  if (fs.existsSync(userPath)) {
    const userFile = fs.readFileSync(userPath, 'utf8');
    const { points: currentPoints } = JSON.parse(userFile);
    fs.writeFileSync(userPath, JSON.stringify({ points: currentPoints + points }));
  } else {
    fs.writeFileSync(userPath, JSON.stringify({ points }));
  }
}