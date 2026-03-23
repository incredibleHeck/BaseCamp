# Grade 2 English taxonomy source (NDJSON)

One JSON object per line (no commas between lines). After editing, regenerate Stage 2:

```bash
node scripts/merge-english-g2-ndjson.mjs
```

The merge script applies Cambridge strand casing to `id` (e.g. `2Rv` not `2RV`) and strips leading `*` from `cambridgeStandard`.
