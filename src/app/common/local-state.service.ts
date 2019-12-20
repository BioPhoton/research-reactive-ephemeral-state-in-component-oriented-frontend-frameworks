import {ConnectableObservable, merge, Observable, OperatorFunction, pipe, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, mergeAll, pluck, publishReplay, scan, shareReplay} from 'rxjs/operators';
import {Injectable, OnDestroy} from "@angular/core";

export const stateAccumulator = (state, command): { [key: string]: any } => ({...state, ...command});


@Injectable()
export class LocalState<T> implements OnDestroy {
    private stateAccumulator = stateAccumulator;
    private _subscription = new Subscription();
    private _stateObservables = new Subject<Observable<Partial<T>>>();
    private _effectSubject = new Subject<Observable<any>>();
    private _stateSlices = new Subject<Partial<T>>();
    private _state$: Observable<Partial<T>> =
        merge(
            this._stateObservables.pipe(mergeAll()),
            this._stateSlices
        )
            .pipe(
                scan(this.stateAccumulator, {}),
                publishReplay(1)
            );

    constructor() {
        this._subscription.add((this._state$ as ConnectableObservable<any>).connect());
        this._subscription.add(this._effectSubject
            .pipe(mergeAll()).subscribe()
        );
    }

    /*
    * connectEffect(o: Observable<any>): void
    *
    *  * @example
     * const ls = new LocalState<{test: string, bar: number}>();
     * // Error
     * // ls.connectEffect(7);
     * ls.connectEffect(of());
     * ls.connectEffect(interval(1000).pipe(tap(console.log));
    * */
    connectEffect(o: Observable<any>): void {
        this._effectSubject.next(o);
    }

    /**
     * setSlice(s: Partial<T>) => void
     *
     * @param s: Partial<T>
     *
     * @example
     * const ls = new LocalState<{test: string, bar: number}>();
     * // Error
     * // ls.setSlice({test: 7});
     * ls.setSlice({test: 'tau'});
     * // Error
     * // ls.setSlice({bar: 'tau'});
     * ls.setSlice({bar: 7});
     */
    setState(s: Partial<T>): void {
        this._stateSlices.next(s);
    }


    /**
     * connectSlice(o: Observable<Partial<T>>) => void
     *
     * @param o: Observable<Partial<T>>
     *
     * @example
     * const ls = new LocalState<{test: string, bar: number}>();
     * // Error
     * // ls.connectSlice(of(7));
     * // ls.connectSlice(of('tau'));
     * ls.connectSlice(of());
     * // Error
     * // ls.connectSlice(of({test: 7}));
     * ls.connectSlice(of({test: 'tau'}));
     * // Error
     * // ls.connectSlice(of({bar: 'tau'}));
     * ls.connectSlice(of({bar: 7}));
     *
     * @TODO implement SliceConfig to end a stream automatically with undefined => cleanup of sate
     */
    connectState(o: Observable<Partial<T>>): void {
        this._stateObservables.next(o);
    }

    /**
     * select<R>(operator?: OperatorFunction<T, R>): Observable<T | R>
     *
     * @param operatorOrPath?: OperatorFunction<T, R>
     *
     * @example
     * const ls = new LocalState<{test: string, bar: number}>();
     * ls.select();
     * // Error
     * // ls.select('foo');
     * ls.select('test');
     * // Error
     * // ls.select(of(7));
     * ls.select(mapTo(7));
     * // Error
     * // ls.select(map(s => s.foo));
     * ls.select(map(s => s.test));
     * // Error
     * // ls.select(pipe());
     * // ls.select(pipe(map(s => s.test), startWith(7)));
     * ls.select(pipe(map(s => s.test), startWith('unknown test value')));
     */
    // For undefined arguments i.e select()
    // select<R, K extends keyof T>(operator?: K): Observable<T>;
    select<R = T>(operatorOrPath?: OperatorFunction<T, R>): Observable<R>;
    // For OperatorFunction i.e. pipe(map(s => s.slice)), map(s => s.slice) or mapTo('value')
    select<K extends keyof T, R>(operatorOrPath: K): Observable<R>;
    select<T, R>(operatorOrPath: OperatorFunction<T, R>): Observable<R> {
        let oprs: OperatorFunction<T, R> = pipe() as OperatorFunction<T, R>;
        if (typeof operatorOrPath === 'string') {
            const path: string = operatorOrPath;
            oprs = pipe(pluck(...path.split('.')));
        } else if (typeof operatorOrPath === 'function') {
            oprs = operatorOrPath
        }

        return this._state$
            .pipe(
                // We need to accept operators to enable composition of local scope related observables
                // createSelector
                oprs,
                // @TODO how to deal with undefined values?
                // map(state => state.property) can return undefined if not set.
                // This leads to unwanted behaviour in views.
                // Should filter out undefined values be done here?
                filter(v => v !== undefined),
                // State should get pushed only if changed. as this is a repetitive task we do it here
                distinctUntilChanged(),
                // I don't want to run the same computation for multiple subscribers.
                // Therefore we share the computed value
                shareReplay(1)
            );
    }

    /**
     * ngOnDestroy(): void
     *
     * When called it teardown all internal logic
     * used to connect to the `OnDestroy` life-cycle hook of services, components, directives, pipes
     */
    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

}
