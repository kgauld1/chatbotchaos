function clean(str){
	str = str.trim().replace(/</g, '&lt').replace(/>/g, '&gt');
	return str;
}

function cleanName(str){
	console.log(typeof(str))
	str = clean(str);
	if(str.length > 15) str = str.substr(0, 15);
	return str;
}
var numpeople = 3;

const fetch = require('node-fetch');

var names = ["Liam", "Emma", "Noah", "Olivia", "William", "Ava", "James",	"Isabella", "Oliver",	"Sophia", "Benjamin", "Charlotte", "Elijah", "Mia", "Lucas", "Amelia", "Mason",	"Harper", "Logan", "Evelyn"];

module.exports = (http) => {
	var io = require('socket.io')(http);

	class Room{
		constructor(id, sockets){
			this.id = id;
			this.players = sockets;
			this.names = [];
			this.votes = [];
			for (let p of sockets){
				this.names.push([p.name, p.id]);
				this.votes.push(null);
			}
			this.chat = [];
			this.chatbotId = "happybananas";
			this.chatbotName = names[Math.floor(Math.random()*names.length)];
			if (Math.random() < 0.5) this.chatbotName = this.chatbotName.toLowerCase();
			this.names.push([this.chatbotName, this.chatbotId]);
			setTimeout(() => {
				this.end(false);
			}, 60000);
		}
		start(){
			io.in(this.id).emit('starting', this.names);
		}
		sendChat(name, message){
			io.in(this.id).emit('chat', {text: message, name: name});
			this.chat.push({text: message, name: name});
			if (Math.random() < 0.25){
				let allText = "";
				for (let c of this.chat) allText += c.text + ". ";
				if (allText.length > 1000) allText = allText.substr(allText.length-1000);
				let json = {
					prompt: {
						text: allText
					},
					length: 30,
					temperature: 1.1
				}
				console.log('alltext', json);
				fetch("https://api.inferkit.com/v1/models/standard/generate", {
						method: 'POST',
						body:    JSON.stringify(json),
						headers: {
							'Content-Type': 'application/json',
							'Authorization': 'Bearer 7df973c8-cb1a-45f6-a4a3-d5cbfa09a77b'
						}
				}).then(resp => resp.json()).then(j => {
					let txt = j.data.text;
					io.in(this.id).emit('chat', {text: txt, name: this.chatbotName});
					this.chat.push({text: txt, name: this.chatbotName});
				})
			}
		}
		vote(socket, id){
			let ind = this.players.indexOf(socket);
			this.votes[ind] = id == this.chatbotId;
			if (this.votes.every(x => x===true)) this.end(true);

		}
		end(cond){
			io.in(this.id).emit('end', {won: cond, name: this.chatbotName});
		}
	}

	var rooms = {};
	var stor = {};
	var waiting = [];

	function createGroup(){
		let randKey = Math.round(Math.random()*1e5);
		available[randKey] = {players: []};
		return "" + randKey;
	}

	io.on('connection', (socket) => {
		let name = "";

		socket.on('joinRandom', (playerName) => {
			name = cleanName(playerName);
			if (!name){
				socket.emit('error');
				return;
			}
			socket['name'] = name;
			waiting.push(socket);
			socket.emit('waiting');
			console.log('waiting', waiting.length);
			if (waiting.length >= numpeople) {
				roomId = Math.round(Math.random()*1e10);
				rooms[roomId] = new Room(roomId, waiting.splice(0, numpeople));
				for (let s of rooms[roomId].players){
					s.join(roomId);
					stor[s.id] = roomId;
				}
				rooms[roomId].start();
			}
		});

		socket.on('chat', message => {
			let group = stor[socket.id];
			message = clean(message);
			rooms[group].sendChat(name, message);
		});

		socket.on('vote', id => {
			let group = stor[socket.id];
			rooms[group].vote(socket, id);
		});
		
		socket.on('disconnect', () => {
			if (socket.id in stor){
				let group = stor[socket.id];
				socket.leave(group);
				ind = rooms[group].players.indexOf(socket);
				delete rooms[group].players[ind];
				if (rooms[group].players.length == 0) delete rooms[group];
				delete stor[socket.id];
			}
			else {
				if (waiting.includes(socket)){
					waiting.splice(waiting.indexOf(socket), 1);
				}
			}
		});
		
	});
}