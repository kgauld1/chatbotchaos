var socket = io();

async function replaceBody(file){
	let resp = await fetch(file);
	let text = await resp.text();
	document.body.innerHTML = text;
}

function clean(str){
	str = str.trim().replace(/</g, '&lt').replace(/>/g, '&gt');
	return str;
}

function enterGame(){
	var name = document.getElementById('name');
	if(name.value && clean(name.value)){
		socket.emit('joinRandom', name.value);
	}
}

socket.on('waiting', () => {
	document.getElementById('waiting').style.display="inline-block";
});

socket.on('starting', async (names) => {
	console.log(names);
	await replaceBody('/game.html');
	let v = document.getElementById('votes');
	for (let i = 0; i < names.length; i++){
		v.innerHTML += `<span>${names[i][0]} <input type="radio" id="${names[i][1]}" onclick=vote(this.id)> </span>`
	}
});

function sendChat(obj){
	let text = obj.value;
	if (window.event.keyCode == 13 && clean(text)){
		obj.value = "";
		socket.emit('chat', clean(text));
	}
}

function vote(id){
	socket.emit('vote', id);
}

socket.on('chat', ({name, text}) => {
	let html = `
		<p><b>${name}:</b> ${text}</p>
	`;
	let chat = document.getElementById('chat')
	chat.innerHTML += html;
	chat.scrollTop = chat.scrollHeight;

})

socket.on('end', async ({won, name}) => {
	await replaceBody('/winlose.html');
	let h1 = document.getElementById('condition');
	let h2 = document.getElementById('chatbotName');
	if (won) h1.innerHTML = "You won!";
	else h1.innerHTML = "You lost.";
	h2.innerHTML = "The chatbot's name was " + name;
})