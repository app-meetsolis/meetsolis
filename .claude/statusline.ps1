# Claude Code Status Line with Real-time Token Calculation
param()

try {
    # Read JSON input from stdin with proper encoding
    $inputStream = [Console]::OpenStandardInput()
    $reader = New-Object System.IO.StreamReader($inputStream, [System.Text.Encoding]::UTF8)
    $input = $reader.ReadToEnd()
    $reader.Close()

    # Parse JSON input
    if ([string]::IsNullOrWhiteSpace($input)) {
        throw "No input received from stdin"
    }

    $json = $input | ConvertFrom-Json

    # Extract basic info with better error handling
    $model = if ($json.model -and $json.model.display_name) { $json.model.display_name } else { 'Claude' }
    $dir = if ($json.workspace -and $json.workspace.current_dir) {
        Split-Path -Leaf $json.workspace.current_dir
    } else {
        Split-Path -Leaf (Get-Location).Path
    }
    $style = if ($json.output_style -and $json.output_style.name) { $json.output_style.name } else { 'default' }

    # Calculate real-time token usage
    $tokenInfo = "?"
    $maxTokens = "200K"

    # Debug: Check if transcript_path exists in JSON
    if ($json.transcript_path) {
        # Check if the file actually exists
        if (Test-Path $json.transcript_path -PathType Leaf) {
            try {
                # Read the transcript file with better error handling
                $transcriptContent = Get-Content $json.transcript_path -Raw -Encoding UTF8 -ErrorAction Stop

                if ($transcriptContent -and $transcriptContent.Length -gt 0) {
                    # Estimate tokens (rough approximation: 1 token ≈ 4 characters for English text)
                    # This is a simplified estimation - actual tokenization is more complex
                    $charCount = $transcriptContent.Length
                    $estimatedTokens = [Math]::Round($charCount / 4)

                    # Format token count
                    if ($estimatedTokens -lt 1000) {
                        $tokenInfo = "$estimatedTokens"
                    } elseif ($estimatedTokens -lt 1000000) {
                        $tokenInfo = "$([Math]::Round($estimatedTokens / 1000, 1))K"
                    } else {
                        $tokenInfo = "$([Math]::Round($estimatedTokens / 1000000, 1))M"
                    }

                    # Determine max tokens based on model
                    if ($json.model -and $json.model.id) {
                        if ($json.model.id -like "*claude-3-5-sonnet*" -or $json.model.id -like "*sonnet*") {
                            $maxTokens = "200K"
                        } elseif ($json.model.id -like "*claude-3-opus*" -or $json.model.id -like "*opus*") {
                            $maxTokens = "200K"
                        } elseif ($json.model.id -like "*claude-3-haiku*" -or $json.model.id -like "*haiku*") {
                            $maxTokens = "200K"
                        } else {
                            $maxTokens = "200K"  # Default assumption
                        }
                    }
                } else {
                    # File exists but is empty
                    $tokenInfo = "0"
                }
            } catch {
                # If there's an error reading the transcript, show error info
                $tokenInfo = "ERR"
            }
        } else {
            # File doesn't exist
            $tokenInfo = "NF"
        }
    } else {
        # No transcript path provided
        $tokenInfo = "NP"
    }

    # Output the status line
    Write-Output "Claude Code ($model) | $dir | $style | $tokenInfo/$maxTokens"

} catch {
    # Fallback in case of any errors - include error info for debugging
    $errorMsg = $_.Exception.Message
    Write-Output "Claude Code (Error: $($errorMsg.Substring(0, [Math]::Min(20, $errorMsg.Length)))) | | |"
}