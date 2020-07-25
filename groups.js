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

module.exports = (http) => {
	var io = require('socket.io')(http);

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
			waiting.push(socket);
			socket.emit('waiting');
			console.log('waiting', waiting.length);
			if (waiting.length >= 2) {
				roomId = Math.round(Math.random()*1e10);
				console.log('room:', roomId);
				rooms[roomId] = {
					players: waiting.splice(0, 2),
					chat: []
				};
				for (let s of rooms[roomId].players){
					s.join(roomId);
					console.log(s.id);
					s.emit("starting");
					stor[s.id] = roomId;
				}
			}
		});

		socket.on('chat', message => {
			let group = stor[socket.id];
			message = clean(message);
			io.to(group).emit('chat', {text: message, name: name});
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