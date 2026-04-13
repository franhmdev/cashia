// =============================================================================
// COMPONENT » BlackCard
// Gastos de tarjeta negra — misma lógica que ExtraExpenses,
// comparte categorías con extra_expense_categories
// =============================================================================
import { useState, useMemo } from 'react'
import { useBlackCardExpenses }    from '@/hooks/useBlackCardExpenses'
import { useExtraExpenseCategories } from '@/hooks/useExtraExpenseCategories'
import styles from './BlackCard.module.scss'

const fmt = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const CAT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#7c3aed',
  '#ec4899', '#6b7280',
]

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

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <line x1="4"  y1="6"  x2="20" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4"  y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4"  y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8"  cy="6"  r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="12" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="18" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.8" />
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
          <button className={styles['modal__cancel']} onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className={styles['modal__confirm']} onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Fila de gasto (visualización) ───────────────────────────────────────────
function BlackCardRow({ item, cat, onEdit, onDelete }) {
  const [touched, setTouched] = useState(false)

  const handleRowClick = (e) => {
    if (e.target.closest('button, input, select')) return
    setTouched(t => !t)
  }

  return (
    <div
      className={[styles.txn, touched ? styles['txn--touched'] : ''].filter(Boolean).join(' ')}
      onClick={handleRowClick}
    >
      {/* Círculo de categoría */}
      <div
        className={`${styles['txn__cat']} ${!cat ? styles['txn__cat--none'] : ''}`}
        style={cat ? { backgroundColor: cat.color } : {}}
        aria-hidden="true"
      >
        {cat ? cat.name[0].toUpperCase() : '?'}
      </div>

      {/* Info: nombre + metadatos */}
      <div className={styles['txn__info']}>
        <span className={styles['txn__name']}>{item.name}</span>
        <div className={styles['txn__meta']}>
          {item.due_day && (
            <span className={styles['txn__day']}>Día {item.due_day}</span>
          )}
          {cat ? (
            <span
              className={styles['txn__badge']}
              style={{
                backgroundColor: hexToRgba(cat.color, 0.12),
                color: cat.color,
              }}
            >
              {cat.name}
            </span>
          ) : (
            <span className={styles['txn__badge-none']}>Sin categoría</span>
          )}
        </div>
      </div>

      {/* Importe */}
      <span className={styles['txn__amount']}>{fmt(item.amount)}</span>

      {/* Acciones */}
      <div className={styles['txn__actions']}>
        <button className={styles['txn__edit-btn']} onClick={(e) => { e.stopPropagation(); setTouched(false); onEdit() }} title="Editar">
          <PencilIcon />
        </button>
        <button className={styles['txn__delete-btn']} onClick={(e) => { e.stopPropagation(); setTouched(false); onDelete() }} title="Eliminar">
          <MinusCircleIcon />
        </button>
      </div>
    </div>
  )
}

// ─── Fila de gasto (edición) ──────────────────────────────────────────────────
function EditBlackCardRow({ item, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:        item.name,
    amount:      item.amount,
    due_day:     item.due_day ?? '',
    category_id: item.category_id ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.amount) return
    setSaving(true)
    const d = parseInt(form.due_day, 10)
    await onSave({
      name:        form.name.trim(),
      amount:      parseFloat(form.amount),
      due_day:     d >= 1 && d <= 31 ? d : null,
      category_id: form.category_id || null,
    })
    setSaving(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }

  return (
    <div className={`${styles.txn} ${styles['txn--editing']}`}>
      <div className={styles['txn__form']}>
        <input
          className={styles['txn__input']}
          value={form.name}         onChange={set('name')}
          onKeyDown={handleKey}     placeholder="Nombre del gasto"
          autoFocus
        />
        <input
          className={`${styles['txn__input']} ${styles['txn__input--day']}`}
          value={form.due_day}      onChange={set('due_day')}
          onKeyDown={handleKey}     type="number" min="1" max="31" placeholder="Día"
        />
        <input
          className={`${styles['txn__input']} ${styles['txn__input--amount']}`}
          value={form.amount}       onChange={set('amount')}
          onKeyDown={handleKey}     type="number" min="0" step="0.01" placeholder="0,00"
        />
        <select
          className={styles['txn__cat-select']}
          value={form.category_id}  onChange={set('category_id')}
        >
          <option value="">Sin categoría</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className={styles['txn__form-actions']}>
          <button className={styles['txn__save-btn']}   onClick={handleSave} disabled={saving} title="Guardar"><CheckIcon /></button>
          <button className={styles['txn__cancel-btn']} onClick={onCancel}   disabled={saving} title="Cancelar"><XIcon /></button>
        </div>
      </div>
    </div>
  )
}

