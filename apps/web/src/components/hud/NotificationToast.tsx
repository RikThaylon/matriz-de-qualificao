import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react'

interface Toast {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success'
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([
    {
      id: '1',
      title: 'TELEMETRIA 3D CONECTADA',
      message: 'Canal WebSocket ativo com taxa de atualização de 60Hz.',
      type: 'info',
    },
  ])

  useEffect(() => {
    // Simulate real-time industrial events periodically
    const timer = setInterval(() => {
      const events: Toast[] = [
        {
          id: Date.now().toString(),
          title: 'NR-12 REGULAGEM',
          message: 'Verificação de barreira laser concluída no setor CNC-04.',
          type: 'success',
        },
        {
          id: (Date.now() + 1).toString(),
          title: 'ALERTA DE TEMPERATURA',
          message: 'Prensa PR-12 operando em 58°C (Limite nominal 65°C).',
          type: 'warning',
        },
      ]
      const nextToast = events[Math.floor(Math.random() * events.length)]
      setToasts((prev) => [nextToast, ...prev.slice(0, 2)])
    }, 15000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute top-20 left-4 z-20 space-y-2 pointer-events-auto max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 bg-[#0A0F17]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-3 shadow-xl"
        >
          {toast.type === 'info' && <Activity size={16} className="text-[#00F3FF] mt-0.5" />}
          {toast.type === 'warning' && <AlertTriangle size={16} className="text-[#FFB800] mt-0.5" />}
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-[#00FF9D] mt-0.5" />}
          <div>
            <div className="font-mono text-xs font-bold text-slate-100">{toast.title}</div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
