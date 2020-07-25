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

socket.on('starting', () => {
	replaceBody('/game.html');
});

function sendChat(obj){
	let text = obj.value;
	if (window.event.keyCode == 13 && clean(text)){
		obj.value = "";
		socket.emit('chat', clean(text));
	}
}

socket.on('chat', ({name, text}) => {
	let html = `
		<p><b>${name}:</b> ${text}</p>
	`;
	document.getElementById('chat').innerHTML += html;
})