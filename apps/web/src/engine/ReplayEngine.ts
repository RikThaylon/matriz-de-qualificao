export interface TelemetrySnapshot {
  timestamp: number
  machines: { id: string; oee: number; temperature: number; vibration: number; operatorId?: string }[]
  operators: { id: string; position: [number, number, number]; status: string }[]
}

export class ReplayEngine {
  private snapshots: TelemetrySnapshot[] = []
  private isReplaying = false
  private currentIndex = 0
  private playbackSpeed = 1.0

  public recordSnapshot(snapshot: TelemetrySnapshot): void {
    if (this.isReplaying) return
    this.snapshots.push(snapshot)
    if (this.snapshots.length > 500) {
      this.snapshots.shift()
    }
  }

  public startReplay(): void {
    if (this.snapshots.length === 0) return
    this.isReplaying = true
    this.currentIndex = 0
  }

  public stopReplay(): void {
    this.isReplaying = false
  }

  public getIsReplaying(): boolean {
    return this.isReplaying
  }

  public seek(progress: number): TelemetrySnapshot | null {
    if (this.snapshots.length === 0) return null
    const index = Math.floor(progress * (this.snapshots.length - 1))
    this.currentIndex = Math.max(0, Math.min(index, this.snapshots.length - 1))
    return this.snapshots[this.currentIndex]
  }

  public getCurrentSnapshot(): TelemetrySnapshot | null {
    return this.snapshots[this.currentIndex] || null
  }

  public getSnapshotsCount(): number {
    return this.snapshots.length
  }
}

export const replayEngine = new ReplayEngine()
