/*!
 * Flappy Pop
 * Browser game based on Android 5.0 easter egg.
 * 
 * Copyright 2015, Raphael Marco
 */

var FlappyPop = function(config) {

    var PRELOAD_IMAGES = [
        'assets/img/android.png',
        'assets/img/cloud.png',
        'assets/img/moon.png',
        'assets/img/pop_belt.png',
        'assets/img/pop_droid.png',
        'assets/img/pop_pizza.png',
        'assets/img/pop_swirl.png',
        'assets/img/pop_vortex.png',
        'assets/img/pop_vortex2.png',
        'assets/img/star.png',
        'assets/img/sun.png'
    ];

    var SCENE_SUNRISE = 1, SCENE_NOON = 2, SCENE_SUNSET = 3, SCENE_NIGHT = 4;
    var POPS = ['belt', 'droid', 'pizza', 'stripes', 'swirl', 'vortex', 'vortex2'];
    var ROTATING_POPS = ['pizza', 'swirl', 'vortex', 'vortex2'];
    
    var PRELOADED = false;
    var INITIALIZED = false;
    var ELEMENTS_INSERTED = false;
    var POP_INSERTION = true;
    var FLAP_START_COUNT = 0;
    var FLAP_MAX_STRENGTH = 30;
    var FLAP_INTERVAL = null;

    this.viewElement = document.querySelector(config.element);
    this.scene = 0;

    this.clouds = config.clouds;
    this.stars = config.stars;

    this.init = function() {
        if (INITIALIZED) {
            return;
        }

        if (!PRELOADED) {
            this.viewElement.innerHTML = '<div class="preload">Loading assets...</div>';

            for (var i = 0; i < PRELOAD_IMAGES.length; i++) {
                (new Image()).src = PRELOAD_IMAGES[i];

                if (i == PRELOAD_IMAGES.length - 1) {
                    PRELOADED = true;
                    this.init();
                }
            };
        }

        this.viewElement.innerHTML = '<div class="instruction">Click to start</div>';

        this.viewElement.setAttribute('tabindex', '-1');
        this.viewElement.style.position = 'relative';
        this.viewElement.style.height = '100%';
        this.viewElement.style.overflow = 'hidden';

        this.initBg();
        this.initSky();

        this.animatePops();

        INITIALIZED = true;
    };

    this.initBg = function() {
        this.scene = Util.rand(1, 4);

        var bgClass;

        switch (this.scene) {
            case SCENE_SUNRISE:
                bgClass = 'sunrise';
                break;

            case SCENE_NOON:
                bgClass = 'noon';
                break;

            case SCENE_SUNSET:
                bgClass = 'sunset'
                break;

            case SCENE_NIGHT:
                bgClass = 'night';
                break;
        };

        if (!this.viewElement.querySelector('.bg')) {
            this.viewElement.innerHTML += '<div class="bg"></div>';
        }

        this.viewElement.querySelector('.bg').classList.add(bgClass);
    };

    this.initSky = function() {
        var sunMoonEl = 'sun';
        var sunMoonStyle = [
            'position: absolute',
            'top: ' + Util.rand(0, 100) + '%',
            'left: ' + Util.rand(0, 100) + '%',
            'right: ' + Util.rand(0, 100) + '%',
            'bottom: ' + Util.rand(0, 100) + '%',
        ];

        if (this.scene == SCENE_SUNSET || this.scene == SCENE_NIGHT) {
            sunMoonEl = 'moon';

            if (Util.rand(1, 5) % 2 != 0) {
                var moonFlip = [
                    '-moz-transform: scaleX(-1)',
                    '-o-transform: scaleX(-1)',
                    '-webkit-transform: scaleX(-1)',
                    'transform: scaleX(-1)',
                    'filter: FlipH',
                    '-ms-filter: "FlipH"'
                ];

                sunMoonStyle = sunMoonStyle.concat(moonFlip);
            }
        }

        this.viewElement.innerHTML += '<div class="sky ' + sunMoonEl + '" style="' + sunMoonStyle.join('; ') + '"></div>';

        for (var i = this.clouds - 1; i >= 0; i--) {
            var size = ((96 * Util.rand(50, 100)) / 100) + 'px';
            var style = [
                'height: ' + size,
                'width: ' + size,
                'position: absolute',
                'top: ' + Util.rand(0, 100) + '%',
                'left: ' + Util.rand(0, 100) + '%',
                'right: ' + Util.rand(0, 100) + '%',
                'bottom: ' + Util.rand(0, 100) + '%',
            ];

            this.viewElement.innerHTML += '<div class="sky cloud slide" style="' + style.join('; ') + '"></div>';
            
            if (i == 0) {
                this.animateClouds();
            }
        };

        if (this.scene == SCENE_SUNSET || this.scene == SCENE_NIGHT) {
            for (var i = this.stars - 1; i >= 0; i--) {
                var style = [
                    'position: absolute',
                    'top: ' + Util.rand(0, 100) + '%',
                    'left: ' + Util.rand(0, 100) + '%',
                    'right: ' + Util.rand(0, 100) + '%',
                    'bottom: ' + Util.rand(0, 100) + '%',
                ];

                this.viewElement.innerHTML += '<div class="sky star" style="' + style.join('; ') + '"></div>';
            };
        }
    };

    this.animateClouds = function() {
        var clouds = this.viewElement.querySelectorAll('.sky.cloud');

        for (var i = clouds.length - 1; i >= 0; i--) {
            var rect = clouds[i].getBoundingClientRect();

            clouds[i].style.left = (rect.left - (i % 2 == 0 ? 0.75 : 0.5)) + 'px';

            if (rect.left < -100) {
                clouds[i].style.left = '100%';
            }
        };

        requestAnimationFrame(this.animateClouds.bind(this));
    };

    this.insertPop = function() {
        if (!POP_INSERTION) {
            return;
        }

        this.preventPopInsert();

        var topPopType = POPS[Util.rand(0, POPS.length - 1)];
        var bottomPopType = POPS[Util.rand(0, POPS.length - 1)];

        if (ROTATING_POPS.indexOf(topPopType) > -1) {
            topPopType += ' rotate';
        }

        if (ROTATING_POPS.indexOf(bottomPopType) > -1) {
            bottomPopType += ' rotate';
        }

        var topPopPosition = Util.rand(5, 50)
        var bottomPopPosition = 100 - topPopPosition;

        var topPopContainer = [
            '<div class="pop_container top" style="top: -' + topPopPosition + '%;">',
                '<div class="stick"></div>',
                '<div class="pop ' + topPopType + '"></div>',
            '</div>'
        ].join('\n');

        var bottomPopContainer = [
            '<div class="pop_container bottom" style="bottom: -' + bottomPopPosition + '%">',
                '<div class="pop ' + bottomPopType + '"></div>',
                '<div class="stick"></div>',
            '</div>'
        ].join('\n');

        this.viewElement.innerHTML += topPopContainer + bottomPopContainer;

        var nsElements = this.viewElement.querySelectorAll('.pop_container:not(.shown)');

        setTimeout(function() {
            for (var i = nsElements.length - 1; i >= 0; i--) {
                nsElements[i].classList.add('shown');
            };
        }, 100);

        setTimeout(this.allowPopInsert.bind(this), 1000);
    };

    this.preventPopInsert = function() {
        POP_INSERTION = false;
    };

    this.allowPopInsert = function() {
        POP_INSERTION = true;
    };

    this.animatePops = function() {
        var popContainers = this.viewElement.querySelectorAll('.pop_container');

        for (var i = popContainers.length - 1; i >= 0; i--) {
            var rect = popContainers[i].getBoundingClientRect()

            popContainers[i].style.left = (rect.left - 2) + 'px';

            if (rect.left < -100) {
                this.insertPop();

                if (rect.left < -150) {
                    this.viewElement.removeChild(popContainers[i]);
                }
            }
        };

        requestAnimationFrame(this.animatePops.bind(this));
    };

    this.insertAndroid = function() {
        if (this.viewElement.querySelector('.sky.android')) {
            return;
        }
        
        this.viewElement.innerHTML += '<div class="sky android half_margined tilt"></div>';
        
        var android = this.viewElement.querySelector('.sky.android');
        var rect = android.getBoundingClientRect();
        
        android.classList.remove('half_margined');
        android.style.top = rect.top + 'px';
        android.style.left = rect.left + 'px';

        this.dropAndroid();
    };

    this.dropAndroid = function() {
        var android = this.viewElement.querySelector('.sky.android');
        var intTop = parseInt(android.style.top);

        if (intTop <= window.innerHeight - 64) {
            android.style.top = (intTop + 5) + 'px';
        }

        requestAnimationFrame(this.dropAndroid.bind(this));
    };

    this.flapAndroid = function() {
        var android = this.viewElement.querySelector('.sky.android');
        var intTop = parseInt(android.style.top);

        if (FLAP_START_COUNT > FLAP_MAX_STRENGTH) {
            FLAP_START_COUNT = 0;
            return;
        }

        android.classList.remove('tilt');
        android.offsetWidth = android.offsetWidth;
        android.classList.add('tilt');

        if (intTop > 0) {
            android.style.top = (intTop - 5) + 'px';
        }

        requestAnimationFrame(this.flapAndroid.bind(this));
        FLAP_START_COUNT++;
    };

    this.act = function() {
        if (!INITIALIZED) {
            return false;
        }

        if (!ELEMENTS_INSERTED) {
            this.insertAndroid();
            this.insertPop();

            this.viewElement.removeChild(
                this.viewElement.querySelector('.instruction')
            );

            ELEMENTS_INSERTED = true;
        }

        this.flapAndroid();
    };

    this.viewElement.addEventListener('click', this.act.bind(this), false);
    this.viewElement.addEventListener('keypress', this.act.bind(this), false);

};

var Util = {

    rand: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}