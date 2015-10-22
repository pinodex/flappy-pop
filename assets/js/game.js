/*!
 * Floppy Pop
 * Browser game based on Android 5.0 easter egg.
 * 
 * Copyright 2015, Raphael Marco
 */

var FloppyPop = function(config) {

    var SCENE_SUNRISE = 1, SCENE_NOON = 2, SCENE_SUNSET = 3, SCENE_NIGHT = 4;
    var POPS = ['belt', 'droid', 'pizza', 'stripes', 'swirl', 'vortex', 'vortex2'];
    var ROTATING_POPS = ['pizza', 'swirl', 'vortex', 'vortex2'];

    this.viewElement = document.querySelector(config.element);
    this.scene = 0;

    this.clouds = config.clouds;
    this.stars = config.stars;

    this.init = function() {
        this.viewElement.innerHTML = '';

        this.initBg();
        this.initSky();
        this.animatePops();

        this.insertPop();
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

        this.viewElement.querySelector('.bg').className = 'bg ' + bgClass;
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
            var rect = clouds[i].getBoundingClientRect()

            clouds[i].style.left = (rect.left - 0.5) + 'px';

            if (rect.left < -100) {
                clouds[i].style.left = '100%';
            }
        };

        requestAnimationFrame(this.animateClouds.bind(this));
    };

    this.insertPop = function() {
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
                nsElements[i].className += ' shown';
            };
        }, 100);

        setTimeout(this.insertPop.bind(this), 8000);
    };

    this.animatePops = function() {
        var popContainers = this.viewElement.querySelectorAll('.pop_container');

        for (var i = popContainers.length - 1; i >= 0; i--) {
            var rect = popContainers[i].getBoundingClientRect()

            popContainers[i].style.left = (rect.left - 2) + 'px';

            if (rect.left < -150) {
                this.viewElement.removeChild(popContainers[i]);
            }
        };

        requestAnimationFrame(this.animatePops.bind(this));
    };

};

var Util = {

    rand: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}