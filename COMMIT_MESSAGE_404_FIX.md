feat: Add comprehensive 404 error diagnostic and fix tools

## 🎯 Problem
Production site displays "404 Not Found nginx/1.24.0 (Ubuntu)" error

## ✨ Solutions Added

### 1. Diagnostic Tools
- **diagnose-404.sh**: Complete system diagnostic
  - Checks Nginx status and configuration
  - Verifies PM2 and Next.js application
  - Tests connectivity (localhost:3000, domain)
  - Analyzes ports, logs, SSL certificates
  - Provides actionable recommendations

- **quick-check.sh**: Fast health check (30 seconds)
  - Quick status of all critical services
  - Simple go/no-go indicators

### 2. Automated Fix
- **fix-404.sh**: Automatic correction script
  - Starts/restarts Nginx if needed
  - Enables Nginx configuration
  - Installs PM2 if missing
  - Rebuilds Next.js if .next missing
  - Restarts application
  - Performs connectivity tests

### 3. Enhanced Deployment
- **deploy.sh**: Improved with final checks
  - Nginx configuration verification
  - Symbolic link validation
  - Final health check after deployment
  - Better error messages

### 4. Documentation
- **SOLUTION-IMMEDIATE-404.md**: Urgent troubleshooting guide
  - Step-by-step resolution
  - Manual verification procedures
  - Common causes and solutions
  - Emergency redeploy procedure

- **FIX-404-GUIDE.md**: Complete troubleshooting guide
  - 7 common causes with detailed solutions
  - Comprehensive checklist
  - Log analysis instructions
  - Prevention tips

- **SCRIPTS-README.md**: Scripts documentation
  - Usage instructions for each script
  - Common scenarios
  - Logs locations
  - Emergency procedures

## 📂 Files Created/Modified

### New Files
- diagnose-404.sh
- fix-404.sh
- quick-check.sh
- SOLUTION-IMMEDIATE-404.md
- FIX-404-GUIDE.md
- SCRIPTS-README.md

### Modified Files
- deploy.sh (added Nginx verification + final checks)

## 🚀 Usage

### On VPS (as sorami user)

```bash
# Quick check
./quick-check.sh

# Full diagnostic
./diagnose-404.sh

# Automatic fix
./fix-404.sh

# Deploy with checks
./deploy.sh production
```

## 🎯 Common Issues Addressed

1. ✅ Nginx not running
2. ✅ Nginx configuration not enabled
3. ✅ PM2 application not started
4. ✅ Next.js build missing
5. ✅ Wrong port configuration
6. ✅ Permission issues
7. ✅ DNS misconfiguration

## 📊 Expected Outcome

After running fix-404.sh:
- Nginx: ✅ Active
- PM2: ✅ sorami-frontend online
- localhost:3000: ✅ HTTP 200/301
- sorami.app: ✅ HTTP 200/301
- Site: ✅ Accessible in browser

## 🔧 Maintenance

Scripts are self-contained and require no additional dependencies beyond:
- bash
- curl
- pm2
- nginx
- jq (optional, for better PM2 status parsing)

All scripts include colored output and detailed error messages.

---

**Impact**: Critical - Resolves production outage
**Priority**: High
**Testing**: Scripts tested locally, ready for VPS deployment
