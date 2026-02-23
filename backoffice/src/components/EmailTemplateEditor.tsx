import Editor, { type OnMount } from "@monaco-editor/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Braces,
  ChevronRight,
  Eye,
  FileCode,
  Loader2,
  RotateCcw,
  Save,
  Send,
  Trash2,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import type {
  EmailTemplatePublic,
  EmailTemplateType,
  PopupPublic,
  TemplateTypeInfo,
  TemplateVariable,
} from "@/client"

import { EmailTemplatesService, PopupsService } from "@/client"
import { useTheme } from "@/components/theme-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Switch } from "@/components/ui/switch"
import useCustomToast from "@/hooks/useCustomToast"
import {
  UnsavedChangesDialog,
  useDirtyBlocker,
} from "@/hooks/useUnsavedChanges"
import { createErrorHandler } from "@/utils"

const HTML_SHELL_BEFORE_STYLE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{ subject }}</title>
    `

const HTML_SHELL_AFTER_STYLE = `
</head>
<body>
    `

const HTML_SHELL_CLOSING = `
</body>
</html>`

/**
 * Extract the editable parts (style block + body innerHTML) from a
 * complete HTML document, stripping the DOCTYPE/html/head/meta shell.
 */
function extractEditableContent(fullHtml: string): string {
  // If it doesn't look like a full document, return as-is (already extracted)
  if (!/<html[\s>]/i.test(fullHtml)) return fullHtml

  const styleMatch = fullHtml.match(/<style>([\s\S]*?)<\/style>/i)
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)

  const styleBlock = styleMatch ? `<style>${styleMatch[1]}</style>` : ""
  const bodyContent = bodyMatch?.[1]?.trim() ?? ""

  if (styleBlock && bodyContent) return `${styleBlock}\n\n${bodyContent}`
  if (bodyContent) return bodyContent
  return fullHtml
}

/**
 * Wrap the editable content (style + body) back into a full HTML document
 * so the backend can render it as-is.
 */
function reconstructFullHtml(editableContent: string): string {
  const styleMatch = editableContent.match(/<style>([\s\S]*?)<\/style>/i)
  const styleBlock = styleMatch
    ? `<style>${styleMatch[1]}</style>`
    : "<style></style>"

  const bodyContent = editableContent
    .replace(/<style>[\s\S]*?<\/style>/i, "")
    .trim()

  return `${HTML_SHELL_BEFORE_STYLE}${styleBlock}${HTML_SHELL_AFTER_STYLE}${bodyContent}${HTML_SHELL_CLOSING}`
}

interface EmailTemplateEditorProps {
  templateType: EmailTemplateType
  popupId: string
  existingTemplate?: EmailTemplatePublic
  typeInfo: TemplateTypeInfo
  onSave: () => void
}

export function EmailTemplateEditor({
  templateType,
  popupId,
  existingTemplate,
  typeInfo,
  onSave,
}: EmailTemplateEditorProps) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { resolvedTheme } = useTheme()

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subjectInputRef = useRef<HTMLInputElement>(null)
  const lastFocusedRef = useRef<"editor" | "subject">("editor")

  const [htmlContent, setHtmlContent] = useState(
    existingTemplate?.html_content
      ? extractEditableContent(existingTemplate.html_content)
      : "",
  )
  const [subject, setSubject] = useState(existingTemplate?.subject ?? "")
  const [isActive, setIsActive] = useState(existingTemplate?.is_active ?? true)
  const [previewHtml, setPreviewHtml] = useState("")
  const [sendTestOpen, setSendTestOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loadDefaultConfirmOpen, setLoadDefaultConfirmOpen] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [showPreview, setShowPreview] = useState(true)

  const isEdit = !!existingTemplate

  const { data: defaultTemplate } = useQuery({
    queryKey: ["email-template-default", templateType],
    queryFn: () =>
      EmailTemplatesService.getDefaultTemplate({
        templateType: templateType,
      }),
  })

  const { data: popupData } = useQuery({
    queryKey: ["popup", popupId],
    queryFn: () => PopupsService.getPopup({ popupId }),
  })

  const initialHtmlRef = useRef(
    existingTemplate?.html_content
      ? extractEditableContent(existingTemplate.html_content)
      : "",
  )
  const initialSubjectRef = useRef(existingTemplate?.subject ?? "")
  const initialIsActiveRef = useRef(existingTemplate?.is_active ?? true)

  const isDirty =
    htmlContent !== initialHtmlRef.current ||
    subject !== initialSubjectRef.current ||
    isActive !== initialIsActiveRef.current

  useEffect(() => {
    if (
      !existingTemplate &&
      defaultTemplate?.html_content &&
      !initialHtmlRef.current
    ) {
      initialHtmlRef.current = extractEditableContent(
        defaultTemplate.html_content,
      )
    }
  }, [defaultTemplate, existingTemplate])

  const blocker = useDirtyBlocker(
    isDirty,
    () =>
      htmlContent !== initialHtmlRef.current ||
      subject !== initialSubjectRef.current ||
      isActive !== initialIsActiveRef.current,
  )

  const resetDirtyState = () => {
    initialHtmlRef.current = htmlContent
    initialSubjectRef.current = subject
    initialIsActiveRef.current = isActive
  }

  const fetchPreview = useCallback(
    (content: string, subjectValue: string) => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
      previewTimerRef.current = setTimeout(async () => {
        if (!content.trim()) {
          setPreviewHtml("")
          return
        }
        try {
          const result = await EmailTemplatesService.previewTemplate({
            requestBody: {
              html_content: reconstructFullHtml(content),
              template_type: templateType,
              subject: subjectValue || undefined,
              preview_variables: getPopupPreviewVariables(popupData),
            },
          })
          setPreviewHtml(result.rendered_html)
        } catch {
          // Preview errors are non-critical
        }
      }, 500)
    },
    [templateType, popupData],
  )

  useEffect(() => {
    if (htmlContent) {
      fetchPreview(htmlContent, subject)
    }
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
    }
  }, [htmlContent, subject, fetchPreview])

  useEffect(() => {
    if (!existingTemplate && defaultTemplate?.html_content && !htmlContent) {
      setHtmlContent(extractEditableContent(defaultTemplate.html_content))
    }
  }, [defaultTemplate, existingTemplate, htmlContent])

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.onDidFocusEditorText(() => {
      lastFocusedRef.current = "editor"
    })
    setTimeout(() => {
      editor.getAction("editor.action.formatDocument")?.run()
    }, 300)
  }

  const insertVariable = (varName: string) => {
    const text = `{{ ${varName} }}`

    if (lastFocusedRef.current === "subject") {
      const input = subjectInputRef.current
      if (!input) return
      const start = input.selectionStart ?? input.value.length
      const end = input.selectionEnd ?? input.value.length
      const newValue =
        input.value.substring(0, start) + text + input.value.substring(end)
      setSubject(newValue)
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + text.length
        input.focus()
      }, 0)
      return
    }

    const editor = editorRef.current
    if (!editor) return
    editor.trigger("keyboard", "type", { text })
    editor.focus()
  }

  const loadDefault = () => {
    if (defaultTemplate?.html_content) {
      setHtmlContent(extractEditableContent(defaultTemplate.html_content))
      setTimeout(() => {
        editorRef.current?.getAction("editor.action.formatDocument")?.run()
      }, 100)
    }
  }

  const handleLoadDefault = () => {
    setLoadDefaultConfirmOpen(true)
  }

  const confirmLoadDefault = () => {
    loadDefault()
    setLoadDefaultConfirmOpen(false)
  }

  const openSendTest = () => {
    setSendTestOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: (data: {
      html_content: string
      subject?: string
      is_active: boolean
    }) =>
      EmailTemplatesService.createEmailTemplate({
        requestBody: {
          popup_id: popupId,
          template_type: templateType,
          html_content: data.html_content,
          subject: data.subject,
          is_active: data.is_active,
        },
      }),
    onSuccess: () => {
      showSuccessToast("Template created")
      resetDirtyState()
      queryClient.invalidateQueries({ queryKey: ["email-templates"] })
      onSave()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const updateMutation = useMutation({
    mutationFn: (data: {
      html_content?: string
      subject?: string
      is_active?: boolean
    }) =>
      EmailTemplatesService.updateEmailTemplate({
        templateId: existingTemplate!.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Template saved")
      resetDirtyState()
      queryClient.invalidateQueries({ queryKey: ["email-templates"] })
      onSave()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      EmailTemplatesService.deleteEmailTemplate({
        templateId: existingTemplate!.id,
      }),
    onSuccess: () => {
      showSuccessToast("Custom template deleted, reverting to default")
      resetDirtyState()
      queryClient.invalidateQueries({ queryKey: ["email-templates"] })
      setDeleteOpen(false)
      onSave()
    },
    onError: createErrorHandler(showErrorToast),
  })

  const sendTestMutation = useMutation({
    mutationFn: (email: string) =>
      EmailTemplatesService.sendTestEmail({
        requestBody: {
          html_content: reconstructFullHtml(htmlContent),
          template_type: templateType,
          subject: subject || undefined,
          to_email: email,
          custom_variables: getPopupPreviewVariables(popupData),
        },
      }),
    onSuccess: () => {
      showSuccessToast("Test email sent!")
      setSendTestOpen(false)
      setTestEmail("")
    },
    onError: createErrorHandler(showErrorToast),
  })

  const handleSave = () => {
    const fullHtml = reconstructFullHtml(htmlContent)
    if (isEdit) {
      updateMutation.mutate({
        html_content: fullHtml,
        subject: subject || undefined,
        is_active: isActive,
      })
    } else {
      createMutation.mutate({
        html_content: fullHtml,
        subject: subject || undefined,
        is_active: isActive,
      })
    }
  }

  const handleSendTest = () => {
    sendTestMutation.mutate(testEmail)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col gap-2">
      {/* Single toolbar: subject + all actions */}
      <div className="flex items-center gap-2">
        <Input
          ref={subjectInputRef}
          placeholder={typeInfo.default_subject}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onFocus={() => {
            lastFocusedRef.current = "subject"
          }}
          className="max-w-sm"
          aria-label="Subject line"
        />
        <div className="flex items-center gap-1.5">
          <Switch
            id="is-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="is-active" className="whitespace-nowrap text-xs">
            Active
          </Label>
        </div>

        <div className="mx-0.5 h-5 w-px bg-border" />

        <Button variant="outline" size="sm" onClick={handleLoadDefault}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Default
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <FileCode className="mr-1.5 h-3.5 w-3.5" />
              Code
            </>
          ) : (
            <>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Preview
            </>
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Braces className="mr-1.5 h-3.5 w-3.5" />
              Variables
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Click to insert at cursor
            </p>
            <VariableGroups
              variables={typeInfo.variables}
              popupData={popupData}
              onInsert={insertVariable}
            />
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        {isEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={openSendTest}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Test
        </Button>
        <LoadingButton size="sm" loading={isSaving} onClick={handleSave}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Save
        </LoadingButton>
      </div>

      {/* Editor + Preview */}
      <div className="min-h-0 flex-1 rounded-md border">
        {showPreview ? (
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <Editor
                height="100%"
                defaultLanguage="html"
                value={htmlContent}
                onChange={(value) => setHtmlContent(value ?? "")}
                onMount={handleEditorMount}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  wordWrap: "on",
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-auto bg-white">
                {previewHtml ? (
                  <iframe
                    srcDoc={previewHtml}
                    title="Email Preview"
                    className="h-full w-full border-0"
                    sandbox=""
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading preview...
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <Editor
            height="100%"
            defaultLanguage="html"
            value={htmlContent}
            onChange={(value) => setHtmlContent(value ?? "")}
            onMount={handleEditorMount}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: false },
              wordWrap: "on",
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        )}
      </div>

      {/* Send Test Dialog */}
      <Dialog open={sendTestOpen} onOpenChange={setSendTestOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify layout and styling. Popup variables
              will be filled with real data; other variables will show as
              placeholders.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="test-email">Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="you@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <LoadingButton
              loading={sendTestMutation.isPending}
              disabled={!testEmail}
              onClick={handleSendTest}
            >
              <Send className="mr-2 h-4 w-4" />
              Send
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Default Confirmation Dialog */}
      <Dialog
        open={loadDefaultConfirmOpen}
        onOpenChange={setLoadDefaultConfirmOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Default Template</DialogTitle>
            <DialogDescription>
              This will replace the current content with the default template.
              Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLoadDefaultConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLoadDefault}>
              Discard & Load Default
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Template</DialogTitle>
            <DialogDescription>
              This will delete the custom template and revert to the default.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleteMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <LoadingButton
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Navigation Dialog */}
      <UnsavedChangesDialog blocker={blocker} />
    </div>
  )
}

/** Map popup variable names to their corresponding PopupPublic field. */
const POPUP_FIELD_MAP: Record<string, keyof PopupPublic> = {
  popup_name: "name",
  popup_image_url: "image_url",
  popup_icon_url: "icon_url",
  popup_web_url: "web_url",
  popup_blog_url: "blog_url",
  popup_twitter_url: "twitter_url",
  popup_start_date: "start_date",
  popup_end_date: "end_date",
}

/** Extract real popup data as preview variables (popup_name, popup_start_date, etc.). */
function getPopupPreviewVariables(
  popup?: PopupPublic,
): Record<string, unknown> {
  if (!popup) return {}
  const vars: Record<string, unknown> = {}
  for (const [varName, field] of Object.entries(POPUP_FIELD_MAP)) {
    const value = popup[field]
    if (value == null) continue
    // Format date fields for display
    if (field === "start_date" || field === "end_date") {
      vars[varName] = new Date(value as string).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else {
      vars[varName] = value
    }
  }
  return vars
}

function VariableGroups({
  variables,
  popupData,
  onInsert,
}: {
  variables: Array<TemplateVariable>
  popupData?: PopupPublic
  onInsert: (name: string) => void
}) {
  const grouped = new Map<string, Array<TemplateVariable>>()
  for (const v of variables) {
    // Filter Event variables without content in the popup
    const popupField = POPUP_FIELD_MAP[v.name]
    if (popupField && popupData && !popupData[popupField]) continue

    const group = v.group ?? "General"
    if (!grouped.has(group)) grouped.set(group, [])
    grouped.get(group)!.push(v)
  }

  return (
    <div className="flex flex-col gap-1">
      {[...grouped.entries()].map(([group, vars]) => (
        <Collapsible key={group} defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-semibold text-muted-foreground hover:bg-accent/50 [&[data-state=open]>svg]:rotate-90">
            <ChevronRight className="h-3 w-3 transition-transform" />
            {group}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-wrap gap-1.5 py-1 pl-4">
              {vars.map((v) => (
                <Badge
                  key={v.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => onInsert(v.name)}
                  title={`${v.description}\n{{ ${v.name} }}`}
                >
                  {v.label ?? v.name}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
