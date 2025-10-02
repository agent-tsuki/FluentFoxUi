# FileCraft API Connection Troubleshooting Guide

## Issue: ERR_BLOCKED_BY_CLIENT / Network Error

### Symptoms
- `AxiosError: ERR_BLOCKED_BY_CLIENT`
- `AxiosError: ERR_NETWORK`
- `net::ERR_BLOCKED_BY_CLIENT` in browser console
- API works from command line but fails in browser

### Root Causes & Solutions

#### 1. **Ad Blockers (Most Common)**
**Problem**: Browser extensions like uBlock Origin, AdBlock Plus block requests
**Solutions**:
- **Disable ad blocker** for `localhost:3001` and `localhost:8080`
- **Add exception** in ad blocker settings:
  - uBlock Origin: Click icon → Click "Disable on this site"
  - AdBlock Plus: Settings → Whitelisted websites → Add `localhost`

#### 2. **Browser Security Policies**
**Problem**: Chromium/Chrome security features block localhost requests
**Solutions**:
- **Try different browser**: Firefox, Safari, Edge
- **Disable security flags** (Chrome): 
  ```bash
  google-chrome --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir=/tmp/chrome_dev
  ```

#### 3. **Firewall/Antivirus**
**Problem**: System firewall blocking localhost connections
**Solutions**:
- **Windows**: Windows Defender Firewall → Allow app through firewall
- **Linux**: `sudo ufw allow 8080` and `sudo ufw allow 3001`
- **Mac**: System Preferences → Security & Privacy → Firewall

#### 4. **Corporate Network/Proxy**
**Problem**: Corporate proxy blocking requests
**Solutions**:
- **Try mobile hotspot** to bypass corporate network
- **Configure proxy** settings in browser
- **Contact IT** to whitelist localhost development

### Quick Tests

#### Test 1: Direct API Access
```bash
curl http://localhost:8080/health
```
**Expected**: `{"status":true,"message":"FileCraft is running"...}`

#### Test 2: Browser API Test
Open: `http://localhost:3001/api-test.html`
- Click "Test Health Endpoint"
- Click "Test Image Conversion"

#### Test 3: Network Tab
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try image conversion
4. Look for failed requests and error details

### Applied Fixes in Code

1. **Added axios interceptors** for detailed logging
2. **Implemented fetch fallback** when axios fails
3. **Added connection test** function
4. **Enhanced error handling** with specific error types

### Debug Information

Check browser console for:
```
🚀 API Request: [request details]
❌ Response Error: [error details]
🔄 Trying fetch fallback: [fallback attempt]
```

### Environment Check

Ensure these services are running:
- ✅ FastAPI Backend: `http://localhost:8080`
- ✅ Next.js Frontend: `http://localhost:3001`

### Last Resort Solutions

1. **Change ports** in both applications
2. **Use ngrok** to tunnel localhost
3. **Docker network** configuration
4. **Host file** modifications

---

## Current Status

- ✅ API endpoints are correct
- ✅ CORS is configured properly
- ✅ Services are running
- ⚠️ Browser blocking requests (likely ad blocker)

### Next Steps
1. Test with ad blocker disabled
2. Try the API test page: `http://localhost:3001/api-test.html`
3. Use "Test API Connection" button in the main app
4. Check browser console for detailed logs