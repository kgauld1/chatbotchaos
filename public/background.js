let canvas;
let pieces = [];
function setup(){
  colorMode(HSB,360,100,100)
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0,0);
  canvas.style('z-index', '-1');
  for(var i = 0; i < 2000; i++){
    var s = random(2,5);
    var xn = random(width);
    var yn = random(height);
		pieces[i] = {
			x: xn,
			y: yn,
			v1: [random(-3,3)*s, 0],
      v2: [0, random(-3,3)*s],
      v3: [random(-4,4)*s, random(-4,4)*s],
      vx: random(-3,3),
      vy: random(-3,3),
			rot: random(0, 2*Math.PI),
			vrot: random(-0.1, 0.1)
		}
  }
}

function draw(){
  //frameRate(10);
  background(0);
  drawPieces();
}

function drawPieces(){
  fill(200, 40, 80, 0.7);
  
  for(var i = 0; i < pieces.length; i++){
    //console.log(pieces[i].v1 + "|" + pieces[i].v2);
    // ellipse(pieces[i].x, pieces[i].y, 10);
    
    push();
    noStroke();
    translate(pieces[i].x + pieces[i].v1[0], pieces[i].y + pieces[i].v1[1]);
    rotate(pieces[i].rot);
    beginShape(TRIANGLES);
    
    vertex(0, 0);
    vertex(pieces[i].v2[0]-pieces[i].v1[0], pieces[i].v1[1]-pieces[i].v1[1]);
    vertex(pieces[i].v3[0]-pieces[i].v1[0], pieces[i].v3[1]-pieces[i].v1[1]);
    endShape();
    pop();
		pieces[i].rot += pieces[i].vrot;
    
    pieces[i].x = (pieces[i].x + pieces[i].vx)%width
    pieces[i].y = (pieces[i].y + pieces[i].vy)%height;
	}
  
}