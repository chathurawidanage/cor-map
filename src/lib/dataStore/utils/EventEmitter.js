/* Based on https://gist.github.com/mudge/5830382 */

/* Polyfill EventEmitter. */
export class EventEmitter {
    events = {}

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
    
        this.events[event].push(listener);
    }

    off(event, listener) {
        var idx;
    
        if (this.events[event]) {
            idx = this.events[event].indexOf(listener);
    
            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }
    }

    emit(event) {
        var i, listeners, length, args = [].slice.call(arguments, 1);

        if (this.events[event]) {
            listeners = this.events[event].slice();
            length = listeners.length;

            for (i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    }

    once(event, listener) {
        this.on(event, function g () {
            this.off(event, g);
            listener.apply(this, arguments);
        });
    };
};