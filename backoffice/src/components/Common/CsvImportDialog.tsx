import { useVirtualizer } from "@tanstack/react-virtual"
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react"
import Papa from "papaparse"
import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CsvColumnConfig<TRow> {
  /** CSV header name */
  header: string
  /** Key on the row object */
  key: keyof TRow & string
  /** Is the field required? */
  required?: boolean
  /** Per-cell validator — return error string or null */
  validate?: (value: string) => string | null
  /** Parse the raw CSV string into the target type */
  parse?: (value: string) => unknown
}

export interface CsvImportResult {
  success: boolean
  err_msg?: string | null
  row_number: number
}

interface EditableRow<TRow> {
  /** 1-based, matches backend row_number */
  rowNumber: number
  data: Record<keyof TRow & string, string>
  errors: Partial<Record<keyof TRow & string, string>>
}

interface CsvImportDialogProps<TRow, TResult extends CsvImportResult> {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: CsvColumnConfig<TRow>[]
  resourceName: string
  onImport: (rows: TRow[]) => Promise<TResult[]>
  isPending: boolean
  progress?: { current: number; total: number }
  onCancel?: () => void
}

type Step = "upload" | "preview" | "results"

// ---------------------------------------------------------------------------
// EditableCell — local state so keystrokes don't re-render every row
// ---------------------------------------------------------------------------

function EditableCell({
  value,
  error,
  onChange,
}: {
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <Input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) onChange(local)
      }}
      className={error ? "border-destructive text-destructive" : ""}
      aria-invalid={!!error}
      title={error ?? undefined}
    />
  )
}

// ---------------------------------------------------------------------------
// PreviewTable — virtualized so only visible rows are in the DOM
// ---------------------------------------------------------------------------

const ROW_HEIGHT = 40

