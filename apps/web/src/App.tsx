import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity, AlertTriangle, ArrowLeft, Bot, BrainCircuit, Check, ChevronRight,
  CircleDot, Clock3, Crosshair, Factory, Gauge, LayoutGrid, LockKeyhole,
  Medal, Pencil, Play, Plus, Radio, RotateCcw, ScanLine, ShieldCheck,
  Sparkles, Target, Trophy, Tv, UserCheck, Users, Wifi, X, Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type State = 'apto' | 'atencao' | 'bloqueado' | 'vazio'
type Machine = {
  id: string
  code: string
  name: string
  type: string
  x: number
  y: number
  state: State
  operator?: string
  score?: number
  rotation?: number
}
type Person = {
  id: string
  name: string
  initials: string
  role: string
  shift: string
  color: string
  skills: string[]
  score: Record<string, number>
  expires?: string
}
type Recommendation = {
  personId: string
  name: string
  initials: string
  score: number
  status: 'APTA' | 'ATENCAO' | 'BLOQUEADA'
  reasons: string[]
}

const people: Person[] = [
  { id: 'ana', name: 'Ana Martins', initials: 'AM', role: 'Operadora Plena', shift: 'Turno A', color: '#8df3c8', skills: ['CNC N4', 'Metrologia N3'], score: { cnc: 100, pr: 82, emb: 78 } },
  { id: 'rafa', name: 'Rafael Costa', initials: 'RC', role: 'Operador Sênior', shift: 'Turno A', color: '#ffc75a', skills: ['Prensa N3', 'Segurança N4'], score: { cnc: 64, pr: 88, emb: 72 }, expires: '16 dias' },
  { id: 'bia', name: 'Beatriz Lima', initials: 'BL', role: 'Técnica de Processo', shift: 'Turno B', color: '#70b8ff', skills: ['CNC N3', 'Embalagem N4'], score: { cnc: 82, pr: 76, emb: 100 } },
  { id: 'joao', name: 'João Silva', initials: 'JS', role: 'Operador Júnior', shift: 'Turno A', color: '#ff7c88', skills: ['Embalagem N2'], score: { cnc: 42, pr: 51, emb: 68 } },
]

const initialMachines: Machine[] = [
  { id: 'cnc', code: 'CNC-04', name: 'Centro de usinagem', type: 'Usinagem', x: 13, y: 22, state: 'apto', operator: 'Ana Martins', score: 100 },
  { id: 'pr', code: 'PR-12', name: 'Prensa hidráulica', type: 'Conformação', x: 57, y: 18, state: 'atencao', operator: 'Rafael Costa', score: 88 },
  { id: 'emb', code: 'EMB-02', name: 'Estação de embalagem', type: 'Expedição', x: 38, y: 62, state: 'vazio' },
]

const machineSkills: Record<string, string[]> = {
  cnc: ['Programação CNC', 'Metrologia', 'NR-12'],
  pr: ['Operação de prensa', 'Segurança crítica', 'NR-12'],
  emb: ['Inspeção visual', 'Rastreabilidade', 'Ergonomia'],
}

const stateLabel: Record<State, string> = {
  apto: 'Apta', atencao: 'Atenção', bloqueado: 'Bloqueada', vazio: 'Sem operador',
}

function rankCandidates(machineId: string, candidates: Person[]): Recommendation[] {
  return candidates.map((person) => {
    const score = person.score[machineId] ?? 0
    const criticalFail = machineId === 'pr' && person.id === 'joao'
    const status: Recommendation['status'] = criticalFail || score < 70 ? 'BLOQUEADA' : score === 100 ? 'APTA' : 'ATENCAO'
    const reasons = status === 'APTA'
      ? ['Todos os requisitos atendidos', 'Melhor cobertura sem risco operacional']
      : status === 'ATENCAO'
        ? [`Aderência técnica de ${score}%`, person.expires ? `Certificação vence em ${person.expires}` : 'Requer acompanhamento inicial']
        : [criticalFail ? 'Requisito crítico de segurança ausente' : `Aderência abaixo do limite de 70%`, 'Treinamento necessário antes da alocação']
    return { personId: person.id, name: person.name, initials: person.initials, score, status, reasons }
  }).sort((a, b) => {
    const blocked = Number(a.status === 'BLOQUEADA') - Number(b.status === 'BLOQUEADA')
    return blocked || b.score - a.score
  })
}

