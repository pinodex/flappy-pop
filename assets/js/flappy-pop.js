/*!
 * Flappy Pop
 * Browser game based on Android 5.0 easter egg.
 * 
 * Copyright 2015, Raphael Marco
 */

var FlappyPop = function(options) {

    var POPS = ['belt', 'droid', 'pizza', 'stripes', 'swirl', 'vortex', 'vortex2'];
    var ROTATING_POPS = ['pizza', 'swirl', 'vortex', 'vortex2'];
    var SCENES = {
        sunrise: {
            clouds: true,
            stars: false,
            gradient: [
                [0, '#204080'],
                [0.4, '#51585C'],
                [0.8, '#807038'],
                [1, '#987C27']
            ]
        },
        noon: {
            clouds: false,
            stars: false,
            gradient: [
                [0, '#A0A0FF'],
                [1, '#C0C0FF']
            ]
        },
        sunset: {
            clouds: true,
            stars: true,
            gradient: [
                [0, '#000010'],
                [1, '#000038']
            ]
        },
        night: {
            clouds: true,
            stars: true,
            gradient: [
                [0, '#000000']
            ]
        }
    };

    var initialized = false;
    var started = false;
    var stopped = false;

    var properties = {
        lollipop: {
            size: 100,
            space: 200
        },
        android: {
            velocity: 7
        }
    };
    
    var spawnAndroid = false;
    var flap = false;

    this.options = options;

    this.element = null;
    this.canvas = null;
    this.context = null;

    this.spritesheet = {
        data: null,
        image: null
    };

    this.scene = null;

    this.stars = [];
    this.clouds = [];

    this.lollipops = [];
    this.android = null;

    this.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    this.loadSpritesheet =  function(callback) {
        if (!this.spritesheet.data) {
            var xhr = new XMLHttpRequest();
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (xhr.status !== 200) {
                        alert('An error occurred while loading game resources');
                        return;
                    }

                    this.spritesheet.data = JSON.parse(xhr.responseText);
                    
                    if (this.spritesheet.image) {
                        callback();
                    }
                }
            }.bind(this);

            xhr.open('GET', this.options.spritesheet.data, true);
            xhr.send();
        }

        if (!this.spritesheet.image) {
            var image = new Image();

            image.src = this.options.spritesheet.image;
            image.onload = function() {
                this.spritesheet.image = image;
                
                if (this.spritesheet.data) {
                    callback();
                }
            }.bind(this);
        }
    };

    this.drawImageFromSprite = function(key, x, y, height, width) {
        var imageData = this.spritesheet.data[key];

        this.context.drawImage(
            this.spritesheet.image,
            imageData.x,
            imageData.y,
            imageData.width,
            imageData.height,
            x, y, height, width
        );
    }

    this.init = function() {
        if (initialized) {
            console.warn('Game already initialized');
            return;
        }

        this.element = document.querySelector(this.options.element);

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        // Create a 9:16 canvas.
        this.canvas.height = this.element.clientHeight;
        this.canvas.width = this.element.clientWidth;

        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';

        this.element.innerHTML = "";
        this.element.appendChild(this.canvas);

        this.scene = SCENES[Object.keys(SCENES)[this.getRandomInt(0, 3)]];

        this.loadSpritesheet(function() {
            this.render();

            var text = 'Press SPACE to start';

            if (typeof window.orientation !== 'undefined') {
                text = 'Touch to start';
            }

            this.context.fillStyle = 'white';
            this.context.font = 'bold 20px sans-serif';
            this.context.textBaseline = 'middle'; 
            this.context.textAlign = 'center'; 
            this.context.fillText(text, this.canvas.width / 2, this.canvas.height / 2);

            initialized = true;
        }.bind(this));

        addEventListener('touchstart', function(e) {
            if (!started) {
                this.start();
            }

            if (e.repeat) {
                flap = false;
                return;
            }

            flap = true;
        }.bind(this), false);

        addEventListener('touchend', function(e) {
            flap = false;
        }.bind(this), false);

        addEventListener('keydown', function(e) {
            if (e.keyCode == 32) {
                if (!started) {
                    this.start();
                }

                if (e.repeat) {
                    flap = false;
                    return;
                }
                
                flap = true;
            }
        }.bind(this), false);

        addEventListener('keyup', function(e) {
            flap = false;
        }.bind(this), false);
    };

    this.loop = function() {
        this.update();
        this.checkCollisions();
        this.render();

        if (stopped) {
            return;
        }

        requestAnimationFrame(this.loop.bind(this));
    };

    this.start = function() {
        if (stopped) {
            this.scene = SCENES[Object.keys(SCENES)[this.getRandomInt(0, 3)]];

            this.stars = [];
            this.clouds = [];

            this.lollipops = [];
            this.android = null;

            stopped = false;
        }

        spawnAndroid = true;
        
        this.spawnLollipop();
        this.loop();

        started = true;
    };

    this.stop = function() {
        flap = false;

        stopped = true;
        started = false;
    };

    this.render = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background
        var linearGradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);

        for (var i = 0; i < this.scene.gradient.length; i++) {
            linearGradient.addColorStop(this.scene.gradient[i][0], this.scene.gradient[i][1]);
        };

        this.context.fillStyle = linearGradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Stars
        for (var i = 0; i < this.options.stars; i++) {
            var x = this.stars[i] ? this.stars[i][0] : this.getRandomInt(0, this.canvas.width);
            var y = this.stars[i] ? this.stars[i][1] : this.getRandomInt(0, this.canvas.height);

            this.drawImageFromSprite('star', x, y, 10, 10);
            this.stars.push([x, y]);
        };

        // Clouds
        for (var i = 0; i < this.options.clouds; i++) {
            var x = this.clouds[i] ? this.clouds[i][0] : this.getRandomInt(0, this.canvas.width);
            var y = this.clouds[i] ? this.clouds[i][1] : this.getRandomInt(0, this.canvas.height);
            var size = this.clouds[i] ? this.clouds[i][2] : this.getRandomInt(36, 96);

            this.drawImageFromSprite('cloud', x, y, size, size);
            this.clouds.push([x, y, size]);
        };

        // Lollipops
        for (var i = 0; i < this.lollipops.length; i++) {
            var lollipop = this.lollipops[i];
            var stickX = lollipop.gX + (properties.lollipop.size / 2) - 7.5;

            this.drawImageFromSprite('stick', stickX, 0, 15, lollipop.top.y + 5);
            this.drawImageFromSprite('stick', stickX, lollipop.bottom.y + properties.lollipop.size - 5, 15, this.canvas.height - lollipop.bottom.y - properties.lollipop.size + 5);

            this.drawImageFromSprite('pop_' + lollipop.top.type, lollipop.gX, lollipop.top.y, properties.lollipop.size, properties.lollipop.size);
            this.drawImageFromSprite('pop_' + lollipop.bottom.type, lollipop.gX, lollipop.bottom.y, properties.lollipop.size, properties.lollipop.size);
        };

        // Android
        if (spawnAndroid) {
            var Ax = this.android ? this.android.x : (this.canvas.width / 2) - 24;
            var Ay = this.android ? this.android.y : (this.canvas.height / 2) - 24;
            var Aa = this.android ? this.android.a : 0;

            this.context.save();
            this.context.translate(Ax, Ay);
            this.context.rotate(Aa * (Math.PI / 180));
            this.context.translate(-24, -24);

            this.drawImageFromSprite('android', -24, -24, 48, 48);

            this.context.restore();
            this.android = {
                x: Ax,
                y: Ay,
                a: Aa
            }
        }
    };

    this.spawnLollipop = function() {
        if (this.lollipops.length >= 2) {
            return;
        }

        var lollipop = lollipop || {
            gX: this.canvas.width
        };

        lollipop.top = lollipop.top || {
            y: -100,
            yIn: this.getRandomInt(0, this.canvas.height - ((properties.lollipop.size * 2) + properties.lollipop.space)),
            type: POPS[this.getRandomInt(0, POPS.length - 1)]
        };
        
        lollipop.bottom = lollipop.bottom || {
            y: this.canvas.height + 100,
            yIn: lollipop.top.yIn + properties.lollipop.size + properties.lollipop.space,
            type: POPS[this.getRandomInt(0, POPS.length - 1)]
        };

        this.lollipops.push(lollipop);
    };

    this.update = function() {
        for (var i = 0; i < this.clouds.length; i++) {
            if (this.clouds[i][0] < -this.clouds[i][2]) {
                this.clouds[i][0] = this.canvas.width;
            }

            this.clouds[i][0] -= i % 2 == 0 ? 1 : 0.5;
        };

        for (var i = 0; i < this.lollipops.length; i++) {
            if (this.lollipops[i].top.y < this.lollipops[i].top.yIn) {
                this.lollipops[i].top.y += 15;
            }

            if (this.lollipops[i].bottom.y > this.lollipops[i].bottom.yIn) {
                this.lollipops[i].bottom.y -= 15;
            }

            this.lollipops[i].gX -= this.canvas.width / 200;

            if (this.lollipops[i].gX < properties.lollipop.size / 2) {
                this.spawnLollipop();
            }

            if (this.lollipops[i].gX < -properties.lollipop.size) {
                this.lollipops.splice(i, 1);
            }
        };

        if (this.android) {
            if (this.android.y < this.canvas.height - 48) {
                this.android.y += properties.android.velocity;
            }

            if (this.android.a <= 180) {
                this.android.a += 5/2;
            }

            if (flap && this.android.y > 0) {
                this.android.y -= properties.android.velocity * 3;
                this.android.a = 45;
            }
        }
    };

    this.checkCollisions = function() {
        if (!this.android) {
            return false;
        }

        if (this.android.y <= 0 || this.android.y + 48 >= this.canvas.height) {
            this.stop()
        }

        for (var i = 0; i < this.lollipops.length; i++) {
            var popX = {
                start: this.lollipops[i].gX,
                end: this.lollipops[i].gX + properties.lollipop.size
            };

            var topPopY = {
                start: this.lollipops[i].top.y,
                end: this.lollipops[i].top.y + properties.lollipop.size
            };

            var bottomPopY = {
                start: this.lollipops[i].bottom.y,
                end: this.lollipops[i].bottom.y + properties.lollipop.size
            };

            var xCollide = this.android.x >= popX.start && this.android.x <= popX.end;
            var yTopCollide = this.android.y >= topPopY.start && this.android.y <= topPopY.end;
            var yBottomCollide = this.android.y >= bottomPopY.start && this.android.y <= bottomPopY.end;

            if ((xCollide && yTopCollide) || (xCollide && yBottomCollide)) {
                this.stop();
            }
        };
    };

};