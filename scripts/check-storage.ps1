$headers = @{
    "apikey" = "sb_publishable_bakYYZx5RQ8HlTBm3uQhig_V5wJUp0b"
    "Authorization" = "Bearer sb_publishable_bakYYZx5RQ8HlTBm3uQhig_V5wJUp0b"
    "Content-Type" = "application/json"
}
$url = "https://piixpofklisorumvrenm.supabase.co"

Write-Host "DreamSnap Storage Report"
Write-Host "========================"

try {
    $gallery = Invoke-RestMethod -Uri "$url/rest/v1/gallery_photos?select=id" -Headers $headers -Method GET
    Write-Host "Gallery photos: $($gallery.Count) records"
} catch {
    Write-Host "Gallery: 0 records"
}

try {
    $leads = Invoke-RestMethod -Uri "$url/rest/v1/leads?select=id" -Headers $headers -Method GET
    Write-Host "Leads: $($leads.Count) records"
} catch {
    Write-Host "Leads: 0 records"
}

try {
    $body = '{"prefix":"","limit":100}'
    $files = Invoke-RestMethod -Uri "$url/storage/v1/object/list/gallery-photos" -Headers $headers -Method POST -Body $body
    Write-Host "Storage files: $($files.Count)"
} catch {
    Write-Host "Storage: 0 files or empty"
}