function OperatorCard({ person, recommended }: { person: Person; recommended: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: person.id })
  return (
    <motion.button
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined, opacity: isDragging ? .25 : 1 }}
      className={`operator-card ${recommended ? 'recommended' : ''}`}
      {...listeners}
      {...attributes}
      whileHover={{ x: 4 }}
    >
      <span className="avatar" style={{ '--avatar': person.color } as React.CSSProperties}>{person.initials}<i /></span>
      <span className="operator-copy"><strong>{person.name}</strong><small>{person.role}</small><em>{person.skills.join(' · ')}</em></span>
      {recommended ? <span className="ai-pick"><Sparkles size={11} /> IA</span> : <ChevronRight size={16} />}
    </motion.button>
  )
}

function MachineNode({ machine, selected, editing, onSelect }: { machine: Machine; selected: boolean; editing: boolean; onSelect: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: machine.id })
  return (
    <motion.button
      ref={setNodeRef}
      onClick={onSelect}
      className={`machine-node ${machine.state} ${selected ? 'selected' : ''} ${isOver ? 'drag-over' : ''}`}
      style={{ left: `${machine.x}%`, top: `${machine.y}%`, rotate: machine.rotation || 0 }}
      initial={{ opacity: 0, scale: .88 }}
      animate={{ opacity: 1, scale: selected ? 1.04 : 1 }}
    >
      <span className="machine-beacon"><i /><i /><i /></span>
      <span className="machine-head"><b>{machine.code}</b><em>{stateLabel[machine.state]}</em></span>
      <strong>{machine.name}</strong>
      {machine.operator ? (
        <span className="machine-crew"><UserCheck size={14} /><span>{machine.operator}<small>{machine.score}% aderência</small></span></span>
      ) : (
        <span className="machine-empty"><Crosshair size={15} /> Solte uma unidade aqui</span>
      )}
      {editing && <span className="edit-anchor"><RotateCcw size={12} /> mover</span>}
    </motion.button>
  )
}

function Home({ now, onEnter }: { now: string; onEnter: () => void }) {
  return (
    <main className="launch-screen">
      <div className="atmosphere" />
      <header className="launch-nav">
        <div className="wordmark"><span className="mark"><i /><i /><i /></span><div><b>MATRIZ</b><small>COMANDO OPERACIONAL</small></div></div>
        <div className="launch-status"><span><Wifi size={13} /> Rede sincronizada</span><span className="hud-time">{now}</span><button><Tv size={15} /> Modo TV</button></div>
      </header>

      <section className="launch-hero">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
          <p className="kicker"><CircleDot size={13} /> OPERAÇÃO 01 · TURNO A</p>
          <h1>Escalone o time.<br /><span>Domine a linha.</span></h1>
          <p>Transforme qualificações em decisões rápidas. Cada máquina é uma missão; cada operador, uma vantagem operacional.</p>
        </motion.div>
        <motion.div className="mission-score" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .2 }}>
          <span className="score-ring"><b>67</b><small>COBERTURA</small></span>
          <div><small>META DO TURNO</small><strong>Alcançar cobertura total</strong><span><i style={{ width: '67%' }} /></span><em>2 de 3 postos cobertos</em></div>
        </motion.div>
      </section>

      <section className="sector-select">
        <div className="select-title"><span>SELECIONE A MISSÃO</span><small>1 SETOR OPERACIONAL</small></div>
        <motion.button className="sector-mission" onClick={onEnter} whileHover={{ y: -7 }} whileTap={{ scale: .99 }}>
          <div className="mission-map">
            <span className="radar"><i /><i /><i /></span>
            <span className="map-unit u1">CNC-04</span><span className="map-unit u2 warn">PR-12</span><span className="map-unit u3 empty">EMB-02</span>
            <svg viewBox="0 0 500 260"><path d="M20 202 H166 V78 H340 V165 H480" /><circle cx="166" cy="78" r="4" /><circle cx="340" cy="165" r="4" /></svg>
          </div>
          <div className="mission-copy">
            <span className="mission-number">MISSÃO 01 <em>EM CURSO</em></span>
            <h2>Usinagem &<br />Conformação</h2>
            <p>Uma estação aguarda cobertura. O motor Órbita já encontrou a melhor combinação.</p>
            <div className="mission-facts"><span><b>03</b> máquinas</span><span><b>04</b> operadores</span><span className="warning"><b>01</b> risco</span></div>
            <span className="launch-button"><Play size={16} fill="currentColor" /> ENTRAR NO SETOR</span>
          </div>
        </motion.button>
        <div className="locked-mission"><LockKeyhole size={18} /><span>SETOR 02<strong>Montagem final</strong></span><em>AGUARDANDO CONFIGURAÇÃO</em></div>
        <div className="locked-mission"><LockKeyhole size={18} /><span>SETOR 03<strong>Expedição</strong></span><em>AGUARDANDO CONFIGURAÇÃO</em></div>
      </section>
    </main>
  )
}

