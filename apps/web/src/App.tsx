import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, AlertTriangle, ArrowLeft, Check, ChevronRight, CircleAlert, Clock3, Gauge, LayoutGrid, Maximize2, Minus, MoveUpRight, Pencil, Plus, Radio, Settings2, ShieldAlert, Sparkles, Tv, Users, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type State = 'apto' | 'atencao' | 'bloqueado' | 'vazio'
type Machine = { id: string; code: string; name: string; type: string; x: number; y: number; state: State; operator?: string; score?: number; critical?: string; rotation?: number }
type Person = { id: string; name: string; initials: string; role: string; shift: string; color: string; skills: string[]; score: Record<string, number>; expires?: string }

const people: Person[] = [
  { id: 'ana', name: 'Ana Martins', initials: 'AM', role: 'Operadora Plena', shift: 'TURNO A', color: '#5ee0b5', skills: ['CNC • Nível 4', 'Metrologia • Nível 3'], score: { cnc: 100, pr: 88, emb: 78 } },
  { id: 'rafa', name: 'Rafael Costa', initials: 'RC', role: 'Operador', shift: 'TURNO A', color: '#ffcb66', skills: ['Prensa • Nível 3', 'Segurança • Nível 4'], score: { cnc: 64, pr: 100, emb: 72 }, expires: '16 dias' },
  { id: 'bia', name: 'Beatriz Lima', initials: 'BL', role: 'Técnica de Processo', shift: 'TURNO B', color: '#8bb8ff', skills: ['CNC • Nível 3', 'Embalagem • Nível 4'], score: { cnc: 82, pr: 76, emb: 100 } },
  { id: 'joao', name: 'João Silva', initials: 'JS', role: 'Operador Júnior', shift: 'TURNO A', color: '#f0808b', skills: ['Embalagem • Nível 2'], score: { cnc: 42, pr: 51, emb: 68 } }
]
const initialMachines: Machine[] = [
  { id: 'cnc', code: 'CNC-04', name: 'Centro de usinagem', type: 'Usinagem', x: 18, y: 24, state: 'apto', operator: 'Ana Martins', score: 100 },
  { id: 'pr', code: 'PR-12', name: 'Prensa hidráulica', type: 'Conformação', x: 54, y: 19, state: 'atencao', operator: 'Rafael Costa', score: 88 },
  { id: 'emb', code: 'EMB-02', name: 'Estação de embalagem', type: 'Expedição', x: 37, y: 61, state: 'vazio' }
]

const stateCopy: Record<State, { label: string; icon: string }> = { apto: { label: 'OPERAÇÃO APTA', icon: '✓' }, atencao: { label: 'ATENÇÃO', icon: '!' }, bloqueado: { label: 'BLOQUEADO', icon: '×' }, vazio: { label: 'SEM COBERTURA', icon: '—' } }

function Operator({ person, selected, onClick }: { person: Person; selected?: boolean; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: person.id })
  const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, opacity: isDragging ? .35 : 1 }
  return <button ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={onClick} className={`operator ${selected ? 'selected' : ''}`}>
    <span className="avatar" style={{ '--avatar': person.color } as React.CSSProperties}>{person.initials}<i /></span>
    <span className="operator-info"><b>{person.name}</b><small>{person.role}</small></span><ChevronRight size={16} className="op-chevron" />
  </button>
}

function MachineNode({ machine, selected, edit, onClick }: { machine: Machine; selected: boolean; edit: boolean; onClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: machine.id })
  return <button ref={setNodeRef} onClick={onClick} className={`machine ${machine.state} ${selected ? 'active' : ''} ${isOver ? 'drag-over' : ''}`} style={{ left: `${machine.x}%`, top: `${machine.y}%`, transform: `rotate(${machine.rotation || 0}deg)` }}>
    <span className="machine-top"><span className="machine-code">{machine.code}</span><span className="state-dot">{stateCopy[machine.state].icon}</span></span>
    <span className="machine-name">{machine.name}</span>
    <span className="machine-status">{machine.operator ? <><span className="operator-mini">{machine.operator.split(' ').map(x => x[0]).join('').slice(0, 2)}</span>{machine.operator.split(' ')[0]} · {machine.score}%</> : 'Arraste um operador aqui'}</span>
    {edit && <span className="resize-handle">↗</span>}
  </button>
}

