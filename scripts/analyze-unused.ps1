$ErrorActionPreference = 'SilentlyContinue'
$root = (Get-Location).Path

$dirs = 'app', 'components', 'hooks', 'lib', 'contexts', 'resources', 'types', 'prisma', 'scripts'
$allFiles = @()
foreach ($d in $dirs) {
    $p = Join-Path $root $d
    if (Test-Path $p) {
        $allFiles += Get-ChildItem -Path $p -Recurse -File -Include *.ts, *.tsx, *.js, *.jsx, *.cjs |
        Where-Object { $_.FullName -notmatch 'prisma\\generated' }
    }
}
Get-ChildItem -Path $root -File -Include *.ts, *.tsx, *.js, *.jsx, *.cjs | ForEach-Object { $allFiles += $_ }

$fileList = @()
$isSource = @{}
$fileSet = @{}
foreach ($f in $allFiles) {
    $rel = $f.FullName.Substring($root.Length + 1)
    $fileList += $rel
    $fileSet[$rel.Replace('/', '\')] = $true
    if ($rel -match '\.(ts|tsx)$') { $isSource[$rel] = $true }
}

# ---- Collect import specifiers per file ----
$fileImports = @{}
$importRe = [regex]"(?:from\s*|import\s*\(\s*|require\s*\(\s*|import\s+[^'`"\r\n]*?from\s*)['`"]([^'`"]+)['`"]"

foreach ($f in $allFiles) {
    if ($f.Extension -notin @('.ts', '.tsx', '.js', '.jsx')) { continue }
    $rel = $f.FullName.Substring($root.Length + 1)
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $list = New-Object System.Collections.Generic.List[string]
    foreach ($m in $importRe.Matches($content)) {
        $spec = $m.Groups[1].Value
        if ($spec -notmatch '\S') { continue }
        if ($spec -match '\.(css|scss|less|sass|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|json|md)$') { continue }
        if (($spec -split '/').Count -lt 2 -and -not $spec.StartsWith('.')) { continue }
        if ($spec.StartsWith('.') -or $spec.StartsWith('@/')) {
            $list.Add($spec)
        }
    }
    $fileImports[$rel] = $list
}

# ---- Resolve specifiers to target rel paths ----
$used = @{}
foreach ($f in $fileList) {
    if (-not $fileImports.ContainsKey($f)) { continue }
    foreach ($spec in $fileImports[$f]) {
        $target = $null
        if ($spec.StartsWith('@/')) {
            $target = $spec.Substring(2)
        }
        elseif ($spec.StartsWith('.')) {
            $dir = Split-Path $f -Parent
            $combined = if ($dir) { Join-Path $dir $spec } else { $spec }
            $combined = [System.IO.Path]::GetFullPath((Join-Path $root $combined))
            if ($combined.StartsWith($root)) {
                $target = $combined.Substring($root.Length + 1)
            }
        }
        if (-not $target) { continue }
        $target = $target.Replace('\', '/')
        $hasExt = $target -match '\.(ts|tsx|js|jsx|cjs)$'

        if ($hasExt) {
            $key = $target.Replace('/', '\')
            if ($fileSet.ContainsKey($key)) { $used[$key] = $true }
        }
        else {
            # Resolve extensionless imports and folder imports to real files.
            foreach ($ext in @('tsx', 'ts', 'jsx', 'js')) {
                $fileKey = "$target.$ext".Replace('/', '\')
                $indexKey = "$target/index.$ext".Replace('/', '\')
                if ($fileSet.ContainsKey($fileKey)) { $used[$fileKey] = $true }
                if ($fileSet.ContainsKey($indexKey)) { $used[$indexKey] = $true }
            }
        }
    }
}

# Also mark files that are imported indirectly via a folder that holds them
# (already handled by index resolution above).

# ---- Classification ----
$frameworkUsed = @{}  # app route files
foreach ($f in $fileList) {
    if ($f -match '^app\\.*(page|layout|loading|route|template|error|not-found|global-error|opengraph-image|twitter-image|icon|apple-icon|sitemap|robots|manifest)\.(ts|tsx)$') {
        $frameworkUsed[$f] = $true
    }
}

$unused = @()
foreach ($f in $fileList) {
    if ($used.ContainsKey($f)) { continue }
    if ($frameworkUsed.ContainsKey($f)) { continue }
    # next-env.d.ts, config-ish files
    if ($f -match '^(next-env\.d\.ts|middleware\.ts|postcss\.config\.js|prisma\.config\.ts|tsconfig\.json|\.eslintrc\.json|\.prettierrc|\.prettierignore|\.gitignore|\.env.*)$') { continue }
    if ($f -match '\.(d\.ts)$' -and $f -match '^types\\.*(css|next|next-auth)\.d\.ts$') { continue }
    $unused += $f
}

$unused | Sort-Object
Write-Output ''
Write-Output ('TOTAL_FILES_NOT_IMPORTED: ' + $unused.Count)