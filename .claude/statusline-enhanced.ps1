# Enhanced Claude Code Status Line with Context Window Tracking
# Read JSON input from stdin
$jsonInput = [Console]::In.ReadToEnd()
$input = $jsonInput | ConvertFrom-Json

# Basic info
$projectName = Split-Path -Leaf $input.workspace.current_dir
$modelName = $input.model.display_name
$outputStyle = $input.output_style.name

# Context window tracking
$transcriptPath = $input.transcript_path
$contextInfo = ""

if (Test-Path $transcriptPath) {
    try {
        # Read transcript and estimate tokens
        $content = Get-Content $transcriptPath -Raw -ErrorAction SilentlyContinue

        if ($content) {
            # Rough token estimation: ~4 characters per token for English text
            $charCount = $content.Length
            $estimatedTokens = [math]::Round($charCount / 4)

            # Model-specific context limits
            $contextLimit = switch -Wildcard ($input.model.id) {
                "*claude-3-5-sonnet*" { 200000 }
                "*claude-3-opus*" { 200000 }
                "*claude-3-haiku*" { 200000 }
                "*claude-sonnet-4*" { 200000 }
                default { 200000 }
            }

            $usagePercent = [math]::Round(($estimatedTokens / $contextLimit) * 100, 1)

            # Simple status indicator without ANSI colors to avoid encoding issues
            $statusIndicator = if ($usagePercent -lt 50) { "OK" } elseif ($usagePercent -lt 80) { "HIGH" } else { "FULL" }

            $contextInfo = " | $estimatedTokens/$contextLimit tokens ($usagePercent% $statusIndicator)"
        }
    } catch {
        # Silent error handling - just show basic info if context tracking fails
        $contextInfo = " | Context: N/A"
    }
}

# Output the status line
Write-Output "Claude Code ($modelName) | $projectName | $outputStyle$contextInfo"