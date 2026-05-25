import { useState } from 'react'
import { ChatView } from '@/features/chat/ChatView'
import { useThemeSync } from './useThemeSync'
import { LeftRail } from './LeftRail'
import { RightPanel } from './RightPanel'
import { TopBar } from './TopBar'

export function AppShell() {
  useThemeSync()
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-surface-0 text-ink">
      <TopBar
        rightPanelOpen={rightPanelOpen}
        onToggleRightPanel={() => setRightPanelOpen((v) => !v)}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        <main className="flex-1 overflow-hidden">
          <ChatView />
        </main>
        <RightPanel open={rightPanelOpen} />
      </div>
    </div>
  )
}
