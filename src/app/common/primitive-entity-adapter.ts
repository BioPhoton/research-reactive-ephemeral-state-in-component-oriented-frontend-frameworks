import {isDevMode} from '@angular/core';

export enum DidMutate {
    EntitiesOnly,
    Both,
    None,
}

export function createStateOperator<V, R>(
    mutator: (arg: R, state: EntityState<V>) => DidMutate
): EntityState<V>;
export function createStateOperator<V, R>(
    mutator: (arg: any, state: any) => DidMutate
): any {
    return function operation<S extends EntityState<V>>(arg: R, state: any): S {
        const clonedEntityState: EntityState<V> = {
            ids: [...state.ids],
            entities: { ...state.entities },
        };

        const didMutate = mutator(arg, clonedEntityState);

        if (didMutate === DidMutate.Both) {
            return Object.assign({}, state, clonedEntityState);
        }

        if (didMutate === DidMutate.EntitiesOnly) {
            return {
                ...state,
                entities: clonedEntityState.entities,
            };
        }

        return state;
    };
}
export function selectIdValue<T>(entity: T, selectId: IdSelector<T>) {
    const key = selectId(entity);

    if (isDevMode() && key === undefined) {
        console.warn(
            '@ngrx/entity: The entity passed to the `selectId` implementation returned undefined.',
            'You should probably provide your own `selectId` implementation.',
            'The entity that was passed:',
            entity,
            'The `selectId` implementation:',
            selectId.toString()
        );
    }

    return key;
}
export type ComparerStr<T> = (a: T, b: T) => string;
export type ComparerNum<T> = (a: T, b: T) => number;

export type Comparer<T> = ComparerNum<T> | ComparerStr<T>;

export type IdSelectorStr<T> = (model: T) => string;
export type IdSelectorNum<T> = (model: T) => number;

export type IdSelector<T> = IdSelectorStr<T> | IdSelectorNum<T>;

export interface DictionaryNum<T> {
    [id: number]: T | undefined;
}

export abstract class Dictionary<T> implements DictionaryNum<T> {
    [id: string]: T | undefined;
}

export interface UpdateStr<T> {
    id: string;
    changes: Partial<T>;
}

export interface UpdateNum<T> {
    id: number;
    changes: Partial<T>;
}

export type Update<T> = UpdateStr<T> | UpdateNum<T>;

export type Predicate<T> = (entity: T) => boolean;

export type EntityMap<T> = (entity: T) => T;

export interface EntityState<T> {
    ids: string[] | number[];
    entities: Dictionary<T>;
}

export interface EntityDefinition<T> {
    selectId: IdSelector<T>;
    sortComparer: false | Comparer<T>;
}

export interface EntityStateAdapter<T> {
    addOne<S extends EntityState<T>>(entity: T, state: S): S;
    addMany<S extends EntityState<T>>(entities: T[], state: S): S;
    addAll<S extends EntityState<T>>(entities: T[], state: S): S;

    removeOne<S extends EntityState<T>>(key: string, state: S): S;
    removeOne<S extends EntityState<T>>(key: number, state: S): S;

    removeMany<S extends EntityState<T>>(keys: string[], state: S): S;
    removeMany<S extends EntityState<T>>(keys: number[], state: S): S;
    removeMany<S extends EntityState<T>>(predicate: Predicate<T>, state: S): S;

    removeAll<S extends EntityState<T>>(state: S): S;

    updateOne<S extends EntityState<T>>(update: Update<T>, state: S): S;
    updateMany<S extends EntityState<T>>(updates: Update<T>[], state: S): S;

    upsertOne<S extends EntityState<T>>(entity: T, state: S): S;
    upsertMany<S extends EntityState<T>>(entities: T[], state: S): S;

    map<S extends EntityState<T>>(map: EntityMap<T>, state: S): S;
}

export interface EntitySelectors<T, V> {
    selectIds: (state: V) => string[] | number[];
    selectEntities: (state: V) => Dictionary<T>;
    selectAll: (state: V) => T[];
    selectTotal: (state: V) => number;
}

export interface EntityAdapter<T> extends EntityStateAdapter<T> {
    selectId: IdSelector<T>;
    sortComparer: false | Comparer<T>;
    getInitialState(): EntityState<T>;
    getInitialState<S extends object>(state: S): EntityState<T> & S;
    getSelectors(): EntitySelectors<T, EntityState<T>>;
    getSelectors<V>(
        selectState: (state: V) => EntityState<T>
    ): EntitySelectors<T, V>;
}

