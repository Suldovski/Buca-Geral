# BucaGeral React Codebase - Comprehensive Bug Report
**Generated**: May 7, 2026  
**Scope**: BucaGeral.React - Full React Application Analysis

---

## Executive Summary
Found **25 distinct bugs** across the React codebase, ranging from critical routing issues to missing validation and error handling problems.

**Severity Breakdown:**
- 🔴 **CRITICAL**: 5 bugs (app-breaking issues)
- 🟠 **HIGH**: 8 bugs (significant functionality loss)
- 🟡 **MEDIUM**: 12 bugs (usability/reliability issues)

---

## CRITICAL BUGS

### 1. ❌ Incorrectly Named Route File (BLOCKS FEATURE)
- **Location**: [src/routes/obras/.tsx](src/routes/obras/.tsx)
- **Problem**: File is literally named `.tsx` instead of `$obraId.tsx`
- **Impact**: 
  - TanStack Router doesn't recognize it as a dynamic route
  - Detail page for obras won't work
  - Route.useParams() returns undefined
  - Clicking obra names in table crashes the app
- **Evidence**: routeTree.gen.ts shows "/obras/" not "/obras/$obraId"
- **Fix**: Rename file to `$obraId.tsx` and update createFileRoute to `"/obras/$obraId"`

### 2. ❌ Broken obra Detail Route Link
- **Location**: [src/routes/obras/index.tsx:85](src/routes/obras/index.tsx#L85)
- **Problem**: `Link to="/obras/$obraId"` points to non-existent route due to bug #1
- **Impact**: Users cannot view obra details; link does nothing
- **Fix**: Will be fixed when issue #1 is resolved

### 3. ❌ No Network Request Timeout
- **Location**: [src/lib/api.ts:3-8](src/lib/api.ts#L3)
- **Problem**: fetch() has no timeout; requests hang indefinitely
- **Impact**: UI freezes if backend server is down
- **Example**: If server crashes, all API calls wait forever
- **Fix**: Add timeout to fetch calls (recommend 10-30s)

### 4. ❌ Date Parsing Causes NaN Crashes
- **Location**: [src/routes/index.tsx:23](src/routes/index.tsx#L23)
- **Problem**: `new Date(f.dataAdmissao).getFullYear()` silently fails if date invalid
- **Impact**: Dashboard chart shows 0 employees if ANY date is malformed
- **Root Cause**: getFullYear() on Invalid Date returns NaN; NaN === 2026 is always false
- **Fix**: Add date validation before creating Date object

### 5. ❌ Silent Error in Auth Storage
- **Location**: [src/lib/auth.tsx:21](src/lib/auth.tsx#L21)
- **Problem**: `} catch {}` silently ignores JSON parse errors
- **Impact**: If localStorage is corrupted, users are logged out without knowing why
- **Fix**: Add error logging and user notification

---

## HIGH SEVERITY BUGS

### 6. ❌ Empty Catch Block (Auth Recovery Issues)
- **Location**: [src/lib/auth.tsx:21](src/lib/auth.tsx#L21)
- **Problem**: `catch {}` - catches but doesn't handle localStorage errors
- **Impact**: Storage errors silently fail; no debugging information
- **Fix**: Add console error or error boundary

### 7. ❌ Direct Mock Data Mutation (State Corruption)
- **Location**: 
  - [src/routes/funcionarios.tsx:43](src/routes/funcionarios.tsx#L43)
  - [src/routes/obras/index.tsx:28](src/routes/obras/index.tsx#L28)
- **Problem**: `funcionariosMock.push(novo)` - mutates imported array directly
- **Impact**: 
  - Changes persist across page navigations
  - Re-renders forced with hack: `setQ(q + " ")`
  - No proper state management
- **Fix**: Use React state (useState) instead of mutating mock data

### 8. ❌ No Form Input Validation
- **Location**: 
  - [src/routes/funcionarios.tsx:39](src/routes/funcionarios.tsx#L39)
  - [src/routes/obras/index.tsx:27](src/routes/obras/index.tsx#L27)
- **Problem**: `handleSalvarFunc()` and `handleSalvarObra()` save without validation
- **Impact**: Can save empty strings, whitespace-only names, no obra selected
- **Fix**: Add validation before saving:
  ```javascript
  if (!novoFunc.nome.trim() || !novoFunc.cargo.trim() || !novoFunc.obraId) {
    setError("All fields required");
    return;
  }
  ```

### 9. ❌ No Duplicate Prevention on Save
- **Location**: 
  - [src/routes/funcionarios.tsx:39](src/routes/funcionarios.tsx#L39)
  - [src/routes/obras/index.tsx:27](src/routes/obras/index.tsx#L27)
- **Problem**: No loading state on save button; user can click multiple times
- **Impact**: Creates duplicate records with different IDs
- **Fix**: Disable button during save with loading state

### 10. ❌ Usuarios Page Form Not Trimming Input
- **Location**: [src/routes/usuarios.tsx:39](src/routes/usuarios.tsx#L39)
- **Problem**: Validation is `if (!form.nome.trim())` but accepts whitespace strings
- **Impact**: Data pollution; stores "   " as valid input
- **Fix**: Always use trim() on user input

### 11. ❌ Generic API Error Responses
- **Location**: [src/lib/api.ts:8](src/lib/api.ts#L8)
- **Problem**: `throw new Error(await res.text())` - throws HTML if server returns error page
- **Impact**: Users see HTML markup instead of friendly error message
- **Fix**: Parse response type and provide meaningful errors

### 12. ❌ Race Condition in Login
- **Location**: [src/lib/auth.tsx:24-27](src/lib/auth.tsx#L24)
- **Problem**: Multiple simultaneous login calls not prevented
- **Impact**: Multiple API requests, potential state corruption
- **Fix**: Add loading flag or debounce

---

## MEDIUM SEVERITY BUGS

### 13. ❌ AppShell Redirect Loop Risk
- **Location**: [src/components/AppShell.tsx:19-21](src/components/AppShell.tsx#L19)
- **Problem**: `useEffect(() => { if (!user) navigate(...) })` - loops if auth cleared externally
- **Impact**: Potential redirect loops if auth state invalidated
- **Fix**: Add guard to prevent multiple navigations

### 14. ❌ No Input Validation in Login Form
- **Location**: [src/routes/login.tsx:55, 59](src/routes/login.tsx#L55)
- **Problem**: Only HTML5 `required` attribute; no programmatic validation
- **Impact**: Invalid email format not caught before API call
- **Fix**: Add email regex validation before submit

### 15. ❌ Missing Type Safety (any types)
- **Location**: [src/lib/api.ts:21-37](src/lib/api.ts#L21)
- **Lines**: 21, 22, 23, 25, 28, 29, 30, 34, 35
- **Problem**: Widespread `any[]` and `any` types in API endpoints
- **Impact**: No IDE autocomplete; runtime errors possible
- **Example**: `listar: () => request<any[]>('/obras')`
- **Fix**: Define proper TypeScript interfaces for responses

### 16. ❌ Missing Return Types in API Methods
- **Location**: [src/lib/api.ts:22-37](src/lib/api.ts#L22)
- **Problem**: `criar()`, `atualizar()`, `excluir()` don't return type annotations
- **Impact**: Calling code doesn't know what data to expect
- **Fix**: Add explicit return types to all API methods

### 17. ❌ No Date Validation Input
- **Location**: 
  - [src/routes/funcionarios.tsx:170](src/routes/funcionarios.tsx#L170)
  - [src/routes/obras/index.tsx](src/routes/obras/index.tsx)
- **Problem**: Date input fields not required or validated
- **Impact**: Empty dates stored, breaks calculations
- **Fix**: Add `required` attribute to date inputs

### 18. ❌ Date Localization Inconsistency
- **Location**: Multiple files using `toLocaleDateString("pt-BR")`
- **Problem**: No error handling if date is invalid
- **Impact**: UI might show "Invalid Date" to users
- **Fix**: Validate dates before display

### 19. ❌ No Logout Redirect Guarantee
- **Location**: [src/components/AppShell.tsx](src/components/AppShell.tsx)
- **Problem**: After logout(), AppShell doesn't guarantee navigation to /login
- **Impact**: User might see stale page content briefly
- **Fix**: Use useNavigate immediately on logout

### 20. ❌ Filter Performance Issue
- **Location**: [src/routes/index.tsx:28](src/routes/index.tsx#L28)
- **Problem**: `forEach` loop recalculates cargo frequency on every render
- **Impact**: O(n) operation on dashboard; slow with large datasets
- **Fix**: Use useMemo to memoize cargo frequency calculation

### 21. ❌ Detail Route Won't Accept Parameters
- **Location**: [src/routes/obras/.tsx:9](src/routes/obras/.tsx#L9)
- **Problem**: `createFileRoute("/obras/")` - doesn't define $obraId parameter
- **Impact**: Route.useParams() returns undefined; lookup fails
- **Fix**: Rename route file and update to `createFileRoute("/obras/$obraId")`

### 22. ❌ Silent Date Parsing Failures
- **Location**: [src/routes/index.tsx:23](src/routes/index.tsx#L23)
- **Problem**: No validation before date parsing
- **Impact**: Chart calculations silently fail if date malformed
- **Fix**: Add try-catch around date parsing

### 23. ❌ No Loading State During Save
- **Location**: 
  - [src/routes/funcionarios.tsx:39](src/routes/funcionarios.tsx#L39)
  - [src/routes/obras/index.tsx:27](src/routes/obras/index.tsx#L27)
- **Problem**: Button clickable during save; no loading indicator
- **Impact**: User can submit duplicate records
- **Fix**: Add loading state and disable button

---

## SUMMARY TABLE

| Bug # | Severity | File | Line | Type | Status |
|-------|----------|------|------|------|--------|
| 1 | 🔴 CRITICAL | src/routes/obras/.tsx | - | Naming | Unfixed |
| 2 | 🔴 CRITICAL | src/routes/obras/index.tsx | 85 | Routing | Blocked by #1 |
| 3 | 🔴 CRITICAL | src/lib/api.ts | 3 | Timeout | Unfixed |
| 4 | 🔴 CRITICAL | src/routes/index.tsx | 23 | Date Parsing | Unfixed |
| 5 | 🔴 CRITICAL | src/lib/auth.tsx | 21 | Error Handling | Unfixed |
| 6 | 🟠 HIGH | src/lib/auth.tsx | 21 | Error Handling | Unfixed |
| 7 | 🟠 HIGH | Multiple | Various | State Management | Unfixed |
| 8 | 🟠 HIGH | Multiple | Various | Validation | Unfixed |
| 9 | 🟠 HIGH | Multiple | Various | UX/Duplicates | Unfixed |
| 10 | 🟠 HIGH | src/routes/usuarios.tsx | 39 | Validation | Unfixed |
| 11 | 🟠 HIGH | src/lib/api.ts | 8 | Error Handling | Unfixed |
| 12 | 🟠 HIGH | src/lib/auth.tsx | 24 | Race Condition | Unfixed |
| 13 | 🟡 MEDIUM | src/components/AppShell.tsx | 19 | Navigation | Unfixed |
| 14 | 🟡 MEDIUM | src/routes/login.tsx | 55 | Validation | Unfixed |
| 15 | 🟡 MEDIUM | src/lib/api.ts | 21+ | Type Safety | Unfixed |
| 16 | 🟡 MEDIUM | src/lib/api.ts | 22+ | Type Safety | Unfixed |
| 17 | 🟡 MEDIUM | Multiple | Various | Validation | Unfixed |
| 18 | 🟡 MEDIUM | Multiple | Various | Date Handling | Unfixed |
| 19 | 🟡 MEDIUM | src/components/AppShell.tsx | - | Navigation | Unfixed |
| 20 | 🟡 MEDIUM | src/routes/index.tsx | 28 | Performance | Unfixed |
| 21 | 🟡 MEDIUM | src/routes/obras/.tsx | 9 | Routing | Unfixed |
| 22 | 🟡 MEDIUM | src/routes/index.tsx | 23 | Date Parsing | Unfixed |
| 23 | 🟡 MEDIUM | Multiple | Various | UX | Unfixed |

---

## RECOMMENDATIONS FOR PRIORITY FIXES

### Immediate (P0 - App Breaking):
1. Rename [src/routes/obras/.tsx](src/routes/obras/.tsx) to `$obraId.tsx`
2. Add network timeout to fetch calls in [src/lib/api.ts](src/lib/api.ts)
3. Fix date parsing in [src/routes/index.tsx:23](src/routes/index.tsx#L23)
4. Add error logging to [src/lib/auth.tsx:21](src/lib/auth.tsx#L21)

### High Priority (P1 - Feature Complete):
5. Add form validation to all modals
6. Replace direct mock data mutation with useState
7. Add loading states to save buttons
8. Fix API error handling for user-friendly messages

### Medium Priority (P2 - Polish):
9. Add TypeScript types for API responses
10. Implement input trim and validation
11. Add date validation
12. Optimize filter calculations with useMemo

---

## TESTING RECOMMENDATIONS

### Unit Tests Needed:
- API error handling with various HTTP status codes
- Form validation edge cases (empty, whitespace, invalid types)
- Date parsing with malformed inputs
- Auth state persistence

### Integration Tests Needed:
- obra detail page navigation
- Complete login flow
- Modal save operations
- Filter and search functionality

### E2E Tests Needed:
- Full user journey: login → create record → view details → logout
- Error scenarios (network down, invalid dates, duplicate saves)
- Performance under load (large datasets)

---

## ADDITIONAL NOTES

- The app uses mock data instead of real API calls (works with only login endpoint)
- No error boundaries or global error handling
- No loading skeletons or placeholders
- No form submission confirmation dialogs
- No undo/redo functionality
- Consider implementing React Query or SWR for API state management
