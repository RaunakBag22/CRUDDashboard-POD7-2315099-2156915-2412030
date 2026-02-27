import { useState, useEffect, type FC, type ChangeEvent } from 'react'
import type { Item } from '../types'

interface Props {
  mode: 'create' | 'edit'
  item?: Item
  existingSkus: string[]
  onSave: (data: Omit<Item, 'id'>) => void
  onClose: () => void
}

interface FormState {
  name: string
  sku: string
  category: string
  price: string
  quantity: string
  imageUrl: string
}

const EMPTY: FormState = { name: '', sku: '', category: '', price: '', quantity: '', imageUrl: '' }

const ItemModal: FC<Props> = ({ mode, item, existingSkus, onSave, onClose }) => {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (mode === 'edit' && item) {
      setForm({
        name: item.name, sku: item.sku, category: item.category,
        price: String(item.price), quantity: String(item.quantity), imageUrl: item.imageUrl ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [mode, item])

  const set = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(prev => ({ ...prev, imageUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.sku.trim()) next.sku = 'SKU is required'
    if (!form.category.trim()) next.category = 'Category is required'
    const price = parseFloat(form.price)
    if (isNaN(price) || price < 0) next.price = 'Enter a valid price ≥ 0'
    const qty = parseInt(form.quantity, 10)
    if (isNaN(qty) || qty < 0 || String(qty) !== form.quantity.trim()) next.quantity = 'Enter a valid whole number ≥ 0'
    if (form.sku.trim() && existingSkus.includes(form.sku.trim())) next.sku = 'SKU already exists'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({
      name: form.name.trim(), sku: form.sku.trim(), category: form.category.trim(),
      price: parseFloat(form.price), quantity: parseInt(form.quantity, 10),
      imageUrl: form.imageUrl || undefined,
    })
  }

  const fieldClass = (err?: string) =>
    `w-full border rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
      err
        ? 'border-red-300 dark:border-red-700 focus:ring-red-400/30 focus:border-red-400 bg-white dark:bg-slate-800'
        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30 focus:border-indigo-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
    } text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500`

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === 'create' ? 'Add New Item' : 'Edit Item'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {mode === 'create' ? 'Fill in the details for your new product.' : 'Update the product details below.'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Name *</label>
            <input className={fieldClass(errors.name)} value={form.name} onChange={set('name')} placeholder="e.g., Running Shoes" />
            {errors.name && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">SKU *</label>
              <input className={fieldClass(errors.sku)} value={form.sku} onChange={set('sku')} placeholder="e.g., SH-042" />
              {errors.sku && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.sku}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Category *</label>
              <input className={fieldClass(errors.category)} value={form.category} onChange={set('category')} placeholder="e.g., Footwear" />
              {errors.category && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.category}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Price ($) *</label>
              <input type="number" min="0" step="0.01" className={fieldClass(errors.price)} value={form.price} onChange={set('price')} placeholder="0.00" />
              {errors.price && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Quantity *</label>
              <input type="number" min="0" step="1" className={fieldClass(errors.quantity)} value={form.quantity} onChange={set('quantity')} placeholder="0" />
              {errors.quantity && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.quantity}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Product Image (optional)</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl px-4 py-4 cursor-pointer transition-colors group">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {form.imageUrl ? 'Change image' : 'Upload an image'}
              </span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
            {form.imageUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img src={form.imageUrl} alt="preview" className="w-20 h-20 object-cover rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm" />
                <button onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))} className="text-xs text-red-500 hover:text-red-700 transition-colors">Remove</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40">
            {mode === 'create' ? 'Create Item' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemModal
