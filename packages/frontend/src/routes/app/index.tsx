import { A, type RouteDefinition } from '@solidjs/router';
import { createResource, lazy, type ParentComponent } from 'solid-js';
import { authClient } from '../../lib/auth-client.ts';
import { UserContext } from './context.ts';
import type { User } from 'better-auth';
import useIsOffline from "../../lib/offline.ts";
import { Calendar } from "../../ui/icons/calendar.tsx";

export const appRoutes: RouteDefinition[] = [
  {
    path: '/schedule',
    component: lazy(() => import('./schedule/schedule.tsx')),
  }
]

export const AppIndex: ParentComponent<{ data: { user?: User } }> = (props) => {
  const [data] = createResource(() => authClient.getSession().then(x => x?.data?.user));
  const offline = useIsOffline();

  return (
    <UserContext.Provider value={data}>
      <div class="flex">
        <div class="hidden md:block border-r border-neutral min-w-52">
          <A class="flex gap-1 items-center justify-center border-b border-neutral p-2" href="/app/schedule">
            <Calendar class="w-3 h-3" />
            Schdeule
          </A>
        </div>
        <div class='flex-1 overflow-x-auto' style={{ height: window.innerHeight + 'px' }}>
          {props.children}
        </div>
      </div>
      <div class="fixed bottom-0 right-0 flex gap-1 items-center bg-base-200 p-1 rounded-selector text-xs">
        <span class="badge h-1 w-1 p-0" classList={{ 'badge-success': !offline(), 'badge-error': offline() }}></span>
        <div>
          {offline() ? 'Offline' : 'Online'}
        </div>
      </div>
    </UserContext.Provider>
  )
}

export default AppIndex;
