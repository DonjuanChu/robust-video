/*jslint browser: true, vars: true*/
/*global CustomEvent: false*/

(function (root) {
    "use strict";

    var eventFactory = function (type) {
        var event;
        if (typeof CustomEvent === "function") {
            event = new CustomEvent(type, {bubbles: true, cancelable: true});
        } else {
            event = document.createEvent('Event');
            event.initEvent(type, true, true);
        }
        return event;
    };

    root.RobustVideo = function (node) {
        if (node.getAttribute('data-robust') === 'yes') {
            return node;
        }
        var states = {
            paused: true,
            pausedTime: 0
        };
        var native = {
            play: node.play,
            pause: node.pause
        };
        var robust = {
            play: function () {
                if (!states.paused) { return; }
                native.play.call(node);
                states.paused = false;
            },
            pause: function () {
                if (states.paused) { return; }
                native.pause.call(node);
                states.paused = true;
            }
        };


        var method = '';
        for (method in native) {
            node[method] = robust[method];
        }

        node.addEventListener('play', function (event) {
            if (!states.paused) {
                event.stopImmediatePropagation();
                event.preventDefault();
                // node.pause();
                return false;
            }
            states.paused = false;
            node.dispatchEvent(eventFactory('$play'));
        }, false);

        node.addEventListener('pause', function () {
            if (states.paused) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return false;
            }
            states.paused = true;
            node.dispatchEvent(eventFactory('$pause'));
        }, false);

        node.addEventListener('ended', function () {
            if (!node.loop) {
                node.dispatchEvent(eventFactory('$ended'));
            } else {
                native.play.call(node);
            }
        }, false);

        node.setAttribute('data-robust', 'yes');
        return node;
    };

    root.robustVideo = root.RobustVideo;

}(this));