function AiPanel({ machine, ranking, loading, onAllocate }: { machine: Machine; ranking: Recommendation[]; loading: boolean; onAllocate: (id: string) => void }) {
  const best = ranking.find((item) => item.status !== 'BLOQUEADA')
  return (
    <div className="ai-panel">
      <div className="ai-title"><span><BrainCircuit size={17} /> ÓRBITA <i>IA</i></span><em>{loading ? 'ANALISANDO' : 'PRONTA'}</em></div>
      {machine.operator ? (
        <div className="ai-stable"><ShieldCheck size={28} /><strong>Posto estabilizado</strong><p>A alocação atual atende à regra de segurança com {machine.score}% de aderência.</p></div>
      ) : best ? (
        <>
          <div className="ai-question"><small>MELHOR RESPOSTA PARA</small><strong>{machine.code} · {machine.name}</strong></div>
          <div className="best-candidate">
            <span className="best-rank"><Trophy size={15} /> #1</span>
            <span className="avatar large">{best.initials}</span>
            <div><small>RECOMENDAÇÃO PRINCIPAL</small><strong>{best.name}</strong><em>{best.status === 'APTA' ? 'Compatibilidade total' : 'Apto com atenção'}</em></div>
            <span className="score-chip"><b>{best.score}</b><small>%</small></span>
          </div>
          <ul className="ai-reasons">{best.reasons.map((reason) => <li key={reason}><Check size={13} />{reason}</li>)}</ul>
          <button className="deploy-best" onClick={() => onAllocate(best.personId)}><Zap size={16} fill="currentColor" /> ALOCAR RECOMENDADA</button>
          <div className="ranking-title"><span>RANKING DE ALTERNATIVAS</span><small>ADERÊNCIA</small></div>
          <div className="candidate-ranking">{ranking.slice(1, 4).map((item, index) => <div className={item.status.toLowerCase()} key={item.personId}><span>{index + 2}</span><b>{item.initials}</b><strong>{item.name}</strong><em>{item.score}%</em></div>)}</div>
        </>
      ) : (
        <div className="ai-none"><AlertTriangle size={26} /><strong>Nenhuma pessoa apta</strong><p>O motor recomenda treinamento antes de liberar este posto.</p></div>
      )}
      <div className="ai-foot"><ScanLine size={13} /> decisão explicável · requisitos + validade + disponibilidade</div>
    </div>
  )
}

