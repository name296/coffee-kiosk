# 아이콘 인덱스 자동 생성 스크립트

$iconDir = Resolve-Path (Join-Path $PSScriptRoot "..\src\assets\icons")
$indexPath = Join-Path $iconDir "index.js"

Write-Host "Scanning: $iconDir" -ForegroundColor Cyan

# 기존 아이콘 목록 파싱
$oldIcons = @()
if (Test-Path $indexPath) {
    $oldContent = Get-Content $indexPath -Raw
    $pattern = "'([^']+)':"
    $oldIcons = [regex]::Matches($oldContent, $pattern) | ForEach-Object { $_.Groups[1].Value }
}

# 현재 SVG 파일 스캔
$files = Get-ChildItem -Path $iconDir -Filter "*.svg" | Sort-Object Name
$newIcons = $files | ForEach-Object { $_.BaseName }

# 변경 사항 감지
$added = $newIcons | Where-Object { $oldIcons -notcontains $_ }
$removed = $oldIcons | Where-Object { $newIcons -notcontains $_ }

# 변경 사항 출력
Write-Host ""
Write-Host "Changes:" -ForegroundColor Yellow
if ($added) {
    Write-Host "  + Added: $($added.Count)" -ForegroundColor Green
    $added | ForEach-Object { Write-Host "    + $_" -ForegroundColor Green }
}
if ($removed) {
    Write-Host "  - Removed: $($removed.Count)" -ForegroundColor Red
    $removed | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}
Write-Host "  Total: $($files.Count) icons" -ForegroundColor Cyan

# iconPaths 생성
$lines = @()
foreach ($file in $files) {
    $key = $file.BaseName
    $lines += "  '$key': '$($file.Name)'"
}

$iconPathsBlock = $lines -join ",`n"

# 템플릿 읽기
$templatePath = Join-Path $PSScriptRoot "icon-index-template.js"
$template = [System.IO.File]::ReadAllText($templatePath, [System.Text.Encoding]::UTF8)

# 교체
$output = $template.Replace('{{ICON_PATHS}}', $iconPathsBlock)
$output = $output.Replace('{{ICON_COUNT}}', $files.Count.ToString())
$output = $output.Replace('{{TIMESTAMP}}', (Get-Date -Format "yyyy-MM-ddTHH:mm:ss"))
$output = $output.Replace('{{ICON_NAMES}}', (($files | ForEach-Object { $_.BaseName }) -join ', '))

# 출력
$outputPath = Join-Path $iconDir "index.js"
[System.IO.File]::WriteAllText($outputPath, $output, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "Done! Generated: $outputPath" -ForegroundColor Green