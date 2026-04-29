param(
    [string]$Root = ".",
    [int]$MaxLines = 300,
    [string[]]$IncludeExtensions = @(
        ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".scss", ".json", ".md", ".ps1", ".py"
    ),
    [string[]]$ExcludeDirectories = @(
        "node_modules", "dist", "build", ".git", "coverage", ".next", ".turbo"
    ),
    [string]$OutFile = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-CommentLineCount {
    param(
        [Parameter(Mandatory = $true)][string]$Extension,
        [AllowNull()][AllowEmptyString()][object]$Content
    )

    $ext = $Extension.ToLowerInvariant()
    $count = 0
    $lines = @()
    if ($null -ne $Content) {
        $lines = @($Content)
    }

    foreach ($line in $lines) {
        $trim = ([string]$line).Trim()

        if ($ext -in @(".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".scss")) {
            if (
                $trim -match "^//" -or
                $trim -match "^/\*" -or
                $trim -match "^\*" -or
                $trim -match "^\*/"
            ) {
                $count++
            }
            continue
        }

        if ($ext -eq ".ps1") {
            if ($trim -match "^#" -or $trim -match "^<#" -or $trim -match "^#>") {
                $count++
            }
            continue
        }

        if ($ext -eq ".py") {
            if ($trim -match "^#") {
                $count++
            }
            continue
        }

        if ($ext -eq ".md") {
            if ($trim -match "^<!--" -or $trim -match "-->$") {
                $count++
            }
            continue
        }
    }

    return $count
}

function Get-NormalizedLines {
    param(
        [Parameter(Mandatory = $true)][string]$Extension,
        [AllowNull()][AllowEmptyString()][object]$Content
    )

    $ext = $Extension.ToLowerInvariant()
    $normalized = @()
    $lines = @()
    if ($null -ne $Content) {
        $lines = @($Content)
    }

    foreach ($line in $lines) {
        $trim = ([string]$line).Trim()
        if ($trim -eq "") {
            continue
        }

        $isComment = $false
        if ($ext -in @(".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".scss")) {
            $isComment = (
                $trim -match "^//" -or
                $trim -match "^/\*" -or
                $trim -match "^\*" -or
                $trim -match "^\*/"
            )
        } elseif ($ext -eq ".ps1") {
            $isComment = ($trim -match "^#" -or $trim -match "^<#" -or $trim -match "^#>")
        } elseif ($ext -eq ".py") {
            $isComment = ($trim -match "^#")
        } elseif ($ext -eq ".md") {
            $isComment = ($trim -match "^<!--" -or $trim -match "-->$")
        }

        if (-not $isComment) {
            $normalized += $trim
        }
    }

    return $normalized
}

function Test-IsExcludedPath {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string[]]$ExcludeDirectories
    )

    foreach ($dir in $ExcludeDirectories) {
        $escaped = [Regex]::Escape($dir)
        if ($Path -match "(^|[\\/])$escaped([\\/]|$)") {
            return $true
        }
    }

    return $false
}

$resolvedRoot = Resolve-Path -Path $Root
$files = Get-ChildItem -Path $resolvedRoot -Recurse -File | Where-Object {
    $ext = $_.Extension.ToLowerInvariant()
    $include = $IncludeExtensions -contains $ext
    $excluded = Test-IsExcludedPath -Path $_.FullName -ExcludeDirectories $ExcludeDirectories
    return $include -and -not $excluded
}

$reportItems = foreach ($file in $files) {
    $content = @(Get-Content -Path $file.FullName)
    $lineCount = $content.Length
    $commentLineCount = Get-CommentLineCount -Extension $file.Extension -Content $content
    $normalizedLines = Get-NormalizedLines -Extension $file.Extension -Content $content
    $normalizedText = $normalizedLines -join "`n"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($normalizedText)
    $hashBytes = [System.Security.Cryptography.SHA256]::HashData($bytes)
    $hash = [Convert]::ToHexString($hashBytes)

    [PSCustomObject]@{
        File = $file.FullName.Substring($resolvedRoot.Path.Length).TrimStart("\", "/")
        Lines = $lineCount
        CommentLines = $commentLineCount
        ExceedsLineLimit = $lineCount -gt $MaxLines
        ContentHash = $hash
    }
}

$oversized = @($reportItems | Where-Object { $_.ExceedsLineLimit } | Sort-Object Lines -Descending)
$duplicateGroups = @($reportItems | Group-Object ContentHash | Where-Object { $_.Count -gt 1 } | Sort-Object Count -Descending)

Write-Output "Structural audit root: $($resolvedRoot.Path)"
Write-Output "Files scanned: $($reportItems.Count)"
Write-Output "Files above $MaxLines lines: $($oversized.Count)"
Write-Output "Duplicate file groups by normalized hash: $($duplicateGroups.Count)"
Write-Output ""

if ($oversized.Count -gt 0) {
    Write-Output "Oversized files:"
    $oversized | Select-Object File, Lines, CommentLines | Format-Table -AutoSize | Out-String | Write-Output
} else {
    Write-Output "Oversized files: none"
}

if ($duplicateGroups.Count -gt 0) {
    Write-Output "Potential duplicate files:"
    foreach ($group in $duplicateGroups) {
        Write-Output "- Hash: $($group.Name) (files: $($group.Count))"
        foreach ($entry in $group.Group) {
            Write-Output "  - $($entry.File)"
        }
    }
} else {
    Write-Output "Potential duplicate files: none"
}

$duplicateObjects = foreach ($group in $duplicateGroups) {
    [PSCustomObject]@{
        hash = $group.Name
        count = $group.Count
        files = @($group.Group | Select-Object -ExpandProperty File)
    }
}

$report = [PSCustomObject]@{
    generated_at = (Get-Date).ToString("s")
    root = $resolvedRoot.Path
    max_lines = $MaxLines
    files_scanned = $reportItems.Count
    oversized_files = @($oversized | Select-Object File, Lines, CommentLines)
    duplicate_file_groups = @($duplicateObjects)
}

if ($OutFile -ne "") {
    $report | ConvertTo-Json -Depth 8 | Set-Content -Path $OutFile -Encoding UTF8
    Write-Output ""
    Write-Output "Report written to: $OutFile"
}