function Insights({ onBack }: { onBack: () => void }) {
  return (
    <section className="insights-screen">
      <div className="insights-lead"><div><p className="kicker"><Sparkles size={13} /> INTELIGÊNCIA DO TURNO</p><h1>Centro de<br /><span>decisões</span></h1><p>Riscos convertidos em ações operacionais claras.</p></div><button onClick={onBack}><ArrowLeft size={16} /> VOLTAR AO MAPA</button></div>
      <div className="insight-scoreboard">
        <article><span><Target size={19} /></span><b>67%</b><small>COBERTURA SEGURA</small><em>meta 100%</em></article>
        <article className="warn"><span><AlertTriangle size={19} /></span><b>01</b><small>POSTO EM RISCO</small><em>ação imediata</em></article>
        <article><span><Medal size={19} /></span><b>02</b><small>PESSOAS-CHAVE</small><em>dependência alta</em></article>
        <article className="warn"><span><Clock3 size={19} /></span><b>16d</b><small>PRÓXIMA VALIDADE</small><em>NR-12 · Rafael</em></article>
      </div>
      <div className="intel-grid">
        <article className="intel-card priority"><span>PRIORIDADE 01</span><h2>Treine Beatriz na PR-12</h2><p>Eleva a cobertura do turno e elimina a dependência de uma única pessoa na prensa.</p><div><b>+24%</b><small>RESILIÊNCIA ESTIMADA</small></div><button>ABRIR PLANO <ChevronRight size={15} /></button></article>
        <article className="intel-card"><span>RISCO DE AUSÊNCIA</span><h2>Rafael é pessoa-chave</h2><p>A ausência dele deixa a prensa sem cobertura plenamente qualificada no Turno A.</p><button>VER SIMULAÇÃO <ChevronRight size={15} /></button></article>
        <article className="intel-card"><span>VALIDADE CRÍTICA</span><h2>NR-12 vence em 16 dias</h2><p>Agende a renovação antes do próximo ciclo para evitar bloqueio automático.</p><button>PROGRAMAR AÇÃO <ChevronRight size={15} /></button></article>
      </div>
      <div className="skill-matrix"><div><span>MATRIZ DE POLIVALÊNCIA</span><h2>Cobertura por unidade</h2></div><div className="matrix-grid"><small></small><small>CNC-04</small><small>PR-12</small><small>EMB-02</small><b>ANA</b><i className="full">100</i><i>82</i><i>78</i><b>BEATRIZ</b><i>82</i><i>76</i><i className="full">100</i><b>JOÃO</b><i className="low">42</i><i className="low">51</i><i className="low">68</i></div></div>
    </section>
  )
}

