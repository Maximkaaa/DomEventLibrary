(function() {

    'use strict';

    var dem = function(node, event, parameters) {
        parameters = parameters || {};
        var EventType = eventTypes[event] || Event;

        if (!parameters.bubbles) parameters.bubbles = true;
        var eventObject = new EventType(event, parameters);
        node.dispatchEvent(eventObject);
    };

    /**
     * Triggers the click event for the node
     * @param {HTMLElement} node - the target of the event
     * @param {Number} [x] - x coordinate of the event relative to the left top corner of the node
     * @param {Number} [y] - y coordinate of the event relative to the left top corner of the node
     * @param {Object} [parameters] - additional parameters of the event
     */
    dem.click = function(node, x, y, parameters) {
        dem.mousedown.apply(dem, arguments);
        dem.mouseup.apply(dem, arguments);
        dem.pureClick.apply(dem, arguments);
    };

    dem.dblclick = function(node, x, y, parameters) {
        dem.click.apply(dem, arguments);
        dem.click.apply(dem, arguments);
        dem.pureDblclick.apply(dem, arguments);
    };

    dem.pureClick = getMouseEventMocker('click');
    dem.pureDblclick = getMouseEventMocker('dblclick');
    dem.mousedown = getMouseEventMocker('mousedown');
    dem.mouseup = getMouseEventMocker('mouseup');
    dem.mousemove = getMouseEventMocker('mousemove');
    dem.mouseout = getMouseEventMocker('mouseout');
    dem.contextmenu = getMouseEventMocker('contextmenu');

    function getMouseEventMocker(type) {
        return function(node, x, y, parameters) {
            parameters = parameters || {};
            var nodeOffset = def.getNodePosition(node);
            parameters.clientX = nodeOffset.x + (x || 0);
            parameters.clientY = nodeOffset.y + (y || 0);

            dem(node, type, parameters);
        }
    }

    var MAX_STEPS = 100;

    /**
     * Trigger the mousedown, mousemove and mouseup events to simulate dragging
     * @param {HTMLElement} node - the target of the event
     * @param {Number[]} [startPosition] - [x, y] start position of the drag relative to the left top corner of the node
     * @param {Number[]} [endPosition] - [x, y] end position of the drag relative to the left top corner of the node
     * @param {Number[]} [step] - [dx, dy] step of the drag
     * @param {Object} [parameters] - additional parameters of the event
     */
    dem.drag = function(node, startPosition, endPosition, step, parameters) {
        startPosition = startPosition || [0, 0];
        endPosition = endPosition || [startPosition[0] + 20, startPosition[1] + 20];
        var signX = sign(endPosition[0] - startPosition[0]);
        var signY = sign(endPosition[1] - startPosition[1]);
        step = step || [signX || 0, signY || 0];

        dem.mousedown(node, startPosition[0], startPosition[1], parameters);

        var position = startPosition.concat();
        var stepsX = Math.abs(Math.round((endPosition[0] - startPosition[0]) / step[0]));
        var stepsY = Math.abs(Math.round((endPosition[1] - startPosition[1]) / step[1]));
        var steps = Math.min(stepsX, stepsY, MAX_STEPS);

        for (var i = 0; i < steps; i++) {
            position[0] += step[0];
            position[1] += step[1];
            dem.mousemove(node, position[0], position[1], parameters);
        }

        dem.mouseup(node, endPosition[0], endPosition[1], parameters);
        dem.pureClick(node, endPosition[0], endPosition[1], parameters);
    };

    /**
     * Trigger the mouse wheel event
     * @param {HTMLElement} node - the target of the event
     * @param {Number} [count=1] - integer of how many times to call the events. Minus sign for scrolling backwards.
     * @param {Number[]} [position=[0,0]] - position of the event relative to the top left corner of the target element
     * @param {Object} [parameters] - additional parameters of the event
     * @param {Number} [delay=300] - interval between scroll events in milliseconds
     */
    dem.wheel = function(node, count, position, parameters, delay) {
        count = count || 1;
        position = position || [0, 0];
        parameters = parameters || {};
        delay = delay || 50;
        var nodeOffset = def.getNodePosition(node);

        parameters.clientX = nodeOffset.x + position[0];
        parameters.clientY = nodeOffset.y + position[1];

        var delta = count > 0 ? 1 : -1;
        parameters.deltaY = -delta * 100;

        callWheelMocker(node, parameters, 0, delta, count, delay);
    };

    function callWheelMocker(node, parameters, counter, delta, count, delay) {
        dem(node, 'wheel', parameters);
        counter += delta;
        if (Math.abs(counter) < Math.abs(count)) {
            setTimeout(function() { callWheelMocker(node, parameters, counter, delta, count, delay); }, delay);
        }
    }

    function sign(x) {
        return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
    }

    var eventTypes = {
        click: MouseEvent,
        mousemove: MouseEvent,
        mousedown: MouseEvent,
        mouseup: MouseEvent,
        dblclick: MouseEvent,
        mouseout: MouseEvent,
        contextmenu: MouseEvent,
        wheel: WheelEvent
    };

    if (typeof define === 'function' && define.amd) {
        define(function() { return dem; });
    } else if (typeof module !== 'undefined') {
        module.exports = dem;
    } else {
        window.dem = dem;
    }

})();