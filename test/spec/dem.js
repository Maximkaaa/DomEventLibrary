describe('DOM Event Mocker', function() {

    var element, parent, handler, called1, called2, called3;
    beforeEach(function () {
        parent = $('<div style="width: 200px; height: 200px; padding: 50px; position: absolute; top: 0; left: 0;"><div style="width: 100px; height: 100px;"></div></div>').get(0);
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

    describe('click', function() {
        it('should trigger the click event', function() {
            def.on(element, 'click', handler1);
            dem.click(element);

            expect(called1).toBe(true);
        });

        it('should set the position of event to the left top corner of the element by default', function() {
            var event;
            var handler = function(e) { event = e; };
            def.on(element, 'click', handler);

            dem.click(element);
            expect(event.pageX).toBe(50);
            expect(event.pageY).toBe(50);
        });

        it('should set the position of the event relative to the left top corner of the element', function() {
            var event;
            var handler = function(e) { event = e; };
            def.on(element, 'click', handler);
            dem.click(element, 5, 10);
            expect(event.pageX).toBe(55);
            expect(event.pageY).toBe(60);
        });
    });

});