// ─── Fila de nuevo gasto ──────────────────────────────────────────────────────
function AddBlackCardRow({ categories, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', amount: '', due_day: '', category_id: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const set = (k) => (e) => { setForm(prev => ({ ...prev, [k]: e.target.value })); setErr('') }

  const handleSave = async () => {
    if (!form.name.trim())                   { setErr('El nombre es requerido'); return }
    if (!form.amount || isNaN(form.amount))  { setErr('Introduce un importe válido'); return }
    setSaving(true)
    const d = parseInt(form.due_day, 10)
    await onSave({
      name:        form.name.trim(),
      amount:      parseFloat(form.amount),
      due_day:     d >= 1 && d <= 31 ? d : null,
      category_id: form.category_id || null,
    })
    setSaving(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }

  return (
    <div className={`${styles.txn} ${styles['txn--adding']}`}>
      <div className={styles['txn__form']}>
        <input
          className={styles['txn__input']}
          value={form.name}         onChange={set('name')}
          onKeyDown={handleKey}     placeholder="Nombre del gasto"
          autoFocus
        />
        <input
          className={`${styles['txn__input']} ${styles['txn__input--day']}`}
          value={form.due_day}      onChange={set('due_day')}
          onKeyDown={handleKey}     type="number" min="1" max="31" placeholder="Día"
        />
        <input
          className={`${styles['txn__input']} ${styles['txn__input--amount']}`}
          value={form.amount}       onChange={set('amount')}
          onKeyDown={handleKey}     type="number" min="0" step="0.01" placeholder="0,00"
        />
        <select
          className={styles['txn__cat-select']}
          value={form.category_id}  onChange={set('category_id')}
        >
          <option value="">Sin categoría</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className={styles['txn__form-actions']}>
          <button className={styles['txn__save-btn']}   onClick={handleSave} disabled={saving} title="Guardar"><CheckIcon /></button>
          <button className={styles['txn__cancel-btn']} onClick={onCancel}   disabled={saving} title="Cancelar"><XIcon /></button>
        </div>
      </div>
      {err && <span className={styles['txn__row-error']}>{err}</span>}
    </div>
  )
}

// ─── Fila de categoría ────────────────────────────────────────────────────────
function CpRow({ cat, onEdit, onDelete }) {
  return (
    <div className={styles.cprow}>
      <div className={styles['cprow__dot']} style={{ backgroundColor: cat.color }} />
      <span className={styles['cprow__name']}>{cat.name}</span>
      <div className={styles['cprow__actions']}>
        <button className={styles['cprow__edit-btn']}   onClick={onEdit}   title="Editar"><PencilIcon /></button>
        <button className={styles['cprow__delete-btn']} onClick={onDelete} title="Eliminar"><MinusCircleIcon /></button>
      </div>
    </div>
  )
}

function EditCpRow({ cat, onSave, onCancel }) {
  const [form, setForm] = useState({ name: cat.name, color: cat.color })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ name: form.name.trim(), color: form.color })
    setSaving(false)
  }

  return (
    <div className={styles['cprow--form']}>
      <div className={styles['cprow__form-top']}>
        <div className={styles['cprow__dot']} style={{ backgroundColor: form.color }} />
        <input
          className={styles['cprow__input']}
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
          placeholder="Nombre"
          autoFocus
        />
        <div className={styles['cprow__actions']}>
          <button className={styles['cprow__save-btn']}   onClick={handleSave} disabled={saving}><CheckIcon /></button>
          <button className={styles['cprow__cancel-btn']} onClick={onCancel}   disabled={saving}><XIcon /></button>
        </div>
      </div>
      <div className={styles.swatches}>
        {CAT_COLORS.map(c => (
          <button
            key={c}
            className={`${styles.swatch} ${form.color === c ? styles['swatch--active'] : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => setForm(p => ({ ...p, color: c }))}
            title={c}
          />
        ))}
      </div>
    </div>
  )
}

function AddCpRow({ onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', color: '#1e0a3c' })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('El nombre es requerido'); return }
    setSaving(true)
    await onSave({ name: form.name.trim(), color: form.color })
    setSaving(false)
  }

  return (
    <div className={styles['cprow--form']}>
      <div className={styles['cprow__form-top']}>
        <div className={styles['cprow__dot']} style={{ backgroundColor: form.color }} />
        <input
          className={styles['cprow__input']}
          value={form.name}
          onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErr('') }}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
          placeholder="Nombre de categoría"
          autoFocus
        />
        <div className={styles['cprow__actions']}>
          <button className={styles['cprow__save-btn']}   onClick={handleSave} disabled={saving}><CheckIcon /></button>
          <button className={styles['cprow__cancel-btn']} onClick={onCancel}   disabled={saving}><XIcon /></button>
        </div>
      </div>
      <div className={styles.swatches}>
        {CAT_COLORS.map(c => (
          <button
            key={c}
            className={`${styles.swatch} ${form.color === c ? styles['swatch--active'] : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => setForm(p => ({ ...p, color: c }))}
            title={c}
          />
        ))}
      </div>
      {err && <span className={styles['cprow__error']}>{err}</span>}
    </div>
  )
}

