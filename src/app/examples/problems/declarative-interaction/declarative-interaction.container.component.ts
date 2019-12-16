import {Component} from '@angular/core';

@Component({
    selector: 'declarative-interaction-container',
    template: `
        <declarative-interaction-bad></declarative-interaction-bad>
        <declarative-interaction-good></declarative-interaction-good>
        <declarative-side-effects-good></declarative-side-effects-good>
    `
})
export class DeclarativeInteractionContainerComponent {

}
