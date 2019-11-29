const input = document.querySelector('input[type="file"]');
const listener = input.addEventListener('change', function(e) {
	const reader = new FileReader();
	reader.onload = function() {
		
		// reading data
		var vertices = [];
		var faces = [];
		var file = reader.result;
		var char = file.split(/\s+/);
		for (var i = 0; i<char.length; i+=4) {
			if (char[i]=="v") {
				var x = parseFloat(char[i+1]);
				var y = parseFloat(char[i+2]);
				var z = parseFloat(char[i+3]);
				vertices.push([x, y, z, 1.0]);
			}
			else if (char[i]=="f") {
				var vertex1 = parseFloat(char[i+1]);
				var vertex2 = parseFloat(char[i+2]);
				var vertex3 = parseFloat(char[i+3]);
				faces.push([vertex1, vertex2, vertex3]);
			}
		}

		// rotation X
		function rotateX (alpha) {
			return [[1, 0, 0, 0],
					[0, Math.cos(alpha), -Math.sin(alpha), 0],
					[0, Math.sin(alpha), Math.cos(alpha), 0],
					[0, 0, 0, 1]];
		};

		// rotation Y
		function rotateY (alpha) {
			return [[Math.cos(alpha), 0, Math.sin(alpha), 0],
					[0, 1, 0, 0],
					[-Math.sin(alpha), 0, Math.cos(alpha), 0],
					[0, 0, 0, 1]];
		};

		// rotation Z
		function rotateZ (alpha) {
			return [[Math.cos(alpha), -Math.sin(alpha), 0, 0],
					[Math.sin(alpha), Math.cos(alpha), 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1]];
		};

		// translation
		function translate(dx, dy, dz) {
			return [[1, 0, 0, dx],
					[0, 1, 0, dy],
					[0, 0, 1, dz],
					[0, 0, 0, 1]];
		};

		// scaling
		function scale(sx, sy, sz) {
			return [[sx, 0, 0, 0],
					[0, sy, 0, 0],
					[0, 0, sz, 0],
					[0, 0, 0, 1]];
		};
		
		// perspective
		function perspective(d) {
			return [[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 1/d, 0]];
		};

		// matrix multiplication
		function multiply(vertices, transformMat) {
			var result = [];
			for (var i = 0; i<vertices.length; i++) {
				var resultX = transformMat[0][0]*vertices[i][0]+
								transformMat[0][1]*vertices[i][1]+
								transformMat[0][2]*vertices[i][2]+
								transformMat[0][3]*vertices[i][3];

				var resultY = transformMat[1][0]*vertices[i][0]+
								transformMat[1][1]*vertices[i][1]+
								transformMat[1][2]*vertices[i][2]+
								transformMat[1][3]*vertices[i][3];

				var resultZ = transformMat[2][0]*vertices[i][0]+
								transformMat[2][1]*vertices[i][1]+
								transformMat[2][2]*vertices[i][2]+
								transformMat[2][3]*vertices[i][3];

				var resultW = transformMat[3][0]*vertices[i][0]+
								transformMat[3][1]*vertices[i][1]+
								transformMat[3][2]*vertices[i][2]+
								transformMat[3][3]*vertices[i][3];

				result.push([resultX, resultY, resultZ, resultW]);
			}
			return result;
		};

		// homogenous coordinates
		function homoCoord(vertices) {
			for (var i = 0; i<vertices.length; i++) {
				if (vertices[i][2]!=1) {
					vertices[i][0] = vertices[i][0]/vertices[i][2];
					vertices[i][1] = vertices[i][1]/vertices[i][2];
					vertices[i][2] = 1;
					vertices[i][3] = 1;
				}
			}
			return vertices;
		}

		// wireframe
		var canvas = document.getElementById("myCanvas");
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "#858585";
		ctx.fillRect(0, 0, 1080, 720);

		// draw line
		function render(vertices, faces) {
			vertices = multiply(vertices, translate(0, 0, -1.5)); // camera position
			vertices = homoCoord(multiply(vertices, perspective(4))); // perspective crop
			for (var i = 0; i<faces.length; i++) {
				ctx.beginPath();
				ctx.moveTo(vertices[faces[i][0]-1][0]*360+540, vertices[faces[i][0]-1][1]*360+360);
				ctx.lineTo(vertices[faces[i][1]-1][0]*360+540, vertices[faces[i][1]-1][1]*360+360);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(vertices[faces[i][1]-1][0]*360+540, vertices[faces[i][1]-1][1]*360+360);
				ctx.lineTo(vertices[faces[i][2]-1][0]*360+540, vertices[faces[i][2]-1][1]*360+360);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(vertices[faces[i][0]-1][0]*360+540, vertices[faces[i][0]-1][1]*360+360);
				ctx.lineTo(vertices[faces[i][2]-1][0]*360+540, vertices[faces[i][2]-1][1]*360+360);
				ctx.stroke();
			}
		}
		render(vertices, faces);
		var tx = 0; 
		var ty = 0;
		var tz = 0;
		document.addEventListener('keydown', function(event) {
			// levo
		    if(event.keyCode == 37) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(-0.1, 0, 0));
				tx-=0.1;
				render(vertices, faces);
		    }
		    // desno
		    else if(event.keyCode == 39) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0.1, 0, 0));
				tx+=0.1;
				render(vertices, faces);
		    }
		    // up
		    else if(event.keyCode == 38) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, -0.1, 0));
				ty-=0.1;
				render(vertices, faces);
		    }
		    // down
		    else if(event.keyCode == 40) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, 0.1, 0));
				ty+=0.1;
				render(vertices, faces);
		    }
		    // backward
		    else if(event.keyCode == 57) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, 0, -0.1));
				tz-=0.1;
				render(vertices, faces);
			}
		    // forward
		    else if(event.keyCode == 48) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, 0, 0.1));
				tz+=0.1;
				render(vertices, faces);
			}
		    // scaling x
		    else if(event.keyCode == 49) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(-tx, 0, 0));
				vertices = multiply(vertices, scale(1.1, 1, 1));
				vertices = multiply(vertices, translate(tx, 0, 0));
				render(vertices, faces);
		    }
		    else if(event.keyCode == 50) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(-tx, 0, 0));
				vertices = multiply(vertices, scale(0.9, 1, 1));
				vertices = multiply(vertices, translate(tx, 0, 0));
				render(vertices, faces);
		    }
		    // scaling y
		    else if(event.keyCode == 51) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, -ty, 0));
				vertices = multiply(vertices, scale(1, 1.1, 1));
				vertices = multiply(vertices, translate(0, ty, 0));
				render(vertices, faces);
		    }
		    else if(event.keyCode == 52) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, -ty, 0));
				vertices = multiply(vertices, scale(1, 0.9, 1));
				vertices = multiply(vertices, translate(0, ty, 0));
				render(vertices, faces);
		    }
		    // scaling z
		    else if(event.keyCode == 53) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, 0, -tz));
				vertices = multiply(vertices, scale(1, 1, 1.1));
				vertices = multiply(vertices, translate(0, 0, tz));
				render(vertices, faces);
		    }
		    else if(event.keyCode == 54) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, 0, -tz));
				vertices = multiply(vertices, scale(1, 1, 0.9));
				vertices = multiply(vertices, translate(0, 0, tz));
				render(vertices, faces);
		    }
		    // rotation x
		    else if(event.keyCode == 104) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, -ty, -tz));
				vertices = multiply(vertices, rotateX(0.10));
				vertices = multiply(vertices, translate(0, ty, tz));
				render(vertices, faces);
		    }
		    else if(event.keyCode == 98) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(0, -ty, -tz));
				vertices = multiply(vertices, rotateX(-0.10));
				vertices = multiply(vertices, translate(0, ty, tz));
				render(vertices, faces);
		    }
		    // rotation y
		    else if(event.keyCode == 100) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(-tx, 0, -tz));
				vertices = multiply(vertices, rotateY(0.10));
				vertices = multiply(vertices, translate(tx, 0, tz));
				render(vertices, faces);
		    }
		    else if(event.keyCode == 102) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(-tx, 0, -tz));
				vertices = multiply(vertices, rotateY(-0.10));
				vertices = multiply(vertices, translate(tx, 0, tz));
				render(vertices, faces);
		    }
		    // rotation z
		    else if(event.keyCode == 97) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(-tx, -ty, 0));
				vertices = multiply(vertices, rotateZ(0.10));
				vertices = multiply(vertices, translate(tx, ty, 0));
				render(vertices, faces);
		    }
		    else if(event.keyCode == 99) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				vertices = multiply(vertices, translate(-tx, -ty, 0));
				vertices = multiply(vertices, rotateZ(-0.10));
				vertices = multiply(vertices, translate(tx, ty, 0));
				render(vertices, faces);
		    }
		});

	}
	reader.readAsText(input.files[0]);
}, false);