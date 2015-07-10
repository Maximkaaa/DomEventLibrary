describe('DOM Event Mocker', function() {

    var element, parent, handler, called1, called2, called3;
    beforeEach(function () {
        parent = $('<div style="width: 200px; height: 200px;"><div style="width: 100px; height: 100px;"></div></div>').get(0);
        element = parent.childNodes[0];
        called1 = called2 = called3 = false;
        handler1 = function () {
            called1 = true;
        };
        handler2 = function () {
            called2 = true;
        };
        handler3 = function () {
            called3 = true;
        };

        $(document.body).append(parent);
    });

    afterEach(function () {
        $(parent).remove();
    });

    describe('Triggering events', function() {
        it('should trigger the events', function() {
            def.on(element, 'click', handler1);

            dem(element, 'click');
            expect(called1).toBe(true);
        });

        it('should let the event bubble', function() {

            def.on(element, 'click', handler1);
            def.on(parent, 'click', handler2);
            def.on(document.body, 'click', handler3);
            dem(element, 'click');

            expect(called1).toBe(true);
            expect(called2).toBe(true);
            expect(called3).toBe(true);
        });
    });

});