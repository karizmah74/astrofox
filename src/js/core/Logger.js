/* eslint-disable no-console */
const LABEL_CSS = 'color:indigo;background-color:lavender;font-weight:bold;';
const TIMER_CSS = 'color:green;background-color:honeydew;';

export default class Logger {
    constructor(name) {
        this.name = name;
        this.timers = {};
    }
    
    output(method, args) {
        if (process.env.NODE_ENV !== 'production') {
            let label = ['%c%s%c', LABEL_CSS, this.name, 'color:black'];

            // Convert to array
            if (!Array.isArray(args)) {
                args = Array.prototype.slice.call(args);
            }

            // If format specifiers are defined, merge with label
            if (args.length && typeof args[0] === 'string' && /%[sidfoOc]/.test(args[0])) {
                label[0] += ' ' + args[0];
                args = args.slice(1);
            }

            method.apply(console, label.concat(args));
        }
    }

    log() {
        this.output(console.log, arguments);
    }

    info() {
        this.output(console.info, arguments);
    }

    warn() {
        this.output(console.warn, arguments);
    }

    error() {
        this.output(console.error, arguments);
    }

    trace() {
        this.output(console.trace, arguments);
    }

    time(id) {
        this.timers[id] = window.performance.now();
    }

    timeEnd(id) {
        let timer = this.timers[id];

        if (timer) {
            let t = (window.performance.now() - timer) / 1000,
                val = (t < 1) ? ~~(t*1000)+'ms' : t.toFixed(2)+'s',
                args = Array.prototype.slice.call(arguments, 1);

            this.output(console.log, ['%c+%s', TIMER_CSS, val].concat(args));

            return t;
        }
    }
}