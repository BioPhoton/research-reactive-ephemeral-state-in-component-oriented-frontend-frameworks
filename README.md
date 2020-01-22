# Research on Reactive-Ephemeral-State in component-oriented frameworks

Angular, RxJS, StateManagement, LocalState, EphemeralState

--- 
### Studies are done with Angular as an example for a component-oriented framework and RxJS is used as an example for a reactive programming library

--- 
As this is too much text I'm afraid the important things at the end will get lost,
I put it here and quote one of Richard Feynman's rules he stuck to when teaching:

> Give credit where it's due
 _Richard Feynman_  

- [@ngrx_io](https://twitter.com/ngrx_io) - that listened to my questions and gave me useful feedback
- [@yjaaidi](http://twitter.com/yjaaidi) and [@niklas_wortmann](https://twitter.com/niklas_wortmann) - may be the only 2 persons on earth that read ALL THAT
- [@juristr](https://twitter.com/juristr) - that pretended he will use it in his projects
- [@mvmusatov](https://twitter.com/mvmusatov) - that sent a [PR](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/pull/1) and fixed my messy demo :D

--- 

In most of the component-oriented applications, there is the need to structure container components.
Even after a well thought refactoring into more display components and grouping logic into responsibilities it's always hard to handle.

The data structure you manage inside these components is only here for their very component. Not for any other components.
This data structure appears with the component and disappears when the component is removed.

This is a good example of an ephemeral state. 

If you have a well thought and structured approach on how to manage ephemeral state such components get a breeze to write.
You could master a fully reactive architecture in a scalable and maintainable way.

This article provides you with some fundamental information about my findings in reactive ephemeral state management.
It is applicable to every framework that is component-oriented and has some life cycle hooks for creation and destruction.  

The below examples are done with Angular as a framework as it has DI built-in which comes in handy here.
As a Reactive programming library with cold Observables by default, I picked RxJS as it is well supported.

---

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-intro__michael-hladky.png "How to Avoid Observables in Angular - Intro")

---

# Table of Content

<!-- toc -->

- [TL;DR](#tldr)
- [Methodology](#methodology)
- [Layers of State](#layers-of-state)
  * [What is the ephemeral state?](#what-is-the-ephemeral-state)
      + [Global vs Local Accessibility of Data Structures](#global-vs-local-accessibility-of-data-structures)
      + [Static vs Dynamic Lifetime of Data Structures](#static-vs-dynamic-lifetime-of-data-structures)
      + [Global vs Local Processed Sources](#global-vs-local-processed-sources)
      + [Recap Ephemeral State](#recap-ephemeral-state)
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
  * [Recap Problems](#recap-problems)
- [Basic Usage](#basic-usage)
  * [Service Design](#service-design)
  * [Service Usage](#service-usage)
- [Summary](#summary)

<!-- tocstop -->

--- 

# TL;DR

If you are into reactive programming you will learn about some cool topics.
- unicast vs. multicast
- hot vs. cold
- subscription-less components
- higher-order operators like [mergeAll](https://rxjs.dev/api/operators/mergeAll)

If you are also into ephemeral state management you can learn how to detect it:

**We defined 3 rules of thumb to detect ephemeral state**
- No horizontal sharing of state
- The lifetime of the state is dynamic
- It processes local relevant events

Your understanding of the fundamental implementation will get a good boost!
Examples on how to introduce different architecture patterns in your component structure are only the tip of the iceberg: 
- Initiation and coupling state to e.g. a component
- Interaction
- derivation of state

are just some of the nitty-gritty details included!

Here the Important resources:
- **Recording** ([🎥 Live Demo at 24:47](https://www.youtube.com/watch?v=I8uaHMs8rw0&t=24m47s)): 
  {% youtube I8uaHMs8rw0 %}
- **Repository For Examples** ([💾 Final Example](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/tree/master/src/app/examples/demo-basics)): 
{% github BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks no-readme %}
- **Sourcecode First-draft**: [📦 rxjs-state](https://github.com/BioPhoton/rxjs-state)  

--- 

# Methodology

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-quote-gang-of-four__michael-hladky.png "Gang of four quote")

If you go back in history you will find almost all our nowadays "cutting edge problems" already solved. 
When I realized the first time that life is a "constant evolutionary repetition" I started to change my strategy on solving problems.

Before I almost always started to implement a half-backed cool idea which I was certain is most up to date with technologies.

After I made many mistakes (without them I would not be here today) and got some incredibly helpful insights, I now started to change my way of solving problems completely. 
Let me quote **The Gang Of Four** to give you the first glimpse of my fundamental changes in how I approach problems:

So here is what the gang of four says about Object-Oriented-Software-Design-Patterns: 

> If you stick to the paradigms of object-oriented programming,
> the design patterns appear naturally.

With that in mind, I did not work on a solution for ephemeral state management,
but tried to look at all the different problems that we will face when managing any local state in general, with the hope, in the end, a solid solution will appear naturally.

Let's start with the first chapter and some general information to get you on track.

# Layers of State

Of course, there are WAY more, but in this article, I will introduce 3 layers of state:
- (Persistent) Server State
- Persistent Client State (Global State)
- Ephemeral Client State (Local State)

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_layers-of-state__michael-hladky.png "Layers of State")

**Persistent Server State** is the data in your database. It is provided to the consumer over a data API like REST, GraphQL, Websocket, etc.
This is very different from **Meta State**, which is information related to the status of a resource that provides us a state. E.g. Loading, Error, Success, etc.

For persistent and ephemeral client states I will try to use to more simpler wording.
 I will use **Global State** for persistent client state and **Local State** of the ephemeral client state.
Both live on the client, but they demand a completely different way of treatment.

In this article, I want to focus on the ephemeral state. 

## What is the ephemeral state?

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_ephemeral-state__michael-hladky.png "What is Ephemeral State")

The ephemeral state is just one of many names for data structures 
that needed to be managed on the client under special conditions.
Other synonyms are a transient state, UI state, local state, component state, short term data, etc...

It is the data structure that expresses the state 
of an isolated unit like for example a component in your application.

As the word "isolated" is a bit vague, let me get a little bit more concrete.

It's the state that lives in your components, pipes, directives and some of the services that are created
and destroyed over time. The state is not shared between siblings and not populated to global services.

### Global vs Local Accessibility of Data Structures

The term global state is well known in modern web development. 
It is the state we share globally in our app e.g. a `@ngRx/store` or the good old `window` object ;)

This is in this article called persistent state.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_global-accessible__michael-hladky.png "Global Accessible State")

As we can see one global source distributes state to the whole app.
 
If we compare this to a local state we see that this data structure is provided and managed only in a certain time-frame of your app.
For example in a component or directive.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_local-accessible__michael-hladky.png "Local Accessible State")

This is our first rule of thumb to detect local state: 

> No horizontal sharing of the state e.g. with sibling components or upwards.

### Static vs Dynamic Lifetime of Data Structures

In Angular global state is nearly always shared over global singleton services.
Their lifetime starts even before the root component. And ends after every child component.
The state's lifetime is ~equal to the Apps lifetime or the browser windows lifetime.

This is called a static lifetime.
![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_lifetime-global-singleton-service__michael-hladky.png "Lifetime Global Singleton Service")


If we compare this to the lifetime of other building blocks of Angular we can see their lifetime is way more dynamic.
![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_lifetime-angular-building-blocks__michael-hladky.png "Lifetime Angular Building Blocks")

State in this building blocks is tied to the lifetime of their owners, their hosts and if shared this state is shared then only with children.

The best example of a dynamic lifetime is data that gets rendered over the `async` pipe.
![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_lifetime-async-pipe__michael-hladky.png "Lifetime async Pipe")

The lifetime depends on the evaluation of the template expression, a potential `*ngIf` that wraps the expression or e.g a directive.

For our second rule of thumb we detected for the local state is: 

> The lifetime is dynamic e.g. bound to the lifetime of a component or an async pipe

### Global vs Local Processed Sources

Where our global state service nearly always processes remote sources:
- REST API's HTTP, HTTP2
- Web Sockets
- Browser URL
- Browser Plugins
- Global Static Data
- The `window` object

And the logic is located in the more abstract layers of our architecture.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-changes_processing-global-sources__michael-hladky.png "Processing of Global Sources")

Code dedicated to the local state would nearly always focus on the process of the following sources: 
- Data from `@InputBindings`
- UI Events
- Component level Side-Effects
- Parsing global state to local

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-changes_processing-local-sources__michael-hladky.png "Processing of Local Sources")

The third rule of thumb to detect local state is: 

> It processes mostly local sources e.g. sort/filter change

---

### Recap Ephemeral State

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
In other words, there is no need to use many of the concepts of global state management libraries e.g. actions.

Still, we need a way to manage these data structures.

# Problems to Solve on a Low-Level

As a first and foundational decision fact, we have to know we work with a push-based architecture. This has several advantages but more important defines the problems we will run into when implementing a solution.

As we defined the way how we want to distribute our data let me list a set of problems we need to solve.

## Timing

As a lot of problems I ran into in applications are related to timing issues, 
this section is here to give a quick overview of all the different things to consider.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_timing-component-lifecycle__michael-hladky.png "Component Life Cycle Hooks")

**Shouldn't reactive code be by design in a way that timing of certain things becomes irrelevant?**

I mean, not that there is no time in observables, or that it does not matter when we subscribe to something,
but when we compose observables we should not care about when any of our state sources exactly emit a value... 

In a perfect reactive setup, we don't need to care about those problems.
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
Subscription handling can be done declaratively over completion operators. 
The scheduling process can be controlled both over imperative or over operators and can influence the execution context of the next error or complete callback.

We see that there are two different concepts combined that have completely different ways of dealing with timing. 
Angular already solved parts of this friction points but some of 
them are still left and we have to find the right spots to put our glue code and fix the problem.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/angular-timeline__michael-hladky.png "Angular Timeline")

This chart shows a minimal Angular app with the different building units ant their timing:  
In this example it marks:
- the global store lifetime
- the component store lifetime
- the async pipe lifetime

As we can see It makes a big difference where we place observables and where we subscribe to them. 
It also shows where we need hot observables and where we need to replay values.

## Subscription Handling

{% stackblitz research-reactive-ephemeral-state file=src/app/examples/problems/subscription-handling/subscription-handling-bad.component.ts %}

Let's discuss where subscriptions should take place and for which reason they are made.

Subscriptions are here to receive values from any source, cold or hot.

In most cases, we want to render incoming values to the DOM.

For this reason, we use a `Pipe` or a `Directive` in the template to trigger
change-detection whenever a value arrives.

The other reason could be to run some background tasks in a `Component`, `Directive` or `Service`,
which should not get rendered. E.g. a request to the server every 30 seconds.

As subscriptions in the `Pipe` or `Directive` are handled over their life-cycle
hooks automatically, we only have to discuss the scenarios for side-effects.

Let's take a quick look to the diagram from before:
![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_timing-component-lifecycle__michael-hladky.png "Life cycle hooks component")

So what could be a good strategy related to the timing of subscriptions and their termination?

One way to solve it would be to subscribe as early as possible and unsubscribe as late as possible.

On a diagram it would look like that:
![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_subscription-handling__michael-hladky.png "Subscription Handling Strategy")


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
_(used RxJS parts: [timer](https://rxjs.dev/api/function/timer), [tap](https://rxjs.dev/api/operator/tap), [takeUntil](https://rxjs.dev/api/operator/takeUntil), [Subject](https://rxjs.dev/api/class/Subject))_

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


## Sharing State and State Derivations

In many cases, we want to subscribe to more than one place to some source and render its data.
Even with such a simple operation as retrieving and displaying the data several things needs to be considered. 

The interesting parts here are the data structure and derivation logic. 

We will skip the data structure and focus on the things related to RxJS. 
The derivation of data.

### Uni and multi-casting with RxJS

As we have multiple sources we calculate the data for every subscription separately.
This is given by the default behavior of RxJS. It is uni-cased by default.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_uni-case-vs-multi-cast__michael-hladky.png "Uni-Cast VS Multi-Cast")

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
// date:  Fri Dec 13 2042 00:00:01 
```
_(used RxJS parts: [Observable](https://rxjs.dev/api/class/Observable))_

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

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_uni-case-vs-multi-cast-operators__michael-hladky.png "Uni-Cast VS Multi-Cast With Operators")

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
_(used RxJS parts: [map](https://rxjs.dev/api/operator/map))_

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
_(used RxJS parts: [share](https://rxjs.dev/api/operator/share))_


### Sharing Work

{% stackblitz research-reactive-ephemeral-state file=src/app/examples/problems/sharing-a-reference/sharing-a-reference-bad.display.component.ts %}

With this knowledge let's take a look at some examples:

In our view, we could do some processing for incoming data. 
An example could be an array of items from an HTTP call.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_uni-case-vs-multi-cast-work__michael-hladky.png "Uni-Cast VS Multi-Cast - Work")

```typescript
@Component({
    template: `
    <list-a [list]="httpResult$ | async"></list-a>
    <list-b [list]="httpResult$ | async"></list-b>
    `,
    ...
})
export class AnyComponent {
    httpResult$ = this.http.get(url)
        .pipe(
          map(this.mapServerToClientObject)
        );
}
```

the work that is done in `mapServerToClient` is executed once per subscription.
In our example 2 times. Even if we change the HTML and use `ng-container` to maintain only one subscription in the template
in the class could be multiple other subscriptions we can't solve in the template. 

To save work we need to share the subscription.

```typescript
export class AnyComponent {
    httpResult$ = this.http.get(url)
        .pipe(
          map(this.mapServerToClientObject),
          shareReplay({refCount: true, bufferSize: 1})
        );
}
```
_(used RxJS parts: [shareReplay](https://rxjs.dev/api/operator/shareReplay))_

Here we use `shareReplay` to cache the last value, replay it and share all notifications with multiple subscribers.

### Sharing Instances
This is a rare case but important to know if you work fully reactive.

To start this section let's discuss the components implementation details first.
We focus on the component's outputs. 

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state_uni-case-vs-multi-cast-instances__michael-hladky.png "Uni-Cast VS Multi-Cast - Instance")

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
The important part here is that we can pass everything that holds a `subscribe` method.

Which means the following would work:

```typescript
@Component({
    ...
})
export class AnyComponent {
    @Output() compOutput = interval(1000);
}
```
_(used RxJS parts: [interval](https://rxjs.dev/api/function/interval))_

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
_(used RxJS parts: [startWith](https://rxjs.dev/api/operator/startWith))_


If we run the code we will see that the values are not updating in the parent component.

We faced a problem related to the fact that nearly all observables are cold, which means that every subscriber will get its instance of the producer.

You might be even more curious now, as our source that produces the formGroup is a `ReplaySubject`.
Which are multi-casting values and sharing one producer with multiple subscribers...

What we forgot here is that our `formGroup$` observable ends with a `map` operator,
which turns everything after it again into a uni-cast observable.

So what happened? 
We subscribed once in the template over the `async` pipe to render the form.
And another time in the component internals to emit value changes from the form.

As we now know that the map operator turned everything into a uni-cast observable again,
we realize that we created a new `FormGroup` instance for every subscription.
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

{% stackblitz research-reactive-ephemeral-state file=src/app/examples/problems/late-subscriber/late-subscriber.display.component.ts %}


In this section, I faced the first time a problem that needed some more thinking. 

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/late-subscriber__michael-hladky.png "Late Subscriber")

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
![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-late-subscriber-problem__michael-hladky.png "Late Subscriber - Problem")

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

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/late-subscriber-solution__michael-hladky.png "Late Subscriber - First Solution")

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
_(used RxJS parts: [ReplaySubject](https://rxjs.dev/api/class/ReplaySubject))_

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

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-sate-subscriber-replay-caveat-workload__michael-hladky.png "Caveat Workload")

Another downside is the bundle size of ShareReplay. 
But it will be used anyway somewhere in our architecture, so it's a general downside.

**Second Caveat:**
The second and more tricky caveat is composition is still cold.
we rely on the consumer to initialize state composition.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-sate-subscriber-replay-caveat-cold-composition__michael-hladky.png "Caveat Cold Composition")

### Cold Composition
{% stackblitz research-reactive-ephemeral-state file=src/app/examples/problems/cold-composition/some-bad.service.ts %}

Let's quickly clarify hot/cold and uni-case/multi-cast.

First, let's remember what we learned about uni- and multi-casting in the earlier chapter.

**Uni-cast**
The producer is unique per subscription.
Any creation operator is uni-cast. (publish operators are not yet refactored to creation operators, but they would be the only exception)
`interval` for example would call `setInterval` for every subscriber separately.

**Multi-cast**
The producer is shared over all subscriptions.
`Subject` for example emits it's value to multiple subscribers without executing some producer logic again. 

**Cold** 
The internal logic of the observable is executed only on subscription.
The consumer controls the moment when internal logic is executed by the `subscribe` is called.
The `interval` creation operator, for example, will only start it's internal tick if we subscribe to it.
Also, nearly every pipe-able operator will execute only if we have an active subscriber.

An interesting example for a *cold* operator is `share`.
Even if is multi-casts it's notifications to multiple subscribers,
it will not emit any notification until at least one subscriber is present.

So it's cold at the beginning but multi-cast after the first subscriber. :)

**Hot**
The internal logic is executed independently from any consumer.
The `Subject` for example can emit values without any present consumer.

There is also an operator that turn all the above logic into a hot path.
`multicast` and every `publish` operator returns a `ConnectableObservable`. 
If we call `connect` on it we connect to the source an start to execute the logic and all the operators in between `publish` and it's source observable.

--- 

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-hot-cold_unicast-multicast.png "Hot vs Cold, Unicast vs Multicast")

---

With this in mind, we can discuss the problem of cold composition in the case of our **local state**.

As we will have to deal with:
- View Interaction ( button click )
- Global State Changes ( e.g. HTTP update )
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

Some of our sources are cold. This can be solved in tow ways: 
- a) Make all sources replay at least their last value (push workload to all relevant sources)
- b) Make the composition hot as early as possible (push workload to the component related part)

We discuss a) already in the previous section. 
This solution pushed workload to all involved parties, and the initiation will still be controlled by the consumer.

What would be the scenario with b)?

We could think of the earliest possible moment to make the composition hot. 
From the diagram about lifecycle hooks and the different instances in Angular we know that a service, even if locally provided, is instantiated first, before the component.

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
_(used RxJS parts: [scan](https://rxjs.dev/api/operator/scan))_

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

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-sate-subscriber-replay-cold-composition-problem__michael-hladky.png "Cold Composition - Problem")

Even if the source is hot (the subject in the service is defined on instantiation) the composition over `scan` made the stream cold again.
This means the composed values can be received only if there is at least 1 subscriber. 
In our case, the subscriber was the components `async` pipe in the template.

Let's see how we can implement the above in a way we could run hot composition:

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-sate-subscriber-replay-cold-composition-solution__michael-hladky.png "Cold Composition - Solution")

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
_(used RxJS parts: [publishReplay](https://rxjs.dev/api/operator/publishReplay), [Subscription](https://rxjs.dev/api/class/Subscription))_

We kept the component untouched and only applied changes to the service.

We used the `publishReplay` operator to make the
source replay the last emitted value by using `1` as `bufferSize`.

In the service constructor, we called `connect` to make it hot subscribe to the source.

## Subscription-Less Interaction with Component StateManagement
{% stackblitz research-reactive-ephemeral-state file=src/app/examples/problems/declarative-interaction/declarative-interaction-bad.component.ts %}

So far we only had focused on independent peace and didn't pay much attention to their interaction.
Let's analyze the way we interact with components and services so far.

Well, known implementations of sate management like `@ngrx/store` in angular,
which is a global state management library, implemented parts of the consumer-facing API imperatively.
Also, all implementations of REDUX in react did it like that.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-sate-declarative-interaction-setter__michael-hladky.png "Subscription-Less Component - Problem with setter")

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

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-declarative-interaction-breaking-flow__michael-hladky.png "Subscription-Less Component - Breaking the reactive flow")

But how can we go more declarative or even reactive? 
**By providing something compose-able** :)

Like an observable itself. :)

By adding a single line of code we can go **fully declarative** as well as **fully subscription-less**.

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-declarative-interaction-connector__michael-hladky.png "Subscription-Less Component - Connector")

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
_(used RxJS parts: [mergeAll](https://rxjs.dev/api/operator/mergeAll))_

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
2. In `StateService` we added the `mergeAll()` operator to our state computation logic.
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

![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-declarative-interaction-connector-code__michael-hladky.png "Subscription-Less Component - Connect method")

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
            .pipe(mergeAll(), publish()) as ConnectableObservable<any>).connect();
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
_(used RxJS parts: [publish](https://rxjs.dev/api/operator/publish) ))_

Note that the side-effect is now placed in a `tap` operator and the whole observable is handed over.

## Recap Problems

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
![](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/raw/master/images/reactive-local-state-first-draft__michael-hladky.png "Reactive Ephemeral State - First Draft")


# Basic Usage

## Service Design

**State Logic**
```typescript
import {ConnectableObservable, merge, noop, Observable, OperatorFunction, Subject, Subscription, UnaryFunction} from 'rxjs';
import {map, mergeAll, pluck, publishReplay, scan, tap} from 'rxjs/operators';

export function stateful<T>() {
  return (o: Observable<T>): Observable<T> => {
    return o.pipe(
      filter(v => v !== undefined),
      distinctUntilChanged(),
      shareReplay(1)
    );
  };
}

function pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
  if (!fns) {
    return noop as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
  };
}

export class State<T> {
  private subscription = new Subscription();
  private stateObservables = new Subject<Observable<Partial<T>>>();
  private effectSubject = new Subject<any>();
  private stateSlices = new Subject<Partial<T>>();

  private state$ = merge(
    this.stateObservables.pipe(mergeAll()),
    this.stateSlices
  ).pipe(
    scan(this.stateAccumulator, {} as T),
    publishReplay(1)
  );

  constructor() {
    this.init();
  }

  private stateAccumulator(acc: T, command: Partial<T>): T {
    const a = (acc as any) as object;
    const c = (command as any) as object;
    return ({...a, ...c} as T);
  }

  init() {
    this.subscription.add((this.state$ as ConnectableObservable<T>).connect());
    this.subscription.add(
      this.effectSubject.pipe(mergeAll())
        .subscribe()
    );
  }


  setState(s: Partial<T>): void {
    this.stateSlices.next(s);
  }
  
  connectState<A extends keyof T>(str: A, obs: Observable<T[A]>): void;
  connectState<A extends keyof T>(obs: Observable<Partial<T>>): void;
  connectState<A extends keyof T>(strOrObs: any, obs?: any): void {
    if (typeof strOrObs === 'string') {
      this.stateObservables.next(obs.pipe(map(s => ({[strOrObs as A]: s}))) as Observable<T[A]>);
    } else {
      this.stateObservables.next(strOrObs);
    }
  }
  
  select(): Observable<T>;
  // ========================
  select<A = T>(
    op: OperatorFunction<T, A>
  ): Observable<A>;
  select<A = T, B = A>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>
  ): Observable<B>;
  select<A = T, B = A, C = B>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;
  select<A = T, B = A, C = B, D = C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
  ): Observable<D>;
  select<A = T, B = A, C = B, D = C, E = D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
  ): Observable<E>;
  // ================================
  select<K1 extends keyof T>(k1: K1): Observable<T[K1]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1]>(k1: K1, k2: K2): Observable<T[K1][K2]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]>(k1: K1, k2: K2, k3: K3): Observable<T[K1][K2][K3]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]>(k1: K1, k2: K2, k3: K3, k4: K4): Observable<T[K1][K2][K3][K4]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): Observable<T[K1][K2][K3][K4][K5]>;
  select<K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): Observable<T[K1][K2][K3][K4][K5][K6]>;
  // ===========================
  select(...opOrMapFn: any[]): Observable<any> {
    if (!opOrMapFn || opOrMapFn.length === 0) {
      return this.state$
        .pipe(
          stateful()
        );
    } else if (!this.isStringArray(opOrMapFn)) {
      const path = (opOrMapFn as any) as string[];
      return this.state$.pipe(
        pluck(...path),
        stateful()
      );
    } else if (this.isOperateFnArray(opOrMapFn)) {
      const oprs = opOrMapFn as OperatorFunction<T, any>[];
      return this.state$.pipe(
        pipeFromArray(oprs),
        stateful()
      );
    }

    throw new Error('Wrong params passed' + JSON.stringify(opOrMapFn));
  }
  
  holdEffect<S>(observableWithSideEffect: Observable<S>): void;
  holdEffect<S>(obsOrObsWithSideEffect: Observable<S>, sideEffectFn?: (arg: S) => void): void {
    if (sideEffectFn) {
      this.effectSubject.next(obsOrObsWithSideEffect.pipe(tap(sideEffectFn)));
    }
    this.effectSubject.next(obsOrObsWithSideEffect);
  }

  teardown(): void {
    this.subscription.unsubscribe();
  }

  private isOperateFnArray(op: any[]): op is OperatorFunction<T, any>[] {
    return op.every((i: any) => typeof i !== 'string');
  }

  private isStringArray(op: any[]): op is string[] {
    return op.every((i: any) => typeof i !== 'string');
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

Now let's see some basic usage:

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
        <input (input)="input$.next($event)"/>
        {{state$ | async}}
    `
})
export class AnyComponent extends LocalState {
    input$ = new Subject(); 
    
    state$ = this.select(
        withLatestFrom(input$),
        map(([state, _]) => state.slice)
    );    
   
}
```
_(used RxJS parts: [withLatestFrom](https://rxjs.dev/api/operator/withLatestFrom))_

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

This example shows a material design list that is collapsable.
It refreshed data every n seconds of if we click the button.
Also, it displays the fetched items.


*Basic Example - Stateful Component**:
```typescript
@Component({
    selector: 'basic-list',
    template: `
        <mat-expansion-panel
                *ngIf="model$ | async as m"
                (expandedChange)="listExpandedChanges.next($event)"
                [expanded]="m.listExpanded">
            <mat-expansion-panel-header>
                <mat-panel-title>
                    User Name
                </mat-panel-title>
                <mat-panel-description>
                    <span *ngIf="!m.listExpanded">{{m.list.length}} Repositories Updated every: {{m.refreshInterval}}
                        ms</span>
                    <span *ngIf="m.listExpanded">{{m.list.length}}</span>
                </mat-panel-description>
            </mat-expansion-panel-header>

            <button mat-raised-button color="primary"
                    (click)="refreshClicks.next($event)">
                Refresh List
            </button>

            <div *ngIf="m.list.length; else noList">
                <mat-list>
                    <mat-list-item *ngFor="let item of m.list">
                        {{item.name}}
                    </mat-list-item>
                </mat-list>
            </div>

            <ng-template #noList>
                <mat-card>No list given!</mat-card>
            </ng-template>

        </mat-expansion-panel>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoBasicsComponent3 extends LocalState<ComponentState> {
    initComponentState = {
      refreshInterval: 10000,
      listExpanded: false,
      list: []
    };
    refreshClicks = new Subject<Event>();
    listExpandedChanges = new Subject<boolean>();

    model$ = this.select();

    @Input()
    set refreshInterval(refreshInterval: number) {
      this.setState({refreshInterval});
    }

    refreshListSideEffect$ = merge(
        this.refreshClicks,
        this.select(
            map(s => s.refreshInterval),
            tap(console.log),
            switchMap(ms => timer(0, ms))
        )
    )
        .pipe(
            tap(_ => this.store.dispatch(fetchRepositoryList({})))
        );

    constructor(private store: Store<any>) {
        super();
        this.setState(this.initComponentState);
        this.connectState(this.listExpandedChanges
            .pipe(map(b => ({listExpanded: b}))));
        this.holdEffect(this.refreshListSideEffect$);
        this.connectState('list',
            this.store.select(selectRepositoryList).pipe(map(this.parseListItems))
        );
    }

    parseListItems(l: RepositoryListItem[]): DemoBasicsItem[] {
        return l.map(({id, name}) => ({id, name}))
    }

}
```

This shows some fundamental interaction for template global state and ephemeral state. 
The next snippet shows how you would implement architecture patterns based on that service. In this case I picked a simple implementation of the MVVM design pattern.

*Basic Example - Design Pattern MVVM**:

```typescript
export interface DemoBasicsBaseModel {
    refreshInterval: number;
    list: DemoBasicsItem[];
    listExpanded: boolean;
}

export interface DemoBasicsView {
    refreshClicks: Subject<Event>;
    listExpandedChanges: Subject<boolean>
    baseModel$: Observable<DemoBasicsBaseModel>;
}

@Injectable()
export class DemoBasicsViewModelService extends LocalState<DemoBasicsBaseModel> implements DemoBasicsView {
    initState: DemoBasicsBaseModel = {
      refreshInterval: 1000,
      listExpanded: true,
      list: []
    }

    baseModel$ = this.select();

    refreshClicks = new Subject<Event>();
    listExpandedChanges = new Subject<boolean>();

    refreshListSideEffect$ = merge(
        this.refreshClicks,
        this.select(map(s => s.refreshInterval))
            .pipe(switchMap(ms => timer(ms)))
    );

    constructor() {
        super();
        this.setState(this.initState);

        this.connectState(this.listExpandedChanges
            .pipe(map(b => ({listExpanded: b})))
        );
    }

}



@Component({
    selector: 'basic-list',
    template: `
<mat-expansion-panel
        *ngIf="vm.baseModel$ | async as bm"
        (expandedChange)="vm.listExpandedChanges.next($event)"
        [expanded]="bm.listExpanded">
    <mat-expansion-panel-header>
        <mat-panel-title>
            User Name
        </mat-panel-title>
        <mat-panel-description>
                          <span *ngIf="!bm.listExpanded">{{bm.list.length}}
                              Repositories Updated every: {{bm.refreshInterval}}
                              ms</span>
            <span *ngIf="bm.listExpanded">{{bm.list.length}}</span>
        </mat-panel-description>
    </mat-expansion-panel-header>

    <button mat-raised-button color="primary"
            (click)="vm.refreshClicks.next($event)">
        Refresh List
    </button>

    <div *ngIf="bm.list.length; else noList">
        <mat-list>
            <mat-list-item *ngFor="let item of bm.list">
                {{item.name}}
            </mat-list-item>
        </mat-list>
    </div>

    <ng-template #noList>
        <mat-card>No list given!</mat-card>
    </ng-template>

</mat-expansion-panel>
            `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DemoBasicsViewModelService]
})
export class DemoBasicsComponent4 {

    @Input()
    set refreshInterval(refreshInterval: number) {
            this.vm.setState({refreshInterval});
    }

    constructor(public vm: DemoBasicsViewModelService,
                private store: Store<any>) {
        this.vm.connectState('list',
            this.store.select(selectRepositoryList).pipe(map(this.parseListItems))
        );
        this.vm.holdEffect(this.vm.refreshListSideEffect$
            .pipe(tap(_ => this.store.dispatch(fetchRepositoryList())))
        );
    }

    parseListItems(l: RepositoryListItem[]): DemoBasicsItem[] {
        return l.map(({id, name}) => ({id, name}))
    }

}

```

The lase example showed how MVVM in implemented based on the reactive state class. What is interesting here is that the template only accesses the ViewModel, nothing else.

But this is part of another document I would suggest. ;p

# Summary

**How to differ global from the ephemeral state:**
- No horizontal sharing of state
- The lifetime of the state is dynamic, bound to e.g. a component
- It processes local relevant events


If we take a look at our operator reference list at the end of this document we can see it was a lot about: 
- unicast vs. multicast
- hot vs. cold

**The main outcome here was we should ensure that the moment of computation of states is not controlled by the subscriber. 
It should be hot.**

We learned how to can have a fully reactive flow with
- **higher-order operators** like [mergeAll](https://rxjs.dev/api/operators/mergeAll)
The combination with our logic bound to a certain life-time enabled us to create
- **subscription-less components**

An example implementation of our learning can be found in the resources.

Based on that we used in a minimal example and also made the first test with some design patterns like MVVM.

---

**Resources**  
- **Recording** ([🎥 Live Demo at 24:47](https://www.youtube.com/watch?v=I8uaHMs8rw0&t=24m47s)):  

[🎥 Angular Vienna, Angular, and RxJS - Tackling Ephemeral State Reactively](https://www.youtube.com/watch?v=I8uaHMs8rw0)
- **Slides**:  

[🖼️ Tackling Component State Reactively](https://docs.google.com/presentation/d/1MGzffMw9qaP1-lYyzDJ0LfC8zKJWxCktK9MN8xauU0Q/edit?usp=sharing)
- **Repository For Examples** ([💾 Final Example](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/tree/master/src/app/examples/demo-basics)):  

[💾 research-on-reactive-ephemeral-state-in-component-oriented-frontend-frameworks](https://github.com/BioPhoton/research-reactive-ephemeral-state-in-component-oriented-frontend-frameworks/)
- **Sourcecode First-draft**:  

[📦 rxjs-state](https://github.com/BioPhoton/rxjs-state)  

Used RxJS parts: 
- [interval](https://rxjs.dev/api/function/interval)
- [timer](https://rxjs.dev/api/function/timer)
- [tap](https://rxjs.dev/api/operator/tap)
- [map](https://rxjs.dev/api/operator/map)
- [mergeAll](https://rxjs.dev/api/operator/mergeAll)
- [share](https://rxjs.dev/api/operator/share)
- [shareReplay](https://rxjs.dev/api/operator/shareReplay)
- [publish](https://rxjs.dev/api/operator/publish)
- [publishReplay](https://rxjs.dev/api/operator/publishReplay)
- [takeUntil](https://rxjs.dev/api/operator/takeUntil)
- [withLatestFrom](https://rxjs.dev/api/operator/withLatestFrom)
- [Subscription](https://rxjs.dev/api/class/Subscription)
- [Observable](https://rxjs.dev/api/class/Observable)
- [Subject](https://rxjs.dev/api/class/Subject)
- [ReplaySubject](https://rxjs.dev/api/class/ReplaySubject)
