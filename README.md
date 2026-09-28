npm run build
PS C:\Users\mcsol\Downloads\lab-app> npm run build

> lab@0.1.0 build
> next build

▲ Next.js 15.1.0

- Environments: .env

Creating an optimized production build ...
✓ Compiled successfully

Failed to compile.

./app/(admin)/dashboard/page.tsx
91:20 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
91:34 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities

./app/(public)/apropos/page.tsx
370:28 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
371:59 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
386:31 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
431:26 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
442:29 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
442:78 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
452:65 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
456:28 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
461:49 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
584:19 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
584:39 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
666:54 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities

./app/(public)/blog/[slug]/page.tsx
36:5 Warning: 'handleDeleteComment' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
43:30 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
43:43 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
77:35 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
80:38 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
195:11 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console

./app/(public)/home/page.tsx
13:9 Warning: 'sections' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./app/(public)/public_podcast/page.tsx
53:9 Warning: 'router' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
118:6 Warning: React Hook useEffect has missing dependencies: 'fetchCategories', 'reload', 'searchTerm', and 'selectedCategories'. Either include them or remove the dependency array. react-hooks/exhaustive-deps
130:6 Warning: React Hook useEffect has a missing dependency: 'categories.length'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
135:6 Warning: React Hook useEffect has a missing dependency: 'reload'. Either include it or remove the dependency array. react-hooks/exhaustive-deps

./app/(public)/public_podcast/[slug]/page.tsx
16:11 Warning: 'user' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./app/(user)/book/[slug]/page.tsx
52:5 Warning: 'canInteract' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./app/(user)/enregistrement/page.tsx
9:7 Warning: 'ACCENT' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
10:7 Warning: 'ACCENT_WARM' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
94:73 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
124:27 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities

./app/(user)/podcast/page.tsx
109:6 Warning: React Hook useEffect has missing dependencies: 'fetchCategories', 'reload', 'searchTerm', and 'selectedCategories'. Either include them or remove the dependency array. react-hooks/exhaustive-deps
114:6 Warning: React Hook useEffect has a missing dependency: 'reload'. Either include it or remove the dependency array. react-hooks/exhaustive-deps

./app/(user)/podcast/[slug]/page.tsx
16:11 Warning: 'user' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./app/(user)/post/page.tsx
14:10 Warning: 'LoadingFeed' is defined but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./app/(user)/post/[slug]/page.tsx
14:3 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console
15:3 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console
16:3 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console
93:12 Warning: 'postId' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars
100:6 Warning: 'postId' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars
108:5 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console

./app/api/admin/books/route.ts
9:27 Warning: 'req' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars
95:30 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
99:36 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any

./app/api/admin/podcasts/route.ts
9:27 Warning: 'req' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars

./app/api/admin/posts/route.ts
9:27 Warning: 'req' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars

./app/api/admin/users/route.ts
9:27 Warning: 'req' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars
24:41 Warning: 'password' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars

./app/api/auth/register/route.ts
9:7 Warning: 'userService' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./components/AdminHeader/Header.tsx
12:3 Warning: 'User' is defined but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
118:9 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any

./components/blog/book/BookCard.tsx
20:3 Warning: 'isLoading' is assigned a value but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars

./components/blog/book/BookGrid.tsx
30:9 Warning: 'getGridCols' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./components/blog/create/TagInput.tsx
343:35 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
343:50 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities

./components/blog/feed/article/ArticleView.tsx
50:19 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
65:3 Warning: 'userReactions' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars
74:3 Warning: 'handleToggleReaction' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars
78:3 Warning: 'setAdminTab' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars

./components/blog/feed/article/CommentsSection.tsx
17:19 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
143:18 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
302:26 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities

./components/blog/feed/podcast/FeaturedPodcastHero.tsx
63:25 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities

./components/blog/feed/podcast/MultimediaHub.tsx
65:32 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
155:24 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
157:24 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion

./components/blog/podcast/PodcastCard.tsx
104:5 Warning: 'likesCount' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
105:5 Warning: 'commentsCount' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
107:5 Warning: 'author' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
108:5 Warning: 'interactionState' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
111:9 Warning: 'publishedDate' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
142:3 Error: React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return? react-hooks/rules-of-hooks
159:3 Error: React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return? react-hooks/rules-of-hooks

./components/blog/post/ArticleCard.tsx
72:9 Warning: 'publishedDate' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
84:18 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
85:18 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
93:14 Error: 'Image' is not defined. react/jsx-no-undef

./components/home/Hero.tsx
179:29 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
197:16 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
197:45 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
310:23 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
310:56 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
388:25 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
388:47 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities

./components/home/sections/BlogLABSection.tsx
203:14 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities

./components/home/sections/CommunitySection.tsx
293:30 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
369:23 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
369:45 Warning: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`. react/no-unescaped-entities
402:38 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities
418:25 Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. react/no-unescaped-entities

./components/home/sections/EcommerceSection.tsx
55:5 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console
89:42 Warning: 'index' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars

./components/layout/Footer.tsx
39:7 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console

./components/layout/Navbar.tsx
45:7 Warning: 'POPULAR_SEARCHES' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
85:7 Warning: 'TYPE_ICONS' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
176:10 Warning: 'isSearchOpen' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
178:10 Warning: 'searchSuggestions' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
179:10 Warning: 'isSearching' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
284:9 Warning: 'handleSearchSubmit' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
292:9 Warning: 'getCategoryColor' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars
512:26 Error: 'Image' is not defined. react/jsx-no-undef

./components/ProductImage.tsx
27:20 Warning: 'onLoadingComplete' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./components/resource/create/CreateResourceEditor.tsx
89:17 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
90:19 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
91:21 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
92:20 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
93:15 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
161:9 Warning: 'emissionField' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./components/ui/BooksPageHeader.tsx
18:3 Warning: 'page' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars

./components/ui/GenericTable.tsx
417:9 Error: Expected an assignment or function call and instead saw an expression. @typescript-eslint/no-unused-expressions
427:7 Error: Expected an assignment or function call and instead saw an expression. @typescript-eslint/no-unused-expressions
1534:37 Warning: 'value' is assigned a value but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./lib/auth/auth-options.ts
5:15 Warning: 'JWT' is defined but never used. Allowed unused vars must match /^_/u. @typescript-eslint/no-unused-vars

./lib/prisma/client.ts
5:35 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion

./lib/repositories/book.repository.ts
87:29 Warning: 'bookId' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars
87:45 Warning: 'userId' is defined but never used. Allowed unused args must match /^_/u. @typescript-eslint/no-unused-vars

./lib/repositories/podcast.repository.ts
21:5 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console
25:7 Warning: Unexpected console statement. Only these console methods are allowed: warn, error. no-console

./lib/sentry/client-utils.ts
27:73 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
51:70 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any

./lib/sentry/config.ts
68:23 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any

./lib/sentry/server-utils.ts
25:79 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
49:76 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
60:55 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
60:65 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
69:41 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any

./lib/services/book.service.ts
158:24 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
165:26 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
166:22 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
209:25 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
281:30 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
301:36 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
460:36 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
506:25 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
554:30 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
574:36 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
622:30 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any

./lib/services/feed.service.ts
146:29 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
150:30 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
155:52 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
232:38 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
244:29 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
248:30 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
253:52 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
320:52 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
324:38 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
336:29 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
340:30 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
345:52 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
483:23 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
565:48 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
577:29 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
581:30 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion
586:52 Warning: Unexpected any. Specify a different type. @typescript-eslint/no-explicit-any
625:27 Warning: Forbidden non-null assertion. @typescript-eslint/no-non-null-assertion

info - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
