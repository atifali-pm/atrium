import { TraceDrawer } from '@/features/traces/TraceDrawer'
import { Composer } from './Composer'
import { MessageList } from './MessageList'

export function ChatView() {
  return (
    <div className="flex h-full flex-col bg-surface-0">
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      <TraceDrawer />
      <div className="border-t border-line bg-surface-0">
        <Composer />
      </div>
    </div>
  )
}
