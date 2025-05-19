export class Shape {
    _samples = [];
    get samples() {
        this.unifySamples();
        return this._samples;
    }
    unifySamples() {
        this._samples = this._samples
            .map(item => JSON.stringify(item))
            .filter((item, index, array) => array.indexOf(item) === index)
            .map(item => JSON.parse(item));
    }
    _optional = false;
    get optional() {
        return this._optional;
    }
    constructor(args = {}) {
        if (this.constructor.name !== 'NeverShape' && this.constructor.name !== 'BottomShape' && !args.samples?.length)
            debugger;
        this._optional = args.optional ?? false;
        this._samples = args.samples ?? [];
    }
    clone(args) {
        return new this.constructor({
            samples: this.samples.slice(),
            optional: this.optional,
            ...args,
        });
    }
    makeOptional() {
        return this.clone({ optional: true });
    }
    makeNonOptional() {
        return this.clone({ optional: false });
    }
    equal(t) {
        return (t instanceof this.constructor
            && t.optional === this.optional);
    }
    addSample(data) {
        this.samples.push(data);
        return this;
    }
}