// ─── Panel de categorías ──────────────────────────────────────────────────────
function CategoriesPanel({ categories, onAdd, onUpdate, onRemove, onClose }) {
  const [editingId, setEditingId]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [isAdding, setIsAdding]     = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onRemove(deleteItem.id)
    setDeleteItem(null)
    setDeleting(false)
  }

  const handleOverlayMouseDown = (e) => { if (e.target === e.currentTarget) onClose() }

  return (
    <div
      className={styles['cat-overlay']}
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
      aria-label="Gestionar categorías"
    >
      <div className={styles['cat-panel']}>
        <div className={styles['cat-panel__header']}>
          <h3 className={styles['cat-panel__title']}>
            <SlidersIcon />
            Categorías compartidas
          </h3>
          <button
            className={styles['bc__add-btn']}
            onClick={() => { setIsAdding(true); setEditingId(null) }}
            aria-label="Nueva categoría"
          >
            <PlusIcon />
          </button>
          <button className={styles['cat-panel__close']} onClick={onClose} aria-label="Cerrar panel">
            <XIcon />
          </button>
        </div>

        <div className={styles['cat-panel__body']}>
          {categories.length === 0 && !isAdding && (
            <p className={styles['bc__empty']}>
              Sin categorías.{' '}
              <button className={styles['bc__empty-cta']} onClick={() => setIsAdding(true)}>
                Crea la primera
              </button>
            </p>
          )}

          {categories.map(cat =>
            editingId === cat.id ? (
              <EditCpRow
                key={cat.id}
                cat={cat}
                onSave={async (data) => { await onUpdate(cat.id, data); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <CpRow
                key={cat.id}
                cat={cat}
                onEdit={() => { setEditingId(cat.id); setIsAdding(false) }}
                onDelete={() => setDeleteItem(cat)}
              />
            )
          )}

          {isAdding && (
            <AddCpRow
              onSave={async (data) => { await onAdd(data); setIsAdding(false) }}
              onCancel={() => setIsAdding(false)}
            />
          )}
        </div>
      </div>

      {deleteItem && (
        <DeleteModal
          name={deleteItem.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function BlackCard({ month, year }) {
  const { items, loading, error, add, update, remove } = useBlackCardExpenses(month, year)
  const { categories, add: addCat, update: updateCat, remove: removeCat } =
    useExtraExpenseCategories()

  const [editingId, setEditingId]           = useState(null)
  const [deleteItem, setDeleteItem]         = useState(null)
  const [isAdding, setIsAdding]             = useState(false)
  const [deleting, setDeleting]             = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [filterCatId, setFilterCatId]       = useState('')

  const catMap = useMemo(
    () => Object.fromEntries(categories.map(c => [c.id, c])),
    [categories]
  )

  const filtered = !filterCatId
    ? items
    : filterCatId === '__none__'
      ? items.filter(i => !i.category_id)
      : items.filter(i => i.category_id === filterCatId)

  const filteredTotal = filtered.reduce((s, i) => s + Number(i.amount), 0)

  const handleDelete = async () => {
    setDeleting(true)
    await remove(deleteItem.id)
    setDeleteItem(null)
    setDeleting(false)
  }

  const startAdd = () => { setIsAdding(true); setEditingId(null) }

  return (
    <section className={styles.bc}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={styles['bc__header']}>
        <h2 className={styles['bc__title']}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2" />
            <line x1="6" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="13" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Tarjeta Negra
        </h2>

        <div className={styles['bc__header-right']}>
          <select
            className={styles['bc__cat-filter']}
            value={filterCatId}
            onChange={e => setFilterCatId(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__none__">Sin categoría</option>
          </select>

          <button
            className={styles['bc__manage-btn']}
            onClick={() => setShowCategories(true)}
            title="Gestionar categorías"
            aria-label="Gestionar categorías"
          >
            <SlidersIcon />
          </button>

          <button
            className={styles['bc__add-btn']}
            onClick={startAdd}
            aria-label="Añadir gasto"
            title="Añadir"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* ── Lista ────────────────────────────────────────────────────────── */}
      <div className={styles['bc__body']}>
        {loading && <p className={styles['bc__loading']}>Cargando…</p>}
        {error   && <p className={styles['bc__msg-error']}>{error}</p>}

        {!loading && !error && (
          <>
            {filtered.map(item =>
              editingId === item.id ? (
                <EditBlackCardRow
                  key={item.id}
                  item={item}
                  categories={categories}
                  onSave={async (data) => { await update(item.id, data); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <BlackCardRow
                  key={item.id}
                  item={item}
                  cat={catMap[item.category_id] ?? null}
                  onEdit={() => { setEditingId(item.id); setIsAdding(false) }}
                  onDelete={() => setDeleteItem(item)}
                />
              )
            )}

            {filtered.length === 0 && !isAdding && (
              <p className={styles['bc__empty']}>
                {filterCatId
                  ? 'No hay gastos en esta categoría.'
                  : <>Aún no hay gastos para este mes.{' '}
                    <button className={styles['bc__empty-cta']} onClick={startAdd}>
                      Añade el primero
                    </button></>
                }
              </p>
            )}

            {isAdding && (
              <AddBlackCardRow
                categories={categories}
                onSave={async (data) => { await add(data); setIsAdding(false) }}
                onCancel={() => setIsAdding(false)}
              />
            )}
          </>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className={styles['bc__footer']}>
          <span className={styles['bc__count']}>
            {filtered.length} gasto{filtered.length !== 1 ? 's' : ''}
            {filterCatId && items.length !== filtered.length && ` de ${items.length}`}
          </span>
          <div className={styles['bc__total-block']}>
            <span className={styles['bc__total-label']}>Total</span>
            <span className={styles['bc__total-value']}>{fmt(filteredTotal)}</span>
          </div>
        </div>
      )}

      {/* ── Modal eliminar ────────────────────────────────────────────────── */}
      {deleteItem && (
        <DeleteModal
          name={deleteItem.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={deleting}
        />
      )}

      {/* ── Panel de categorías ──────────────────────────────────────────── */}
      {showCategories && (
        <CategoriesPanel
          categories={categories}
          onAdd={addCat}
          onUpdate={updateCat}
          onRemove={removeCat}
          onClose={() => setShowCategories(false)}
        />
      )}
    </section>
  )
}
