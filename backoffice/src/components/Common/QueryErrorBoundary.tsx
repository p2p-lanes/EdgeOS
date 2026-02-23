import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { AlertCircle, FileQuestion, RefreshCw } from "lucide-react"
import { Component, type ErrorInfo, type ReactNode } from "react"
import { EmptyState } from "@/components/Common/EmptyState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryInner extends Component<
  Props & { onReset: () => void },
  State
> {
  constructor(props: Props & { onReset: () => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Query error caught by boundary:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Check if it's a "not found" or "no data" type error
      const errorMessage = this.state.error?.message || ""
      const is404 =
        errorMessage.includes("404") ||
        errorMessage.includes("Not Found") ||
        errorMessage.includes("not found")

      if (is404) {
        return (
          <EmptyState
            icon={FileQuestion}
            title="Not found"
            description="The requested resource could not be found."
          />
        )
      }

      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {errorMessage || "Something went wrong while fetching data."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="ml-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

export function QueryErrorBoundary({ children, fallback }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundaryInner onReset={reset} fallback={fallback}>
          {children}
        </ErrorBoundaryInner>
      )}
    </QueryErrorResetBoundary>
  )
}