function PreviewTable<TRow extends Record<string, unknown>>({
  rows,
  columns,
  scrollRef,
  onUpdateCell,
  onDeleteRow,
}: {
  rows: EditableRow<TRow>[]
  columns: CsvColumnConfig<TRow>[]
  scrollRef: React.RefObject<HTMLDivElement | null>
  onUpdateCell: (
    rowIdx: number,
    key: keyof TRow & string,
    value: string,
  ) => void
  onDeleteRow: (rowIdx: number) => void
}) {
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const colSpan = columns.length + 2 // # col + data cols + action col

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-auto border rounded-md"
    >
      <table className="min-w-max text-sm">
        <thead className="bg-muted/50 [&_tr]:border-b sticky top-0 z-10">
          <tr className="border-b">
            <th className="text-muted-foreground h-10 px-3 text-left text-xs font-semibold whitespace-nowrap w-10">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-muted-foreground h-10 px-2 text-left text-xs font-semibold whitespace-nowrap"
              >
                {col.header}
                {col.required && (
                  <span className="text-destructive ml-0.5">*</span>
                )}
              </th>
            ))}
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td
                colSpan={colSpan}
                style={{ height: paddingTop, padding: 0, border: "none" }}
              />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const rowIdx = virtualRow.index
            const row = rows[rowIdx]
            return (
              <tr key={row.rowNumber} className="border-b">
                <td className="text-muted-foreground text-xs px-3 py-1">
                  {row.rowNumber}
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-1 py-1">
                    <EditableCell
                      value={row.data[col.key]}
                      error={row.errors[col.key]}
                      onChange={(v) => onUpdateCell(rowIdx, col.key, v)}
                    />
                  </td>
                ))}
                <td className="px-1 py-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteRow(rowIdx)}
                    aria-label={`Delete row ${row.rowNumber}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td
                colSpan={colSpan}
                style={{ height: paddingBottom, padding: 0, border: "none" }}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CsvImportDialog<
  TRow extends Record<string, unknown>,
  TResult extends CsvImportResult,
>({
  open,
  onOpenChange,
  columns,
  resourceName,
  onImport,
  isPending,
  progress,
  onCancel,
}: CsvImportDialogProps<TRow, TResult>) {
  const [step, setStep] = useState<Step>("upload")
  const [rows, setRows] = useState<EditableRow<TRow>[]>([])
  const [results, setResults] = useState<TResult[]>([])
  const [missingColumns, setMissingColumns] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const importingRef = useRef(false)

  // ---- Reset on close ----
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep("upload")
      setRows([])
      setResults([])
      setMissingColumns([])
      importingRef.current = false
      if (fileRef.current) fileRef.current.value = ""
    }
    onOpenChange(next)
  }

  // ---- Validation helpers ----
  const validateRow = useCallback(
    (data: Record<keyof TRow & string, string>) => {
      const errors: Partial<Record<keyof TRow & string, string>> = {}
      for (const col of columns) {
        const val = data[col.key] ?? ""
        if (col.required && !val.trim()) {
          errors[col.key] = `${col.header} is required`
        } else if (val.trim() && col.validate) {
          const err = col.validate(val)
          if (err) errors[col.key] = err
        }
      }
      return errors
    },
    [columns],
  )

  const hasErrors = rows.some((r) => Object.keys(r.errors).length > 0)

  // ---- CSV parsing ----
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const csvHeaders = result.meta.fields ?? []
        const missing = columns
          .filter((col) => !csvHeaders.includes(col.header))
          .map((col) => col.header)
        setMissingColumns(missing)

        const parsed: EditableRow<TRow>[] = result.data.map((raw, idx) => {
          const data = {} as Record<keyof TRow & string, string>
          for (const col of columns) {
            data[col.key] = (raw[col.header] ?? "").trim()
          }
          const errors = validateRow(data)
          return { rowNumber: idx + 1, data, errors }
        })
        setRows(parsed)
        setStep("preview")
      },
    })
  }

  // ---- Cell editing ----
  const updateCell = (
    rowIdx: number,
    key: keyof TRow & string,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r
        const data = { ...r.data, [key]: value }
        return { ...r, data, errors: validateRow(data) }
      }),
    )
  }

  // ---- Row deletion ----
  const deleteRow = (rowIdx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== rowIdx))
  }

  // ---- Build typed rows & import ----
  const handleImport = async () => {
    if (importingRef.current) return
    importingRef.current = true
    const typed: TRow[] = rows.map((r) => {
      const out: Record<string, unknown> = {}
      for (const col of columns) {
        const raw = r.data[col.key]
        if (!raw && !col.required) {
          out[col.key] = col.parse ? col.parse("") : undefined
          continue
        }
        out[col.key] = col.parse ? col.parse(raw) : raw
      }
      return out as TRow
    })

    const res = await onImport(typed)
    importingRef.current = false
    setResults(res)
    setStep("results")
  }

  // ---- Template download ----
  const downloadTemplate = () => {
    const headers = columns.map((c) => c.header).join(",")
    const blob = new Blob([`${headers}\n`], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${resourceName.toLowerCase()}-import-template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---- Results summary ----
  const successCount = results.filter((r) => r.success).length
  const failCount = results.length - successCount

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[85vh] flex flex-col transition-[max-width] duration-200",
          step !== "upload" && "sm:max-w-[90vw]",
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {step === "upload" && `Import ${resourceName}s`}
            {step === "preview" &&
              `Preview — ${rows.length} ${resourceName.toLowerCase()}(s)`}
            {step === "results" && `Import Results`}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              `Upload a CSV file to bulk-create ${resourceName.toLowerCase()}s.`}
            {step === "preview" &&
              "Review and edit before importing. Fix any errors highlighted in red."}
            {step === "results" &&
              `${successCount} created, ${failCount} failed.`}
          </DialogDescription>
        </DialogHeader>

        {/* ---- Upload Step ---- */}
        {step === "upload" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <Input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
        )}

        {/* ---- Missing columns warning ---- */}
        {step === "preview" && missingColumns.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Missing columns in CSV:{" "}
              <strong>{missingColumns.join(", ")}</strong>. You can fill them in
              below.
            </span>
          </div>
        )}

        {/* ---- Preview Step (virtualized) ---- */}
        {step === "preview" && (
          <PreviewTable
            rows={rows}
            columns={columns}
            scrollRef={scrollRef}
            onUpdateCell={updateCell}
            onDeleteRow={deleteRow}
          />
        )}

        {/* ---- Results Step ---- */}
        {step === "results" && (
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.row_number}>
                    <TableCell className="text-muted-foreground text-xs">
                      {r.row_number}
                    </TableCell>
                    <TableCell>
                      {r.success ? (
                        <Badge variant="default">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Created
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {(r as unknown as Record<string, string>).name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.err_msg ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ---- Footer ---- */}
        <DialogFooter>
          {step === "preview" && (
            <>
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setStep("upload")
                  setRows([])
                  setMissingColumns([])
                  if (fileRef.current) fileRef.current.value = ""
                }}
              >
                Back
              </Button>
              {isPending && progress && (
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1 rounded-full bg-muted h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-200"
                      style={{
                        width: `${Math.round((progress.current / progress.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {progress.current} / {progress.total}
                  </span>
                  {onCancel && (
                    <Button variant="destructive" size="sm" onClick={onCancel}>
                      Cancel
                    </Button>
                  )}
                </div>
              )}
              <LoadingButton
                loading={isPending}
                disabled={hasErrors || rows.length === 0}
                onClick={handleImport}
              >
                Import {rows.length} {resourceName.toLowerCase()}(s)
              </LoadingButton>
            </>
          )}
          {(step === "upload" || step === "results") && (
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
