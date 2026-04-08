// =============================================================================
// COMPONENT » FixedExpenses
// Lista interactiva de gastos fijos con CRUD inline
// =============================================================================
import { useState } from 'react'
import { useFixedExpenses } from '@/hooks/useFixedExpenses'
import styles from './FixedExpenses.module.scss'

const fmt = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

// ─── Íconos ───────────────────────────────────────────────────────────────────
function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MinusCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Modal de confirmación ────────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onCancel, loading }) {
  return (
    <div className={styles['modal-overlay']} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3 className={styles['modal__title']}>¿Eliminar gasto?</h3>
        <p className={styles['modal__body']}>
          Se eliminará <strong>"{name}"</strong>. Esta acción no se puede deshacer.
        </p>
        <div className={styles['modal__actions']}>
          <button className={styles['modal__cancel']} onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className={styles['modal__confirm']} onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Fila en modo visualización ───────────────────────────────────────────────
function ExpenseRow({ expense, onToggle, onEdit, onDelete }) {
  return (
    <div className={[styles.expense, expense.paid ? styles['expense--paid'] : ''].filter(Boolean).join(' ')}>
      <label className={styles['expense__check-wrap']} title={expense.paid ? 'Marcar como pendiente' : 'Marcar como pagado'}>
        <input
          type="checkbox"
          checked={expense.paid}
          onChange={onToggle}
          className={styles['expense__checkbox']}
        />
        <span className={styles['expense__check-box']} aria-hidden="true" />
      </label>
      <span className={styles['expense__name']}>{expense.name}</span>
      <span className={styles['expense__day']}>{expense.due_day ? `Día ${expense.due_day}` : '—'}</span>
      <span className={styles['expense__amount']}>{fmt(expense.amount)}</span>
      <div className={styles['expense__actions']}>
        <button className={styles['expense__edit-btn']} onClick={onEdit} title="Editar">
          <PencilIcon />
        </button>
        <button className={styles['expense__delete-btn']} onClick={onDelete} title="Eliminar">
          <MinusCircleIcon />
        </button>
      </div>
    </div>
  )
}

// ─── Fila en modo edición ─────────────────────────────────────────────────────
function EditRow({ expense, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:    expense.name,
    amount:  expense.amount,
    due_day: expense.due_day,
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.amount) return
    setSaving(true)
    const parsedDay = parseInt(form.due_day, 10)
    await onSave({
      name:    form.name.trim(),
      amount:  parseFloat(form.amount),
      due_day: parsedDay >= 1 && parsedDay <= 31 ? parsedDay : null,
    })
    setSaving(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }

  return (
    <div className={`${styles.expense} ${styles['expense--editing']}`}>
      <span className={styles['expense__edit-spacer']} />
      <input
        className={styles['expense__input']}
        value={form.name}
        onChange={set('name')}
        onKeyDown={handleKey}
        placeholder="Nombre del gasto"
        autoFocus
      />
      <input
        className={`${styles['expense__input']} ${styles['expense__input--day']}`}
        value={form.due_day}
        onChange={set('due_day')}
        onKeyDown={handleKey}
        type="number" min="1" max="31"
        placeholder="Día"
      />
      <input
        className={`${styles['expense__input']} ${styles['expense__input--amount']}`}
        value={form.amount}
        onChange={set('amount')}
        onKeyDown={handleKey}
        type="number" min="0" step="0.01"
        placeholder="0,00"
      />
      <div className={styles['expense__actions']}>
        <button className={styles['expense__save-btn']} onClick={handleSave} disabled={saving} title="Guardar">
          <CheckIcon />
        </button>
        <button className={styles['expense__cancel-btn']} onClick={onCancel} disabled={saving} title="Cancelar">
          <XIcon />
        </button>
      </div>
    </div>
  )
}

// ─── Fila de nuevo gasto ──────────────────────────────────────────────────────
function AddRow({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', amount: '', due_day: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k) => (e) => { setForm(prev => ({ ...prev, [k]: e.target.value })); setErr('') }

  const handleSave = async () => {
    if (!form.name.trim())                   { setErr('El nombre es requerido'); return }
    if (!form.amount || isNaN(form.amount))  { setErr('Introduce un importe válido'); return }
    setSaving(true)
    const parsedDay = parseInt(form.due_day, 10)
    await onSave({
      name:    form.name.trim(),
      amount:  parseFloat(form.amount),
      due_day: parsedDay >= 1 && parsedDay <= 31 ? parsedDay : null,
    })
    setSaving(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }

  return (
    <div className={`${styles.expense} ${styles['expense--adding']}`}>
      <span className={styles['expense__edit-spacer']} />
      <input
        className={styles['expense__input']}
        value={form.name}
        onChange={set('name')}
        onKeyDown={handleKey}
        placeholder="Nombre del gasto"
        autoFocus
      />
      <input
        className={`${styles['expense__input']} ${styles['expense__input--day']}`}
        value={form.due_day}
        onChange={set('due_day')}
        onKeyDown={handleKey}
        type="number" min="1" max="31"
        placeholder="Día"
      />
      <input
        className={`${styles['expense__input']} ${styles['expense__input--amount']}`}
        value={form.amount}
        onChange={set('amount')}
        onKeyDown={handleKey}
        type="number" min="0" step="0.01"
        placeholder="0,00"
      />
      <div className={styles['expense__actions']}>
        <button className={styles['expense__save-btn']} onClick={handleSave} disabled={saving} title="Guardar">
          <CheckIcon />
        </button>
        <button className={styles['expense__cancel-btn']} onClick={onCancel} disabled={saving} title="Cancelar">
          <XIcon />
        </button>
      </div>
      {err && <span className={styles['expense__row-error']}>{err}</span>}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function FixedExpenses({ month, year }) {
  const { items, loading, error, add, update, remove, toggle, total, pending } =
    useFixedExpenses(month, year)

  const [editingId, setEditingId]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [isAdding, setIsAdding]     = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await remove(deleteItem.id)
    setDeleteItem(null)
    setDeleting(false)
  }

  const startAdd = () => { setIsAdding(true); setEditingId(null) }

  return (
    <section className={styles.fixed}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={styles['fixed__header']}>
        <h2 className={styles['fixed__title']}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Gastos Fijos
        </h2>
        <button className={styles['fixed__add-btn']} onClick={startAdd} aria-label="Añadir gasto fijo" title="Añadir">
          <PlusIcon />
        </button>
      </div>

      {/* ── Cuerpo ──────────────────────────────────────────────────────── */}
      <div className={styles['fixed__body']}>
        {loading && <p className={styles['fixed__loading']}>Cargando gastos…</p>}
        {error   && <p className={styles['fixed__msg-error']}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Cabeceras de columnas */}
            {(items.length > 0 || isAdding) && (
              <div className={styles['fixed__cols']}>
                <span />
                <span>Concepto</span>
                <span>Fecha</span>
                <span>Importe</span>
                <span />
              </div>
            )}

            {/* Filas */}
            {items.map(exp =>
              editingId === exp.id
                ? (
                  <EditRow
                    key={exp.id}
                    expense={exp}
                    onSave={async (data) => { await update(exp.id, data); setEditingId(null) }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <ExpenseRow
                    key={exp.id}
                    expense={exp}
                    onToggle={() => toggle(exp.id, !exp.paid)}
                    onEdit={() => { setEditingId(exp.id); setIsAdding(false) }}
                    onDelete={() => setDeleteItem(exp)}
                  />
                )
            )}

            {/* Estado vacío */}
            {items.length === 0 && !isAdding && (
              <p className={styles['fixed__empty']}>
                Aún no hay gastos fijos para este mes.{' '}
                <button className={styles['fixed__empty-cta']} onClick={startAdd}>
                  Añade el primero
                </button>
              </p>
            )}

            {/* Fila de añadir */}
            {isAdding && (
              <AddRow
                onSave={async (data) => { await add(data); setIsAdding(false) }}
                onCancel={() => setIsAdding(false)}
              />
            )}
          </>
        )}
      </div>

      {/* ── Footer totales ───────────────────────────────────────────────── */}
      {!loading && items.length > 0 && (
        <div className={styles['fixed__footer']}>
          <div className={styles['fixed__total-block']}>
            <span className={styles['fixed__total-label']}>Total</span>
            <span className={styles['fixed__total-value']}>{fmt(total)}</span>
          </div>
          <div className={`${styles['fixed__total-block']} ${styles['fixed__total-block--pending']}`}>
            <span className={styles['fixed__total-label']}>Pendiente</span>
            <span className={styles['fixed__total-value']}>{fmt(pending)}</span>
          </div>
        </div>
      )}

      {/* ── Modal eliminar ───────────────────────────────────────────────── */}
      {deleteItem && (
        <DeleteModal
          name={deleteItem.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={deleting}
        />
      )}
    </section>
  )
}
