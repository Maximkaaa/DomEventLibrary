describe('DOM Event Fixer', function() {

    var element, parent, handler, called1, called2, called3;
    beforeEach(function() {
        parent = $('<div style="width: 200px; height: 200px;"><div style="width: 100px; height: 100px;"></div></div>').get(0);
        element = parent.childNodes[0];
        called1 = called2 = called3 = false;
        handler1 = function() { called1 = true; };
        handler2 = function() { called2 = true; };
        handler3 = function() { called3 = true; };
    });

    describe('Setting the event listeners', function() {
        it('should set the event listeners', function() {
            def.on(element, 'click', handler1);
            dem(element, 'click');

            expect(called1).toBe(true);
        });

        it('should set several event listeners and call them in a row', function() {
            def.on(element, 'click', handler1);
            var rightOrder = false;
            var handler = function() {
                rightOrder = called1 && !called2;
            };
            def.on(element, 'click', handler);
            def.on(element, 'click', handler2);
            dem(element, 'click');

            expect(called1).toBe(true);
            expect(called2).toBe(true);
            expect(rightOrder).toBe(true);
        });

        it('should set the same handler for several times if needed', function() {
            var counter = 0;
            var handler = function() { counter++; };
            def.on(element, 'click', handler);
            def.on(element, 'click', handler);
            dem(element, 'click');

            expect(counter).toBe(2);
        });

        it('should set different types of event handlers', function() {
            def.on(element, 'click', handler1);
            def.on(element, 'mousemove', handler2);

            dem(element, 'mousemove');
            expect(called2).toBe(true);
            expect(called1).toBe(false);

            called2 = false;
            dem(element, 'click');
            expect(called1).toBe(true);
            expect(called2).toBe(false);
        });
    });

    describe('Removing event listeners', function() {
        it('should remove previously set handler', function() {
            def.on(element, 'click', handler1);
            def.off(element, 'click', handler1);
            dem(element, 'click');

            expect(called1).toBe(false);
        });

        it('should remove only the handler specified', function() {
            def.on(element, 'click', handler1);
            def.on(element, 'click', handler2);
            def.off(element, 'click', handler1);
            dem(element, 'click');

            expect(called1).toBe(false);
            expect(called2).toBe(true);
        });
    });

});