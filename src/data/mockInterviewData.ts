import {
  JobRole,
  InterviewType,
  InterviewDifficulty,
  InterviewQuestion,
  InterviewEvaluationReport
} from '../types/interview';

export const ROLE_DESCRIPTIONS: Record<JobRole, { label: string; icon: string; highlight: string }> = {
  'Python Developer': {
    label: 'Python Developer',
    icon: '🐍',
    highlight: 'Data structures, GIL, async/await, generators, and clean architecture'
  },
  'Java Developer': {
    label: 'Java Developer',
    icon: '☕',
    highlight: 'JVM internals, concurrency, Spring Boot, OOP design patterns, and memory models'
  },
  'C Programmer': {
    label: 'C Programmer',
    icon: '⚙️',
    highlight: 'Pointers, manual memory allocation, POSIX system calls, cache locality, and bitwise ops'
  },
  'Frontend Developer': {
    label: 'Frontend Developer',
    icon: '🎨',
    highlight: 'React lifecycle, Virtual DOM, CSS layout math, browser rendering pipelines, and Web APIs'
  },
  'Full-Stack Developer': {
    label: 'Full-Stack Developer',
    icon: '🌐',
    highlight: 'API design, state synchronization, database indexing, authentication, and DevOps'
  },
  'Data Analyst': {
    label: 'Data Analyst',
    icon: '📊',
    highlight: 'SQL window functions, ETL pipelines, statistical inference, data wrangling, and BI metrics'
  },
  'AI/ML Engineer': {
    label: 'AI/ML Engineer',
    icon: '🤖',
    highlight: 'Gradient descent, transformer architectures, vector embeddings, loss functions, and inference'
  }
};

