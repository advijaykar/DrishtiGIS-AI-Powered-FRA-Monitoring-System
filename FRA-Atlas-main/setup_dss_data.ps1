# ========================================
# Decision Support Engine Data Setup Script
# ========================================

Write-Host "Setting up Decision Support Engine sample data..." -ForegroundColor Green

# Check if Supabase CLI is available
if (Get-Command supabase -ErrorAction SilentlyContinue) {
    Write-Host "Found Supabase CLI. Running migrations..." -ForegroundColor Blue
    
    # Run the main DSS data migration
    Write-Host "1. Adding comprehensive DSS sample data..." -ForegroundColor Yellow
    supabase db push --file "supabase/migrations/add_dss_sample_data.sql"
    
    # Run the user profiles migration
    Write-Host "2. Adding user profiles and additional data..." -ForegroundColor Yellow
    supabase db push --file "supabase/migrations/add_user_profiles.sql"
    
    Write-Host "✅ DSS data setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Decision Support Engine now includes:" -ForegroundColor Cyan
    Write-Host "• 19+ patta holders from 7 different states" -ForegroundColor White
    Write-Host "• 18+ government schemes with detailed eligibility criteria" -ForegroundColor White
    Write-Host "• Realistic scheme recommendations based on land use and tribal communities" -ForegroundColor White
    Write-Host "• Community feedback from beneficiaries" -ForegroundColor White
    Write-Host "• User profiles for admin, officer, and user roles" -ForegroundColor White
    Write-Host "• Analytics data and dashboard views" -ForegroundColor White
    Write-Host "• AI-detected assets with verification status" -ForegroundColor White
    
} else {
    Write-Host "Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can run these SQL files manually in your Supabase dashboard:" -ForegroundColor Blue
    Write-Host "1. supabase/migrations/add_dss_sample_data.sql" -ForegroundColor White
    Write-Host "2. supabase/migrations/add_user_profiles.sql" -ForegroundColor White
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Magenta
Write-Host "1. Visit your application's DSS page to see the new data" -ForegroundColor White
Write-Host "2. Test the 'Select Patta Holder for Analysis' feature" -ForegroundColor White
Write-Host "3. Try the 'Analyze Eligibility' button to see scheme recommendations" -ForegroundColor White
Write-Host "4. Check the analytics and feedback sections" -ForegroundColor White
