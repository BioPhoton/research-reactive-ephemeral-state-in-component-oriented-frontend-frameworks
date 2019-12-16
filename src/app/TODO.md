# Example to implement:

 ## Todo List :)
 This example tests the different implementations of several real live requirements.
 Of course in a very simple use case, but still lots of different challenges combined.
 When i use global store it is equal to ANY global state management. i.e. @ngrx/store.
 
 Implement a todo list with following behaviour:
 
 1. The todo list is a **derivation of** the todo list table from the **global store**, 
  and the todo list item table also global store. Structure looks like this:
```typescript
interface TodoList {
    id: string;
    listName: string
}
interface TodoItem {
    id: string;
    itemName: string
    done: boolean;
}
``` 
The component should present a table looks like that:
```typescript
interface DenormalizedTodoListEntity {
    tlId: string;
    listName: string;
    tiId: string;
    itemName: string;
}
```
2. As long as the component lives we **automatically refresh** every [n] seconds the list of todo lists as well as todo items. 
[n] is retrieved from the parent component over an **input binding**.
3. The presented table should provide a checkbox for every item that marks it for deletion. The interesting thing here, this **state exists only locally** in the component.
**Only if the user does another interaction** (button click in step 4) we persist the new state of the todo list.
4. If **at least one checkbox is clicked, the user can click** the delete button.
 If the button is clicked we need to **persist those changes to the server**.
5. There are random situations where the **server** does not process the deletion of items and **responds with an error**.
 The **error should be mapped to a human readable message** and **displayed for 8 seconds** in the component
6. If the deletion was **successful we want to display a success message** defined by the component
**displayed for 8 seconds** to the user, then we want to hide it again.
7. Switching from and to this above component should **restore the denormalized todo list**.
All **other state should die with the component** destruction.  
