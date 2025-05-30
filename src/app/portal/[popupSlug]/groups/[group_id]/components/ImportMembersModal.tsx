import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { api } from '@/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/modal'
import { FileUp, Upload, AlertCircle, Check, X, Info, HelpCircle, Download } from 'lucide-react'
import { read, utils } from 'xlsx'
import { GENDER_OPTIONS } from '@/constants/util'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'

interface ImportMembersModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface MemberData {
  first_name: string
  last_name: string
  email: string
  telegram?: string
  organization?: string
  role?: string
  gender?: string
}

const ImportMembersModal = ({ open, onClose, onSuccess }: ImportMembersModalProps) => {
  const { group_id } = useParams() as { group_id: string }
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<MemberData[]>([])
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'validated' | 'error'>('idle')
  const [updateExisting, setUpdateExisting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFile(null)
    setParsedData([])
    setValidationError(null)
    setUploadStatus('idle')
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const validateFileType = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.macroEnabled.12', // .xlsm
      'application/vnd.oasis.opendocument.spreadsheet', // .ods
      'application/vnd.oasis.opendocument.spreadsheet-template', // .ots
      'text/csv' // .csv
    ]
    return validTypes.includes(file.type)
  }

  const readFileData = async (file: File): Promise<MemberData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const json = utils.sheet_to_json<MemberData>(worksheet)
          resolve(json)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = (error) => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  const validateData = (data: any[]): { valid: boolean, message: string | null, data: MemberData[] } => {
    if (data.length === 0) {
      return { valid: false, message: 'The file is empty', data: [] }
    }

    const validatedData: MemberData[] = []
    const errors: string[] = []
    
    // Get valid gender values
    const validGenderValues = GENDER_OPTIONS.map(option => option.value);

    data.forEach((row, index) => {
      // Check required fields
      if (!row.first_name) errors.push(`Row ${index + 1}: Missing first name`)
      if (!row.last_name) errors.push(`Row ${index + 1}: Missing last name`)
      if (!row.email) {
        errors.push(`Row ${index + 1}: Missing email`)
      } else if (!/^\S+@\S+\.\S+$/.test(row.email)) {
        errors.push(`Row ${index + 1}: Invalid email format - ${row.email}`)
      }

      // Validate gender if provided
      if (row.gender && !validGenderValues.includes(row.gender)) {
        errors.push(`Row ${index + 1}: Invalid gender value "${row.gender}". Valid options are: ${validGenderValues.join(', ')}`)
      }

      // Validate data types
      if (row.first_name && typeof row.first_name !== 'string') errors.push(`Row ${index + 1}: First name must be text`)
      if (row.last_name && typeof row.last_name !== 'string') errors.push(`Row ${index + 1}: Last name must be text`)

      // Add to validated data if no errors
      if (!errors.find(e => e.startsWith(`Row ${index + 1}:`))) {
        validatedData.push({
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          telegram: row.telegram || undefined,
          organization: row.organization || undefined,
          role: row.role || undefined,
          gender: row.gender || undefined
        })
      }
    })

    if (errors.length > 0) {
      return { 
        valid: false, 
        message: `There are issues with your file:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more issues` : ''}`, 
        data: validatedData 
      }
    }

    return { valid: true, message: null, data: validatedData }
  }

  const processDrop = async (file: File) => {
    if (!validateFileType(file)) {
      setValidationError('Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
      setUploadStatus('error')
      return
    }

    setFile(file)
    setUploadStatus('validating')
    
    try {
      const data = await readFileData(file)
      const validation = validateData(data)
      
      if (validation.valid) {
        setParsedData(validation.data)
        setUploadStatus('validated')
        setValidationError(null)
      } else {
        setValidationError(validation.message)
        setParsedData(validation.data)
        setUploadStatus('error')
      }
    } catch (error) {
      console.error('Error reading file:', error)
      setValidationError('Failed to read file. Please ensure it is a valid CSV or Excel file.')
      setUploadStatus('error')
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await processDrop(files[0])
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processDrop(files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No valid data to import')
      return
    }

    setIsSubmitting(true)

    try {
      await api.post(`/groups/${group_id}/members/batch`, { 
        members: parsedData,
        update_existing: updateExisting 
      }).then((res) => {  
        if (res.status >= 200 && res.status < 300) {
          const failedMembers = Array.isArray(res.data) ? res.data.filter((member: any) => member.success === false) : [];
          
          if (failedMembers.length > 0) {
            // Mostrar errores para cada miembro fallido
            failedMembers.forEach((member: any) => {
              toast.error(`Error for ${member.email}: ${member.err_msg}`);
            });
          } else {
            // Todos los miembros fueron importados exitosamente
            toast.success(`Successfully imported ${parsedData.length} members`);
          }
          
          if (onSuccess) {
            onSuccess();
          } else {
            onClose();
          }
        } else {
          toast.error(res.data.detail || 'Failed to import members')
        }
      })
    } catch (error: any) {
      console.error('Error importing members:', error)
      toast.error(error.response?.data?.message || 'Failed to import members')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearFile = () => {
    resetState()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownloadTemplate = () => {
    // Define required and optional columns
    const headers = ['first_name', 'last_name', 'email', 'telegram', 'organization', 'role', 'gender'];
    
    // Create CSV content
    const csvContent = headers.join(',') + '\n' + 
                       'John,Doe,john.doe@example.com,@johndoe,Company Name,Member,Male';
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set download attributes
    link.href = url;
    link.setAttribute('download', 'members_template.csv');
    
    // Append to document, click and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetState()
        onClose()
      }}
      title="Import Members"
      description={
        <>
          <span>Upload a CSV or Excel file with member data to quickly add multiple members at once. 
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownloadTemplate();
                  }}
                  className="text-primary hover:underline inline-flex items-center text-sm font-medium cursor-pointer ml-1"
                >
                  Download template file.
                </a>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Download a CSV template with all required columns (first_name, last_name, email) and optional fields.</p>
              </TooltipContent>
            </Tooltip>
          </span>
        </>
      }
    >
      <div className="space-y-6">
        {/* File upload area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx,.xls,.xlsm,.ods,.ots"
            onChange={handleFileInputChange}
          />
          
          {!file && (
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium">
                Drop your document here, or <span className="text-primary">click to browse</span>
              </p>
              <p className="text-xs text-gray-500">Supported formats: .csv, .xls, .xlsx, .xlsm, .ods, .ots</p>
            </div>
          )}

          {file && (
            <div className="flex flex-col items-center justify-center gap-2">
              <FileUp className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium break-all">{file.name}</p>
              <div className="flex items-center gap-2">
                {uploadStatus === 'validating' && <p className="text-xs text-amber-500">Validating...</p>}
                {uploadStatus === 'validated' && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Valid file with {parsedData.length} members
                  </p>
                )}
                {uploadStatus === 'error' && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Invalid file
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Validation error message */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">Validation errors found</p>
                <pre className="text-xs whitespace-pre-line text-red-700">{validationError}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Update existing members checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="updateExisting"
            checked={updateExisting}
            onCheckedChange={(checked: boolean) => setUpdateExisting(checked)}
          />
          <label htmlFor="updateExisting" className="text-sm font-medium text-gray-700">
            Update existing members
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>If checked, existing members will be updated with new data from the file. If unchecked, existing members will be skipped.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between gap-3">
          <div>
            {file && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFile}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Clear
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={uploadStatus !== 'validated' || isSubmitting || parsedData.length === 0}
              onClick={handleImport}
            >
              {isSubmitting ? 'Importing...' : `Import ${parsedData.length || ''} Members`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ImportMembersModal 