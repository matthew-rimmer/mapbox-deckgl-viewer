import { ReplaySubject as _ReplaySubject } from "rxjs";

export class ReplaySubjectReset<T> {

    private subject: _ReplaySubject<T>;

    constructor() {
        this.subject = new _ReplaySubject<T>;
    }

    public reset() {
        this.subject.complete();
        this.subject = new _ReplaySubject<T>;
    }

    public next(value: T) {
        this.subject.next(value);
    }

    public subscribe(callback: (value: T) => void) {
        return this.subject.subscribe(callback)
    }

}