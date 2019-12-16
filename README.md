![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/cover-reactive-local-state__michael-hladky.png "How to Avoid Observables in Angular - Cover")
# Research on Reactive-Ephemeral-State with Angular and RxJS

Angular, RxJS, State-Management, Ephemeral-State

In most of component oriented applications you occasionally end up with huge container components.
Even after a well thought refactoring into more display components and grouping logic into responsibilities it's always hard to handle.

The data structure you manage inside this components is only here for their very component. Not for any other components.
This data structure appears with the component and disappears when the component is removed.

This is a good example for ephemeral state. 

If you have a well thought and structured approach on how to manage ephemeral state such components get a breeze to write.
You could master a fully reactive architecture in a scalable and maintainable way.

This article provides you with some fundamental information about my findings in reactive ephemeral state management.  

---

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-intro__michael-hladky.png "How to Avoid Observables in Angular - Intro")

<!-- toc -->

- [Methodology](#methodology)
- [Layers of state](#layers-of-state)
  * [What is the ephemeral state?](#what-is-the-ephemeral-state)
    + [Global vs Local Accessibility of Data Structures](#global-vs-local-accessibility-of-data-structures)
    + [Static vs Dynamic Lifetime of Data Structures](#static-vs-dynamic-lifetime-of-data-structures)
    + [Global vs Local Processed Sources](#global-vs-local-processed-sources)
    + [Recap](#recap)
- [Problems to Solve on a Low-Level](#problems-to-solve-on-a-low-level)
  * [Timing](#timing)
  * [Subscription Handling](#subscription-handling)
  * [Sharing State and State Derivations](#sharing-state-and-state-derivations)
    + [Uni and multi-casting with RxJS](#uni-and-multi-casting-with-rxjs)
    + [Sharing Work](#sharing-work)
    + [Sharing Instances](#sharing-instances)
  * [The Late Subscriber Problem](#the-late-subscriber-problem)
    + [Cold Composition](#cold-composition)
  * [Subscription-Less Interaction with Component StateManagement](#subscription-less-interaction-with-component-statemanagement)
    + [Subscription-Less Handling of Side-Effects](#subscription-less-handling-of-side-effects)
  * [Recap](#recap-1)
- [Basic Usage](#basic-usage)
  * [Service Design](#service-design)
  * [Service Implementation](#service-implementation)
  * [Service Usage](#service-usage)
- [Glossary](#glossary)
- [Rethinking Components based on Ephemeral State Management](#rethinking-components-based-on-ephemeral-state-management)
- [Dynamic Component State and Reactive Context](#dynamic-component-state-and-reactive-context)
  * [Initialisation and Cleanup](#initialisation-and-cleanup)
  * [Overriding State Changes and Effects](#overriding-state-changes-and-effects)
  * [Historical problems with state management in the frontend](#historical-problems-with-state-management-in-the-frontend)

<!-- tocstop -->

# Methodology

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_quote-gang-of-four__michael-hladky.png "Gang of four quote")

If you go back in history you will find almost all our nowadays "cutting edge problems" already solved. 
When I realized the first time that life is a "constant evolutionary repetition" I started to change my strategy on solving problems.

Before I almost always started to implement a half-backed cool idea which I was certain is most up to date.

After I made many mistakes (without them I would not be here today) and got some incredibly helpful insights, I changed my way of solving problems completely.
Let me quote **The Gang Of Four** to give you the first glimpse of my fundamental changes in how I approach problems:

So here is what the gang of four says about Object-Oriented-Software-Design-Patterns: 

> If you stick to the paradigms of object-oriented programming,
> the design patterns appear naturally.

With that in mind, I did not work on a solution for ephemeral state management,
but tried to look at all the different problems that we will face when managing any local state in general,
(and also some specific problems related to Angular), with the hope, in the end, a solid solution will appear naturally.

Let's start with the first chapter and some general information to get you on track.

# Layers of state

Of course, there are WAY more, but in this article, I will introduce 3 layers of state:
- (Persistent) Server State
- Persistent Client State (Global State)
- Ephemeral Client State (Local State)

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_layers-of-state__michael-hladky.png "Layers of State")

**Persistent Server State** is the data in your database. It is provided to the consumer over a data API like REST, GraphQL, Websocket, etc.
This is very different from **Meta State**, which is information related to the status of a resource that provides us a state. I.E. Loading, Error, Success, etc.

For persistent and ephemeral client states I will try to use to more simpler wording.
 I will use **Global State** for persistent client state and **Local State** of the ephemeral client state.
Both live on the client, but they demand completely different handling and a completely different way of treating them.

In this article, I want to focus on the ephemeral state. 

## What is ephemeral state?

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_ephemeral-state__michael-hladky.png "What is Ephemeral State")

The ephemeral state is just one of many names for data structures 
that needed to be managed on the client under special conditions.
Other synonyms are a transient state, UI state, local state, component state, short term data, etc...

It is the data structure that expresses the state 
of an isolated unit like for example a component in your application.

As the word "isolated" is a bit vague, let me get a little bit more concrete.

It's the state that life's in your components, pipes, directives and some of the services that are created
and destroyed over time. The state is not shared between siblings and not populated to global services.

### Global vs Local Accessibility of Data Structures

The therm global state is well known in modern web development. 
It is the state we share globally in our app i.e. a `@ngRx/store` or the good old `window` object ;)

This is in this article called persistent state.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_global-accessible__michael-hladky.png "Global Accessible State")

As we can see one global source distributes state to the whole app.
 
If we compare this to a local state we see that this data structure is provided and managed only in a certain time-frame of your app.
For example in a component or directive.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_local-accessible__michael-hladky.png "Local Accessible State")

This is our first rule of thumb to detect local state: 

> No horizontal sharing of the state i.e. with sibling components or upwards.

### Static vs Dynamic Lifetime of Data Structures

In Angular global state is nearly always shared over global singleton services.
Their lifetime starts even before the root component. And ends after every child component.
The state's lifetime is ~equal to the Apps lifetime or the browser windows lifetime.

This is called a static lifetime.
![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_lifetime-global-singleton-service__michael-hladky.png "Lifetime Global Singleton Service")


If we compare this to the lifetime of other building blocks of angular we can see their lifetime is way more dynamic.
![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_lifetime-angular-building-blocks__michael-hladky.png "Lifetime Angular Building Blocks")

State in this building blocks is tied to the lifetime of their owners or hosts.
And if shared only with children.

The best example of a dynamic lifetime is data that gets rendered over the `async` pipe.
![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_lifetime-async-pipe__michael-hladky.png "Lifetime async Pipe")

The lifetime depends on the evaluation of the template expression, a potential `*ngIf` that wraps the expression or many other things.

For our second rule of thumb we detected for the local state is: 

> The lifetime is dynamic i.e. bound to the lifetime of a component or an async pipe

### Global vs Local Processed Sources

Where our global state service nearly always processes remote sources:
- REST API's HTTP, HTTP2
- Web Sockets
- Browser URL
- Browser Plugins
- Global Static Data
- The `window` object

And the logic is located in the more abstract layers of our architecture.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-changes_processing-global-sources__michael-hladky.png "Processing of Global Sources")

Code dedicated to the local state would nearly always focus on the process of the following sources: 
- Data from `@InputBindings`
- UI Events
- Component level Side-Effects
- Parsing global state to local

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-changes_processing-local-sources__michael-hladky.png "Processing of Local Sources")

The third rule of thumb to detect local state is: 

> It processes mostly local sources i.e. sort/filter change

---

### Recap

> **We defined 3 rules of thumb to detect ephemeral/local state**
> - No horizontal sharing of state
> - The lifetime of the state is dynamic
> - It processes local relevant events

Some real-life example that matches the above-defined rules are:
- sorting state of a list
- form errors
- state of an admin panel (filter, open/close, ...)
- any dynamic appearing data
- accumulations from @Input data
- extended global state or derived global state for a container component 
 
You rarely share this data with sibling components, it only shares data-structures only locally and focuses mostly on local sources.
In other words, there is no need to use state management libraries like ngrx, ngxs, Akita, etc. there.

Still, we need a way to manage these data structures.

# Problems to Solve on a Low-Level

As a first and foundational decision in the way of data distribution, we will pick a push-based architecture.
This has several advantages but more important defines the problems we will run into when implementing a solution.

As we defined the way how we want to distribute our data let me list a set of problems we need to solve.

## Timing

As a lot of problems I ran into in applications are related to timing issues, 
this section is here to give a quick overview of all the different things to consider.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_timing-component-lifecycle__michael-hladky.png "Component Life Cycle Hooks")

**Shouldn't reactive code be by design in a way that timing of certain things becomes irrelevant?**

I mean not that there is no time in observables, or that it does not matter when we subscribe to something,
but when we compose observables we should not care about when any of our state sources exactly emit a value... 

That's the case, in a perfect reactive setup, we don't need to care about those problems.
However, as Angular is an object-orientated framework we often have to deal with different problems
related to life-cycles of components and services, router-events and many more things.

In RxJS timing is given by the following:
- For hot observables the **time of creation**
- For cold observables the **time of subscription**
- For emitted values the **scheduling process**

In Angular timing is given by the following:
- For global services the **creation** as well as the application **lifetime**
- For components the **creation**, several **life-cycle hooks** as well as the component **lifetime**
- For local services the **creation** of the component as well as the components **lifetime**
- For pipes or directives in the template also the components **lifetime**

All timing relates things in Angular are in an object-oriented style, very similar to hot observables.
Subscription handling can be done declarative over completion operators. 
The scheduling process can be controlled both over imperative or over operators and can influence the execution context of the next error or complete callback.

We see that there are two different concepts combined that have completely different ways of dealing with timing. 
Angular already solved parts of this friction points but some of 
they are still left and we have to find the right spots to put our glue code and fix the problem.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/angular-timeline__michael-hladky.png "Angular Timeline")

This chart shows a minimal Angular app with the different building units ant their timing:  
In this example it marks:
- the global store lifetime
- the component store lifetime
- the async pipe lifetime

As we can see It makes a big difference where we place observables and where we subscribe to them. 
It also shows where we need hot observables and where we need to replay values.

## Subscription Handling

Let's discuss where subscriptions should take place and for which reason they are made.

Subscriptions are here to receive values from any source, cold or hot.

In most cases, we want to render incoming values to the DOM.

For this reason, we use a `Pipe` or a `Directive` in the template to trigger
change-detection whenever a value arrives.

The other reason could be to run some background tasks in a `Component`, `Directive` or `Service`,
which should not get rendered. I.e. a request to the server every 30 seconds.

As subscriptions in the `Pipe` or `Directive` are handled over their life-cycle
hooks automatically, we only have to discuss the scenarios for side-effects.

Let's take a quick look to the diagram from before:
![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_timing-component-lifecycle__michael-hladky.png "Life cycle hooks component")

So what could be a good strategy related to the timing of subscriptions and their termination?

One way to solve it would be to subscribe as early as possible and unsubscribe as late as possible.

On a diagram it would look like that:
![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_subscription-handling__michael-hladky.png "Subscription Handling Strategy")


```typescript
@Component({
  ...
})
export class SubscriptionHandlingComponent implements OnDestroy {
    onDestroy$ = new Subject();

    sideEffect$ = timer(0, 1000).pipe(tap(n => serverRequest(n)));

    constructor() {
        this.sideEffect$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
    }
}
```

We already have a declarative subscription handling. 
But this code could get moved somewhere else. We could use
the local service that we most probably will need if we implement
the final implementation for component state handling.

**Service**
```typescript
export class SubscriptionHandlingService implements OnDestroy {

    onDestroy$ = new Subject();

    subscribe(o): void {
        o.pipe(takeUntil(this.onDestroy$))
            .subscribe();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
    }

}
```

**Component**
```typescript
@Component({
    ...
    providers: [SubscriptionHandlingService]
})
export class SubscriptionHandlingComponent {
    sideEffect$ = timer(0, 1000)
        .pipe(tap(console.log));

    constructor(private subHandler: SubscriptionHandlingService) {
        this.subHandler
            .subscribe(this.sideEffect$)
    }
}
```

In this way, we get rid of thinking about subscriptions in the component at all.

([🎮 StackBlitz demo](https://blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs.stackblitz.io/subscription-handling))

## Sharing State and State Derivations

In many cases, we want to subscribe to more than one place to some source and render its data.
Even with such a simple operation as retrieving and displaying the data several things needs to be considered. 

The interesting parts here are the data structure and derivation logic. 

We will skip the data structure and focus on the things related to RxJS. 
The derivation of data.

### Uni and multi-casting with RxJS

As we have multiple sources we calculate the data for every subscription separately.
This is given by the default behavior of RxJS. Notifications are is uni-cased by default.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_uni-case-vs-multi-cast__michael-hladky.png "Uni-Cast VS Multi-Cast")

**Basic uni-cast examples:**
```typescript
const timeStampObservable = new Observable((subscriber) => {
    console.log('create date object');
    const dataObject = new Date();
    subscriber.next(dataObject);
});

timeStampObservable
  .subscribe(d => console.log('date: ', d));
timeStampObservable
  .subscribe(d => console.log('date: ', d));

// Result in console:
// 
// create date object
// date:  Fri Dec 13 2042 00:00:00 
// create date object
// date:  Fri Dec 13 2042 00:00:00 
```

If we want to multicast the values we could do something like that:

**Basic multi-cast examples:**
```typescript
const timestamp object = new Subject();

timeStampSubject
  .subscribe(d => console.log('date: ', d));
timeStampSubject
  .subscribe(d => console.log('date: ', d));

console.log('create date object');
const dataObject = new Date();
timeStampSubject.next(dataObject);

// Result in console:
// 
// create date object
// date:  Fri Dec 13 2042 00:00:00 
// date:  Fri Dec 13 2042 00:00:00 
```

We see how we can share data, now let's take a look at operations:

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_uni-case-vs-multi-cast-operators__michael-hladky.png "Uni-Cast VS Multi-Cast With Operators")

**Operators uni-cast examples:**
```typescript
const timeStampSubject = new Subject();
const timeStampObservable = timeStampSubject.pipe(
    map((date: Date) => {
        console.log('transformation of ', date);
        return date.getTime();
    })
);

timeStampObservable
    .subscribe(d => console.log('date: ', d));
timeStampObservable
    .subscribe(d => console.log('date: ', d));

console.log('create date object');
const dataObject = new Date();
timeStampSubject.next(dataObject);

// create date object
// transformation of Fri Dec 13 2042 00:00:00
// date:  1576231670737
// transformation of Fri Dec 13 2042 00:00:00
// date:  1576231670737
```

You remember the subscriber function we saw in the first example with the observable?
Operators internally maintain a similar logic. We apply an operator the inner subscriber functions are chained.
This is the reason we see the log for the transformation 2 times. For every subscriber one time.

There are also operators that help to add multi-casting in operator chains.

**Operators multi-cast examples:**
```typescript
const timeStampSubject = new Subject();
const timeStampObservable = timeStampSubject.pipe(
    map((date: Date) => {
        console.log('transformation of ', date);
        return date.getTime();
    }),
    share()
);

timeStampObservable
    .subscribe(d => console.log('date: ', d));
timeStampObservable
    .subscribe(d => console.log('date: ', d));

console.log('create date object');
const dataObject = new Date();
timeStampSubject.next(dataObject);

// create date object
// transformation of Fri Dec 13 2042 00:00:00
// date:  1576231670737
// date:  1576231670737
```
### Sharing Work
With this knowledge let's take a look at some examples:

In our view, we could do some processing for incoming data. 
An example could be an array of items from an HTTP call.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_uni-case-vs-multi-cast-work__michael-hladky.png "Uni-Cast VS Multi-Cast - Work")

```typescript
@Component({
    template: `
    <list-a [list]="httpResult$ | async">
    </list-a>
    <list-b [list]="httpResult$ | async">
    </list-b>
    `,
    ...
})
export class AnyComponent {
    httpResult$ = this.http.get(url)
        .pipe(map(this.mapServerToClientObject));
}
```

the work that is done in `mapServerToClient` is executed once per subscription.
In our example 2 times. Even if we change the HTML and use `ng-container` to maintain only one subscription in the template
in the class could be multiple other subscriptions we can't solve in the template. 

To save work we need to share the subscription.

```typescript
export class AnyComponent {
    httpResult$ = this.http.get(url)
        .pipe(map(this.mapServerToClientObject), shareReplay({refCount: true, bufferSize: 1}));
}
```
Here we use `shareReplay` to cache the last value, replay it and share all notifications with multiple subscribers.
([🎮 StackBlitz demo](https://blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs.stackblitz.io/sharing-a-reference))

### Sharing Instances
This is a rare case but important to know if you work fully reactive.

To start this section let's discuss the components implementation details first.
We focus on the component's outputs. 

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_uni-case-vs-multi-cast-instances__michael-hladky.png "Uni-Cast VS Multi-Cast - Instance")

```typescript
@Component({
    ...
})
export class AnyComponent {
    @Output() compOutput = new EventEmitter()
}
```

Let's take a closer look at the EventEmitter interface:
`EventEmitter<T extends any> extends Subject<T>`
And `Subject` looks like this:
`Subject<T> extends Observable<T> implements SubscriptionLike`
The important part here is that we can pass everything that holds a `subscribe`.

Which means the following would work:

```typescript
@Component({
    ...
})
export class AnyComponent {
    @Output() compOutput = interval(1000);
}
```
An observable for example provides a `subscribe` method. 
Therefore we can directly use it as a value stream for our `@Output` binding.

Knowing that enables us to take some very nice and elegant shortcuts as well as reducing the amount of code we need to write.

With this in mind let's focus on the original problem, sharing work and references.

In this example, we receive a config object from the parent component
turn it into a reactive form and 
emit changes from the form group created out of the config object.

Every time we receive a new value from the input binding 
- we create a config object out of it
- and use the `FormBuilder` service to create the new form.
As output value, we have to provide something that holds a `subscribe` method.
So we could use the form groups `value changes` to provide the forms changes directly as component output events.

```typescript
@Component({
    selector: 'sharing-a-reference',
    template: `
        <form *ngIf="(formGroup$ | async) as formGroup" [formGroup]="formGroup">
            <div *ngFor="let c of formGroup.controls | keyvalue">
                <label>{{c.key}}</label>
                <input [formControlName]="c.key"/>
            </div>
        </form>
    `
})
export class SharingAReferenceComponent {
    state$ = new ReplaySubject(1);

    formGroup$: Observable<FormGroup> = this.state$
        .pipe(
            startWith({}),
            map(input => this.getFormGroupFromConfig(input))
        );

    @Input()
    set formGroupModel(value) {
        this.state$.next(value);
    }

    @Output() formValueChange = this.formGroup$
        .pipe(switchMap((fg: FormGroup) => fg.valueChanges));

    constructor(private fb: FormBuilder) {

    }

    getFormGroupFromConfig(modelFromInput) {
        const config = Object.entries(modelFromInput)
            .reduce((c, [name, initialValue]) => ({...c, [name]: [initialValue]}), {});
        return this.fb.group(config);
    }

}
```

If we run the code we will see that the values are not updating in the parent component.

We faced a problem related to the fact that nearly all observables are cold, which means that every subscriber will get its instance of the producer.

You might be even more confused now, as our source that produces the formGroup is a `ReplaySubject`.
Which are multi-casting values and sharing one producer with multiple subscribers...

What we forgot here is that our `formGroup$` observable ends with a `map` operator,
which turns everything after it again into a uni-cast observable.

So what happened? 
We subscribed once in the template over the `async` pipe to render the form.
And another time in the component internals to emit value changes from the form.

As we now know that the map operator turned everything into a uni-cast observable again,
we realize created a new `FormGroup` instance for every subscription.
The subscription in the template, as well as the subscription, happens internally over @Output().

This can be solved by adding a multicast operator like `share` or `shareReplay` at the end of `formGroup$`.

As we also have late subscribers, the `async` pipe in the template, we use `shareReplay` with `bufferSize` 1 serve them the actual formGroup instance. 

```typescript
   formGroup$: Observable<FormGroup> = this.state$
        .pipe(
            startWith({}),
            map(input => this.getFormGroupFromConfig(input)),
            shareReplay({refCount: true, bufferSize: 1})
        );
```
`shareReplay` emits **the same value** to subscribers.

So the subscription in the template and the subscription in the components internals receive **the same instance** of `FormGroup`.

Important to notice here is that `shareReplay` is cold but multicast. 
This means it only subscribes to the source if at least one subscriber is present.
This does not solve the problem of cold composition but it is fine to share specific work or in this case a reference.

Later on, in this article, we will remember this problem to provide a way to share work instances.

## The Late Subscriber Problem

In this section, we will face the first time a problem that might need some more thinking. :D
But with a bit of focus, we can solve it.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/late-subscriber__michael-hladky.png "Late Subscriber")

Incoming values arrive before the subscription has happened.

For example state over `@Input()` decorators arrive before the view gets rendered and a used pipe could receive the value.


```typescript
@Component({
  selector: 'app-late-subscriber',
  template: `
    {{state$ | async | json}}
  `
})
export class LateSubscriberComponent {
  state$ = new Subject();
  
  @Input()
  set state(v) {
    this.state$.next(v);
  }

}
```
![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-late-subscriber-problem__michael-hladky.png "Late Subscriber - Problem")

We call this situation a late subscriber problem. In this case, the view is a late subscribe to the values from '@Input()' properties.
There are several situations from our previous explorations that have this problem:
- Input Decorators
  - transporting values from `@Input` to `AfterViewInit` hook
  - transporting values from `@Input` to the view
  - transporting values from `@Input` to the constructor 
- Component And Directive Life Cycle Hooks
  - transporting `OnChanges` to the view
  - getting the state of any life cycle hook later in time (important when hooks are composed)
- Local State
  - transporting the current local state to the view
  - getting the current local state for other compositions


A quick solution here would replay the latest notification to use a ReplaySubject with bufferSize 1.
This would cache the latest emitted value and replay it when the async pipe subscribes.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/late-subscriber-solution__michael-hladky.png "Late Subscriber - First Solution")

**Primitive Solution**
```typescript
@Component({
  selector: 'app-late-subscriber',
  template: `
    {{state$ | async | json}}
  `
})
export class LateSubscriberComponent {
  state$ = new ReplaySubject(1);
  
  @Input()
  set state(v) {
    this.state$.next(v);
  }

}
```

This quick solution has 2 major caveats!

**First Caveat:**
The downside here is that we can only replay the latest value emitted.  
Replaying more values would cause problems for later compositions of this stream,
as a new subscriber would get all past values of the `@Input` Binding. 
And that's not what we want. 

More important here is the fact that **we push workload to the consumer**.
We can not assume everybody adopts that.

If we would make every source replay at least the last value we would have to implement this logic in the following places:
- View Input bindings (multiple times)
- View events (multiple times)
- Other Service Changes (multiple times)
- Component Internal interval (multiple times)

It would also force the parts to cache values and increase memory.
Furthermore, it would force the third party to implement this too. 

IMHO not scalable.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-sate-subscriber-replay-caveat-workload__michael-hladky.png "Caveat Workload")

Another downside is the bundle size of ShareReplay. 
But it will be used anyway somewhere in our architecture, so it's a general downside.

**Second Caveat:**
The second and more tricky caveat is composition is still cold.
we rely on the consumer to initialize state composition.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-sate-subscriber-replay-caveat-cold-composition__michael-hladky.png "Caveat Cold Composition")

### Cold Composition

Let's quickly clarify hot/cold and uni-case/multi-cast.

First, let's remember what we learned about uni- and multi-casting in the earlier chapter.

**uni-cast**
The producer is unique per subscription.
Any creation operator is uni-cast. (publish operators are not yet refactored to creation operators, but they would be the only exception)
`interval` for example would call `setInterval` for every subscriber separately.

**multi-cast**
The producer is shared over all subscriptions.
`Subject` for example emits it's value to multiple subscribers without executing some producer logic again. 

**cold** 
The internal logic of the observable is executed only on subscription.
The consumer controls the moment when internal logic is executed by the `subscribe` is called.
The `interval` creation operator, for example, will only start it's internal tick if we subscribe to it.
Also, nearly every pipe-able operator will execute only if we have an active subscriber.

An interesting example for a *cold* operator is `share`.
Even if is multi-casts it's notifications to multiple subscribers,
it will not emit any notification until at least one subscriber is present.

So it's cold but multi-cast. :)

**hot**
The internal logic is executed independently from any consumer.
The `Subject` for example can emit values without any present consumer.

There is also an operator that turn all the above logic into a hot path.
Every `publish` operator returns a `ConnectableObservable`. 
If we call `connect` on it we connect to the source an start to execute the logic and all the operators in between `publish` and it's source observable.

Some side notes here:
Pipeable operators that return `ConnectableObservable` are not pipeable operators as they are not compos-able.
IMHO they should get refactored to creation operators.

--- 

With this in mind, we can discuss the problem of cold composition in the case of our **local state**.

As we will have to deal with:
- View Interaction ( button click )
- Global State Changes ( i.e. HTTP update )
- Component State Changes ( triggered internal logic )

Putting all this logic in the component class is a bad idea. 
Not only because of the separations of concerns but also because we would have to implement it over and over again.

We need to create the logic that deals with the problems around the composition
in a way that it can be reused and is independent!

So far our sources got subscribed to when the view was ready and we rendered the state.
As the input from the view is a hot producer of values and injected services too we have to decouple
the service that handles component state from other sources. 

**So what is the problem?!!11**

We have hot sources and we have to compose them. As we already learned in the section _sharing work and instances_ nearly every operator returns a cold source. 
No matter if it was hot before or not.

If we compose state we have to consider that our `scan` operator returns a cold observable.

So no matter what we do before, after an operation we get a cold observable, and we have to subscribe to it to trigger the composition.
I call this situation a cold composition.

Some of our sources are cold. This can be solved by tow ways: 
- a) Make all sources replay at least their last value (push workload to all relevant sources)
- b) Make the composition hot as early as possible (push workload to the component related part)

We discuss a) already in the previous section, and concluded that this is not an option.

What would be the scenario with b)?

We could think of the earliest possible moment to make the composition hot. 
From the diagram above we know that service, even if locally provided, 
are instantiated first, before the component.

If we would put it there we could take over the workload from:
- View Input bindings (multiple times)
- View events (multiple times)
- Component Internal interval (multiple times)
- Locally provided services
- Global services

We could also get rid of the dependency on their subscription.

Let's see a simple example where we rely on the consumer to start the composition.

**Service:**
```typescript
export class SomeService {
    commands$ = new Subject();
    composedState$ = this.commands$
        .pipe(
            tap(v => console.log('compute state ', v)),
            scan((acc, i) => {
                return {sum : acc['sum'] + i['sum']};
            }, {sum: 0}),
           // operator here
           shareReplay({refCount: true, bufferSize: 1})
        );
}
```

In this service we could try to solve our problem by using:
- share()
- shareReplay({refCount: true, bufferSize: 1})
- shareReplay({refCount: false, bufferSize: 1})

**Component:**
```typescript
@Component({
    selector: 'cold-composition',
    template: `
        <h1>Cold Composition</h1>
        <button (click)="updateState()">update state</button><br/>
        <label><input [(ngModel)]="isOpen" type="checkbox"> Show result</label>
        <div *ngIf="isOpen">
            someService.composedState$: {{someService.composedState$ | async | json}}
        </div>
    `,
    providers: [SomeService]
})
export class ColdCompositionComponent {
    isOpen = false;

    constructor(public someService: SomeService) {

    }

    updateState() {
        this.someService.commands$.next({sum: 1})
    }

}
```

If we run the code and click the button first and then open the result area we see we missed the values emitted before opening the area.

No matter which of the above ways we try, nothing works. 
We always lose values if no subscriber is present.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-sate-subscriber-replay-cold-composition-problem__michael-hladky.png "Cold Composition - Problem")

Even if the source is hot (the subject in the service is defined on instantiation) the composition over `scan` made the stream cold again.
This means the composed values can be received only if there is at least 1 subscriber. 
In our case, the subscriber was the components `async` pipe in the template.

Let's see how we can implement the above in a way we could run hot composition:

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-sate-subscriber-replay-cold-composition-solution__michael-hladky.png "Cold Composition - Solution")

**Hot Composition Service:**
```typescript
export class SomeService {
    subscription = new Subscription();

   commands$ = new Subject();
    composedState$ = this.commands$
        .pipe(
            tap(v => console.log('compute state ', v)),
            scan((acc, i) => {
                return {sum : acc['sum'] + i['sum']};
            }, {sum: 0}),
           // operator here
           publishReplay(1)
        );

    constructor() {
        // Composition is hot from here on
        this.serviceSubscription = this.composedState$.connect();
    }

}
```

We kept the component untouched and only applied changes to the service.

We used the `publishReplay` operator to make the
source replay the last emitted value by using `1` as `bufferSize`.

In the service constructor, we called `connect` to make it hot subscribe to the source.

## Subscription-Less Interaction with Component StateManagement

So far we only had focused on independent peace and didn't pay much attention to their interaction.
Let's analyze the way we interact with components and services so far.

Well, known implementations of sate management like `@ngrx/store` in angular,
which is a global state management library, implemented parts of the consumer-facing API imperatively.
Also, all implementations of REDUX in react did it like that.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-sate-declarative-interaction-setter__michael-hladky.png "Subscription-Less Component - Problem with setter")

The provided method is `dispatch` which accepts a single value, an action, that gets sent to the store. 

Let's look at a simple example:

**Imperative Interaction Service**
```typescript
export class StateService {
    ...

    private stateSubject = new Subject<{ [key: string]: any }>();
    
    // setter like dispatch
    setState(v) {
        this.stateSubject.next(v);
    }
    
    ...

}
```

**Imperative Interaction Component**
```typescript
@Component({
    selector: 'component',
    template: `
        <p>Imperative Interaction</p>
        <pre>{{state$ | async | json}}</pre>
        <button (click)="updateState()">
            Update State
        </button>
    `,

    providers: [StateService]
})
export class AnyComponent implements OnDestroy {
    state$ = this.stateService.state$;

    constructor(private stateService: StateService) {
       
    }
    
    updateState() {
        this.stateService
            .dispatch(({key: value}));
    }
    
}
```

Why is this imperative? Imperative programming means working with instances and mutating state.
Whenever you write a `setter` or `getter` your code is imperative, It's not compose-able.

If we now think about the `dispatch` method of `@ngrx/store`, we realize that it is similar to working with `setter`.

While in this example it sits inside another un-compose-able thing, the instance method and therefore is ok.
Everything else would resolve in more refactoring.

However, we can not use it to work with compose-able sources.

Let's think about connection RouterState or any other source like `ngrx/store` to the local state:

**Imperative Interaction Component**
```typescript
@Component({
    selector: 'component',
    template: `
        <p>Imperative Interaction</p>
        <pre>{{state$ | async | json}}</pre>
    `,

    providers: [StateService]
})
export class AnyComponent implements OnDestroy {
    subscription = new Subscription();
    state$ = this.stateService.state$;

    constructor(private stateService: StateService,
                private store: Store) {
     
        this.subscription.add(
            this.store.select(getStateSlice)
                .subscribe(value => this.stateService
                    .setState({key: value})
                )
        );
    
    }
    
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    
}
```

As we can see as soon as we deal with something compose-able setters don't work anymore.
We end up in a very ugly code. We break the reactive flow and we have to take care of subscriptions.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-declarative-interaction-breaking-flow__michael-hladky.png "Subscription-Less Component - Breaking the reactive flow")

But how can we go more declarative or even reactive? 
**By providing something compose-able** :)

Like an observable itself. :)

By adding a single line of code we can go **fully declarative** as well as **fully subscription-less**.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-declarative-interaction-connector__michael-hladky.png "Subscription-Less Component - Connector")

**Declarative Interaction Service**
```typescript
export class StateService implements OnDestroy {
    ...
    private stateSubject = new Subject<Observable<{ [key: string]: any }>>();
    state$ = this.stateSubject
        .pipe(
            // process observables of state changes
            mergeAll(),
            ...
        );
    
    // "connector" takes observable (compose-able)
    connectState(o) {
        this.stateSubject.next(o);
    }
    ...
}
```

**Declarative Interaction Component**
```typescript
@Component({
    selector: 'component',
    template: `
        <p>Imperative Interaction</p>
        <pre>{{state$ | async | json}}</pre>
    `,

    providers: [StateService]
})
export class AnyComponent {
    state$ = this.stateService.state$;

    constructor(private stateService: StateService,
                private store: Store) {
    this.stateService.connectState(
        this.store.select(getStateSlice)
                .pipe(map(value => ({key: value})))
        ); 
        
    }
}
```

Let's take a detailed look at the introduced changes:

1. In `StateService` we changed 
`stateSubject = new Subject<{ [key: string]: any }>();`
to 
`stateSubject = new Subject<Observable<{ [key: string]: any }>>();`
It now accepts Observables instead of state objects.
2. In `StateService` we added the `mergeAll()` operator to ors state processing
3. In `StateService` we replaced the `setState` method 
```
setState(v: { [key: string]: any }) {
    this.stateSubject.next(v);
}
```
that took a single value to `connectState`
```
connectState(o: Observable<{ [key: string]: any }>) {
    this.stateSubject.next(o);
}
```

By providing the whole observable we can handle all related mechanisms
of subscription handling, as well as value processing and emission in the service itself and hide all this away from others.

![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state-declarative-interaction-connector-code__michael-hladky.png "Subscription-Less Component - Connect method")

We now have not only way less and maintainable code but also a "subscription-less component". 

This simple change will enable us to do create way more than just subscription-Less components.
But this document is dedicated to the very fundamentals.

As a last additional benefit in this section we can talk a little bit about side-effects:

### Subscription-Less Handling of Side-Effects

If we recap the above snippet we can see that we not only introduced a subscription-less way for state management interaction, 
but also a very elegant way to handle side-effects over our service.

Let's implement some more lines of code:

**Service**
```typescript
export class DeclarativeSideEffectsGoodService implements OnDestroy {
    private effectSubscription = new Subscription();
    private effectSubject = new Subject<Observable<{ [key: string]: number }>>();

    constructor() {
        this.effectSubscription = (this.effectSubject
            .pipe(mergeAll()) as ConnectableObservable<any>).connect();
    }

    ngOnDestroy(): void {
        this.effectSubscription.unsubscribe();
    }

    connectEffect(o: Observable<any>) {
        this.effectSubject.next(o);
    }

}
```
**Declarative Interaction Component**
```typescript
@Component({
    selector: 'declarative-side-effects',
    template: `
        <p>Declarative SideEffects</p>
    `,
    providers: [StateAndEffectService]
})
export class AnyComponent {
    constructor(private stateService: StateAndEffectService) {
        this.stateService.connectEffect(interval(1000)
            .pipe(tap(_ => ({key: value}))));
    }

}
```

Note that the side-effect is now placed in a `tap` operator and the whole observable is handed over.

## Recap

So far we encountered the following problems:
- sharing work and references
- subscription handling
- late subscriber
- cold composition
- moving primitive tasks as subscription handling and state composition into another layer
- Subscription-less components and declarative interaction

If you may already realize all the above problems naturally collapse into a single piece of code.
:)

Also if you remember from the beginning this is what "the gang of four" quote says about Object-Oriented Design Patterns.
:)

We can be happy as we did a great job so far. 
We focused on understanding the problems, we used the language specific possibilities the right way,
and naturally, we ended up with a solution that is compact, robust and solves all related problems in an elegant way.

Let's see how the local state service looks like.

# Basic Usage
![](https://github.com/BioPhoton/blog-crafting-reactive-ephemeral-state-in-angular-and-rxjs/raw/master/images/reactive-local-state_first-draft__michael-hladky.png "Reactive Ephemeral State - First Draft")

## Service Design

**Local State Service**
```typescript
export class LocalState implements OnDestroy {
    private _subscription = new Subscription();
    private _effectSubject = new Subject();
    private _stateSubject = new Subject();
    private _stateSubjectObservable = new Subject();
    
    private _state$ = merge(
                        this._stateSubject,
                        this._stateSubjectObservable.pipe(mergeAll()),
                     )
        .pipe(
            map(obj => Object.entries(obj).pop()),
            scan((state, command) => ({...state, ...command}), {}),
            publishReplay(1)
        );

    constructor() {
        this._subscription.add(this.state$.connect());
        this._subscription.add(this.effectSubject.pipe(mergeAll()).connect()
        );
    }
  
    select(operatorArray) {
        return this._state$
            .pipe(
                operatos,
                shareReplay({refCount: true, bufferSize: 1})
            );
    }
 
    setState(slice) {
        this._stateSubject.next(slice);
    }
    connectState(slice$) {
        this._stateSubject.next(slice$);
    }

    connectEffect(o) {
        this._effectSubject.next(o);
    }
    
    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

}
```

## Service Implementation

Now let us see some minimal examples on how to use the service:

**Extending the service**
```typescript
@Component({
    selector: 'component',
    template: `
        <p>Component</p>
        ...
    `
})
export class AnyComponent extends LocalState {

    constructor() {
        this.super();
    }

}
```

**Injecting the service**
```typescript
@Component({
    selector: 'component',
    template: `
        <p>Component</p>
        ...
    `,
    providers: [LocalState]
})
export class AnyComponent {

    constructor(private stateService: LocalState) {
    }

}
```

## Service Usage

**Connecting Input-Bindings**
```typescript
@Component({
    selector: 'component',
    template: `
        <p>Component</p>
        ...
    `
})
export class AnyComponent extends LocalState {

    @Input() 
    set value(value) {
        this.setState({slice: value})
    }

    constructor() {
        this.super();
    }

}
```

**Connecting GlobalState**
```typescript
@Component({
    selector: 'component',
    template: `
        <p>Component</p>
        ...
    `
})
export class AnyComponent extends LocalState {

    @Input() 
    set value(value) {
        this.setState({slice: value})
    }

    constructor(private store: Store) {
        this.connectState(
            this.store.select(getStateSlice)
                    .pipe(transformation)
        );
    }

}
```

**Selecting LocalState**
```typescript
@Component({
    selector: 'component',
    template: `
        <p>Component</p>
        <button (click)="click$.next()">btn</button>
        {{state$ | async}}
    `
})
export class AnyComponent extends LocalState {
    click$ = new Subject(); 
    
    state$ = this.select(
        withLatestFrom(click$),
        map(([state, _]) => state.slice)
    );    
   
}
```

**Handling LocalSideEffects**

```typescript
@Component({
    selector: 'component',
    template: `
        <p>Component</p>
        ...
    `
})
export class AnyComponent extends LocalState {
    
    constructor(private store: Store) {
        this.connectEffect(interval(10000)
            .pipe(tap(this.store.dispatch(loadDataAction)))
        );
    }

}
```

# Summary

---

**Resources**  
You can find the source code of the examples   
as well as all the resources in the repository [Tackling Ephemeral State Reactively](https://github.com/BioPhoton/blog-tackling-ephemeral-state-reactively) on GitHub.

The first-draft is contained in the following repository:
- [📦 rxjs-state](https://github.com/BioPhoton/rxjs-state) 
All Examples can be found in this repository:
- [📦 rxjs-state](https://github.com/BioPhoton/rxjs-state) 

# Glossary
