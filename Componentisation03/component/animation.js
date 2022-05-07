

export class Timeline {
    constructor() {
        this.animations = new Set();
        this.finishedAnimaions = new Set();
        this.addTimes = new Map();
        this.requestId = null;
        this.state = "inited"
        this.tick = () => {
            let t = Date.now() - this.startTime;
            for (let animation of this.animations) {
                let { object, property, startValue, endValue, duration, delay, timingFunction, template } = animation;
                let addTime = this.addTimes.get(animation);
                if (t < delay + addTime) {
                    continue
                }
                let progression = timingFunction((t - delay - addTime) / duration);
                if (t > duration + delay + addTime) {
                    progression = 1
                    this.animations.delete(animation);
                    this.finishedAnimaions.add(animation)
                }
                let value = animation.valueFromProgression(progression);
                object[property] = template(value)
            }
            if (this.animations.size)
                this.requestId = requestAnimationFrame(this.tick);
            else
                this.requestId = null;
        }
    }
    start() {
        if (this.state !== "inited") {
            return;
        }
        this.state = "playing"
        this.startTime = Date.now();
        this.tick();
    }

    pause() {
        if (this.state !== "playing") {
            return;
        }
        this.state = "paused"
        this.pauseTime = Date.now();
        if (this.requestId !== null) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
    }
    resume() {
        if (this.state !== "paused") {
            return;
        }
        this.state = "playing";
        this.startTime += Date.now() - this.pauseTime;
        this.tick();
    }

    reset() {
        if (this.state === "playing") {
            this.pause();
        }
        this.animations = new Set;
        this.finishedAnimaions = new Set;
        this.addTimes = new Map;
        this.requestId = null;
        this.startTime = Date.now();
        this.pauseTime = null;
        this.state = "inited"
    }
    restart() {
        if (this.state === "playing") {
            this.pause();
        }
        for (let animation of this.finishedAnimaions) {
            this.animations.add(animation)
        }

        this.finishedAnimaions = new Set();
        this.requestId = null;
        this.state = "playing";
        this.startTime = Date.now();
        this.pauseTime = null;
        this.tick();
    }
    add(animation, addTime) {
        this.animations.add(animation)
        if (this.state === "playing") {
            this.addTimes.set(animation, addTime !== void 0 ? addTime : Date.now() - this.startTime);
        } else {
            this.addTimes.set(animation, addTime !== void 0 ? addTime : 0);
        }
        if (this.state === "playing" && this.requestId === null) {
            this.tick();
        }
    }
}

export class Animation {
    constructor(object, property, start, end, duration, delay, timingFunction, template) {
        this.object = object
        this.property = property
        this.start = start
        this.end = end
        this.duration = duration
        this.timingFunction = timingFunction
        this.delay = delay
        this.template = template
    }
    valueFromProgression(progression) {
        return this.start + progression * (this.end - this.start);
    }
}

export class ColorAnimation {
    constructor(object, property, start, end, duration, delay, timingFunction, template) {
        this.object = object
        this.property = property
        this.start = start
        this.end = end
        this.duration = duration
        this.timingFunction = timingFunction
        this.delay = delay
        this.template = template
    }
    valueFromProgression(progression) {
        return {
            r: this.start.r + progression * (this.end.r - this.start.r),
            g: this.start.g + progression * (this.end.g - this.start.g),
            b: this.start.b + progression * (this.end.b - this.start.b),
            a: this.start.a + progression * (this.end.a - this.start.a),
        }
    }
}