export const QUESTION_BANK: Record<JobRole, InterviewQuestion[]> = {
  'Python Developer': [
    {
      id: 'py-1',
      question: 'Explain how Python handles memory management, specifically referencing the Global Interpreter Lock (GIL), reference counting, and cyclical garbage collection.',
      category: 'Core Language Architecture',
      difficulty: 'Medium',
      hint: 'Mention sys.getrefcount, PyObject ob_refcnt, and generational GC for cyclical references.',
      suggestedModelAnswer: 'Python utilizes automatic memory management driven primarily by reference counting supplemented by a cyclic garbage collector. Each PyObject tracks an internal reference count (ob_refcnt); when this reaches zero, memory is immediately deallocated. To solve circular references (e.g. object A references B and B references A), CPython runs a generational garbage collector (Generations 0, 1, 2) utilizing doubly linked lists to detect unreachable cycles. The GIL (Global Interpreter Lock) ensures thread safety in CPython by permitting only one native thread to execute Python bytecode at a time, protecting reference count integrity.',
      keyEvaluationPoints: [
        'Explains reference counting mechanism and deallocation trigger',
        'Addresses circular reference detection via generational collector',
        'Connects the GIL to thread-safe reference count mutability'
      ]
    },
    {
      id: 'py-2',
      question: 'What is the fundamental difference between a Python generator and a standard list comprehension, and when would you use each in a production pipeline?',
      category: 'Data Structures & Iterators',
      difficulty: 'Easy',
      hint: 'Contrast eager evaluation in memory with lazy evaluation using the yield keyword.',
      suggestedModelAnswer: 'List comprehensions evaluate eagerly, allocating the entire collection in memory at once (O(N) space complexity). Generators use lazy evaluation via the iterator protocol (`yield` or generator expressions `(...)`), producing values on-demand one item at a time (O(1) auxiliary space). In production, generators are preferred when streaming large files, paginated database records, or infinite sequences where memory retention is a bottleneck.',
      keyEvaluationPoints: [
        'Eager vs lazy evaluation distinction',
        'O(N) memory allocation vs O(1) streaming footprint',
        'Production use cases (e.g. file streaming vs indexable random access)'
      ]
    },
    {
      id: 'py-3',
      question: 'How do async and await work under the hood with Python’s asyncio event loop, and how do they differ from multi-threading with concurrent.futures?',
      category: 'Concurrency',
      difficulty: 'Hard',
      hint: 'Discuss cooperative multitasking versus preemptive thread scheduling.',
      suggestedModelAnswer: '`asyncio` implements single-threaded cooperative multitasking built on top of generators/coroutines. The event loop maintains a queue of ready and waiting tasks; when a coroutine encounters an `await` on an I/O operation (e.g., HTTP request or socket read), it yields control back to the loop, allowing other ready tasks to execute without OS context-switch overhead. In contrast, multi-threading (`concurrent.futures.ThreadPoolExecutor`) uses preemptive OS threads scheduled by the kernel, which incurs thread creation overhead and GIL contention for CPU-bound tasks.',
      keyEvaluationPoints: [
        'Cooperative multitasking mechanism vs preemptive scheduling',
        'Event loop task scheduling on I/O boundaries',
        'GIL implications and overhead comparison'
      ]
    },
    {
      id: 'py-4',
      question: 'Describe Python decorators. How would you write a reusable decorator that logs execution time and catches specific exceptions?',
      category: 'Metaprogramming & Patterns',
      difficulty: 'Medium',
      hint: 'Use functools.wraps to preserve function metadata.',
      suggestedModelAnswer: 'A decorator is a higher-order function that takes a callable as an argument and returns an augmented wrapper callable. Using `functools.wraps(func)` preserves original function name and docstrings. Inside the wrapper, `time.perf_counter()` is recorded before and after calling `func(*args, **kwargs)`. A `try/except` block surrounds the execution to log timing or cleanly intercept known exceptions.',
      keyEvaluationPoints: [
        'Higher-order function mechanics (*args, **kwargs closure)',
        'Preservation of metadata via functools.wraps',
        'Structured exception interception'
      ]
    },
    {
      id: 'py-5',
      question: 'How do Python dictionaries achieve O(1) average lookup time, and what changed in Python 3.7+ regarding dictionary key ordering?',
      category: 'Algorithms & Internals',
      difficulty: 'Medium',
      hint: 'Hash table bucket lookup, open addressing with quadratic probing, and dense array layout.',
      suggestedModelAnswer: 'Python dictionaries use hash tables with open addressing and pseudo-random probing to resolve collisions. Looking up a key hashes it with `hash()`, masks it to bucket size, and traverses entries. Since Python 3.6 (formalized in 3.7), dicts use a compact array representation: a sparse index array pointing into a dense array of `[hash, key, value]`. This reduced memory usage by ~25% and guaranteed insertion-order iteration as a language specification.',
      keyEvaluationPoints: [
        'Hash indexing and collision resolution strategy',
        'Compact array layout introduced in Python 3.6/3.7',
        'Guarantee of insertion order preservation'
      ]
    }
  ],
  'Java Developer': [
    {
      id: 'java-1',
      question: 'Explain the JVM memory model, distinguishing between Heap, Stack, Metaspace, and the Garbage Collection generational hypotheses.',
      category: 'JVM Internals',
      difficulty: 'Medium',
      hint: 'Talk about Eden, Survivor spaces, Tenured/Old Gen, and minor vs major GC.',
      suggestedModelAnswer: 'The JVM divides memory into the Stack (storing frame states, local primitives, and object references per thread) and the Heap (shared memory where objects reside). Metaspace stores class metadata in native memory. The Heap is partitioned into Young Generation (Eden and two Survivor spaces S0/S1) and Old Generation based on the weak generational hypothesis (most objects die young). Minor GC sweeps Eden into survivor spaces; survivors exceeding an age threshold are promoted to Old Gen, where Major/Full GC (G1 or ZGC) runs.',
      keyEvaluationPoints: [
        'Stack vs Heap storage and thread isolation',
        'Generational Heap partitioning (Eden, Survivors, Old Gen)',
        'Role of Metaspace and GC compaction'
      ]
    },
    {
      id: 'java-2',
      question: 'Compare Java’s HashMap and ConcurrentHashMap. How does ConcurrentHashMap achieve thread safety without synchronizing the entire table?',
      category: 'Collections & Concurrency',
      difficulty: 'Hard',
      hint: 'Mention Java 8 bucket-level CAS operations and synchronized bin locks.',
      suggestedModelAnswer: '`HashMap` is non-synchronized and vulnerable to race conditions (e.g., infinite loops during resizing in Java 7 or data corruption in Java 8+). `ConcurrentHashMap` avoids monolithic synchronization. In Java 8+, it uses lock-free Compare-And-Swap (CAS) for inserting into empty bucket heads, and synchronizes only the specific bucket node (first node) during collision handling or treeification (Red-Black tree conversion when bucket length exceeds 8). Reads are non-blocking via volatile value references.',
      keyEvaluationPoints: [
        'Lock stripping / bucket-level locking vs Hashtable synchronized table',
        'CAS operations for empty buckets',
        'Treeification threshold (TREEIFY_THRESHOLD = 8)'
      ]
    },
    {
      id: 'java-3',
      question: 'What are Java Virtual Threads (Project Loom), and how do they differ from traditional OS platform threads in high-throughput microservices?',
      category: 'Modern Java & Concurrency',
      difficulty: 'Medium',
      hint: 'M:N scheduling over ForkJoinPool carrier threads.',
      suggestedModelAnswer: 'Platform threads are 1:1 wrappers around OS kernel threads, each consuming ~1MB stack memory and requiring kernel context switching. Virtual threads (Java 21+) are lightweight user-mode threads managed by the JVM with an M:N scheduling model over carrier platform threads. When a virtual thread performs blocking I/O (e.g. JDBC query or REST call), the JVM unmounts its stack from the carrier thread and mounts another ready virtual thread, allowing millions of concurrent connections without thread exhaustion.',
      keyEvaluationPoints: [
        '1:1 kernel threads vs M:N JVM-managed user threads',
        'Unmounting on blocking operations without stalling carrier thread',
        'Throughput gains for I/O-bound microservice workloads'
      ]
    },
    {
      id: 'java-4',
      question: 'Explain how Spring Boot handles Dependency Injection (DI) and how the ApplicationContext lifecycle resolves circular dependencies.',
      category: 'Framework Architecture',
      difficulty: 'Medium',
      hint: 'Bean post-processors, singleton cache three-level map, and constructor vs field injection.',
      suggestedModelAnswer: 'Spring manages object lifecycles via the Inversion of Control (IoC) container using an `ApplicationContext`. For singleton beans, Spring uses a three-level cache (`singletonObjects`, `earlySingletonObjects`, `singletonFactories`) to resolve circular dependencies by exposing partially constructed beans before full initialization. Constructor injection is recommended over field injection because it guarantees immutability, forces compile-time cycle detection, and simplifies unit testing without mocking container reflections.',
      keyEvaluationPoints: [
        'IoC container lifecycle and BeanPostProcessor role',
        'Three-level singleton cache for circular resolution',
        'Constructor injection vs field injection rationale'
      ]
    },
    {
      id: 'java-5',
      question: 'What is the purpose of the volatile keyword in Java, and how does it relate to CPU cache coherence and the happens-before relationship?',
      category: 'Concurrency & Memory Model',
      difficulty: 'Hard',
      hint: 'Memory barriers, cache flushes, and preventing instruction reordering.',
      suggestedModelAnswer: 'The `volatile` keyword guarantees two things: visibility and ordering (preventing instruction reordering). Under the Java Memory Model (JMM), writes to a volatile variable flush the thread local CPU cache to main memory, establishing a happens-before relationship with subsequent reads. However, `volatile` does not guarantee atomicity for compound operations like `i++`; for atomicity, `AtomicInteger` or synchronization is required.',
      keyEvaluationPoints: [
        'Visibility guarantee across CPU cache lines',
        'Prevention of compiler and CPU instruction reordering',
        'Non-atomicity of compound operations'
      ]
    }
  ],
  'C Programmer': [
    {
      id: 'c-1',
      question: 'Explain the difference between stack and heap memory allocation in C, and discuss what causes segmentation faults and memory leaks.',
      category: 'Memory Management',
      difficulty: 'Easy',
      hint: 'Stack automatic lifetime vs malloc/free manual lifetime; NULL pointer dereference.',
      suggestedModelAnswer: 'Stack memory is managed automatically by the compiler via CPU stack pointer manipulation (LIFO order); local variables are allocated on function entry and popped upon return. Heap memory is allocated dynamically at runtime via `malloc`/`calloc`/`realloc` and requires manual deallocation with `free`. A segmentation fault occurs when a program attempts to access memory it does not have permission for (e.g., dereferencing NULL, accessing unmapped pages, writing to read-only string literals, or buffer overflow). A memory leak occurs when heap memory is orphaned without a valid pointer to call `free()`.',
      keyEvaluationPoints: [
        'Automatic stack scope vs manual heap lifetime',
        'Mechanisms of segmentation faults (MMU page violations, NULL dereference)',
        'Techniques for memory leak mitigation (Valgrind, ASan)'
      ]
    },
    {
      id: 'c-2',
      question: 'How do pointer arithmetic and array indexing work in C? What is the relationship between `arr[i]` and `*(arr + i)`?',
      category: 'Pointers & Arrays',
      difficulty: 'Easy',
      hint: 'Pointer stride based on sizeof(*arr).',
      suggestedModelAnswer: 'In C, an array identifier decays to a pointer to its first element in most expression contexts. Pointer arithmetic is scaled by the `sizeof(type)` of the dereferenced pointer. `arr[i]` is defined syntactically as identical to `*(arr + i)`. Because pointer addition is commutative, `*(arr + i)` is also identical to `*(i + arr)` and thus `i[arr]`. Adding 1 to a pointer advances its address by `sizeof(T)` bytes in virtual memory.',
      keyEvaluationPoints: [
        'Array decay to pointer to first element',
        'Scaling of pointer stride by sizeof(element_type)',
        'Equivalence of arr[i] and *(arr + i)'
      ]
    },
    {
      id: 'c-3',
      question: 'Explain what data structure alignment and padding are in C structs, and how you would minimize struct padding overhead.',
      category: 'Data Structures & Hardware Architecture',
      difficulty: 'Medium',
      hint: 'Hardware alignment requirements (e.g. 4-byte integers on 4-byte boundaries).',
      suggestedModelAnswer: 'CPUs access memory most efficiently when data types reside at addresses that are multiples of their size (e.g., 4-byte int on 4-byte boundary, 8-byte pointer on 8-byte boundary). To satisfy these hardware constraints, the compiler inserts padding bytes between struct members or at the tail of the struct. To minimize wasted padding, order struct members from largest to smallest alignment requirements (e.g. pointers and uint64_t first, then uint32_t, then uint16_t, then chars). Alternatively, GCC `__attribute__((packed))` can disable padding at the expense of unaligned access performance penalties.',
      keyEvaluationPoints: [
        'Hardware alignment rationale (cache line splits, bus cycles)',
        'Ordering fields by decreasing size to pack tightly',
        'Trade-offs of __attribute__((packed))'
      ]
    },
    {
      id: 'c-4',
      question: 'What is a volatile pointer in C, and how does `const int * const` differ from `volatile int *` in embedded or systems programming?',
      category: 'Type Qualifiers & Systems',
      difficulty: 'Hard',
      hint: 'Preventing compiler optimization on memory-mapped hardware registers.',
      suggestedModelAnswer: '`volatile int *` indicates that the integer pointed to can change outside the compiler’s knowledge (such as a memory-mapped hardware peripheral register or an ISR variable). It forbids the compiler from caching the value in a CPU register across reads. In contrast, `const int * const ptr` is a constant pointer to a constant integer, meaning neither the pointer address nor the target value can be modified by the code.',
      keyEvaluationPoints: [
        'Forbidding compiler register caching on hardware registers/ISRs',
        'Placement of const qualifier relative to asterisk (*)',
        'Real-world embedded hardware register mapping'
      ]
    },
    {
      id: 'c-5',
      question: 'Explain the difference between fork(), vfork(), and clone() in Linux C programming, and how copy-on-write (COW) operates.',
      category: 'Operating Systems & System Calls',
      difficulty: 'Hard',
      hint: 'Page tables, page fault triggers, and sharing address spaces.',
      suggestedModelAnswer: '`fork()` creates a child process with a duplicated address space. Linux optimizes this via Copy-On-Write (COW): the child receives page tables mapped to the parent’s physical frames marked read-only. A physical copy is made only when either process writes to a page, triggering a page fault. `vfork()` suspends the parent and shares the parent’s address space without copying until `exec()` or `_exit()`. `clone()` is the underlying Linux system call providing fine-grained control flags (e.g., `CLONE_VM`, `CLONE_FS`, `CLONE_FILES`) used to implement POSIX pthreads.',
      keyEvaluationPoints: [
        'Copy-on-write page table replication and MMU fault mechanics',
        'vfork thread suspension and shared stack hazards',
        'clone() flags and relationship to user-space threading'
      ]
    }
  ],
  'Frontend Developer': [
    {
      id: 'fe-1',
      question: 'Explain the React 18/19 Concurrent rendering model and how Fiber nodes coordinate non-blocking UI updates with Suspense and Transitions.',
      category: 'React Architecture',
      difficulty: 'Hard',
      hint: 'Prioritization of user events over background updates using startTransition.',
      suggestedModelAnswer: 'Prior to Concurrent React, rendering was synchronous and uninterrupted; once reconciliation began, it blocked the main JavaScript thread until completion. Concurrent React decomposes work into Fiber nodes (linked-list units of work). The scheduler assigns lanes/priorities to updates. Urgent updates (typing, clicking) interrupt lower-priority transitions (`useTransition`). If a transition is interrupted, React pauses rendering, applies urgent work, and resumes or restarts the transition. Suspense works seamlessly with this by allowing component trees to pause rendering until promises resolve without tearing the DOM.',
      keyEvaluationPoints: [
        'Synchronous stack reconciler vs fiber incremental priority scheduling',
        'Priority lanes and non-blocking interruption via startTransition',
        'Suspense integration with concurrent boundaries'
      ]
    },
    {
      id: 'fe-2',
      question: 'How does the browser rendering pipeline operate from HTML parsing to pixel rasterization (DOM -> CSSOM -> Render Tree -> Layout -> Paint -> Composite)?',
      category: 'Browser Performance',
      difficulty: 'Medium',
      hint: 'Layout vs Paint vs GPU compositing, transform/opacity optimizations.',
      suggestedModelAnswer: 'The browser parses HTML tokens into the DOM and CSS rules into the CSSOM. Combining visible DOM nodes with matched CSS rules produces the Render Tree. Next, Layout (Reflow) computes the exact geometric coordinates and bounding box of each element. Paint draws colors, borders, and shadows onto bitmap layers. Finally, Composite uploads these layers to the GPU to be flattened onto the screen. Animating properties like `transform` and `opacity` bypasses Layout and Paint, going directly to Composite on the GPU, avoiding jank and maintaining 60/120 FPS.',
      keyEvaluationPoints: [
        'Step-by-step pipeline sequence',
        'Distinction between Reflow (Layout) and Repaint',
        'Hardware acceleration via GPU compositing layers'
      ]
    },
    {
      id: 'fe-3',
      question: 'Compare client-side rendering (CSR), server-side rendering (SSR), and static site generation (SSG), explaining how hydration works.',
      category: 'Rendering Strategies',
      difficulty: 'Medium',
      hint: 'Time to First Byte (TTFB), First Contentful Paint (FCP), and attaching event listeners during hydration.',
      suggestedModelAnswer: 'CSR loads an empty HTML shell and downloads a JavaScript bundle that constructs the DOM on the client (fast subsequent navigation, but slower initial FCP and SEO challenges). SSR renders HTML dynamically per request on the server (low TTFB, immediate FCP, optimal SEO, but server compute overhead). SSG compiles static HTML at build time (fastest edge caching, but requires rebuilding for dynamic content). Hydration is the client-side process where React walks the pre-rendered HTML DOM, attaches event listeners, and reconstructs the component state without re-creating DOM nodes.',
      keyEvaluationPoints: [
        'Core trade-offs of CSR, SSR, and SSG across Core Web Vitals',
        'Hydration mechanics (event listener binding and state attachment)',
        'Hydration mismatch causes and remediation'
      ]
    },
    {
      id: 'fe-4',
      question: 'What are the main performance bottlenecks in modern web apps, and how do you optimize Core Web Vitals (LCP, INP, and CLS)?',
      category: 'Web Vitals & Performance',
      difficulty: 'Medium',
      hint: 'Interaction to Next Paint (INP replaced FID), Largest Contentful Paint image preloads, and explicit aspect ratios.',
      suggestedModelAnswer: 'LCP (Largest Contentful Paint) is optimized by preloading hero images with `rel="preload"`, utilizing modern formats (AVIF/WebP), and minimizing server TTFB. INP (Interaction to Next Paint) measures responsiveness to user input; it is optimized by breaking up long tasks (>50ms) using `scheduler.yield()` or Web Workers, debouncing handlers, and using React transitions. CLS (Cumulative Layout Shift) is eliminated by assigning explicit `width`/`height` or CSS `aspect-ratio` to images and ads, and reserving space for dynamically injected content.',
      keyEvaluationPoints: [
        'LCP optimization (resource hints, CDN caching, image optimization)',
        'INP focus on main thread unblocking and task splitting',
        'CLS prevention via layout reservation'
      ]
    },
    {
      id: 'fe-5',
      question: 'How do closures work in JavaScript, and what are common memory leak scenarios associated with closures in React components?',
      category: 'JavaScript Core',
      difficulty: 'Easy',
      hint: 'Lexical scope retention, event listeners in useEffect without cleanup, and interval timers.',
      suggestedModelAnswer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. It allows an inner function to access an outer function’s scope even after the outer function has returned. In React, closures commonly cause memory leaks when `useEffect` attaches event listeners, intervals, or WebSocket subscriptions without returning a cleanup function. Another issue is stale closures, where a hook captures an old state value from an earlier render cycle due to a missing dependency array entry.',
      keyEvaluationPoints: [
        'Lexical environment retention mechanism',
        'Stale closure bug in hooks without proper dependency tracking',
        'Uncleaned event listeners and timers leading to retained memory'
      ]
    }
  ],
  'Full-Stack Developer': [
    {
      id: 'fs-1',
      question: 'Design an end-to-end authentication and authorization architecture for a distributed web application, explaining JWTs, refresh tokens, and CSRF protection.',
      category: 'Security & System Design',
      difficulty: 'Medium',
      hint: 'Short-lived access tokens, httpOnly secure SameSite cookies for refresh tokens, and revocation lists.',
      suggestedModelAnswer: 'A robust setup uses short-lived JWT access tokens (10-15 min) stored in memory or passed via Bearer headers, paired with long-lived refresh tokens stored in an `httpOnly`, `Secure`, `SameSite=Strict` cookie to prevent XSS access. When the access token expires, the client calls a `/refresh` endpoint where the server validates the cookie against a Redis whitelist/revocation store and issues a new access token. CSRF protection is achieved via SameSite cookies combined with Double Submit Cookie or custom Anti-CSRF headers for state-changing operations.',
      keyEvaluationPoints: [
        'Separation of short-lived access token and httpOnly refresh token',
        'Token rotation and revocation strategy in distributed caches (Redis)',
        'XSS and CSRF threat mitigation tactics'
      ]
    },
    {
      id: 'fs-2',
      question: 'How do database indexes (B-Trees and Hash indexes) work, and how do you diagnose and resolve a slow query in a relational database?',
      category: 'Databases & Query Optimization',
      difficulty: 'Medium',
      hint: 'EXPLAIN ANALYZE, sequential scans vs index scans, composite index column order.',
      suggestedModelAnswer: 'B-Tree indexes maintain a balanced multi-way tree sorted on key values, providing O(log N) search, insertion, and range queries. Hash indexes provide O(1) equality lookups but do not support range scans. To diagnose a slow query, run `EXPLAIN (ANALYZE, BUFFERS)` to inspect the execution plan for sequential scans (Seq Scan) on large tables, high disk I/O, or hash joins without indexes. Resolve by creating targeted composite indexes matching the `WHERE` and `ORDER BY` predicates (respecting the leftmost prefix rule) and eliminating `SELECT *`.',
      keyEvaluationPoints: [
        'B-Tree logarithmic search and range capability vs Hash index',
        'Using EXPLAIN ANALYZE to identify sequential scans and index skips',
        'Composite index ordering and leftmost prefix rule'
      ]
    },
    {
      id: 'fs-3',
      question: 'Compare REST, GraphQL, and gRPC. In what scenarios would you choose each for client-server versus microservice-to-microservice communication?',
      category: 'API Protocols & Architecture',
      difficulty: 'Easy',
      hint: 'HTTP verbs, over-fetching vs under-fetching, binary protobuf serialization over HTTP/2.',
      suggestedModelAnswer: 'REST is standard, predictable, and leverages HTTP caching efficiently for public APIs and CRUD operations. GraphQL eliminates over-fetching and under-fetching by allowing clients to query specific graph schemas in a single request, ideal for complex web dashboards with diverse client requirements. gRPC utilizes Protocol Buffers over HTTP/2 for high-throughput, low-latency binary serialization and bidirectional streaming, making it the premier choice for internal microservice-to-microservice RPC communication.',
      keyEvaluationPoints: [
        'REST standard caching and resource modeling',
        'GraphQL client query autonomy and payload optimization',
        'gRPC binary serialization and HTTP/2 multiplexing for microservices'
      ]
    },
    {
      id: 'fs-4',
      question: 'Explain how you design an idempotent API endpoint, particularly for payment processing or order submissions.',
      category: 'API Design & Reliability',
      difficulty: 'Hard',
      hint: 'Idempotency keys, atomic locks in distributed stores, and transactional outbox.',
      suggestedModelAnswer: 'An idempotent API guarantees that making multiple identical requests has the same effect as a single request. For payment endpoints, the client sends a unique `Idempotency-Key` UUID header. The server attempts an atomic `SET key lock NX PX 5000` in Redis. If the key exists with a completed status, the server returns the previously cached response immediately without reprocessing. If processing, it waits or returns 409 Conflict. Once DB transactions commit, the final response is saved with an expiration TTL.',
      keyEvaluationPoints: [
        'Unique idempotency key header convention',
        'Distributed lock and state tracking in Redis/DB',
        'Handling concurrent duplicate requests without double-charging'
      ]
    },
    {
      id: 'fs-5',
      question: 'How do you handle real-time bidirectional communication between thousands of clients and a cluster of backend servers?',
      category: 'Real-Time Systems',
      difficulty: 'Hard',
      hint: 'WebSockets, sticky sessions, Redis Pub/Sub backplane, and horizontal scaling.',
      suggestedModelAnswer: 'WebSockets establish persistent, full-duplex TCP connections over an upgraded HTTP handshake. When scaling across multiple backend instances, a client connected to Server A cannot directly message a client on Server B. To solve this, servers connect to a Redis Pub/Sub or Apache Kafka messaging backplane. When an event occurs on Server A, it publishes to a Redis channel; all server instances subscribed to the channel receive the payload and broadcast it to their locally connected WebSocket clients.',
      keyEvaluationPoints: [
        'WebSocket protocol handshake and persistent socket lifecycle',
        'Multi-instance scaling via Redis Pub/Sub backplane',
        'Heartbeat ping/pong and reconnection backoff strategy'
      ]
    }
  ],
  'Data Analyst': [
    {
      id: 'da-1',
      question: 'Explain the difference between WHERE and HAVING in SQL, and demonstrate how you would use window functions (e.g., ROW_NUMBER vs DENSE_RANK).',
      category: 'SQL & Data Wrangling',
      difficulty: 'Easy',
      hint: 'Pre-aggregation row filtering vs post-aggregation group filtering; tie handling in ranking.',
      suggestedModelAnswer: '`WHERE` filters individual rows before any aggregation operations (`GROUP BY`) occur. `HAVING` filters aggregated groups after the `GROUP BY` clause is evaluated. For window functions, `ROW_NUMBER()` assigns a unique consecutive integer to each row regardless of ties. `RANK()` leaves gaps after ties (e.g. 1, 2, 2, 4), while `DENSE_RANK()` does not leave gaps after ties (e.g. 1, 2, 2, 3). They operate across partitions without collapsing rows like `GROUP BY`.',
      keyEvaluationPoints: [
        'Filtering lifecycle: WHERE before aggregation vs HAVING after GROUP BY',
        'Difference in tie resolution between ROW_NUMBER, RANK, and DENSE_RANK',
        'Window partitioning without collapsing row sets'
      ]
    },
    {
      id: 'da-2',
      question: 'What is Simpson’s Paradox, and how does it manifest in business analytics when aggregating user cohort metrics?',
      category: 'Statistical Analysis',
      difficulty: 'Hard',
      hint: 'A trend appearing in subgroups disappears or reverses when the groups are combined due to confounding variables.',
      suggestedModelAnswer: 'Simpson’s Paradox occurs when a statistical trend or correlation observed across multiple individual subgroups disappears or completely reverses when the subgroups are aggregated together. This is driven by an unobserved confounding variable and unequal sample sizes across subgroups. In business, a marketing campaign might have a higher conversion rate for both desktop users and mobile users individually, but show an overall lower conversion rate if one variant received a disproportionately large share of low-converting mobile traffic.',
      keyEvaluationPoints: [
        'Definition of subgroup trend reversal in aggregated data',
        'Role of confounding variables and unequal subgroup sample distribution',
        'Concrete business example (e.g. conversion rates across device cohorts)'
      ]
    },
    {
      id: 'da-3',
      question: 'Describe how you calculate Customer Lifetime Value (CLV) and Retention Churn Rate, and explain how they guide marketing acquisition budgets.',
      category: 'Business Intelligence & Metrics',
      difficulty: 'Medium',
      hint: 'ARPU / Churn Rate, CAC to LTV ratio of 1:3.',
      suggestedModelAnswer: 'Churn Rate is calculated as `(Customers Lost during Period) / (Customers at Start of Period)`. In subscription models, Customer Lifetime Value (CLV) is estimated as `Average Revenue Per User (ARPU) * Gross Margin / Churn Rate`. A healthy SaaS company targets a CLV:CAC (Customer Acquisition Cost) ratio of at least 3:1 with a CAC payback period under 12 months. If CAC exceeds one-third of CLV, acquisition is unprofitable.',
      keyEvaluationPoints: [
        'Formulas for cohort churn and CLV derivation',
        'Target benchmark ratio of CLV:CAC (typically 3:1)',
        'Strategic impact on marketing spend and payback periods'
      ]
    },
    {
      id: 'da-4',
      question: 'How do you structure an A/B test from hypothesis definition to determining statistical significance (p-value, alpha, power)?',
      category: 'Experimentation & Hypothesis Testing',
      difficulty: 'Medium',
      hint: 'Type I error alpha (0.05), Type II error beta, statistical power (0.80), sample size calculation.',
      suggestedModelAnswer: '1. Formulate null ($H_0$) and alternative ($H_1$) hypotheses. 2. Define minimum detectable effect (MDE), significance level $\\alpha$ (typically 0.05 for 95% confidence), and statistical power $1-\\beta$ (typically 0.80). 3. Pre-calculate required sample size using power analysis to prevent early stopping bias. 4. Randomize users uniformly into Control and Treatment variants. 5. Run a two-sample t-test or z-test for proportions, rejecting $H_0$ only if the p-value $< \\alpha$.',
      keyEvaluationPoints: [
        'Hypothesis formulation and MDE definition',
        'Significance level (alpha) vs statistical power (beta)',
        'Sample size determination and avoidance of p-hacking/peeking'
      ]
    },
    {
      id: 'da-5',
      question: 'Compare Star Schema and Snowflake Schema in dimensional data modeling for an enterprise data warehouse.',
      category: 'Data Warehousing & ETL',
      difficulty: 'Easy',
      hint: 'Central fact table with denormalized dimensions vs normalized dimensional hierarchies.',
      suggestedModelAnswer: 'In a Star Schema, a centralized Fact table containing business measures and foreign keys is surrounded by completely denormalized Dimension tables, resembling a star. This simplifies queries and minimizes table joins, optimizing read performance for OLAP. In a Snowflake Schema, the dimension tables are normalized into sub-tables (e.g. Product -> Category -> Department), reducing data redundancy at the cost of requiring more complex multi-table joins.',
      keyEvaluationPoints: [
        'Central fact table surrounded by denormalized dimensions in Star schema',
        'Normalized hierarchical dimensions in Snowflake schema',
        'Query simplicity and join performance trade-offs'
      ]
    }
  ],
  'AI/ML Engineer': [
    {
      id: 'ai-1',
      question: 'Explain the Multi-Head Attention mechanism in Transformer models, including why queries, keys, and values are projected into multiple subspaces.',
      category: 'Deep Learning & Transformers',
      difficulty: 'Hard',
      hint: 'Softmax(QK^T / sqrt(d_k)) * V and attending to different syntactic and semantic aspects.',
      suggestedModelAnswer: 'Scaled Dot-Product Attention computes $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$. The $\\sqrt{d_k}$ scaling prevents large dot products from pushing the softmax into regions with vanishing gradients. Multi-Head Attention projects $Q, K, V$ into $h$ distinct lower-dimensional subspaces using learned weight matrices, applies attention in parallel, and concatenates the outputs. This allows the model to jointly attend to information from different representation subspaces (e.g., syntactic structure in one head, co-reference in another) at different positions.',
      keyEvaluationPoints: [
        'Mathematical formulation of scaled dot-product attention',
        'Purpose of sqrt(d_k) scaling against gradient saturation',
        'Multiple projection subspaces capturing diverse relationships'
      ]
    },
    {
      id: 'ai-2',
      question: 'How do you detect and mitigate overfitting in deep neural networks? Contrast L1/L2 regularization, Dropout, and Batch Normalization.',
      category: 'Model Optimization & Training',
      difficulty: 'Easy',
      hint: 'Train vs validation loss divergence; weight decay vs neuron deactivation.',
      suggestedModelAnswer: 'Overfitting is identified when training loss continues to decrease while validation loss plateaus or increases. L1 regularization (Lasso) adds an absolute weight penalty promoting sparsity; L2 (Ridge/Weight Decay) penalizes squared weights, preventing extreme weights without forcing zeros. Dropout randomly zeroes out neuron activations with probability $p$ during training, preventing co-adaptation and acting as an ensemble. Batch Normalization normalizes mini-batch layer inputs to mean 0 and variance 1, smoothing the optimization landscape and providing subtle regularization.',
      keyEvaluationPoints: [
        'Validation curve divergence indicator',
        'L1 sparse selection vs L2 weight decay distribution',
        'Dropout ensemble effect and Batch Normalization smoothing'
      ]
    },
    {
      id: 'ai-3',
      question: 'What is Retrieval-Augmented Generation (RAG), and how do dense vector embeddings and Approximate Nearest Neighbor (ANN) search work?',
      category: 'Generative AI & LLMs',
      difficulty: 'Medium',
      hint: 'Embedding models, cosine similarity, HNSW vector indexing, and grounding LLM prompts.',
      suggestedModelAnswer: 'RAG augments LLMs with external proprietary knowledge without fine-tuning. Text documents are chunked and converted into high-dimensional dense vectors using an embedding model. At query time, the user prompt is embedded, and an Approximate Nearest Neighbor (ANN) algorithm like HNSW (Hierarchical Navigable Small World) searches a vector database for top-k semantically relevant chunks via cosine similarity or inner product. These retrieved chunks are injected into the prompt context as ground-truth references for the LLM to synthesize.',
      keyEvaluationPoints: [
        'Chunking, embedding generation, and prompt context injection',
        'Cosine similarity and semantic distance measurement',
        'Role of ANN indexing (e.g. HNSW, IVF-PQ) for sub-linear retrieval'
      ]
    },
    {
      id: 'ai-4',
      question: 'Explain the bias-variance tradeoff and how it guides model selection and ensemble techniques (Bagging vs Boosting).',
      category: 'Machine Learning Theory',
      difficulty: 'Medium',
      hint: 'Underfitting vs overfitting; Random Forests (Bagging) reduce variance, Gradient Boosting reduces bias.',
      suggestedModelAnswer: 'Total generalization error consists of Bias^2 + Variance + Irreducible Error. High bias indicates an overly simple model failing to capture underlying patterns (underfitting). High variance indicates an overly complex model fitting training noise (overfitting). Bagging (e.g., Random Forests) trains independent deep models in parallel on bootstrapped subsets, aggregating predictions to reduce variance without increasing bias. Boosting (e.g., XGBoost) trains shallow weak learners sequentially, with each new model fitting the residuals of previous models, primarily reducing bias.',
      keyEvaluationPoints: [
        'Decomposition of generalization error into bias and variance',
        'Bagging parallel bootstrap aggregation reducing variance',
        'Boosting sequential residual correction reducing bias'
      ]
    },
    {
      id: 'ai-5',
      question: 'What are common evaluation metrics for classification (Precision, Recall, F1, ROC-AUC), and why is accuracy misleading on imbalanced datasets?',
      category: 'Evaluation & Metrics',
      difficulty: 'Easy',
      hint: 'False positives vs false negatives; fraud detection scenario with 99% majority class.',
      suggestedModelAnswer: 'Accuracy is `(TP + TN) / Total`. On imbalanced datasets (e.g., 99% non-fraud, 1% fraud), a trivial model predicting "not fraud" achieves 99% accuracy while failing completely on the minority class. Precision is `TP / (TP + FP)` (minimizing false alarms). Recall is `TP / (TP + FN)` (minimizing missed positives). The F1 score is the harmonic mean of Precision and Recall. ROC-AUC measures true positive rate against false positive rate across all decision thresholds, providing an invariant metric of ranking quality regardless of class balance.',
      keyEvaluationPoints: [
        'Accuracy paradox on skewed class distributions',
        'Precision vs Recall trade-off and F1 harmonic mean',
        'ROC-AUC threshold-independent discriminative power'
      ]
    }
  ]
};

