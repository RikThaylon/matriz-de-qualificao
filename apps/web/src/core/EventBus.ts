type EventCallback<T = any> = (data: T) => void

export interface TelemetryEvent {
  machineId: string
  oee: number
  temperature: number
  vibration: number
  timestamp: number
}

export interface OperatorMoveEvent {
  operatorId: string
  from: [number, number, number]
  to: [number, number, number]
}

export interface AIRecommendationEvent {
  targetMachineId: string
  recommendedOperatorId: string
  score: number
}

export type DigitalTwinEvents = {
  'telemetry:update': TelemetryEvent
  'operator:move': OperatorMoveEvent
  'ai:recommendation': AIRecommendationEvent
  'emergency:stop': void
  'emergency:reset': void
  'heatmap:toggle': 'off' | 'thermal' | 'traffic' | 'stress'
  'replay:stateChange': { isReplaying: boolean; timestamp: number }
}

class EventBus {
  private listeners: Map<keyof DigitalTwinEvents, Set<EventCallback>> = new Map()

  public on<K extends keyof DigitalTwinEvents>(event: K, callback: EventCallback<DigitalTwinEvents[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  public emit<K extends keyof DigitalTwinEvents>(event: K, data?: DigitalTwinEvents[K]): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((cb) => cb(data))
    }
  }

  public clear(): void {
    this.listeners.clear()
  }
}

export const eventBus = new EventBus()
