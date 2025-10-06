import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type UploadBoxProps = {
  file: File | null
  onChange: (file: File | null) => void
  accept?: string
  multiple?: boolean
  label?: string
  hint?: string
}

export default function UploadBox({ file, onChange, accept = 'image/*,application/pdf', multiple = false, label, hint }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const effectiveLabel = label ?? 'Déposez vos fichiers ici ou cliquez pour sélectionner'
  const effectiveHint = hint ?? 'Formats acceptés: JPG, PNG, HEIC, PDF • 1 fichier max'

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [file])

  const onClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onFiles = useCallback((files?: FileList | null) => {
    if (!files || files.length === 0) return
    // Pour l’instant on prend le premier fichier (single)
    onChange(files[0])
  }, [onChange])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    onFiles(e.dataTransfer?.files)
  }, [onFiles])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }, [])

  return (
    <div className="">
      <div
        className={`rounded-xl border-2 border-dashed ${isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-300'} p-4 transition-colors`}
        onClick={onClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="12" width="18" height="8" rx="2" stroke="#334155" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-800">
              {effectiveLabel.split(/\scliquer\s/i).length > 1 ? effectiveLabel : effectiveLabel}
            </div>
            <div className="mt-1 text-xs text-slate-500">{effectiveHint}</div>
            <div className="mt-3">
              <button type="button" className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-slate-50" onClick={onClick}>Ajouter</button>
              <input ref={inputRef} type="file" className="hidden" accept={accept} multiple={multiple} onChange={(e) => onFiles(e.target.files)} />
            </div>
          </div>
          {file && (
            <div className="w-28 shrink-0">
              {previewUrl ? (
                <div className="overflow-hidden rounded-lg border"><img src={previewUrl} alt="aperçu" className="w-full h-20 object-cover" /></div>
              ) : (
                <div className="text-xs text-slate-600 break-words max-w-[7rem]">{file.name}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        {file ? (
          <>
            <div className="text-xs text-slate-600 truncate max-w-[18rem]">Fichier: <span className="font-medium">{file.name}</span> ({file.type || '—'})</div>
            <button type="button" onClick={() => onChange(null)} className="text-xs text-red-600 hover:underline">Retirer</button>
          </>
        ) : (
          <div className="text-xs text-slate-500">Minimum 1 fichier</div>
        )}
      </div>
    </div>
  )
}