function SectorCard({ onOpen }: { onOpen: () => void }) {
  return <motion.button className="sector-card" onClick={onOpen} whileHover={{ y: -6 }} whileTap={{ scale: .985 }}>
    <div className="sector-line"><span className="pulse" /> AO VIVO <span>ATUALIZADO AGORA</span></div>
    <div className="sector-card-head"><span className="sector-index">01</span><ArrowLeft size={20} className="turn" /><span className="sector-state">ESTÁVEL</span></div>
    <h2>Usinagem<br /><em>e Conformação</em></h2>
    <div className="mini-map"><i className="mini-room r1" /><i className="mini-machine m1" /><i className="mini-machine m2" /><i className="mini-machine m3" /></div>
    <div className="sector-metrics"><span><b>2/3</b> cobertas</span><span><b className="amber">1</b> atenção</span><span><b>04</b> disponíveis</span></div>
    <div className="open-sector">ABRIR SETOR <ChevronRight size={18} /></div>
  </motion.button>
}

function App() {
  const [screen, setScreen] = useState<'home' | 'floor'>('home')
  const [machines, setMachines] = useState<Machine[]>(initialMachines)
  const [selected, setSelected] = useState('cnc')
  const [mode, setMode] = useState<'op' | 'edit' | 'tv'>('op')
  const [tab, setTab] = useState<'floor' | 'insights'>('floor')
  const [notice, setNotice] = useState<{ status: State; title: string; text: string } | null>(null)
  const [now, setNow] = useState('14:32:08')
  useEffect(() => { const id = window.setInterval(() => setNow(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000); return () => clearInterval(id) }, [])
  const selectedMachine = machines.find(m => m.id === selected) || machines[0]
  const available = people.filter(p => !machines.some(m => m.operator === p.name))
  const coverage = useMemo(() => ({ apt: machines.filter(x => x.state === 'apto').length, att: machines.filter(x => x.state === 'atencao').length, empty: machines.filter(x => x.state === 'vazio').length }), [machines])

  function allocate(event: DragEndEvent) {
    if (!event.over || mode !== 'op') return
    const p = people.find(x => x.id === event.active.id); const m = machines.find(x => x.id === event.over?.id)
    if (!p || !m) return
    const score = p.score[m.id] ?? 0
    const criticalFail = m.id === 'pr' && p.id === 'joao'
    if (score < 70 || criticalFail) { setNotice({ status: 'bloqueado', title: 'ALOCação BLOQUEADA', text: criticalFail ? 'Falta habilitação crítica em Segurança de Prensa.' : `Aderência de ${score}% — treinamento insuficiente para esta máquina.` }); return }
    const state: State = score === 100 ? 'apto' : 'atencao'
    setMachines(prev => prev.map(x => x.id === m.id ? { ...x, operator: p.name, score, state } : x))
    setSelected(m.id)
    setNotice({ status: state, title: state === 'apto' ? 'ALOCação APROVADA' : 'ALOCação COM ATENÇÃO', text: state === 'apto' ? `${p.name} está plenamente qualificada para operar.` : `${p.name} pode operar. Certificação complementar vence em breve.` })
  }
  function addMachine() { const n = machines.length + 1; const item: Machine = { id: `new-${Date.now()}`, code: `MQ-${String(n).padStart(2, '0')}`, name: 'Nova máquina', type: 'Genérica', x: 68, y: 66, state: 'vazio' }; setMachines([...machines, item]); setSelected(item.id) }

  if (screen === 'home') return <main className="home"><header className="brand"><div className="brand-mark"><span /><span /><span /></div><div><b>MATRIZ</b><small>QUALIFICAÇÃO OPERACIONAL</small></div><span className="pilot">PILOTO INDUSTRIAL</span></header><section className="home-hero"><div><p className="eyebrow"><Radio size={13} /> SISTEMA ONLINE · 3 SETORES</p><h1>Quem está pronto<br />para fazer <em>acontecer?</em></h1><p className="home-sub">Alocação visual, qualificação em tempo real<br />e decisões seguras no chão de fábrica.</p></div><div className="home-clock"><span>{now}</span><small>TERÇA · 04 AGO 2026</small></div></section><section className="sector-grid"><SectorCard onOpen={() => setScreen('floor')} /><motion.div className="future-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }}><span>02</span><h3>Montagem final</h3><p>Configurar setor</p><Plus size={22} /></motion.div><motion.div className="future-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}><span>03</span><h3>Expedição</h3><p>Configurar setor</p><Plus size={22} /></motion.div></section><footer><span><i className="pulse" /> SINCRONIZADO VIA REDE LOCAL</span><span>VERSÃO PILOTO 0.1</span></footer></main>

  return <DndContext onDragEnd={allocate}><main className={`floor ${mode === 'tv' ? 'tv-mode' : ''}`}><header className="topbar"><button className="back" onClick={() => setScreen('home')}><ArrowLeft size={18} /> TODOS OS SETORES</button><div className="floor-title"><span className="sector-chip">SETOR 01</span><b>Usinagem e Conformação</b><span className="live"><i className="pulse" /> AO VIVO</span></div><div className="top-actions"><span className="time">{now}</span><button onClick={() => setTab(tab === 'floor' ? 'insights' : 'floor')} className={tab === 'insights' ? 'nav-active' : ''}><Sparkles size={17} /> INSIGHTS</button><button onClick={() => setMode(mode === 'tv' ? 'op' : 'tv')}><Tv size={17} /> TV</button></div></header>
  <div className="commandbar"><div className="mode-switch"><button className={mode === 'op' ? 'chosen' : ''} onClick={() => setMode('op')}><Activity size={15} /> OPERAÇÃO</button><button className={mode === 'edit' ? 'chosen' : ''} onClick={() => setMode('edit')}><Pencil size={14} /> EDITAR LAYOUT</button></div><div className="coverage"><span><i className="green" /> {coverage.apt} APTA</span><span><i className="yellow" /> {coverage.att} ATENÇÃO</span><span><i className="red" /> {coverage.empty} DESCOBERTA</span></div>{mode === 'edit' && <button onClick={addMachine} className="add-machine"><Plus size={17} /> NOVA MÁQUINA</button>}</div>
  {tab === 'insights' ? <Insights onClose={() => setTab('floor')} /> : <div className="work-area"><aside className="lobby"><div className="panel-label"><Users size={15} /> LOBBY <span>{available.length}</span></div><h3>Disponíveis agora</h3><p className="panel-sub">Arraste para uma máquina</p><div className="operator-list">{available.map(p => <Operator key={p.id} person={p} selected={false} />)}{available.length === 0 && <div className="empty-lobby">Todos os operadores estão alocados.</div>}</div><div className="lobby-foot"><Clock3 size={14} /> PRÓXIMO TURNO EM 01:28</div></aside>
  <section className={`map ${mode === 'edit' ? 'layout-edit' : ''}`}><div className="map-label">LINHA DE PRODUÇÃO A <span>·</span> ESCALA 1:120</div><svg className="map-routes" viewBox="0 0 1000 700" preserveAspectRatio="none"><path d="M0 116 H1000 M0 560 H1000 M174 0 V700 M720 0 V700" /><path className="route" d="M42 525 H309 V364 H640 V176 H960" /></svg><span className="zone z1">ESTOQUE</span><span className="zone z2">INSPEÇÃO</span><span className="zone z3">EXPEDIÇÃO</span>{machines.map(m => <MachineNode key={m.id} machine={m} selected={selected === m.id} edit={mode === 'edit'} onClick={() => setSelected(m.id)} />)}<div className="map-scale"><span>0</span><i /><span>5 m</span></div>{mode === 'edit' && <div className="edit-tip"><MoveUpRight size={17} /><span><b>MODO DE EDIÇÃO</b> · clique numa máquina para configurar</span></div>}</section>
  <aside className="details"><div className="panel-label"><Settings2 size={15} /> PAINEL DA MÁQUINA</div><div className={`detail-state ${selectedMachine.state}`}><span>{stateCopy[selectedMachine.state].icon}</span><div><small>ESTADO ATUAL</small><b>{stateCopy[selectedMachine.state].label}</b></div></div><h2>{selectedMachine.name}</h2><p className="machine-id">{selectedMachine.code} · {selectedMachine.type}</p>{selectedMachine.operator ? <div className="assigned"><span className="avatar small">{selectedMachine.operator.split(' ').map(x => x[0]).join('').slice(0,2)}</span><div><small>OPERADOR ALOCADO</small><b>{selectedMachine.operator}</b><em>{selectedMachine.score}% DE ADERÊNCIA</em></div><button onClick={() => setMachines(prev => prev.map(x => x.id === selectedMachine.id ? { ...x, operator: undefined, score: undefined, state: 'vazio' } : x))}><X size={15}/></button></div> : <div className="unassigned"><CircleAlert size={20} /><span>Sem operador alocado.<br /><small>Arraste alguém do lobby.</small></span></div>}<div className="reqs"><div className="section-head">REQUISITOS DE QUALIFICAÇÃO <span>ver todos</span></div><Requirement title="Operação segura" level="Nível 3" status="ok" /><Requirement title={selectedMachine.id === 'cnc' ? 'CNC · programação' : 'Segurança de processo'} level="Nível 2" status={selectedMachine.state === 'atencao' ? 'warn' : 'ok'} /><Requirement title="NR-12 vigente" level="Certificação" status="ok" /></div><div className="recent"><div className="section-head">ATIVIDADE RECENTE</div><p><Check size={13} /> Rafael alocado com atenção <span>14:26</span></p><p><Gauge size={13} /> Layout atualizado <span>13:52</span></p></div></aside></div>}
  <AnimatePresence>{notice && <motion.div className={`notice ${notice.status}`} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}><span className="notice-icon">{stateCopy[notice.status].icon}</span><div><b>{notice.title}</b><p>{notice.text}</p></div><button onClick={() => setNotice(null)}><X size={17} /></button></motion.div>}</AnimatePresence></main></DndContext>
}

function Requirement({ title, level, status }: { title: string; level: string; status: 'ok'|'warn' }) { return <div className={`requirement ${status}`}><span>{status === 'ok' ? <Check size={14} /> : <AlertTriangle size={14} />}</span><div><b>{title}</b><small>{level}</small></div><em>{status === 'ok' ? 'ATENDIDO' : 'PRÓX. VENCIMENTO'}</em></div> }
function Insights({ onClose }: { onClose: () => void }) { const insights = [{ tag: 'RISCO DE COBERTURA', title: 'Prensa PR-12 depende de uma única pessoa', text: 'Rafael Costa é o único operador com qualificação plena para o próximo turno.', action: 'VER PLANO DE TREINAMENTO', tone: 'amber' }, { tag: 'TREINAMENTO PRIORITÁRIO', title: 'Treinar Beatriz em Prensa reduz risco em 48%', text: 'Uma qualificação adicional elimina a dependência de pessoa-chave.', action: 'VER RECOMENDAÇÃO', tone: 'blue' }, { tag: 'VALIDADES', title: '2 certificações exigem atenção neste mês', text: 'A validade NR-12 de Rafael vence em 16 dias.', action: 'VER QUALIFICAÇÕES', tone: 'red' }]; return <section className="insights"><div className="insights-header"><div><p className="eyebrow"><Sparkles size={14} /> LEITURA OPERACIONAL</p><h1>Insights do <em>turno atual</em></h1><p>O que requer decisão para manter a linha segura e produtiva.</p></div><button onClick={onClose}><X size={18} /> FECHAR</button></div><div className="numbers"><Metric icon={<ShieldAlert />} value="67%" label="COBERTURA APTA" delta="2 de 3 máquinas" /><Metric icon={<AlertTriangle />} value="01" label="EM ATENÇÃO" delta="ação recomendada" warn /><Metric icon={<Users />} value="02" label="PESSOAS-CHAVE" delta="risco de ausência" /><Metric icon={<Clock3 />} value="16d" label="PRÓX. VENCIMENTO" delta="NR-12 · Rafael" warn /></div><div className="insight-list">{insights.map(i => <article className={`insight-card ${i.tone}`} key={i.title}><span className="insight-tag">{i.tag}</span><h2>{i.title}</h2><p>{i.text}</p><button>{i.action} <ChevronRight size={16} /></button></article>)}</div><div className="coverage-card"><div><span className="insight-tag">MATRIZ DE POLIVALÊNCIA</span><h2>Quem pode cobrir cada posto?</h2></div><div className="matrix"><span>ANA <i className="g" /><i className="g" /><i className="a" /></span><span>BEATRIZ <i className="a" /><i className="a" /><i className="g" /></span><span>JOÃO <i className="r" /><i className="r" /><i className="r" /></span><small>CNC-04　 PR-12　 EMB-02</small></div></div></section> }
function Metric({ icon, value, label, delta, warn }: { icon: React.ReactNode; value: string; label: string; delta: string; warn?: boolean }) { return <div className={`metric ${warn ? 'warn' : ''}`}><span>{icon}</span><b>{value}</b><div><small>{label}</small><em>{delta}</em></div></div> }
export default App
