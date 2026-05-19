Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Set-Location "d:\Google Drive PapsiSeminar\(14) WEBSITE\Github\PAPSI-main"

$descMap = @{
  'about.html' = 'PAPSI About page for members, educators, and training participants.'
  'certificate.html' = 'PAPSI Certificate page for members, educators, and training participants.'
  'conference.html' = 'PAPSI Conference page for members, educators, and training participants.'
  'course-single.html' = 'PAPSI Course Details page for members, educators, and training participants.'
  'courses.html' = 'PAPSI Courses page for members, educators, and training participants.'
  'event-single.html' = 'PAPSI Event Details page for members, educators, and training participants.'
  'membership.html' = 'PAPSI Membership page for members, educators, and training participants.'
  'notice.html' = 'PAPSI Notices page for members, educators, and training participants.'
  'notice-single.html' = 'PAPSI Notice Details page for members, educators, and training participants.'
  'promo.html' = 'PAPSI Promo page for members, educators, and training participants.'
  'research.html' = 'PAPSI Research page for members, educators, and training participants.'
  'scholarship.html' = 'PAPSI Scholarship page for members, educators, and training participants.'
  'searchmember.html' = 'PAPSI Search by Member page for members, educators, and training participants.'
  'searchtraining.html' = 'PAPSI Search by Training page for members, educators, and training participants.'
  'seminar.html' = 'PAPSI Seminar page for members, educators, and training participants.'
  'teacher.html' = 'PAPSI Teachers page for members, educators, and training participants.'
  'teacher-single.html' = 'PAPSI Teacher Details page for members, educators, and training participants.'
  'training.html' = 'PAPSI Training page for members, educators, and training participants.'
  'verification.html' = 'PAPSI Verification page for members, educators, and training participants.'
  'webinar.html' = 'PAPSI Webinar page for members, educators, and training participants.'
}

$themeBlock = @"
<!--
 // WEBSITE: https://themefisher.com
 // TWITTER: https://twitter.com/themefisher
 // FACEBOOK: https://www.facebook.com/themefisher
 // GITHUB: https://github.com/themefisher/
-->
"@

$mapsRegex = '(?m)^\s*<script\s+src="https://maps\.googleapis\.com/maps/api/js[^"]*"\s*></script>\s*\r?\n?'
$gmapRegex = '(?m)^\s*<script\s+src="plugins/google-map/gmap\.js"\s*></script>\s*\r?\n?'

foreach ($name in $descMap.Keys) {
  if (-not (Test-Path -LiteralPath $name)) { continue }

  $content = Get-Content -LiteralPath $name -Raw

  $content = $content.Replace($themeBlock, '')
  $content = $content.Replace('<meta name="author" content="Themefisher">', '<meta name="author" content="PAPSI">')
  $content = $content.Replace(
    '<meta name="description" content="Construction Html5 Template">',
    '<meta name="description" content="' + $descMap[$name] + '">'
  )
  $content = [regex]::Replace($content, $mapsRegex, '')
  $content = [regex]::Replace($content, $gmapRegex, '')

  [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $name), $content, [System.Text.UTF8Encoding]::new($false))
}

$archiveDir = Join-Path 'images' 'Unused Images'
if (-not (Test-Path -LiteralPath $archiveDir)) {
  New-Item -ItemType Directory -Path $archiveDir | Out-Null
}

$moveList = @(
  'images/favicon-0.png',
  'images/logo-0.png',
  'images/preloader-0.gif'
)

foreach ($src in $moveList) {
  if (Test-Path -LiteralPath $src) {
    Move-Item -LiteralPath $src -Destination $archiveDir -Force
  }
}
