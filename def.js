(function() {

    'use strict';

    var def = {
        /**
         * Sets a handler for the node
         * @param {HTMLElement} node
         * @param {String} desc - description of the event: space separated event types and dot prefixed namespaces
         * @param {Function} handler
         */
        on: function(node, desc, handler) {
            var types = getEventTypes(desc);
            var namespaces = getEventNamespaces(desc);

            for (var i = 0; i < types.length; i++) {
                var type = getFixedType(types[i]);

                if (!node._eventHandlers) node._eventHandlers = {_handler: getCommonHandler(node)};
                if (!node._eventHandlers[type]) {
                    node._eventHandlers[type] = [];
                    if (node.addEventListener) {
                        node.addEventListener(type, node._eventHandlers._handler, false);
                    } else if (node.attachEvent) {
                        node.attachEvent("on" + type, node._eventHandlers._handler);
                    } else {
                        throw(new Error('Unknown type of the node: ' + node));
                    }
                }

                node._eventHandlers[type].push({handler: handler, namespaces: namespaces});
            }
        },

        /**
         * Removes the handler from the node
         * @param {HTMLElement} node
         * @param {String} description - description of the event: space separated event types and dot prefixed namespaces
         * @param {Function} [handler]
         */
        off: function(node, description, handler) {
            if (!node._eventHandlers) return;

            var types = getEventTypes(description);
            var namespaces = getEventNamespaces(description);

            if (types.length === 0) {
                types = Object.keys(node._eventHandlers);
                types.splice(types.indexOf('_handler'), 1);
            }

            for (var j = 0; j < types.length; j++) {
                var type = getFixedType(types[j]);
                if (!node._eventHandlers[type]) continue;

                for (var i = 0; i < node._eventHandlers[type].length; i++) {
                    var desc = node._eventHandlers[type][i];
                    if ((namespaces.length === 0 || arraysIntersect(namespaces, desc.namespaces)) && (!handler || desc.handler === handler)) {
                        node._eventHandlers[type].splice(i, 1);
                        if (node._eventHandlers[type].length === 0) {
                            removeHandlerType(node, type);
                            break;
                        }
                    }
                }
            }
        },

        getMouseOffset: function(node, e) {
            var docPos = this.getNodePosition(target);
            return {x: e.pageX - docPos.x, y: e.pageY - docPos.y};
        },

        getNodePosition: function(node) {
            var clientRect = node.getBoundingClientRect(),
                x = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
                y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            return {x: clientRect.left + x, y: clientRect.top + y};
        }
    };

    function arraysIntersect(a,b) {
        for (var i = 0; i < a.length; i++) {
            if (b.indexOf(a[i]) !== -1) return true;
        }
        return false;
    }

    function getEventTypes(string) {
        return string.replace(/\.[A-Za-z0-9_-]+/g, '').match(/[A-Za-z0-9_-]+/g) || [];
    }

    function getEventNamespaces(string) {
        return string.match(/\.[A-Za-z0-9_-]+/g) || [];
    }

    function removeHandlerType(node, type) {
        if (node.removeEventListener) {
            node.removeEventListener(type, node._eventHandlers._handler, false);
        } else if (node.detachEvent) {
            node.detachEvent("on" + type, node._eventHandlers._handler);
        }
        delete node._eventHandlers[type];

        var keys = Object.keys(node._eventHandlers);
        if (keys.length === 1) {
            try {
                delete node._eventHandlers;
            } catch (e) {
                node.removeAttribute('_eventHandlers');
            }
        }
    }


    function fixEvent(event) {
        event = event || window.event;

        if (event.isFixed) return event;

        event.preventDefault = event.preventDefault || function(){ this.returnValue = false; };
        event.stopPropagation = event.stopPropagation || function(){ this.cancelBubble = true; };

        if (!event.target) event.target = event.srcElement;
        if (!event.currentTarget) event.currentTarget = event.srcElement;

        if (event.relatedTarget === undefined && event.fromElement) {
            event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
        }

        if ( event.pageX == null && event.clientX != null ) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }

        if ( !event.which && event.button ) {
            event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
        }

        if (event.type === 'wheel') event.wheelDirection = getWheelDirection(event);

        event.isFixed = true;

        return event;
    }

    function getWheelDirection(e) {
        var wheelData = (e.detail ? e.detail *  -1 : e.wheelDelta / 40) || (e.deltaY * -1);
        if (wheelData > 0) {
            wheelData = 1;
        } else if (wheelData < 0){
            wheelData = -1;
        }
        return wheelData;
    }

    function getFixedType(type) {
        if (type === 'wheel') type = getWheelEventType();
        return type;
    }

    function getCommonHandler(node) {
        return function(event) {
            fixEvent(event);
            var handlers = node._eventHandlers[event.type];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    var result = handlers[i].handler(event);
                    if (result === false) {
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    }
                }
            }
        }
    }

    function getWheelEventType() {
        if (document.addEventListener) {
            if ('onwheel' in document) {
                return 'wheel';
            } else if ('onmousewheel' in document) {
                return 'mousewheel';
            } else {
                return 'MozMousePixelScroll';
            }
        }
    }

    if (typeof define === 'function' && define.amd) {
        define(function() { return def; });
    } else if (typeof module !== 'undefined') {
        module.exports = def;
    } else {
        window.def = def;
    }

})();