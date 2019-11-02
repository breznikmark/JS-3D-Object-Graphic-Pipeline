const input = document.querySelector('input[type="file"]');
const listener = input.addEventListener('change', function(e) {
	const reader = new FileReader();
	reader.onload = function() {
		
		// branje podatkov v tabeli oglisca in trikotniki
		var oglisca = [];
		var trikotniki = [];
		var datoteka = reader.result;
		var znaki = datoteka.split(/\s+/);
		var prviDelBranja = 0; //postane 1 ko preberemo oglisca, in zacnemo s povezavami
		for (var i = 0; i<znaki.length; i+=4) {
			if (znaki[i]=="v") {
				var x = parseFloat(znaki[i+1]);
				var y = parseFloat(znaki[i+2]);
				var z = parseFloat(znaki[i+3]);
				oglisca.push([x, y, z, 1.0]);
			}
			else if (znaki[i]=="f") {
				var oglisce1 = parseFloat(znaki[i+1]);
				var oglisce2 = parseFloat(znaki[i+2]);
				var oglisce3 = parseFloat(znaki[i+3]);
				trikotniki.push([oglisce1, oglisce2, oglisce3]);
			}
		}

		// realizacija metod

		// rotacija po X-osi
		function rotateX (alpha) {
			return [[1, 0, 0, 0],
					[0, Math.cos(alpha), -Math.sin(alpha), 0],
					[0, Math.sin(alpha), Math.cos(alpha), 0],
					[0, 0, 0, 1]];
		};

		// rotacija po Y-osi
		function rotateY (alpha) {
			return [[Math.cos(alpha), 0, Math.sin(alpha), 0],
					[0, 1, 0, 0],
					[-Math.sin(alpha), 0, Math.cos(alpha), 0],
					[0, 0, 0, 1]];
		};

		// rotacija po Z-osi
		function rotateZ (alpha) {
			return [[Math.cos(alpha), -Math.sin(alpha), 0, 0],
					[Math.sin(alpha), Math.cos(alpha), 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1]];
		};

		// translacija
		function translate(dx, dy, dz) {
			return [[1, 0, 0, dx],
					[0, 1, 0, dy],
					[0, 0, 1, dz],
					[0, 0, 0, 1]];
		};

		// skaliranje
		function scale(sx, sy, sz) {
			return [[sx, 0, 0, 0],
					[0, sy, 0, 0],
					[0, 0, sz, 0],
					[0, 0, 0, 1]];
		};
		
		// perspektiva
		function perspective(d) {
			return [[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 1/d, 0]];
		};

		// mnozenje matrike oglisca s transformacijskimi matrikami
		// PAZI!! Vektorji so pri matriki rezultat se vedno v transponirani obliki
		function multiply(oglisca, transformMat) {
			var rezultat = [];
			for (var i = 0; i<oglisca.length; i++) {
				var rezultatX = transformMat[0][0]*oglisca[i][0]+
								transformMat[0][1]*oglisca[i][1]+
								transformMat[0][2]*oglisca[i][2]+
								transformMat[0][3]*oglisca[i][3];

				var rezultatY = transformMat[1][0]*oglisca[i][0]+
								transformMat[1][1]*oglisca[i][1]+
								transformMat[1][2]*oglisca[i][2]+
								transformMat[1][3]*oglisca[i][3];

				var rezultatZ = transformMat[2][0]*oglisca[i][0]+
								transformMat[2][1]*oglisca[i][1]+
								transformMat[2][2]*oglisca[i][2]+
								transformMat[2][3]*oglisca[i][3];

				var rezultatW = transformMat[3][0]*oglisca[i][0]+
								transformMat[3][1]*oglisca[i][1]+
								transformMat[3][2]*oglisca[i][2]+
								transformMat[3][3]*oglisca[i][3];

				rezultat.push([rezultatX, rezultatY, rezultatZ, rezultatW]);
			}
			return rezultat;
		};

		function homogeneKoordinate(oglisca) {
			for (var i = 0; i<oglisca.length; i++) {
				if (oglisca[i][2]!=1) {
					oglisca[i][0] = oglisca[i][0]/oglisca[i][2];
					oglisca[i][1] = oglisca[i][1]/oglisca[i][2];
					oglisca[i][2] = 1;
					oglisca[i][3] = 1;
				}
			}
			return oglisca;
		}

		// zicnati izris
		var canvas = document.getElementById("myCanvas");
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "#858585";
		ctx.fillRect(0, 0, 1080, 720);

		// risanje crte
		function izrisi(oglisca, trikotniki) {
			oglisca = multiply(oglisca, translate(0, 0, -1.5)); // pozicija kamere
			oglisca = homogeneKoordinate(multiply(oglisca, perspective(4))); // perspektivna projekcija
			for (var i = 0; i<trikotniki.length; i++) {
				ctx.beginPath();
				ctx.moveTo(oglisca[trikotniki[i][0]-1][0]*360+540, oglisca[trikotniki[i][0]-1][1]*360+360);
				ctx.lineTo(oglisca[trikotniki[i][1]-1][0]*360+540, oglisca[trikotniki[i][1]-1][1]*360+360);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(oglisca[trikotniki[i][1]-1][0]*360+540, oglisca[trikotniki[i][1]-1][1]*360+360);
				ctx.lineTo(oglisca[trikotniki[i][2]-1][0]*360+540, oglisca[trikotniki[i][2]-1][1]*360+360);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(oglisca[trikotniki[i][0]-1][0]*360+540, oglisca[trikotniki[i][0]-1][1]*360+360);
				ctx.lineTo(oglisca[trikotniki[i][2]-1][0]*360+540, oglisca[trikotniki[i][2]-1][1]*360+360);
				ctx.stroke();
			}
		}
		izrisi(oglisca, trikotniki);
		var tx = 0; 
		var ty = 0;
		var tz = 0;
		document.addEventListener('keydown', function(event) {
			// levo
		    if(event.keyCode == 37) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(-0.1, 0, 0));
				tx-=0.1;
				izrisi(oglisca, trikotniki);
		    }
		    // desno
		    else if(event.keyCode == 39) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0.1, 0, 0));
				tx+=0.1;
				izrisi(oglisca, trikotniki);
		    }
		    // gor
		    else if(event.keyCode == 38) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, -0.1, 0));
				ty-=0.1;
				izrisi(oglisca, trikotniki);
		    }
		    // dol
		    else if(event.keyCode == 40) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, 0.1, 0));
				ty+=0.1;
				izrisi(oglisca, trikotniki);
		    }
		    // nazaj
		    else if(event.keyCode == 57) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, 0, -0.1));
				tz-=0.1;
				izrisi(oglisca, trikotniki);
			}
		    // naprej
		    else if(event.keyCode == 48) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, 0, 0.1));
				tz+=0.1;
				izrisi(oglisca, trikotniki);
			}
		    // skaliranje x
		    else if(event.keyCode == 49) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(-tx, 0, 0));
				oglisca = multiply(oglisca, scale(1.1, 1, 1));
				oglisca = multiply(oglisca, translate(tx, 0, 0));
				izrisi(oglisca, trikotniki);
		    }
		    else if(event.keyCode == 50) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(-tx, 0, 0));
				oglisca = multiply(oglisca, scale(0.9, 1, 1));
				oglisca = multiply(oglisca, translate(tx, 0, 0));
				izrisi(oglisca, trikotniki);
		    }
		    // skaliranje y
		    else if(event.keyCode == 51) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, -ty, 0));
				oglisca = multiply(oglisca, scale(1, 1.1, 1));
				oglisca = multiply(oglisca, translate(0, ty, 0));
				izrisi(oglisca, trikotniki);
		    }
		    else if(event.keyCode == 52) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, -ty, 0));
				oglisca = multiply(oglisca, scale(1, 0.9, 1));
				oglisca = multiply(oglisca, translate(0, ty, 0));
				izrisi(oglisca, trikotniki);
		    }
		    // skaliranje z
		    else if(event.keyCode == 53) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, 0, -tz));
				oglisca = multiply(oglisca, scale(1, 1, 1.1));
				oglisca = multiply(oglisca, translate(0, 0, tz));
				izrisi(oglisca, trikotniki);
		    }
		    else if(event.keyCode == 54) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, 0, -tz));
				oglisca = multiply(oglisca, scale(1, 1, 0.9));
				oglisca = multiply(oglisca, translate(0, 0, tz));
				izrisi(oglisca, trikotniki);
		    }
		    // rotacija x
		    else if(event.keyCode == 104) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, -ty, -tz));
				oglisca = multiply(oglisca, rotateX(0.10));
				oglisca = multiply(oglisca, translate(0, ty, tz));
				izrisi(oglisca, trikotniki);
		    }
		    else if(event.keyCode == 98) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(0, -ty, -tz));
				oglisca = multiply(oglisca, rotateX(-0.10));
				oglisca = multiply(oglisca, translate(0, ty, tz));
				izrisi(oglisca, trikotniki);
		    }
		    // rotacija y
		    else if(event.keyCode == 100) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(-tx, 0, -tz));
				oglisca = multiply(oglisca, rotateY(0.10));
				oglisca = multiply(oglisca, translate(tx, 0, tz));
				izrisi(oglisca, trikotniki);
		    }
		    else if(event.keyCode == 102) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(-tx, 0, -tz));
				oglisca = multiply(oglisca, rotateY(-0.10));
				oglisca = multiply(oglisca, translate(tx, 0, tz));
				izrisi(oglisca, trikotniki);
		    }
		    // rotacija z
		    else if(event.keyCode == 97) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(-tx, -ty, 0));
				oglisca = multiply(oglisca, rotateZ(0.10));
				oglisca = multiply(oglisca, translate(tx, ty, 0));
				izrisi(oglisca, trikotniki);
		    }
		    else if(event.keyCode == 99) {
		        ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillRect(0, 0, 1080, 720);
				oglisca = multiply(oglisca, translate(-tx, -ty, 0));
				oglisca = multiply(oglisca, rotateZ(-0.10));
				oglisca = multiply(oglisca, translate(tx, ty, 0));
				izrisi(oglisca, trikotniki);
		    }
		});

	}
	reader.readAsText(input.files[0]);
}, false);