import { eventBus } from '../core/EventBus'
import { useDigitalTwinStore } from '../store/digitalTwinStore'

/**
 * NativePlantEngine
 * 
 * Enforces the Standalone System Philosophy:
 * This Digital Twin platform is the Single Source of Truth.
 * It manages all machine states, telemetry cycles, operator allocations, 
 * NR-12 compliance rules, and AI recommendation logic natively without requiring 
 * any external SAP, MES, ERP, or SCADA software.
 */
export class NativePlantEngine {
  private isRunning = false
  private timer: number | null = null

  public startNativeEngine(): void {
    if (this.isRunning) return
    this.isRunning = true

    console.log('[NativePlantEngine] Native Plant Engine Started. Platform operating as Single Source of Truth.')

    // Native High-Frequency Telemetry Generation Loop (60Hz / 2Hz tick cycles)
    this.timer = window.setInterval(() => {
      this.tickTelemetry()
    }, 2000)
  }

  public stopNativeEngine(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.isRunning = false
    console.log('[NativePlantEngine] Native Plant Engine Stopped.')
  }

  private tickTelemetry(): void {
    const store = useDigitalTwinStore.getState()
    if (store.emergencyStopActive) return

    store.machines.forEach((machine) => {
      if (machine.state === 'apto' && machine.operatorId) {
        // Micro thermal & vibration physical fluctuation simulation
        const deltaTemp = (Math.random() - 0.48) * 0.4
        const deltaVib = (Math.random() - 0.5) * 0.05
        const newTemp = parseFloat(Math.min(Math.max(machine.temperature + deltaTemp, 30.0), 75.0).toFixed(1))
        const newVib = parseFloat(Math.min(Math.max(machine.vibration + deltaVib, 0.2), 6.0).toFixed(2))

        store.updateMachineMetrics(machine.id, {
          temperature: newTemp,
          vibration: newVib,
        })

        // Broadcast telemetry event over native internal EventBus
        eventBus.emit('telemetry:update', {
          machineId: machine.id,
          oee: machine.oee,
          temperature: newTemp,
          vibration: newVib,
          timestamp: Date.now(),
        })
      }
    })
  }
}

export const nativePlantEngine = new NativePlantEngine()
