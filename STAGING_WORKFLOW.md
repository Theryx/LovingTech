# Staging Workflow

## Branches

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `staging` | Test changes before production | Vercel Preview URL |
| `main` | Production code | loving-tech.vercel.app |

## Daily Workflow

```bash
# 1. Always start from staging
git checkout staging
git pull origin staging

# 2. Make your changes, commit
git add .
git commit -m "your changes"

# 3. Push to staging - Vercel auto-deploys preview
git push origin staging

# 4. Test on the Vercel preview URL

# 5. When ready for production:
git checkout main
git pull origin main
git merge staging
git push origin main
```

## Flow Diagram

```
Local staging ──push──> origin/staging ──Vercel──> Preview URL (staging)
                                       │
                                       ↓ (after testing)
Local main ──push──> origin/main ──Vercel──> loving-tech.vercel.app (production)
```

## CI Checks

On every push/PR to `staging` or `main`:
- Lint & Type Check
- Unit Tests
- Format Check

## Vercel Setup

1. **Settings → Git**: Set Preview Branch to `staging`
2. **Settings → Environment Variables**: Add variables for Preview scope

## Branch Protection

`main` is protected on GitHub:
- Requires pull request before merging
- Requires passing CI checks
