// =============================================================================
// COMPONENT » LoansPanel
// Panel lateral de préstamos — añadir, editar, eliminar
// Abierto desde el menú de usuario de la Navbar
// =============================================================================
import { useState } from 'react'
import { useLoans } from '@/hooks/useLoans'
import styles from './LoansPanel.module.scss'

const fmt = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

// ─── Íconos ────────────────────────────────────────────────────────────────────
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

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Modal de confirmación ─────────────────────────────────────────────────────
function DeleteModal({ title, onConfirm, onCancel, loading }) {
  return (
    <div className={styles['modal-overlay']} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3 className={styles['modal__title']}>¿Eliminar préstamo?</h3>
        <p className={styles['modal__body']}>
          Se eliminará <strong>"{title}"</strong>. Esta acción no se puede deshacer.
        </p>
        <div className={styles['modal__actions']}>
          <button className={styles['modal__cancel']} onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className={styles['modal__confirm']} onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Fila de préstamo (visualización) ──────────────────────────────────────────
function LoanRow({ loan, onEdit, onDelete }) {
  return (
    <div className={styles.loan}>
      <div className={styles['loan__icon']} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.8" />
          <line x1="6" y1="15" x2="9"  y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="12" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <div className={styles['loan__info']}>
        <span className={styles['loan__title']}>{loan.title}</span>
        <div className={styles['loan__meta']}>
          <span className={styles['loan__meta-item']}>
            <span className={styles['loan__meta-label']}>Total</span>
            <span className={styles['loan__meta-value']}>{fmt(loan.amount)}</span>
          </span>
          <span className={styles['loan__meta-sep']} aria-hidden="true">·</span>
          <span className={styles['loan__meta-item']}>
            <span className={styles['loan__meta-label']}>Cuota</span>
            <span className={styles['loan__meta-value']}>{fmt(loan.monthly_payment)}/mes</span>
          </span>
        </div>
      </div>

      <div className={styles['loan__actions']}>
        <button className={styles['loan__edit-btn']} onClick={onEdit} title="Editar">
          <PencilIcon />
        </button>
        <button className={styles['loan__delete-btn']} onClick={onDelete} title="Eliminar">
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

// ─── Formulario inline (edición o creación) ────────────────────────────────────
function LoanForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title:           initial?.title           ?? '',
    amount:          initial?.amount          ?? '',
    monthly_payment: initial?.monthly_payment ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErr('') }

  const handleSave = async () => {
    if (!form.title.trim())                      { setErr('El título es obligatorio'); return }
    if (!form.amount || isNaN(form.amount))       { setErr('Introduce un importe válido'); return }
    if (!form.monthly_payment || isNaN(form.monthly_payment)) { setErr('Introduce una mensualidad válida'); return }
    setSaving(true)
    await onSave({
      title:           form.title.trim(),
      amount:          parseFloat(form.amount),
      monthly_payment: parseFloat(form.monthly_payment),
    })
    setSaving(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }

  return (
    <div className={styles['loan-form']}>
      <input
        className={styles['loan-form__input']}
        value={form.title}
        onChange={set('title')}
        onKeyDown={handleKey}
        placeholder="Título del préstamo"
        autoFocus
      />
      <div className={styles['loan-form__row']}>
        <div className={styles['loan-form__field']}>
          <label className={styles['loan-form__label']}>Importe total</label>
          <input
            className={styles['loan-form__input']}
            value={form.amount}
            onChange={set('amount')}
            onKeyDown={handleKey}
            type="number" min="0" step="0.01"
            placeholder="0,00 €"
          />
        </div>
        <div className={styles['loan-form__field']}>
          <label className={styles['loan-form__label']}>Mensualidad</label>
          <input
            className={styles['loan-form__input']}
            value={form.monthly_payment}
            onChange={set('monthly_payment')}
            onKeyDown={handleKey}
            type="number" min="0" step="0.01"
            placeholder="0,00 €/mes"
          />
        </div>
      </div>
      {err && <span className={styles['loan-form__error']}>{err}</span>}
      <div className={styles['loan-form__actions']}>
        <button className={styles['loan-form__cancel']} onClick={onCancel} disabled={saving}>
          <XIcon /> Cancelar
        </button>
        <button className={styles['loan-form__save']} onClick={handleSave} disabled={saving}>
          <CheckIcon /> {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

// ─── Panel principal ───────────────────────────────────────────────────────────
export function LoansPanel({ onClose }) {
  const { items, loading, error, add, update, remove, totalAmount, totalMonthly } = useLoans()

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

  const handleOverlayMouseDown = (e) => { if (e.target === e.currentTarget) onClose() }

  return (
    <div
      className={styles.overlay}
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
      aria-label="Mis préstamos"
    >
      <div className={styles.panel}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className={styles['panel__header']}>
          <div className={styles['panel__header-left']}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className={styles['panel__icon']}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className={styles['panel__title']}>Mis préstamos</h2>
          </div>
          <div className={styles['panel__header-right']}>
            <button
              className={styles['panel__add-btn']}
              onClick={() => { setIsAdding(true); setEditingId(null) }}
              aria-label="Añadir préstamo"
              title="Añadir préstamo"
            >
              <PlusIcon />
            </button>
            <button className={styles['panel__close']} onClick={onClose} aria-label="Cerrar panel">
              <XIcon />
            </button>
          </div>
        </div>

        {/* ── Cuerpo ──────────────────────────────────────────────────────── */}
        <div className={styles['panel__body']}>
          {loading && <p className={styles['panel__loading']}>Cargando…</p>}
          {error   && <p className={styles['panel__error']}>{error}</p>}

          {!loading && !error && (
            <>
              {items.length === 0 && !isAdding && (
                <p className={styles['panel__empty']}>
                  Sin préstamos registrados.{' '}
                  <button className={styles['panel__empty-cta']} onClick={() => setIsAdding(true)}>
                    Añade el primero
                  </button>
                </p>
              )}

              {items.map(loan =>
                editingId === loan.id ? (
                  <LoanForm
                    key={loan.id}
                    initial={loan}
                    onSave={async (data) => { await update(loan.id, data); setEditingId(null) }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <LoanRow
                    key={loan.id}
                    loan={loan}
                    onEdit={() => { setEditingId(loan.id); setIsAdding(false) }}
                    onDelete={() => setDeleteItem(loan)}
                  />
                )
              )}

              {isAdding && (
                <LoanForm
                  onSave={async (data) => { await add(data); setIsAdding(false) }}
                  onCancel={() => setIsAdding(false)}
                />
              )}
            </>
          )}
        </div>

        {/* ── Footer de totales ────────────────────────────────────────────── */}
        {!loading && items.length > 0 && (
          <div className={styles['panel__footer']}>
            <div className={styles['panel__total']}>
              <span className={styles['panel__total-label']}>
                {items.length} préstamo{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className={styles['panel__totals-right']}>
              <div className={styles['panel__total-block']}>
                <span className={styles['panel__total-name']}>Deuda total</span>
                <span className={styles['panel__total-value']}>{fmt(totalAmount)}</span>
              </div>
              <div className={styles['panel__total-sep']} aria-hidden="true" />
              <div className={styles['panel__total-block']}>
                <span className={styles['panel__total-name']}>Cuotas / mes</span>
                <span className={[styles['panel__total-value'], styles['panel__total-value--monthly']].join(' ')}>{fmt(totalMonthly)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal eliminar ────────────────────────────────────────────────── */}
      {deleteItem && (
        <DeleteModal
          title={deleteItem.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
