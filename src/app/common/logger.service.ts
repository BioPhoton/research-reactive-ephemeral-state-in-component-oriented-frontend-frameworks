import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, Observable, Subject, Subscription} from 'rxjs';
import {publishReplay, scan} from 'rxjs/operators';

export interface LogObject {
    msg: string;
    data?: any;
    creatorInstance: string;
    hook?: 'constructor' | 'ngOnChanges' | 'ngOnInit' | 'ngAfterViewInit' | 'ngAfterViewChecked' | 'ngAfterContentInit' | 'ngAfterContentChecked' |  'template-expression' | 'template-binding' | 'ngOnDestroy';
    creator: 'component' | 'directive' | 'pipe' | 'service' | 'module';
}
@Injectable({
    providedIn: 'root'
})
export class LoggerService implements OnDestroy {
    private subscription = new Subscription();
    private logSubject = new Subject<LogObject>();
    logs$: Observable<LogObject[]> = this.logSubject.pipe(
        scan((a: LogObject[], i: LogObject): LogObject[] => a.concat([i]), []),
        publishReplay(1)
    );
    constructor() {
        this.subscription.add((this.logs$ as ConnectableObservable<any>).connect());
    }
    log(obj: LogObject): void {
        this.logSubject.next(obj);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
