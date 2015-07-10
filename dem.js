(function() {

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
        parameters = parameters || {};
        var nodeOffset = def.getNodePosition(node);
        parameters.clientX = nodeOffset.x + (x || 0);
        parameters.clientY = nodeOffset.y + (y || 0);

        dem(node, 'click', parameters);
    };


    var eventTypes = {
        click: MouseEvent,
        mousemove: MouseEvent,
        mousedown: MouseEvent,
        mouseup: MouseEvent
    };

    if (typeof define === 'function' && define.amd) {
        define(function() { return dem; });
    } else if (typeof module !== 'undefined') {
        module.exports = dem;
    } else {
        window.dem = dem;
    }

})();