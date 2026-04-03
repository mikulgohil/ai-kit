# Optimizely SaaS CMS Rules

- This is a headless CMS project using **Optimizely SaaS CMS** with Next.js, delivered via **Optimizely Graph** (GraphQL)
- SDK packages: `@remkoj/optimizely-cms-react`, `@remkoj/optimizely-cms-nextjs`, `@remkoj/optimizely-graph-client`
- Use `<CmsEditable>` wrapper for all editable components — the editor won't recognize them without it
- Use `<RichText html={data.field.html} />` from `@remkoj/optimizely-cms-react/rsc` — never use `dangerouslySetInnerHTML`
- Import Server Component versions from `@remkoj/optimizely-cms-react/rsc` — not from the base package
- GraphQL fragment naming: `[Name].page.graphql`, `[Name].block.graphql`, `[Name].element.graphql` — suffix determines injection target
- Register components in ComponentFactory with `[category, typeName]` format (e.g., `['Block', 'HeroBlock']`)
- Use `createPage()` from `@remkoj/optimizely-cms-nextjs/page` for the catch-all `[[...path]]/page.tsx` route
- Use `createPublishApi()` for cache invalidation webhooks at `.well-known/publish/route.ts`
- Handle draft mode: check `draftMode().isEnabled`, switch to HMAC auth, call `client.enablePreview()`
- Run `npx graphql-codegen` after modifying `.graphql` files to regenerate typed queries
- Use `opti-cms nextjs:factory` to regenerate the component dictionary — don't manually edit the auto-generated index
- Content type definitions use `.opti-type.json` files — sync with `opti-cms types:pull` / `types:push`
- Visual Builder hierarchy: Experience > Section > Row > Column > Element — render with `<OptimizelyComposition>`
- Don't hardcode content that should come from CMS content types
- Don't use `getStaticProps`/`getServerSideProps` — `createPage()` handles SSG/SSR/ISR automatically
- Keep `codegen.ts` injection patterns in sync with component folder structure
- Environment: `OPTIMIZELY_GRAPH_SINGLE_KEY` (public), `OPTIMIZELY_GRAPH_APP_KEY` + `SECRET` (HMAC auth)
