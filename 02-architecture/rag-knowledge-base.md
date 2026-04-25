# RAG Knowledge Base Specification

## MVP Approach: Supabase pgvector

Since Supabase is already in the stack, leverage the `pgvector` extension — no additional service needed.

```sql
-- Enable extension
create extension if not exists vector;

-- Methodology chunks table
create table methodology_chunks (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  embedding vector(768),              -- BGE-m3 embedding dimension
  category text,                      -- 'pt_interference' | 'pillar_rules' | 'krashen_examples'
  language_pair text default 'pt-BR->en',
  version text default 'v1',         -- for prompt A/B testing
  created_at timestamptz default now()
);

-- Similarity search function
create function match_methodology(
  query_embedding vector,
  match_count int,
  category_filter text default null
)
returns table(id uuid, content text, similarity float) as $$
begin
  return query
  select id, content, 1 - (embedding <=> query_embedding) as similarity
  from methodology_chunks
  where category = category_filter or category_filter is null
  order by embedding <=> query_embedding
  limit match_count;
end;
$$ language plpgsql;
```

## Corpus Pipeline: Markdown → Supabase

Source material: methodology notes, PT-BR interference research, Krashen examples, pillar rule definitions.

```
1. Write methodology chunks as Markdown files in lexio-corpus/
2. Chunk by heading (max 512 tokens per chunk)
3. Embed with BGE-m3 (free, multilingual, strong PT-BR support)
4. Upsert to Supabase methodology_chunks with category + version tags
```

### Initial Corpus Categories

| Category | Source | MVP Count |
|----------|--------|-----------|
| `pt_interference` | `04-pedagogy/pt-native-challenges.md` | ~30 chunks |
| `pillar_rules` | `04-pedagogy/pillar-implementation.md` | ~15 chunks |
| `krashen_examples` | `04-pedagogy/krashen-comprehensible-input.md` | ~20 chunks |
| `sapir_whorf` | `04-pedagogy/sapir-whorf-examples.md` | ~10 chunks |
| `mnemonic_templates` | `04-pedagogy/mnemonic-design-guidelines.md` | ~15 chunks |

## Retrieval Strategy per Lesson

```typescript
async function getMethodologyContext(
  userLevel: string,
  pillarToday: string,
  ptInterferenceTopic: string
): Promise<string> {
  const chunks: string[] = [];

  // Retrieve chunks per category
  const pillarRules = await matchMethodology(pillarToday, 3, 'pillar_rules');
  const ptRules = await matchMethodology(ptInterferenceTopic, 2, 'pt_interference');
  const krashenExamples = await matchMethodology(userLevel, 2, 'krashen_examples');

  chunks.push(...pillarRules, ...ptRules, ...krashenExamples);
  return chunks.map(c => c.content).join('\n\n');
}
```

## Solution Comparison (for Phase 2 evaluation)

| Solution | Cost | Complexity | PT-BR Support | Notes |
|----------|------|-----------|---------------|-------|
| **Supabase pgvector** | Free tier | Low | ✅ (with BGE-m3) | Already in stack — MVP choice |
| **FAISS (local)** | $0 | Medium | ✅ | Full control, offline |
| **Pinecone** | ~$70/mo starter | Low | ✅ | Managed, scalable |
| **NeMo Retriever** | DGX Cloud cost | High | ✅ | NVIDIA-native, overkill for MVP |

**Recommendation**: Start with Supabase pgvector. Migrate only if embedding search becomes a bottleneck (>10K methodology chunks or >1K concurrent users).
