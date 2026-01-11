# 🚀 Deploy Instructions - Production Update

**Branch:** main
**Latest Commit:** de91b5d
**Date:** 2026-01-11

## 📦 What's New in This Release

### 1. **Knowledge Synchronization System** (Major Feature)
Complete AI-powered system to sync Knowledge Base with Cérebro Lógico through intelligent suggestions.

- AI analysis of knowledge articles
- Automatic biomarker/protocol extraction
- Admin approval workflow
- Conflict detection & resolution
- Complete audit trail

### 2. **Medical Knowledge Management** (Enhancement)
Edit forms for all Cérebro Lógico components:

- Biomarker edit dialog with full CRUD
- Metric edit dialog with formula management
- Protocol edit dialog with conditions
- Enhanced list views with search/filter

### 3. **Bug Fixes**
- Fixed conflict filter showing wrong results
- Fixed agent filtering on analysis page

---

## 🗄️ Database Migration Required

**CRITICAL:** Run database migration before deploying code.

### Option A: Using Drizzle CLI (Recommended)
```bash
# On production server
cd /path/to/medical-ai-v2
pnpm db:migrate
```

### Option B: Manual SQL Execution
Execute the SQL file: `MIGRATION-KNOWLEDGE-SYNC.sql`

**Tables Created:**
- `knowledge_update_suggestions` - AI suggestions for sync
- `sync_audit_log` - Complete history of sync actions

**Tables Modified:**
- `biomarkers_reference` - Added sync metadata columns
- `protocols` - Added sync metadata columns
- `knowledge_articles` - Added lastAnalyzedAt column

---

## 📋 Deployment Steps

### 1. **Backup Database** ⚠️
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. **Pull Latest Code**
```bash
git pull origin main
# Should be at commit: de91b5d
```

### 3. **Install Dependencies**
```bash
pnpm install
```

### 4. **Run Database Migration**
```bash
pnpm db:migrate
```

### 5. **Build Application**
```bash
pnpm build
```

### 6. **Restart Application**
```bash
# Vercel deployment
vercel --prod

# Or if using PM2/custom server
pm2 restart medical-ai-v2
```

### 7. **Verify Deployment**
- [ ] Check `/admin/knowledge-sync` page loads
- [ ] Check `/admin/medical-knowledge` page loads
- [ ] Test biomarker edit functionality
- [ ] Run knowledge sync analysis (small batch)
- [ ] Check audit log in database

---

## 🔑 Environment Variables

No new environment variables required. Existing vars should work:
- ✅ `DATABASE_URL` - Required
- ✅ `GOOGLE_GENERATIVE_AI_API_KEY` - Required for sync
- ✅ `NEXTAUTH_SECRET` - Required
- ✅ `NEXTAUTH_URL` - Required

---

## 🧪 Post-Deployment Testing

### 1. Knowledge Sync System
```
1. Navigate to /admin/knowledge-sync
2. Click "Analisar Artigos" button
3. Wait for analysis to complete
4. Review generated suggestions
5. Approve/reject a suggestion
6. Check audit log in "Histórico" tab
```

### 2. Medical Knowledge Management
```
1. Navigate to /admin/medical-knowledge
2. Search for a biomarker
3. Click edit (pencil icon)
4. Modify a value
5. Save and verify update
```

### 3. Agent Filtering
```
1. Navigate to /analyze page
2. Verify only analysis agents appear (not product generators)
```

---

## 📊 Database Statistics

After migration, expected new rows:
- `knowledge_update_suggestions`: 0 (will populate after first analysis)
- `sync_audit_log`: 0 (will populate after first action)

Expected modified columns:
- All existing `biomarkers_reference` rows: +3 columns (lastSyncedFrom, syncMetadata, updatedAt)
- All existing `protocols` rows: +2 columns (lastSyncedFrom, syncMetadata)
- All existing `knowledge_articles` rows: +1 column (lastAnalyzedAt)

---

## ⚠️ Known Issues & Notes

1. **First Sync May Take Time**: Initial analysis of all articles can take 5-10 minutes depending on volume
2. **Gemini API Quota**: Sync uses Gemini 2.5 Pro - ensure API quota is sufficient
3. **Conflict Filter**: Now automatically shows all statuses when enabled

---

## 🔄 Rollback Plan (If Needed)

If issues occur, rollback to previous version:

```bash
# Revert to previous commit
git revert de91b5d

# Rebuild and redeploy
pnpm build
vercel --prod

# Database rollback (if migration was applied)
psql $DATABASE_URL < backup_TIMESTAMP.sql
```

---

## 📞 Support

If issues occur during deployment:
- Check logs: `vercel logs` or server logs
- Verify database connection
- Check migration status: `pnpm db:studio`
- Review audit logs in database

---

## ✅ Deployment Checklist

- [ ] Database backup created
- [ ] Latest code pulled (commit de91b5d)
- [ ] Dependencies installed
- [ ] Database migration successful
- [ ] Application built successfully
- [ ] Application deployed
- [ ] `/admin/knowledge-sync` accessible
- [ ] `/admin/medical-knowledge` accessible
- [ ] Edit forms working
- [ ] Knowledge sync tested (small batch)
- [ ] No errors in logs

---

**Deployment Prepared By:** Claude Code
**Last Updated:** 2026-01-11
**Production Ready:** ✅ YES