// Specialized HR & Behavioral questions applicable across all roles
export const HR_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'hr-1',
    question: 'Tell me about a time when you encountered a major technical disagreement with a teammate or senior engineer. How did you resolve it constructively?',
    category: 'Conflict Resolution & Collaboration',
    difficulty: 'Medium',
    hint: 'Use the STAR method (Situation, Task, Action, Result). Focus on objective data and shared business goals.',
    suggestedModelAnswer: 'Using the STAR framework: S/T: During an architectural review, a teammate advocated for a microservice decomposition while I proposed keeping a modular monolith to avoid premature distributed systems complexity. A: Rather than debating opinions, I proposed creating an objective comparison matrix evaluating latency, deployment complexity, and team cognitive load. We built a 2-day proof-of-concept benchmark measuring serialization latency. R: The benchmark proved our volume did not yet justify network hop latency, so we aligned on a clean modular monolith with defined domain boundaries, saving 3 weeks of infrastructure overhead while preserving a smooth migration path.',
    keyEvaluationPoints: [
      'Structured STAR delivery without defensiveness',
      'Data-driven evaluation rather than personal ego',
      'Focus on business outcomes and team cohesion'
    ]
  },
  {
    id: 'hr-2',
    question: 'Describe a situation where a production outage or critical bug occurred under your watch. How did you handle the incident, communication, and post-mortem?',
    category: 'Ownership & Incident Management',
    difficulty: 'Medium',
    hint: 'Immediate mitigation over blame, transparent stakeholder updates, blameless post-mortem.',
    suggestedModelAnswer: 'S/T: A faulty database migration locked a critical user table during peak afternoon traffic. A: I immediately declared a P0 incident, prioritized rolling back the schema migration within 8 minutes to restore service, and posted real-time status updates on our public incident channel every 15 minutes. Once resolved, I led a blameless post-mortem analyzing why our staging CI pipeline missed the table lock (concurrent DDL on Postgres). R: We implemented zero-downtime migration guidelines and added automated lock-timeout linters to CI, preventing similar incidents across all 5 engineering squads.',
    keyEvaluationPoints: [
      'Calm incident triage prioritizing customer availability',
      'Transparent communication with regular status cadences',
      'Blameless root cause analysis and preventative automation'
    ]
  },
  {
    id: 'hr-3',
    question: 'How do you prioritize competing deadlines when product managers, technical debt, and urgent bug fixes demand your immediate attention?',
    category: 'Prioritization & Time Management',
    difficulty: 'Easy',
    hint: 'Eisenhower matrix, business impact assessment, and proactive stakeholder communication.',
    suggestedModelAnswer: 'I evaluate incoming requests using an impact-versus-urgency matrix aligned with quarterly sprint objectives. For production bugs affecting revenue or user trust, I address them immediately. For technical debt versus product features, I work with the product manager to quantify the cost of inaction (e.g., "Refactoring this auth module will eliminate 4 hours of weekly maintenance and unblock two upcoming roadmap features"). I also time-box a 15-20% engineering buffer each sprint to consistently pay down debt without derailing deliverable promises.',
    keyEvaluationPoints: [
      'Systematic prioritization based on customer/business impact',
      'Proactive alignment with product stakeholders',
      'Healthy sustainable pacing and technical debt maintenance'
    ]
  }
];