export function createUnsortedStateAdapter<T>(
    selectId: IdSelector<T>
): EntityStateAdapter<T>;
export function createUnsortedStateAdapter<T>(selectId: IdSelector<T>): any {
    type R = EntityState<T>;

    function addOneMutably(entity: T, state: R): DidMutate;
    function addOneMutably(entity: any, state: any): DidMutate {
        const key = selectIdValue(entity, selectId);

        if (key in state.entities) {
            return DidMutate.None;
        }

        state.ids.push(key);
        state.entities[key] = entity;

        return DidMutate.Both;
    }

    function addManyMutably(entities: T[], state: R): DidMutate;
    function addManyMutably(entities: any[], state: any): DidMutate {
        let didMutate = false;

        for (const entity of entities) {
            didMutate = addOneMutably(entity, state) !== DidMutate.None || didMutate;
        }

        return didMutate ? DidMutate.Both : DidMutate.None;
    }

    function addAllMutably(entities: T[], state: R): DidMutate;
    function addAllMutably(entities: any[], state: any): DidMutate {
        state.ids = [];
        state.entities = {};

        addManyMutably(entities, state);

        return DidMutate.Both;
    }

    function removeOneMutably(key: T, state: R): DidMutate;
    function removeOneMutably(key: any, state: any): DidMutate {
        return removeManyMutably([key], state);
    }

    function removeManyMutably(keys: T[], state: R): DidMutate;
    function removeManyMutably(predicate: Predicate<T>, state: R): DidMutate;
    function removeManyMutably(
        keysOrPredicate: any[] | Predicate<T>,
        state: any
    ): DidMutate {
        const keys =
            keysOrPredicate instanceof Array
                ? keysOrPredicate
                : state.ids.filter((key: any) => keysOrPredicate(state.entities[key]));

        const didMutate =
            keys
                .filter((key: any) => key in state.entities)
                .map((key: any) => delete state.entities[key]).length > 0;

        if (didMutate) {
            state.ids = state.ids.filter((id: any) => id in state.entities);
        }

        return didMutate ? DidMutate.Both : DidMutate.None;
    }

    function removeAll<S extends R>(state: S): S;
    function removeAll<S extends R>(state: any): S {
        return Object.assign({}, state, {
            ids: [],
            entities: {},
        });
    }

    function takeNewKey(
        keys: { [id: string]: string },
        update: Update<T>,
        state: R
    ): void;
    function takeNewKey(
        keys: { [id: string]: any },
        update: Update<T>,
        state: any
    ): boolean {
        const original = state.entities[update.id];
        const updated: T = Object.assign({}, original, update.changes);
        const newKey = selectIdValue(updated, selectId);
        const hasNewKey = newKey !== update.id;

        if (hasNewKey) {
            keys[update.id] = newKey;
            delete state.entities[update.id];
        }

        state.entities[newKey] = updated;

        return hasNewKey;
    }

    function updateOneMutably(update: Update<T>, state: R): DidMutate;
    function updateOneMutably(update: any, state: any): DidMutate {
        return updateManyMutably([update], state);
    }

    function updateManyMutably(updates: Update<T>[], state: R): DidMutate;
    function updateManyMutably(updates: any[], state: any): DidMutate {
        const newKeys: { [id: string]: string } = {};

        updates = updates.filter(update => update.id in state.entities);

        const didMutateEntities = updates.length > 0;

        if (didMutateEntities) {
            const didMutateIds =
                updates.filter(update => takeNewKey(newKeys, update, state)).length > 0;

            if (didMutateIds) {
                state.ids = state.ids.map((id: any) => newKeys[id] || id);
                return DidMutate.Both;
            } else {
                return DidMutate.EntitiesOnly;
            }
        }

        return DidMutate.None;
    }

    function mapMutably(map: EntityMap<T>, state: R): DidMutate;
    function mapMutably(map: any, state: any): DidMutate {
        const changes: Update<T>[] = state.ids.reduce(
            (changes: any[], id: string | number) => {
                const change = map(state.entities[id]);
                if (change !== state.entities[id]) {
                    changes.push({ id, changes: change });
                }
                return changes;
            },
            []
        );
        const updates = changes.filter(({ id }) => id in state.entities);

        return updateManyMutably(updates, state);
    }

    function upsertOneMutably(entity: T, state: R): DidMutate;
    function upsertOneMutably(entity: any, state: any): DidMutate {
        return upsertManyMutably([entity], state);
    }

    function upsertManyMutably(entities: T[], state: R): DidMutate;
    function upsertManyMutably(entities: any[], state: any): DidMutate {
        const added: any[] = [];
        const updated: any[] = [];

        for (const entity of entities) {
            const id = selectIdValue(entity, selectId);
            if (id in state.entities) {
                updated.push({ id, changes: entity });
            } else {
                added.push(entity);
            }
        }

        const didMutateByUpdated = updateManyMutably(updated, state);
        const didMutateByAdded = addManyMutably(added, state);

        switch (true) {
            case didMutateByAdded === DidMutate.None &&
            didMutateByUpdated === DidMutate.None:
                return DidMutate.None;
            case didMutateByAdded === DidMutate.Both ||
            didMutateByUpdated === DidMutate.Both:
                return DidMutate.Both;
            default:
                return DidMutate.EntitiesOnly;
        }
    }

    return {
        removeAll,
        addOne: createStateOperator(addOneMutably),
        addMany: createStateOperator(addManyMutably),
        addAll: createStateOperator(addAllMutably),
        updateOne: createStateOperator(updateOneMutably),
        updateMany: createStateOperator(updateManyMutably),
        upsertOne: createStateOperator(upsertOneMutably),
        upsertMany: createStateOperator(upsertManyMutably),
        removeOne: createStateOperator(removeOneMutably),
        removeMany: createStateOperator(removeManyMutably),
        map: createStateOperator(mapMutably),
    };
}
