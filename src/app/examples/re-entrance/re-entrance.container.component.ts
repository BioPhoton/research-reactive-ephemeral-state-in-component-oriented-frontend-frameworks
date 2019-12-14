import {Component} from '@angular/core';

@Component({
    selector: 'cold-composition-container',
    template: `
        <h1>Re Entrance Container</h1>
        <re-entrance-bad>
        </re-entrance-bad>
        <re-entrance>
        </re-entrance> 
    `
})
export class ReEntranceContainerComponent {
 }