// Comprehensive Role-Specific Coding Questions with starter templates
export const ROLE_CODING_QUESTIONS: Record<JobRole, InterviewQuestion[]> = {
  'Python Developer': [
    {
      id: 'py-code-1',
      question: 'Coding Challenge: Implement a two-sum function in Python that returns the indices of the two numbers such that they add up to target. Optimize for O(N) time complexity.',
      category: 'Data Structures & Algorithms',
      difficulty: 'Easy',
      isCodingQuestion: true,
      codingLanguage: 'python',
      starterCode: `def two_sum(nums: list[int], target: int) -> list[int]:
    """
    Find two numbers in nums that add up to target and return their indices.
    Time Complexity: O(N), Space Complexity: O(N)
    """
    seen: dict[int, int] = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test cases:
# print(two_sum([2, 7, 11, 15], 9))  # Expected: [0, 1]
# print(two_sum([3, 2, 4], 6))       # Expected: [1, 2]
`,
      hint: 'Maintain a dictionary mapping seen number -> index to find the complement in O(1) time.',
      suggestedModelAnswer: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      keyEvaluationPoints: [
        'Single-pass hash table with O(N) time complexity',
        'O(N) auxiliary space complexity',
        'Correct complement calculation and index tracking'
      ]
    },
    {
      id: 'py-code-2',
      question: 'Coding Challenge: Implement a Least Recently Used (LRU) Cache in Python with get(key) and put(key, value) operations running in O(1) time complexity.',
      category: 'System & Data Structure Design',
      difficulty: 'Medium',
      isCodingQuestion: true,
      codingLanguage: 'python',
      starterCode: `from collections import OrderedDict

class LRUCache:
    """
    Least Recently Used (LRU) Cache supporting O(1) get and put.
    """
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache: OrderedDict[int, int] = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
`,
      hint: 'Use a hash map paired with a doubly linked list, or Python collections.OrderedDict.',
      suggestedModelAnswer: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
    def get(self, key: int) -> int:
        if key not in self.cache: return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    def put(self, key: int, value: int) -> None:
        if key in self.cache: self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
      keyEvaluationPoints: [
        'O(1) average lookup and eviction',
        'Correctly marks accessed keys as most recently used',
        'Evicts oldest item when capacity is exceeded'
      ]
    },
    {
      id: 'py-code-3',
      question: 'Coding Challenge: Write an asynchronous worker pipeline in Python utilizing asyncio.Queue and task workers with graceful cancellation.',
      category: 'Concurrency & AsyncIO',
      difficulty: 'Hard',
      isCodingQuestion: true,
      codingLanguage: 'python',
      starterCode: `import asyncio

async def worker(worker_id: int, queue: asyncio.Queue):
    """
    Async worker consuming tasks from an asyncio queue.
    """
    while True:
        try:
            item = await queue.get()
            print(f"Worker {worker_id} processing {item}")
            await asyncio.sleep(0.1) # Simulate I/O work
            queue.task_done()
        except asyncio.CancelledError:
            print(f"Worker {worker_id} safely shutting down...")
            break
`,
      hint: 'Catch asyncio.CancelledError inside the worker loop to clean up pending resources.',
      suggestedModelAnswer: 'The worker continuously awaits queue.get(), processes work inside a try block, calls queue.task_done(), and traps asyncio.CancelledError to exit cleanly when cancelled by the orchestrator.',
      keyEvaluationPoints: [
        'Proper asyncio.CancelledError interception',
        'queue.task_done() signalling for join synchronization',
        'Resource cleanup on loop termination'
      ]
    }
  ],
  'Java Developer': [
    {
      id: 'java-code-1',
      question: 'Coding Challenge: Implement a method in Java to validate balanced brackets "()[]{}" using an ArrayDeque as a stack.',
      category: 'Data Structures & Algorithms',
      difficulty: 'Easy',
      isCodingQuestion: true,
      codingLanguage: 'java',
      starterCode: `import java.util.ArrayDeque;
import java.util.Deque;

public class Solution {
    public static boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) {
                return false;
            }
        }
        return stack.isEmpty();
    }
}
`,
      hint: 'Push closing bracket counterparts onto the stack for quick equality checks.',
      suggestedModelAnswer: 'Using ArrayDeque as a stack: push corresponding closing brackets when opening brackets are encountered. For closing brackets, pop and verify equality.',
      keyEvaluationPoints: [
        'Preference of ArrayDeque over legacy java.util.Stack',
        'Early return on mismatched or empty stack conditions',
        'Final check ensuring stack is empty at completion'
      ]
    },
    {
      id: 'java-code-2',
      question: 'Coding Challenge: Implement a thread-safe BoundedBlockingQueue in Java with put() and take() methods using ReentrantLock and Condition variables.',
      category: 'Concurrency & Multithreading',
      difficulty: 'Medium',
      isCodingQuestion: true,
      codingLanguage: 'java',
      starterCode: `import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class BoundedBlockingQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public BoundedBlockingQueue(int capacity) {
        this.capacity = capacity;
    }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (queue.size() == capacity) {
                notFull.await();
            }
            queue.add(item);
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (queue.isEmpty()) {
                notEmpty.await();
            }
            T item = queue.poll();
            notFull.signal();
            return item;
        } finally {
            lock.unlock();
        }
    }
}
`,
      hint: 'Always use while loops around condition await() calls to prevent spurious wakeups.',
      suggestedModelAnswer: 'Guarded suspension using ReentrantLock, with notFull and notEmpty conditions signalling producers and consumers while safeguarding with while-loops.',
      keyEvaluationPoints: [
        'Protection against spurious wakeups using while loops',
        'Guaranteed unlock in finally blocks',
        'Proper signalling of opposing condition variables'
      ]
    }
  ],
  'C Programmer': [
    {
      id: 'c-code-1',
      question: 'Coding Challenge: Implement a custom memmove function in C that correctly handles overlapping source and destination memory regions.',
      category: 'Memory & Systems',
      difficulty: 'Medium',
      isCodingQuestion: true,
      codingLanguage: 'c',
      starterCode: `#include <stddef.h>

void *custom_memmove(void *dest, const void *src, size_t n) {
    unsigned char *d = (unsigned char *)dest;
    const unsigned char *s = (const unsigned char *)src;

    if (d == s || n == 0) return dest;

    if (d < s) {
        // Forward copy: safe when destination begins before source
        for (size_t i = 0; i < n; i++) {
            d[i] = s[i];
        }
    } else {
        // Backward copy: safe when destination overlaps tail of source
        for (size_t i = n; i > 0; i--) {
            d[i - 1] = s[i - 1];
        }
    }
    return dest;
}
`,
      hint: 'If dest < src copy forward; if dest > src copy backward from tail.',
      suggestedModelAnswer: 'Check relative memory addresses: if dest < src, perform forward copy; if dest > src, copy from byte n down to 0 to prevent overwriting unread bytes.',
      keyEvaluationPoints: [
        'Address comparison to determine copy direction',
        'Casting to unsigned char* for byte-level manipulation',
        'Boundary handling for n == 0 or dest == src'
      ]
    },
    {
      id: 'c-code-2',
      question: 'Coding Challenge: Reverse a singly linked list in-place in C using strictly O(1) auxiliary memory.',
      category: 'Pointers & Data Structures',
      difficulty: 'Easy',
      isCodingQuestion: true,
      codingLanguage: 'c',
      starterCode: `struct ListNode {
    int val;
    struct ListNode *next;
};

struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode *prev = NULL;
    struct ListNode *curr = head;
    struct ListNode *next = NULL;

    while (curr != NULL) {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
`,
      hint: 'Maintain three pointers: prev, curr, and next.',
      suggestedModelAnswer: 'Iteratively rewire curr->next to prev, shifting prev and curr forward until curr becomes NULL, then return prev.',
      keyEvaluationPoints: [
        'In-place pointer reversal without extra allocations',
        'Correct null termination of original head',
        'O(N) time and O(1) space complexity'
      ]
    }
  ],
  'Frontend Developer': [
    {
      id: 'fe-code-1',
      question: 'Coding Challenge: Implement a reusable debounce utility in TypeScript with cancel and flush capabilities.',
      category: 'Async JavaScript & Web APIs',
      difficulty: 'Easy',
      isCodingQuestion: true,
      codingLanguage: 'typescript',
      starterCode: `export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}
`,
      hint: 'Clear the pending setTimeout on every call and expose a cancel method to avoid memory leaks.',
      suggestedModelAnswer: 'A higher-order function that captures timer state in closure, resets timer via clearTimeout, and attaches a cancel() handle.',
      keyEvaluationPoints: [
        'Proper closure and timeout cleanup',
        'Preservation of arguments and TypeScript parameter typing',
        'Inclusion of cancel() teardown method'
      ]
    },
    {
      id: 'fe-code-2',
      question: 'Coding Challenge: Implement a polyfill for Promise.all in TypeScript that rejects immediately on first error and preserves resolution order.',
      category: 'Core JavaScript & Promises',
      difficulty: 'Medium',
      isCodingQuestion: true,
      codingLanguage: 'typescript',
      starterCode: `export function customPromiseAll<T>(
  promises: Iterable<T | PromiseLike<T>>
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const items = Array.from(promises);
    if (items.length === 0) {
      resolve([]);
      return;
    }

    const results: T[] = new Array(items.length);
    let completed = 0;

    items.forEach((item, index) => {
      Promise.resolve(item)
        .then((val) => {
          results[index] = val;
          completed += 1;
          if (completed === items.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}
`,
      hint: 'Track completed count and assign by original index to ensure output ordering.',
      suggestedModelAnswer: 'Wrap each item with Promise.resolve(), record into results array at the corresponding index, and resolve once completed count equals items.length.',
      keyEvaluationPoints: [
        'Preserving resolution array ordering',
        'Immediate reject on first failure',
        'Handling empty iterables synchronously'
      ]
    }
  ],
  'Full-Stack Developer': [
    {
      id: 'fs-code-1',
      question: 'Coding Challenge: Implement an in-memory Token Bucket rate limiter in TypeScript supporting refill rate and burst capacity.',
      category: 'Distributed Systems & API Design',
      difficulty: 'Medium',
      isCodingQuestion: true,
      codingLanguage: 'typescript',
      starterCode: `export class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSec: number;
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  public allowRequest(tokensRequested: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokensRequested) {
      this.tokens -= tokensRequested;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSec * this.refillRatePerSec;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }
}
`,
      hint: 'Calculate tokensToAdd based on (now - lastRefill) and cap at bucket capacity.',
      suggestedModelAnswer: 'Computes elapsed time since last refill, adds tokens up to capacity, and decrements tokens on allowed requests.',
      keyEvaluationPoints: [
        'Timestamp delta computation without background intervals',
        'Capacity clamping to prevent infinite token accumulation',
        'Thread/async safety awareness'
      ]
    }
  ],
  'Data Analyst': [
    {
      id: 'da-code-1',
      question: 'Coding Challenge: Write a SQL query using window functions to calculate the 7-day rolling average revenue per region.',
      category: 'SQL & Window Functions',
      difficulty: 'Medium',
      isCodingQuestion: true,
      codingLanguage: 'sql',
      starterCode: `-- Given table: daily_sales (sale_date DATE, region VARCHAR, revenue NUMERIC)
-- Calculate 7-day rolling average revenue for each region

SELECT 
    sale_date,
    region,
    revenue,
    AVG(revenue) OVER (
        PARTITION BY region
        ORDER BY sale_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7day_avg_revenue
FROM daily_sales
ORDER BY region, sale_date;
`,
      hint: 'Use AVG(revenue) OVER (PARTITION BY region ORDER BY sale_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW).',
      suggestedModelAnswer: 'PARTITION BY region ORDER BY sale_date with window frame ROWS BETWEEN 6 PRECEDING AND CURRENT ROW.',
      keyEvaluationPoints: [
        'Correct window partitioning by region',
        'Explicit specification of ROWS frame',
        'Sorting by chronological date'
      ]
    }
  ],
  'AI/ML Engineer': [
    {
      id: 'ai-code-1',
      question: 'Coding Challenge: Implement a numerically stable softmax function in Python with NumPy that prevents exponentiation overflow.',
      category: 'Deep Learning & Math',
      difficulty: 'Easy',
      isCodingQuestion: true,
      codingLanguage: 'python',
      starterCode: `import numpy as np

def stable_softmax(logits: np.ndarray, axis: int = -1) -> np.ndarray:
    """
    Numerically stable softmax: subtract max(logits) before np.exp
    to prevent floating-point overflow for large positive values.
    """
    # Subtract max along specified axis for numerical stability
    shifted_logits = logits - np.max(logits, axis=axis, keepdims=True)
    exp_logits = np.exp(shifted_logits)
    return exp_logits / np.sum(exp_logits, axis=axis, keepdims=True)

# Test:
# print(stable_softmax(np.array([1000.0, 1001.0, 1002.0])))
`,
      hint: 'Subtract np.max(logits, keepdims=True) from logits before np.exp().',
      suggestedModelAnswer: 'Subtract the maximum value along the axis before computing np.exp to ensure the maximum exponent is exp(0)=1, preventing float64/float32 overflow.',
      keyEvaluationPoints: [
        'Shift invariant property of softmax: softmax(x) = softmax(x - c)',
        'Utilization of keepdims=True for broadcast compatibility',
        'Prevention of NaN/Inf floating point overflow'
      ]
    }
  ]
};

