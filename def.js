(function() {

    var def = {
        /**
         * Sets a handler for the node
         * @param {HTMLElement} node
         * @param {String} type
         * @param {Function} handler
         */
        on: function(node, type, handler) {
            type = getFixedType(type);

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

            node._eventHandlers[type].push({handler: handler});
        },

        /**
         * Removes the handler from the node
         * @param {HTMLElement} node
         * @param {String} type
         * @param {Function} handler
         * @returns {boolean} - true if the handler was removed
         */
        off: function(node, type, handler) {
            type = getFixedType(type);
            if (!node._eventHandlers || !node._eventHandlers[type]) return;

            for (var i = 0; i < node._eventHandlers[type].length; i++) {
                var desc = node._eventHandlers[type][i];
                if (desc.handler === handler) {
                    node._eventHandlers[type].splice(i, 1);
                    if (node._eventHandlers[type].length === 0) {
                        removeHandlerType(node, type);
                    }

                    return true;
                }
            }
        }
    };

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

        event.isFixed = true;

        return event;
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