describe('DOM Event Fixer', function() {

    var element, parent, handler, called;
    beforeEach(function() {
        parent = $('<div style="width: 200px; height: 200px;"><div style="width: 100px; height: 100px;"></div></div>');
        element = parent.childNodes[0];
        handler = function() { called = true; };
    });

    describe('Setting the event listeners', function() {
        it('should set the event listeners', function() {

        });
    });

});