export function generateQuestionList(
  role: JobRole,
  type: InterviewType,
  difficulty: InterviewDifficulty,
  count: number
): InterviewQuestion[] {
  let primaryPool: InterviewQuestion[] = [];
  const roleQuestions = QUESTION_BANK[role] || [];
  const codingPool = ROLE_CODING_QUESTIONS[role] || [];

  if (type === 'Technical') {
    // Prioritize technical questions matching the chosen difficulty
    primaryPool = [...roleQuestions];
  } else if (type === 'HR') {
    primaryPool = [...HR_QUESTIONS];
  } else if (type === 'Coding') {
    primaryPool = [...codingPool, ...roleQuestions.filter(q => q.category.includes('Algorithms') || q.category.includes('Data Structure'))];
  } else {
    // Mixed: blend technical, coding, and behavioral
    primaryPool = [
      codingPool[0] || roleQuestions[0],
      roleQuestions[0],
      HR_QUESTIONS[0],
      codingPool[1] || roleQuestions[1],
      roleQuestions[2] || HR_QUESTIONS[1],
      ...roleQuestions.slice(3)
    ];
  }

  // Sort by matching difficulty first
  const matchDifficulty = (q: InterviewQuestion) => {
    if (q.difficulty === difficulty) return 0;
    if (difficulty === 'Medium') return q.difficulty === 'Hard' ? 1 : 2;
    if (difficulty === 'Hard') return q.difficulty === 'Medium' ? 1 : 2;
    return q.difficulty === 'Medium' ? 1 : 2;
  };

  const sortedPool = [...primaryPool].sort((a, b) => matchDifficulty(a) - matchDifficulty(b));

  // Ensure unique questions
  const uniquePool: InterviewQuestion[] = [];
  const seenIds = new Set<string>();

  for (const q of sortedPool) {
    if (!seenIds.has(q.id)) {
      seenIds.add(q.id);
      uniquePool.push(q);
    }
  }

  // If question bank count is less than requested count, generate dynamic procedural questions
  while (uniquePool.length < count) {
    const idx = uniquePool.length + 1;
    const isCoding = type === 'Coding' || (type === 'Mixed' && idx % 2 === 0);
    uniquePool.push({
      id: `${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}-calibrated-${idx}`,
      question: isCoding
        ? `Coding Challenge ${idx}: Implement a high-performance concurrent data pipeline component for a ${role} with error handling and resource cleanup.`
        : `Architecture & System Analysis ${idx}: For a ${role} system handling peak volume, how do you manage latency spikes, circuit breakers, and database failover?`,
      category: isCoding ? 'Algorithmic Problem Solving' : 'System Reliability & Architecture',
      difficulty: difficulty,
      isCodingQuestion: isCoding,
      codingLanguage: role.includes('Python') || role.includes('AI') ? 'python' : role.includes('Java') ? 'java' : role.includes('C ') ? 'c' : 'typescript',
      starterCode: isCoding ? `// Implementation for ${role} Problem ${idx}\n// Target complexity: O(N)\n` : undefined,
      hint: 'Break down your approach into step 1: data invariants, step 2: time/space complexity, step 3: edge conditions.',
      suggestedModelAnswer: `For a ${role} in production, structure the solution around deterministic bounds, explicit failure modes, and automated metric telemetry.`,
      keyEvaluationPoints: [
        'Time and auxiliary space complexity analysis',
        'Defensive validation and boundary checks',
        'Structured modular decomposition'
      ]
    });
  }

  return uniquePool.slice(0, count);
}

