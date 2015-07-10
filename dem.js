(function() {

    var dem = function(node, event, parameters) {
        parameters = parameters || {};
        var EventType = eventTypes[event] || Event;

        if (!parameters.bubbles) parameters.bubbles = true;
        var eventObject = new EventType(event, parameters);
        node.dispatchEvent(eventObject);
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