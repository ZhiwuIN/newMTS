param(
    [string]$AdbPath,
    [string]$Serial
)

$ErrorActionPreference = 'Stop'
if (-not $AdbPath) {
    $adbCommand = Get-Command adb -ErrorAction SilentlyContinue
    if ($adbCommand) { $AdbPath = $adbCommand.Source }
    elseif (Test-Path -LiteralPath 'D:\HBuilderX\plugins\launcher-tools\tools\adbs\adb.exe') {
        $AdbPath = 'D:\HBuilderX\plugins\launcher-tools\tools\adbs\adb.exe'
    }
}
if (-not $AdbPath -or -not (Test-Path -LiteralPath $AdbPath)) {
    throw 'ADB was not found. Pass -AdbPath with the path to adb.exe.'
}

$connected = @(& $AdbPath devices -l | ForEach-Object {
    if ($_ -match '^(\S+)\s+device(?:\s|$)') { $Matches[1] }
})
if ($Serial) {
    if ($Serial -notin $connected) { throw 'The selected device is not connected or authorized.' }
} elseif ($connected.Count -eq 1) {
    $Serial = $connected[0]
} elseif ($connected.Count -eq 0) {
    throw 'No authorized Android device is connected. Connect your test phone and enable USB debugging.'
} else {
    throw 'More than one Android device is connected. Select one with -Serial.'
}
$deviceArgs = @('-s', $Serial)

function Read-Adb([string[]]$AdbArgs) {
    try {
        $result = & $AdbPath @deviceArgs @AdbArgs 2>&1
        return ($result | Out-String).Trim()
    } catch {
        return ('Capture unavailable for this command: ' + $_.Exception.Message)
    }
}

$outputDir = Join-Path ([System.IO.Path]::GetTempPath()) ('uni-ui-audit-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
$metadata = [ordered]@{}
foreach ($property in @('ro.product.brand', 'ro.product.model', 'ro.build.version.release', 'ro.build.version.sdk', 'persist.sys.locale')) {
    $metadata[$property] = Read-Adb @('shell', 'getprop', $property)
}
$metadata['system_locales'] = Read-Adb @('shell', 'settings', 'get', 'system', 'system_locales')
$metadata['accessibility_enabled'] = Read-Adb @('shell', 'settings', 'get', 'secure', 'accessibility_enabled')
$metadata['enabled_accessibility_services'] = Read-Adb @('shell', 'settings', 'get', 'secure', 'enabled_accessibility_services')
foreach ($setting in @('spell_checker_enabled', 'selected_spell_checker', 'selected_spell_checker_subtype', 'default_input_method')) {
    $metadata[$setting] = Read-Adb @('shell', 'settings', 'get', 'secure', $setting)
}
$metadata | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outputDir 'environment.json') -Encoding UTF8

Read-Adb @('shell', 'dumpsys', 'textservices') |
    Set-Content -LiteralPath (Join-Path $outputDir 'spellchecker.txt') -Encoding UTF8
Read-Adb @('shell', 'dumpsys', 'webviewupdate') |
    Set-Content -LiteralPath (Join-Path $outputDir 'webview.txt') -Encoding UTF8
Read-Adb @('shell', 'cmd', 'appops', 'query-op', 'SYSTEM_ALERT_WINDOW', 'allow') |
    Set-Content -LiteralPath (Join-Path $outputDir 'overlay-permission.txt') -Encoding UTF8

$windows = Read-Adb @('shell', 'dumpsys', 'window', 'windows')
$windows -split '\r?\n' | Where-Object {
    $_ -match 'Window #|mOwnerUid|mAttrs=|mViewVisibility|mHasSurface|isOnScreen|isVisible|mCurrentFocus|mFocusedApp'
} | Set-Content -LiteralPath (Join-Path $outputDir 'window-metadata.txt') -Encoding UTF8

# Only retain toast records, not the notification list or its message contents.
$notificationState = Read-Adb @('shell', 'dumpsys', 'notification')
$toastRecords = @($notificationState -split '\r?\n' | Where-Object { $_ -match '\b(?:TextToastRecord|CustomToastRecord|ToastRecord)\b' })
if ($toastRecords.Count -eq 0) { $toastRecords = @('No active toast record was returned at capture time.') }
$toastRecords | Set-Content -LiteralPath (Join-Path $outputDir 'active-toasts.txt') -Encoding UTF8

Write-Output ('Read-only UI audit saved to: ' + $outputDir)
Write-Output 'Overlay permission alone does not prove that an app displayed the unexpected message.'
