import { type ChangeMessage, isChangeMessage, type Operation, type Row } from "@electric-sql/client";
import { createEffect, createSignal } from "solid-js";
import { getShape } from "../lib/electric.ts";
import useIsOffline from "../lib/offline.ts";
import { v4 as id } from 'uuid';
import type { Entity } from "@app/backend";
import { createLocalStorageSignal } from "../lib/storage.ts";

type EntityTypes = 'recipe' | 'schedule';

type LocalWrite<T extends Entity> = {
  operation: Operation
  type: EntityTypes
  value: T
}

export function useListWithWrites<T extends Entity>(tableName: EntityTypes) {
  const offline = useIsOffline();

  const [writes, setWrites] = createLocalStorageSignal<LocalWrite<T>[]>('schedule_writes', []);
  const [data, setData] = createSignal<T[]>([]);

  function doAddWrite(value: T, operation: Operation) {
    setWrites(prev => [
      ...prev,
      {
        id: id(),
        type: tableName,
        value,
        operation
      }
    ]);
  }

  function remove(value: T) {
    doAddWrite(value, 'delete');
  }

  function upsert(value: T) {
    value = {
      ...value,
      last_write_id: id(),
    }

    if (value.id) {
      doAddWrite(value as T, 'update');
    } else {
      doAddWrite({ ...value, created_at: new Date(), id: id() } as T, 'insert')
    }
  }

  const shape = getShape<T>(tableName);

  shape.stream.subscribe(stream => {
    const changes = stream.filter(s => isChangeMessage(s)) as ChangeMessage<Row<T>>[];

    setWrites(writes => writes
      .filter(w => !changes.some(change => w.value.last_write_id === change.value.last_write_id))
    )
  });

  shape.subscribe(s => {
    setData(s.rows as any);
  });

  const state = () =>
    writes().reduce((acc: T[], {value, operation}) => {
      switch (operation) {
        case 'insert':
          return [...acc, value] as T[]
       case 'update':
          return acc.map((v) =>
            v.id === value.id ? { ...v, ...value } : v
          )
        case 'delete':
          return acc.filter(v => v.id !== value.id)
        default:
          return acc
      }
    }, data());

  createEffect(() => {
    if (offline()) {
      return;
    }
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    writes().forEach(write => {
      fetch('/api/write', {
        method: 'POST',
        body: JSON.stringify({ value: write.value, operation: write.operation, table: write.type }),
        headers,
        credentials: 'include'
      }).catch(err => {
        console.error('Could not write', err);
        setWrites(writes => writes.filter(w => w.value.last_write_id !== write.value.last_write_id));
      })
    })
  });

  return { state, remove, upsert };
}