export function generateSampleReport(
  role: JobRole,
  questions: InterviewQuestion[],
  answers: Record<string, string>
): InterviewEvaluationReport {
  // Compute realistic scores based on answer engagement
  let answeredCount = 0;
  let totalWords = 0;

  questions.forEach(q => {
    const ans = answers[q.id]?.trim() || '';
    if (ans.length > 0) {
      answeredCount++;
      totalWords += ans.split(/\s+/).length;
    }
  });

  const completionRatio = questions.length > 0 ? answeredCount / questions.length : 1;
  const avgWords = answeredCount > 0 ? totalWords / answeredCount : 45;

  // Baseline calibrated realistic scores
  const baseTechnical = Math.min(96, Math.max(72, Math.round(78 + (avgWords > 40 ? 12 : avgWords * 0.25) * completionRatio)));
  const baseRelevance = Math.min(94, Math.max(70, Math.round(82 + (completionRatio > 0.8 ? 8 : -10))));
  const baseClarity = Math.min(92, Math.max(68, Math.round(85 + (avgWords > 25 ? 5 : -15))));
  const baseProblemSolving = Math.min(95, Math.max(70, Math.round(80 + (avgWords > 50 ? 12 : 4))));

  const overall = Math.round((baseTechnical * 0.35) + (baseRelevance * 0.25) + (baseClarity * 0.2) + (baseProblemSolving * 0.2));

  const roleStrengthsMap: Record<JobRole, string[]> = {
    'Python Developer': [
      'Strong grasp of CPython runtime mechanics, object reference tracking, and generational garbage collection.',
      'Clear articulation of memory footprint differences between eager collections and lazy generators.',
      'Good awareness of async/await cooperative multitasking boundaries and GIL lock constraints.'
    ],
    'Java Developer': [
      'Comprehensive understanding of JVM heap generational partitioning and garbage collection phases.',
      'Sound architectural reasoning regarding ConcurrentHashMap lock striping and CAS operations.',
      'Effective differentiation between platform threads and lightweight virtual thread concurrency.'
    ],
    'C Programmer': [
      'Precise explanation of stack vs heap lifetimes, virtual memory page protections, and segmentation fault vectors.',
      'Strong knowledge of pointer arithmetic scaling by sizeof(T) and array decay semantics.',
      'Demonstrated understanding of struct padding, CPU alignment penalties, and memory packing.'
    ],
    'Frontend Developer': [
      'Strong articulation of React Concurrent mode, Fiber node scheduling, and non-blocking state transitions.',
      'Solid command of the browser rendering pipeline, distinguishing layout reflow from GPU compositing.',
      'Good familiarity with Core Web Vitals optimization techniques (LCP, INP, CLS).'
    ],
    'Full-Stack Developer': [
      'Clear end-to-end security design separating short-lived access tokens from httpOnly refresh cookies.',
      'Effective query diagnostic methodology using EXPLAIN ANALYZE and composite index leftmost prefix rules.',
      'Sound architectural comparison between REST, GraphQL, and high-throughput gRPC microservices.'
    ],
    'Data Analyst': [
      'Clear distinction between pre-aggregation WHERE filtering and post-aggregation HAVING constraints.',
      'Nuanced explanation of Simpson’s Paradox and the impact of confounding variables on cohort metrics.',
      'Sound formulation of A/B test sample size calculation and statistical significance criteria.'
    ],
    'AI/ML Engineer': [
      'Rigorous mathematical breakdown of Scaled Dot-Product and Multi-Head Attention mechanisms.',
      'Clear understanding of variance-reduction via Bagging versus bias-reduction via sequential Boosting.',
      'Accurate assessment of classification metric trade-offs and the accuracy paradox on imbalanced sets.'
    ]
  };

  const roleImprovementsMap: Record<JobRole, string[]> = {
    'Python Developer': [
      'Elaborate further on internal hash table collision resolution and quadratic probing behaviors.',
      'Explicitly quantify time and space complexities (Big-O notation) upfront before deep-diving into code.',
      'Include edge case testing strategies when discussing asynchronous pipeline failures.'
    ],
    'Java Developer': [
      'State specific GC collector trade-offs (e.g. ZGC sub-millisecond pauses vs G1 throughput) more explicitly.',
      'Detail memory barrier instructions and CPU cache coherency when explaining volatile variables.',
      'Cover thread pool saturation rejection policies (CallerRunsPolicy, DiscardOldestPolicy).'
    ],
    'C Programmer': [
      'Mention specific sanitizers (AddressSanitizer, UndefinedBehaviorSanitizer) and Valgrind in debugging workflows.',
      'Address endianness and byte-order considerations in network serialization routines.',
      'Be more specific about undefined behavior risks when performing type punning via unions.'
    ],
    'Frontend Developer': [
      'Highlight specific micro-frontend or code-splitting chunking strategies for enterprise bundle sizes.',
      'Detail hydration error recovery mechanisms and server-render streaming with Suspense.',
      'Mention accessibility (ARIA tree, focus trap management, keyboard navigation) in component breakdowns.'
    ],
    'Full-Stack Developer': [
      'Detail distributed transaction patterns (Saga pattern, two-phase commit) when microservices fail.',
      'Discuss rate limiting algorithms (Token Bucket, Leaky Bucket) for public API endpoints.',
      'Provide more concrete disaster recovery RTO (Recovery Time Objective) and RPO targets.'
    ],
    'Data Analyst': [
      'Provide greater detail on handling data skew in distributed SQL engines like Apache Spark or BigQuery.',
      'Discuss multiple hypothesis testing corrections (Bonferroni, False Discovery Rate) in large-scale experiments.',
      'Clarify data governance and PII masking methods in production ETL pipelines.'
    ],
    'AI/ML Engineer': [
      'Expand on quantization methods (FP16, INT8, AWQ) for low-latency edge deployment.',
      'Discuss vector database indexing trade-offs between HNSW graph construction time and recall accuracy.',
      'Address data drift detection (Kolmogorov-Smirnov test, Population Stability Index) in production monitoring.'
    ]
  };

  const questionFeedbacks = questions.map((q, idx) => {
    const userAns = answers[q.id]?.trim() || '';
    const answered = userAns.length > 0;
    return {
      questionId: q.id,
      questionText: q.question,
      userAnswer: answered
        ? userAns
        : '[Candidate submitted no response or skipped this question during the practice session]',
      score: answered ? Math.min(95, Math.max(75, 80 + (idx % 3) * 5)) : 50,
      clarityScore: answered ? Math.min(94, Math.max(74, 82 + (idx % 2) * 6)) : 50,
      technicalScore: answered ? Math.min(96, Math.max(76, 84 + (idx % 4) * 3)) : 50,
      modelAnswer: q.suggestedModelAnswer,
      strengths: [
        'Structured response directly addressing core question parameters.',
        'Demonstrated foundational theoretical familiarity with standard industry terminology.'
      ],
      improvements: [
        'Incorporate concrete production metrics, benchmarking numbers, and edge cases to further elevate response depth.'
      ]
    };
  });

  return {
    overallScore: overall,
    technicalCorrectness: baseTechnical,
    answerRelevance: baseRelevance,
    clarity: baseClarity,
    problemSolving: baseProblemSolving,
    strengths: roleStrengthsMap[role] || [
      'Structured logical approach to technical questions',
      'Clear grasp of core engineering and architectural concepts',
      'Calm communication style appropriate for engineering panels'
    ],
    areasForImprovement: roleImprovementsMap[role] || [
      'State time and space complexity upfront before providing explanations',
      'Elaborate on production failure modes, concurrency race conditions, and edge cases',
      'Include quantitative benchmarks and monitoring instrumentation in architecture answers'
    ],
    questionFeedbacks
  };
}