function App() {
  const [screen, setScreen] = useState<'home' | 'sector'>('home')
  const [tab, setTab] = useState<'map' | 'insights'>('map')
  const [mode, setMode] = useState<'operate' | 'edit' | 'tv'>('operate')
  const [machines, setMachines] = useState<Machine[]>(initialMachines)
  const [selectedId, setSelectedId] = useState('emb')
  const [notice, setNotice] = useState<{ state: State; title: string; text: string } | null>(null)
  const [now, setNow] = useState('14:32:08')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date().toLocaleTimeString('pt-BR')), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const selectedMachine = machines.find((machine) => machine.id === selectedId) ?? machines[0]
  const available = useMemo(() => people.filter((person) => !machines.some((machine) => machine.operator === person.name)), [machines])
  const localRanking = useMemo(() => rankCandidates(selectedMachine.id, available), [selectedMachine.id, available])
  const apiUrl = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  const remoteRecommendation = useQuery<{ recommendations: Recommendation[] }>({
    queryKey: ['recommendation', selectedMachine.id, available.map((person) => person.id).join(',')],
    enabled: Boolean(apiUrl && !selectedMachine.operator),
    retry: 1,
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/v1/recommendations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId: selectedMachine.id, candidateIds: available.map((person) => person.id) }),
      })
      if (!response.ok) throw new Error('Recommendation service unavailable')
      return response.json()
    },
  })
  const ranking = remoteRecommendation.data?.recommendations ?? localRanking
  const bestId = ranking.find((item) => item.status !== 'BLOQUEADA')?.personId
  const coverage = useMemo(() => ({
    apt: machines.filter((machine) => machine.state === 'apto').length,
    attention: machines.filter((machine) => machine.state === 'atencao').length,
    empty: machines.filter((machine) => machine.state === 'vazio').length,
  }), [machines])

  function allocatePerson(personId: string, machineId: string) {
    const person = people.find((item) => item.id === personId)
    const machine = machines.find((item) => item.id === machineId)
    if (!person || !machine || machine.operator) return
    const result = rankCandidates(machineId, [person])[0]
    if (result.status === 'BLOQUEADA') {
      setNotice({ state: 'bloqueado', title: 'MOVIMENTO BLOQUEADO', text: result.reasons[0] })
      setMachines((current) => current.map((item) => item.id === machineId ? { ...item, state: 'bloqueado' } : item))
      window.setTimeout(() => setMachines((current) => current.map((item) => item.id === machineId && !item.operator ? { ...item, state: 'vazio' } : item)), 900)
      return
    }
    const state: State = result.status === 'APTA' ? 'apto' : 'atencao'
    setMachines((current) => current.map((item) => item.id === machineId ? { ...item, operator: person.name, score: result.score, state } : item))
    setSelectedId(machineId)
    setNotice({ state, title: state === 'apto' ? 'MISSÃO CUMPRIDA' : 'ALOCAÇÃO COM ATENÇÃO', text: `${person.name} assumiu ${machine.code} com ${result.score}% de aderência.` })
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.over && mode === 'operate') allocatePerson(String(event.active.id), String(event.over.id))
  }

  function releaseOperator() {
    setMachines((current) => current.map((machine) => machine.id === selectedId ? { ...machine, operator: undefined, score: undefined, state: 'vazio' } : machine))
  }

  function addMachine() {
    const machine: Machine = { id: `custom-${Date.now()}`, code: `MQ-${machines.length + 1}`, name: 'Nova unidade', type: 'Genérica', x: 68, y: 66, state: 'vazio' }
    setMachines((current) => [...current, machine])
    setSelectedId(machine.id)
  }

  if (screen === 'home') return <Home now={now} onEnter={() => setScreen('sector')} />

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <main className={`sector-screen ${mode === 'tv' ? 'tv-mode' : ''}`}>
        <header className="sector-hud">
          <button className="hud-back" onClick={() => setScreen('home')}><ArrowLeft size={17} /><span>MISSÕES</span></button>
          <div className="hud-sector"><span className="sector-code">S01</span><div><small>SETOR ATIVO</small><strong>Usinagem & Conformação</strong></div></div>
          <div className="hud-health"><span className="online"><i /> SINCRONIZADO</span><span>{now}</span><button className={tab === 'insights' ? 'active' : ''} onClick={() => setTab(tab === 'map' ? 'insights' : 'map')}><Sparkles size={15} /> INSIGHTS</button><button onClick={() => setMode(mode === 'tv' ? 'operate' : 'tv')}><Tv size={15} /> TV</button></div>
        </header>

        {tab === 'insights' ? <Insights onBack={() => setTab('map')} /> : (
          <>
            <div className="mission-bar">
              <div className="mission-objective"><Target size={16} /><span><small>OBJETIVO ATUAL</small><strong>Cobrir todos os postos sem violar requisitos críticos</strong></span></div>
              <div className="mission-progress"><span><i style={{ width: `${((coverage.apt + coverage.attention) / machines.length) * 100}%` }} /></span><b>{coverage.apt + coverage.attention}/{machines.length}</b></div>
              <div className="hud-stats"><span className="good"><i />{coverage.apt} APTA</span><span className="warn"><i />{coverage.attention} ATENÇÃO</span><span className="danger"><i />{coverage.empty} DESCOBERTA</span></div>
              <div className="mode-tabs"><button className={mode === 'operate' ? 'active' : ''} onClick={() => setMode('operate')}><Activity size={14} /> OPERAR</button><button className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}><Pencil size={14} /> EDITAR</button></div>
            </div>

            <div className="game-layout">
              <aside className="roster-panel">
                <div className="panel-heading"><span><Users size={15} /> ESQUADRÃO</span><b>{available.length}</b></div>
                <h2>Unidades disponíveis</h2><p>Arraste uma unidade até o posto.</p>
                <div className="roster-list">{available.map((person) => <OperatorCard person={person} recommended={person.id === bestId && !selectedMachine.operator} key={person.id} />)}</div>
                <div className="shift-card"><Clock3 size={16} /><span><small>PRÓXIMA ROTAÇÃO</small><strong>01h 28min</strong></span></div>
              </aside>

              <section className={`tactical-map ${mode === 'edit' ? 'editing' : ''}`}>
                <div className="map-topline"><span><LayoutGrid size={14} /> MAPA TÁTICO · LINHA A</span><span>NÍVEL 01 / ESCALA 1:120</span></div>
                <div className="scan-beam" />
                <svg className="floor-paths" viewBox="0 0 1000 700" preserveAspectRatio="none"><path className="walls" d="M40 70 H950 V635 H40 Z M260 70 V245 M720 70 V270 M40 510 H210 M800 510 H950"/><path className="flow" d="M70 565 H250 V370 H520 V165 H915"/></svg>
                <span className="map-zone zone-stock">01 · ESTOQUE</span><span className="map-zone zone-inspect">02 · INSPEÇÃO</span><span className="map-zone zone-exit">03 · SAÍDA</span>
                {machines.map((machine) => <MachineNode key={machine.id} machine={machine} selected={machine.id === selectedId} editing={mode === 'edit'} onSelect={() => setSelectedId(machine.id)} />)}
                {coverage.empty > 0 && <div className="map-mission-alert"><Bot size={17} /><span><small>ÓRBITA DETECTOU UMA LACUNA</small><strong>Selecione a máquina vazia para ver a melhor formação.</strong></span></div>}
                {mode === 'edit' && <button className="new-unit" onClick={addMachine}><Plus size={16} /> ADICIONAR UNIDADE</button>}
              </section>

              <aside className="intel-panel">
                <div className="machine-focus"><div className="focus-head"><span>UNIDADE SELECIONADA</span><em className={selectedMachine.state}>{stateLabel[selectedMachine.state]}</em></div><h2>{selectedMachine.code}</h2><h3>{selectedMachine.name}</h3><small>{selectedMachine.type} · Linha A</small></div>
                {selectedMachine.operator ? (
                  <div className="current-operator"><span className="avatar large">{selectedMachine.operator.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><small>EM OPERAÇÃO</small><strong>{selectedMachine.operator}</strong><em>{selectedMachine.score}% de aderência</em></div><button onClick={releaseOperator} aria-label="Liberar operador"><X size={15} /></button></div>
                ) : <div className="vacant-slot"><Crosshair size={18} /><span><strong>Posto aguardando unidade</strong><small>O motor já avaliou o esquadrão.</small></span></div>}
                <AiPanel machine={selectedMachine} ranking={ranking} loading={remoteRecommendation.isFetching} onAllocate={(id) => allocatePerson(id, selectedMachine.id)} />
                <div className="requirements"><div className="requirements-title"><span>REQUISITOS DA MISSÃO</span><b>{machineSkills[selectedMachine.id]?.length ?? 0}</b></div>{(machineSkills[selectedMachine.id] ?? ['Requisitos a configurar']).map((skill, index) => <div key={skill}><span><Check size={12} /></span><strong>{skill}</strong><em>{index === 1 && selectedMachine.state === 'atencao' ? 'PARCIAL' : 'OBRIGATÓRIO'}</em></div>)}</div>
              </aside>
            </div>
          </>
        )}

        <AnimatePresence>{notice && <motion.div className={`game-toast ${notice.state}`} initial={{ opacity: 0, y: 30, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}><span>{notice.state === 'apto' ? <Trophy size={21} /> : notice.state === 'atencao' ? <AlertTriangle size={21} /> : <X size={21} />}</span><div><strong>{notice.title}</strong><p>{notice.text}</p></div><button onClick={() => setNotice(null)}><X size={16} /></button></motion.div>}</AnimatePresence>
      </main>
    </DndContext>
  )
}

export default App
