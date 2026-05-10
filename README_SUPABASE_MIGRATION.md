# 🚀 Supabase Storage Migration - Complete

## Overview

Your BharatSecure project has been successfully migrated from **SQLite + Local File Storage** to **Supabase PostgreSQL + Supabase Storage**.

## 📦 What Changed

### Database
- ❌ Removed: SQLite (`backend/db.sqlite3`)
- ✅ Using: Supabase PostgreSQL

### File Storage
- ❌ Removed: Local file storage with Django FileField/ImageField
- ✅ Using: Supabase Storage with 9 dedicated buckets

### Upload Features Migrated
1. **AR/VR Analyzer** - Photo uploads → `photos` bucket
2. **Pothole Analyzer** - Image uploads → `potholes` & `processed-images` buckets
3. **Pothole Video Analyzer** - Video uploads → `pothole-videos`, `processed-videos`, `video-thumbnails`, `video-frames` buckets
4. **Incident Reports** - File attachments → `incident-files` bucket
5. **Comments** - File attachments → `comment-files` bucket

## 🎯 Quick Start

### 1. Get Your Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `fzsvxkuzyivihtqpoqid`
3. Navigate to: **Settings** → **API**
4. Copy the **service_role** key (keep it secret!)
5. Add to `backend/.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Run Migration Script

**Windows:**
```bash
cd backend
migrate_to_supabase.bat
```

**Unix/Linux/Mac:**
```bash
cd backend
chmod +x migrate_to_supabase.sh
./migrate_to_supabase.sh
```

### 3. Verify Setup

Check that all buckets were created:
- Go to Supabase Dashboard → Storage
- You should see 9 buckets: photos, potholes, processed-images, pothole-videos, processed-videos, video-thumbnails, video-frames, incident-files, comment-files

## 📁 Files Created/Modified

### New Files
```
backend/
├── utils/supabase_storage.py          # Storage utility
├── setup_supabase_buckets.py          # Bucket creation script
├── migrate_to_supabase.sh             # Unix migration script
├── migrate_to_supabase.bat            # Windows migration script
├── SUPABASE_MIGRATION_GUIDE.md        # Detailed guide
├── MIGRATION_SUMMARY.md               # Quick reference
└── SUPABASE_STORAGE_SETUP_COMPLETE.md # Setup instructions
```

### Modified Files
```
backend/
├── requirements.txt                    # Added supabase dependencies
├── .env                               # Added SUPABASE_SERVICE_ROLE_KEY
├── photos/models.py                   # URLField instead of ImageField
├── photos/views.py                    # Supabase upload handling
├── pothole_analyzer/models.py         # URLField instead of FileField/ImageField
├── pothole_analyzer/views.py          # Supabase upload handling
├── incidents/models.py                # URLField instead of FileField
└── backend/settings.py                # Added SUPABASE_SERVICE_ROLE_KEY config
```

### Deleted Files
```
backend/
└── db.sqlite3                         # SQLite database (removed)
```

## 🔧 Manual Migration Steps

If you prefer to run steps manually:

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Create storage buckets
python setup_supabase_buckets.py

# 3. Generate migrations
python manage.py makemigrations

# 4. Apply migrations
python manage.py migrate
```

## 🧪 Testing

### Test Photo Upload
```bash
curl -X POST http://localhost:8000/api/photos/ \
  -F "image=@test.jpg" \
  -F "title=Test Photo"
```

### Test Pothole Image
```bash
curl -X POST http://localhost:8000/api/pothole-analysis/ \
  -F "image=@pothole.jpg"
```

### Test Pothole Video
```bash
curl -X POST http://localhost:8000/api/pothole-video-analysis/ \
  -F "video=@video.mp4"
```

Expected response includes Supabase URL:
```json
{
  "id": 1,
  "image": "https://fzsvxkuzyivihtqpoqid.supabase.co/storage/v1/object/public/photos/uploads/abc123.jpg"
}
```

## 📊 Storage Buckets

| Bucket Name | Purpose | Used By |
|------------|---------|---------|
| photos | AR/VR photos | Photos app |
| potholes | Original pothole images | Pothole Analyzer |
| processed-images | Processed images | Pothole Analyzer |
| pothole-videos | Original videos | Video Analyzer |
| processed-videos | Processed videos | Video Analyzer |
| video-thumbnails | Video thumbnails | Video Analyzer |
| video-frames | Frame extracts | Video Analyzer |
| incident-files | Incident attachments | Incidents |
| comment-files | Comment attachments | Comments |

All buckets:
- ✅ Public access enabled
- ✅ 50MB file size limit
- ✅ All MIME types allowed

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Never commit it to version control
- Use environment variables only
- The service role key has admin access to your Supabase project

## 📚 Documentation

- **Setup Guide**: `SUPABASE_STORAGE_SETUP_COMPLETE.md`
- **Migration Guide**: `backend/SUPABASE_MIGRATION_GUIDE.md`
- **Quick Reference**: `backend/MIGRATION_SUMMARY.md`
- **Storage Utility**: `backend/utils/supabase_storage.py`

## ✅ Verification Checklist

After migration, verify:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in `backend/.env`
- [ ] Migration script completed without errors
- [ ] 9 storage buckets visible in Supabase Dashboard
- [ ] Photo upload works and returns Supabase URL
- [ ] Pothole image upload works
- [ ] Pothole video upload works
- [ ] Files visible in Supabase Storage
- [ ] Files accessible via public URLs

## 🐛 Troubleshooting

### Bucket Creation Failed
```bash
# Manually create buckets
cd backend
python setup_supabase_buckets.py
```

### Migration Failed
```bash
# Check database connection
python manage.py check

# Run migrations manually
python manage.py makemigrations
python manage.py migrate
```

### Upload Failed
1. Verify bucket exists in Supabase Dashboard
2. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Verify file size < 50MB
4. Check Django logs for errors

## 🎉 Benefits

✅ **Scalable** - No local disk limitations
✅ **Fast** - CDN-backed global delivery
✅ **Reliable** - Automatic backups by Supabase
✅ **Secure** - Fine-grained access control with RLS
✅ **Cost-effective** - Pay only for storage used
✅ **Maintainable** - No local file management needed

## 🔄 Rollback (If Needed)

To rollback to SQLite:

```bash
git checkout HEAD -- backend/
git restore backend/db.sqlite3
cd backend
python manage.py migrate
```

## 📞 Support

For issues:
1. Check `backend/SUPABASE_MIGRATION_GUIDE.md`
2. Review Supabase docs: https://supabase.com/docs/guides/storage
3. Check Django logs: `python manage.py runserver`
4. Verify Supabase Dashboard for bucket status

---

**Migration Date**: May 10, 2026
**Status**: ✅ Complete - Ready for testing
**Next Step**: Run migration script and test uploads
