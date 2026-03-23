# Grade 3 English taxonomy source (NDJSON)

One JSON object per line. Regenerate Stage 3:

```bash
node scripts/merge-english-g3-ndjson.mjs
# or: npm run gen:english-g3
```

The merge script applies Cambridge strand casing to `id` (e.g. `3Rv` not `3RV`) and strips leading `*` from `cambridgeStandard`.
