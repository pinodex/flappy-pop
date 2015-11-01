/*!
 * Flappy Pop
 * Browser game based on Android 5.0 easter egg.
 * 
 * Copyright 2015, Raphael Marco
 */

var FlappyPop = function(options) {

    var IMAGES = {
        android:        'assets/img/android.png',
        cloud:          'assets/img/cloud.png',
        moon:           'assets/img/moon.png',
        pop_belt:       'assets/img/pop_belt.png',
        pop_droid:      'assets/img/pop_droid.png',
        pop_pizza:      'assets/img/pop_pizza.png',
        pop_stripes:    'assets/img/pop_stripes.png',
        pop_swirl:      'assets/img/pop_swirl.png',
        pop_vortex:     'assets/img/pop_vortex.png',
        pop_vortex2:    'assets/img/pop_vortex2.png',
        star:           'assets/img/star.png',
        sun:            'assets/img/sun.png',
        stick:          'assets/img/stick.png'
    };

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

    var PROPS = {
        android: {
            velocity: 7
        },
        lollipop: {
            size: 100,
            space: 200
        }
    };

    var INITIALIZED = false;
    var STARTED = false;
    var spawnAndroid = false;
    var flap = false;

    this.options = options;

    this.element = null;
    this.canvas = null;
    this.context = null;

    this.scene = null;

    this.stars = [];
    this.clouds = [];

    this.lollipops = [];
    this.android = null;

    this.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    this.radians = function(degree) {
        return degree * (Math.PI / 180);
    }

    this.preloadImages =  function(callback) {
        var preloadedFiles = 0;
        var imagesKeys = Object.keys(IMAGES);

        for (var i = 0; i < imagesKeys.length; i++) {
            var resource = IMAGES[imagesKeys[i]];

            IMAGES[imagesKeys[i]] = new Image();
            IMAGES[imagesKeys[i]].onload = function() {
                preloadedFiles++;
                
                if (preloadedFiles == imagesKeys.length) {
                    callback();
                }
            };

            IMAGES[imagesKeys[i]].src = resource;
        };
    };

    this.init = function() {
        if (INITIALIZED) {
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

        this.preloadImages(function() {
            this.render();

            this.context.fillStyle = 'white';
            this.context.font = 'bold 20px sans-serif';
            this.context.textBaseline = 'middle'; 
            this.context.textAlign = 'center'; 
            this.context.fillText('Press SPACE key to start', this.canvas.width / 2, this.canvas.height / 2);

            INITIALIZED = true;
        }.bind(this));

        addEventListener('keydown', function(e) {
            if (e.keyCode == 32) {
                if (!STARTED) {
                    this.start();
                }

                flap = true;
            }
        }.bind(this), false);

        addEventListener('keyup', function(e) {
            flap = false;
        }.bind(this), false);
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

            this.context.drawImage(IMAGES['star'], x, y, 10, 10);
            this.stars.push([x, y]);
        };

        // Clouds
        for (var i = 0; i < this.options.clouds; i++) {
            var x = this.clouds[i] ? this.clouds[i][0] : this.getRandomInt(0, this.canvas.width);
            var y = this.clouds[i] ? this.clouds[i][1] : this.getRandomInt(0, this.canvas.height);
            var size = this.clouds[i] ? this.clouds[i][2] : this.getRandomInt(36, 96);

            this.context.drawImage(IMAGES['cloud'], x, y, size, size);
            this.clouds.push([x, y, size]);
        };

        // Lollipops
        for (var i = 0; i < this.lollipops.length; i++) {
            var lollipop = this.lollipops[i];
            var stickX = lollipop.gX + (PROPS.lollipop.size / 2) - 7.5;

            this.context.drawImage(IMAGES['stick'], stickX, 0, 15, lollipop.top.y + 5);
            this.context.drawImage(IMAGES['stick'], stickX, lollipop.bottom.y + PROPS.lollipop.size - 5, 15, this.canvas.height - lollipop.bottom.y - PROPS.lollipop.size + 5);

            this.context.drawImage(IMAGES['pop_' + lollipop.top.type], lollipop.gX, lollipop.top.y, PROPS.lollipop.size, PROPS.lollipop.size);
            this.context.drawImage(IMAGES['pop_' + lollipop.bottom.type], lollipop.gX, lollipop.bottom.y, PROPS.lollipop.size, PROPS.lollipop.size);
        };

        if (spawnAndroid) {
            var Ax = this.android ? this.android.x : (this.canvas.width / 2) - 24;
            var Ay = this.android ? this.android.y : (this.canvas.height / 2) - 24;
            var Aa = this.android ? this.android.a : 0;

            this.context.save();
            this.context.rotate(this.radians(Aa));
            this.context.drawImage(IMAGES['android'], Ax, Ay, 48, 48);
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
            yIn: this.getRandomInt(0, this.canvas.height - ((PROPS.lollipop.size * 2) + PROPS.lollipop.space)),
            type: POPS[this.getRandomInt(0, POPS.length - 1)]
        };
        
        lollipop.bottom = lollipop.bottom || {
            y: this.canvas.height + 100,
            yIn: lollipop.top.yIn + PROPS.lollipop.size + PROPS.lollipop.space,
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
            if (this.lollipops[i].top.y <= this.lollipops[i].top.yIn) {
                this.lollipops[i].top.y += 15;
            }

            if (this.lollipops[i].bottom.y >= this.lollipops[i].bottom.yIn) {
                this.lollipops[i].bottom.y -= 15;
            }

            this.lollipops[i].gX -= this.canvas.width / 200;

            if (this.lollipops[i].gX < PROPS.lollipop.size / 2) {
                this.spawnLollipop();
            }

            if (this.lollipops[i].gX < -PROPS.lollipop.size) {
                this.lollipops.splice(i, 1);
            }

            /*
            if (this.android) {
                if (
                    this.android.x >= this.lollipops[i].top.x &&
                    this.android.x <= (this.lollipops[i].top.x + PROPS.lollipop.size) &&
                    this.android.y >= this.lollipops[i].top.y &&
                    this.android.y <= (this.lollipops[i].top.y + PROPS.lollipop.size)
                ) {
                    console.log('touch x');
                }
            }

            if (this.android && this.android.x <= this.lollipops[i].top.x && this.android.y <= this.lollipops[i].top.y) {
                console.log('touch top');
            }

            if (this.android && this.android.x <= this.lollipops[i].bottom.x && this.android.y <= this.lollipops[i].bottom.y) {
                console.log('touch bottom');
            }
            */
        };

        if (this.android) {
            if (this.android.y < this.canvas.height - 48) {
                this.android.y += PROPS.android.velocity;
            }

            if (flap && this.android.y > 0) {
                this.android.y -= PROPS.android.velocity * 3;
            }
        }
    };

    this.loop = function() {
        this.update();
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    };

    this.start = function() {
        spawnAndroid = true;
        
        this.spawnLollipop();
        this.loop();

        STARTED = true;
    };

    this.stop = function() {

    };

};