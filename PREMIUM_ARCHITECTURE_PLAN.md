# Architectural Research Report: Integration of the BaseCamp Premium Tier

The strategic evolution of the BaseCamp educational technology platform represents a complex architectural transition. Historically, the platform has operated on a highly optimized, offline-first foundation explicitly designed to accommodate the intermittent connectivity and low-bandwidth constraints typical of public schools within the Ghana Education Service (GES). This foundational architecture relies heavily on client-side storage and background synchronization mechanisms to ensure continuous availability, utilizing IndexedDB for local data persistence and custom service worker queues for eventual consistency when network conditions permit.

However, the organizational roadmap now dictates a strategic pivot toward a cross-subsidization SaaS business model. This model requires the introduction of a "Premium Tier" engineered specifically for well-resourced, Tier-1 Cambridge International private schools. Unlike the rural public school deployments, these premium environments are characterized by 1:1 iPad programs, ubiquitous access to high-speed fiber-optic internet, and an expectation of rich, real-time, interactive digital ecosystems. The commercial strategy relies on the revenue generated from this high-bandwidth premium version to continuously subsidize the operational costs of the offline, low-cost public school version.

The primary engineering challenge lies in integrating these high-bandwidth, computationally heavy, and real-time features into the existing React, Vite, and Firebase technology stack without fracturing the repository into separate, distinct applications. The architecture must remain unified, modular, and multi-tenant, leveraging an environment-specific feature flag, designated as isPremiumTier, functioning alongside the existing curriculumType context variable. This comprehensive report investigates the technical feasibility, data modeling requirements, cloud compute limits, dependency management strategies, and strict configuration constraints required to execute the four proposed Premium Pillars without introducing critical regressions or bundle bloat to the legacy offline-first application.


## Architectural Strategy: Specific File Targeting and Queue Bypassing

The most immediate technical collision point between the existing infrastructure and the proposed Premium Tier involves the local data management and synchronization lifecycle. In the current offline-first paradigm, all outbound data mutations, such as assessment completions or attendance logs, are intercepted by a localized queuing system.

An explicit audit of the architectural role of src/services/core/offlineQueueService.ts reveals that this service functions as a mandatory intermediary for all state changes. When a user interacts with the application, this service intercepts the payload, serializes the application state, and commits the transaction to an IndexedDB storage instance. This ensures that no data is lost if the browser tab is closed or if the network connection drops abruptly. Operating in tandem, the src/hooks/useSyncManager.ts hook actively monitors the navigator.onLine browser API and window focus events. When network connectivity is established, this hook systematically dequeues the serialized payloads from IndexedDB and dispatches them via REST or gRPC protocols to Firebase Firestore for permanent storage.

While this mechanism provides exceptional durability for asynchronous operations, it introduces unacceptable latency for the real-time, interactive features mandated by the Premium Tier. For example, routing ephemeral, sub-second live quiz interactions through an IndexedDB read/write transaction cycle before pushing them to the network would generate significant input lag, entirely defeating the purpose of a synchronous "Live Classroom" environment.

To resolve this bottleneck, the architecture must implement a routing proxy or Strategy Pattern within the early lifecycle of both src/services/core/offlineQueueService.ts and the global state management context. The logic must evaluate the payload origin and the active tenant context before any IndexedDB transaction is initiated.

The conditional bypass logic must adhere to the following sequence: When an outbound payload is generated, the service must first evaluate the boolean status of the isPremiumTier feature flag. If this flag evaluates to false, the system immediately routes the payload to the legacy IndexedDB queue. If the flag evaluates to true, the service must then evaluate the specific action type of the payload. If the payload is categorized as a permanent academic record or a standard assessment, it is routed to the standard offline queue to ensure durability. However, if the payload is explicitly categorized as an ephemeral "Live Classroom" interaction, the system must entirely bypass the offlineQueueService.ts enqueueing method. Instead, the payload is dispatched directly to the Firebase Realtime Database (RTDB) client SDK via a persistent WebSocket connection. This strict dependency inversion guarantees that the heavy volume of live classroom interactions never touches the local IndexedDB storage, preserving device memory and eliminating local transaction latency.


## Pillar 1: The "Live Classroom" Sync Engine and Data Modeling

The first pillar of the Premium Tier transforms the application from a static utility designed for generating printed PDF worksheets into a dynamic, interactive 1:1 Student Portal. This feature allows an educator to instantiate a "Generate Practice Round" event, which instantaneously pushes a gamified, real-time quiz to all connected student iPads.As students interact with the interface, the teacher's dashboard updates continuously, providing a live leaderboard and instant gap analysis to identify systemic learning deficiencies on the fly.


### Resolving the Firestore vs. Realtime Database Dichotomy

The legacy application relies exclusively on Firebase Firestore for database operations. Firestore is an enterprise-grade document database optimized for complex, hierarchical querying, offline data access, and highly scalable data persistence. However, Firestore's billing architecture charges per individual document read and write operation.

In a live classroom scenario involving thirty students simultaneously answering questions over a ten-minute quiz session, the volume of state changes is immense. If the application attempted to sync this ephemeral state using Firestore, every individual student answer would constitute a document write, and every update to the teacher's dashboard would require re-reading thirty separate documents multiple times per second. This approach would result in catastrophic financial overhead and significant rate-limiting latency, as Firestore is fundamentally not designed for sub-second, high-frequency state syncing.

Therefore, the Premium Tier architecture must integrate the Firebase Realtime Database (RTDB) to run side-by-side with the existing Firestore implementation. Unlike Firestore, RTDB stores data as a single monolithic JSON tree and communicates with client devices via persistent WebSockets, enabling ultra-low latency updates typically under ten milliseconds. Crucially, RTDB billing is calculated primarily based on the volume of data downloaded and the number of concurrent connections, rather than the raw number of read/write operations. This makes RTDB financially and technically optimal for ephemeral, high-throughput signaling data.


### Structuring the RTDB Ephemeral State

Integrating RTDB requires a paradigm shift in data modeling. While Firestore encourages deep nesting through subcollections, fetching a node in RTDB inherently downloads all of its nested child nodes.Consequently, the RTDB JSON tree must be flattened to the absolute maximum degree to prevent bandwidth over-fetching.

The data model for a live classroom session must segregate session state, participant presence, and interaction events into isolated, shallow nodes.


| RTDB Node Path                                              | Architectural Purpose                                                                                                                                               | Client Access Control Rules                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| /live_sessions/{sessionId}/state                            | Maintains the global state of the quiz, including the currently active question index, timestamp boundaries, and session status (e.g., waiting, active, concluded). | Teacher: Read/Write

<br>

Student: Read-Only     |
| /live_sessions/{sessionId}/presence/{studentId}             | Utilizes the RTDB onDisconnect hook to track whether a student's iPad maintains an active WebSocket connection, displaying online/offline status on the dashboard.  | Student: Write (Own ID)

<br>

Teacher: Read-Only |
| /live_sessions/{sessionId}/answers/{questionId}/{studentId} | Records the precise user input for a specific question, minimizing the payload size to raw values (e.g., "A", true, 14.5).                                          | Student: Write (Own ID)

<br>

Teacher: Read-Only |


By flattening the structure, the teacher's dashboard component can attach an asynchronous listener specifically to the /answers node.As students submit inputs, the dashboard receives only the delta modifications, computing the live leaderboard in client-side memory without continuously re-downloading the session configuration or the question text.


### The Side-by-Side Synchronization Strategy

While RTDB is exceptional for live execution, it is inappropriate for long-term academic record storage due to its limited querying capabilities and lack of complex indexing. The architecture mandates that all final assessment data must eventually reside in Firestore alongside the legacy public school records.

To achieve this, the architecture will employ an asynchronous synchronization pattern utilizing Firebase Cloud Functions. When a live session concludes, the teacher's client application updates the /live_sessions/{sessionId}/state/status node in RTDB to concluded. This specific node mutation serves as a trigger for a dedicated Cloud Function.

The Cloud Function executes in the secure backend environment, reading the entirety of the ephemeral /answers node. It processes this raw input array against the definitive grading rubric, calculates final mastery scores, and serializes the data into standard assessment documents. The function then executes a bulk, atomic batch-write to the permanent Firestore /assessments collection. Following successful confirmation of the Firestore commit, the Cloud Function recursively deletes the entire /live_sessions/{sessionId} node from RTDB. This self-cleaning architecture ensures that RTDB storage costs remain near zero when classes are not actively in session, while guaranteeing that all academic data is permanently secured in the enterprise-grade Firestore repository.


## Pillar 2: Multimodal Video Pipeline and Cloud Compute Limits

The second pillar leverages the unconstrained bandwidth of Tier-1 private schools to introduce high-fidelity multimodal submissions. Moving beyond the limitations of text inputs or static photographs of paper worksheets, the Premium Tier allows students to record and submit video observations. Using their 1:1 iPads, students can record two-minute presentations or narrate their logical process while solving mathematical equations on a whiteboard. These media files are then processed by the Gemini 3 Flash multimodal AI to evaluate speech cadence, specialized vocabulary utilization, and the visual sequence of problem-solving steps.


### The Client-Side Compression Dilemma

Transmitting raw, uncompressed 4K or 1080p video directly from dozens of iPads simultaneously to Firebase Storage would saturate the school's local network, exhaust Firebase bandwidth quotas, and introduce severe latency before the AI inference could even begin. Therefore, the architecture strictly mandates that all video payloads must be compressed locally on the client device prior to network transmission.

The initial architectural proposition suggested utilizing ffmpeg.wasm to perform this client-side compression. ffmpeg.wasm is a WebAssembly port of the industry-standard FFmpeg C/C++ toolkit, enabling complex media manipulation directly within the browser sandbox. However, exhaustive technical analysis reveals critical constraints when deploying this WebAssembly module to mobile Safari environments on Apple hardware.

To achieve acceptable encoding speeds, video compression algorithms require aggressive multithreading. Within a WebAssembly context, multithreading relies entirely on the browser's SharedArrayBuffer API.< Following the discovery of the Spectre and Meltdown hardware vulnerabilities, major browser vendors, including Apple, severely restricted access to SharedArrayBuffer to prevent side-channel timing attacks. While support was eventually restored in iOS 15.2, enabling it requires the application's hosting server to enforce strict Cross-Origin Isolation.

Enforcing Cross-Origin Isolation requires the injection of specific HTTP response headers: Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp (COOP and COEP). Implementing these headers across a complex React application inherently breaks compatibility with third-party iframes, external content delivery networks (CDNs), and cross-origin resource sharing, which could disable other vital components of the BaseCamp application. Furthermore, executing prolonged WebAssembly encoding on the iPad's CPU drastically consumes battery life and frequently causes the main JavaScript UI thread to become unresponsive or freeze.


### The WebCodecs API Alternative

To bypass the SharedArrayBuffer CORS restrictions and CPU performance bottlenecks, the architecture must abandon ffmpeg.wasm as the primary compression engine for the iPad fleet. Instead, the application will directly interface with the native WebCodecs API.

The WebCodecs API provides low-level JavaScript access to the hardware-accelerated video and audio encoders built directly into the Apple Silicon chips. Because WebCodecs utilizes the GPU for H.264 or HEVC encoding, it operates between 10x to 20x faster than CPU-bound WebAssembly compilations, shrinking a one-minute 1080p video in a matter of seconds without freezing the browser interface or requiring complex COOP/COEP isolation headers.

By combining the WebCodecs API with an mp4-muxer library to containerize the output, the frontend application can rapidly generate highly compressed, 30-second "Show Your Work" videos that are perfectly optimized for rapid upload to Firebase Storage.


### Defining Compute Limits for Firebase Cloud Functions (2nd Gen)

Once the compressed video payload arrives in Firebase Storage, an event-driven background trigger initiates a Firebase Cloud Function to pass the file to the Gemini 3 Flash API for multimodal inference. Video analysis represents one of the most computationally demanding, high-latency workloads in modern cloud architecture.

Legacy first-generation Cloud Functions default to 256MB of RAM and a rigid 60-second execution timeout, which is woefully inadequate for streaming video buffers to an external AI API. The deployment must strictly utilize Cloud Functions for Firebase (2nd gen). Powered by the underlying Google Cloud Run infrastructure, 2nd gen functions support significantly expanded resource provisioning and handle up to 1000 concurrent requests per container instance.

Event-driven functions triggered by Cloud Storage (onObjectFinalized) in the 2nd generation architecture are subject to a hard maximum execution duration limit of 540 seconds (9 minutes). The function initialization block must explicitly declare this timeoutSeconds value to prevent premature termination during complex AI analysis.

Furthermore, memory and CPU allocation are inextricably linked in the 2nd generation infrastructure. Functions configured with 128MB, 256MB, 512MB, or 1GB of memory are hard-capped at exactly 1 vCPU. Attempting to process video buffers and manage the high-throughput networking required for the Gemini API on a single vCPU will result in heavy throttling. To unlock multithreaded cloud processing, the function must be allocated a minimum of 4GB or 8GB of memory, which automatically provisions 2 vCPUs. Alternatively, allocating 16GB of memory unlocks 4 vCPUs, though this may be financially excessive for 30-second clips.

**Optimal Cloud Function Configuration Profile:**


| Configuration Parameter | Target Value | Architectural Justification                                                                                                                                       |
| ----------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| timeoutSeconds          | 540          | Represents the absolute maximum duration allowed for event-driven storage functions, ensuring Gemini has ample time to complete multimodal inference.             |
| memory                  | "4GiB"       | Ensures sufficient RAM to hold the compressed video buffer while executing the API request.                                                                       |
| cpu                     | 2            | Automatically unlocked by the 4GiB memory tier, enabling parallel processing of network I/O and data serialization to prevent bottlenecks.                        |
| concurrency             | 80           | Permits multiple video uploads from a single classroom to be processed by a single warm container instance, significantly reducing latency caused by cold starts. |



### Gemini 3 Flash Token Economics

To accurately forecast operational costs and latency, the architecture must calculate the specific token consumption metrics associated with the Gemini 3 Flash model. Unlike text inputs, which vary significantly based on linguistic density, multimodal media is converted into tokens at fixed, deterministic rates. The gemini-3-flash model boasts a massive context window supporting up to 1,048,576 input tokens.

For the mandated 30-second maximum video length:



* **Visual Token Yield:** 30 seconds × 263 tokens/second = 7,890 tokens.
* **Audio Token Yield:** 30 seconds × 32 tokens/second = 960 tokens.
* **Total Base Payload:** 8,850 tokens per student submission.

Including a comprehensive system prompt directing the AI to analyze speech cadence and visual problem-solving steps will add approximately 500 tokens. The resulting total payload of approximately 9,350 tokens falls profoundly below the 1,048,576-token context limit. Analyzing a 30-second multimodal submission with Gemini 3 Flash remains highly cost-efficient for high-volume tasks. This highly predictable and economical cost structure validates the financial feasibility of the cross-subsidization model, allowing the platform to absorb the AI processing costs without eroding the profit margins required to support the public school application tier.


## Pillar 3: The Executive Data Warehouse

The Premium Tier introduces an operational necessity for high-level analytics. Private school administrators and headmasters require immediate visibility into macro-level trends, evaluating cohort performance across the entire curriculum to ensure the institution's value proposition is maintained. Similarly, the "Premium Parent ROI Dashboard" aims to justify tuition costs by providing automated, weekly summaries detailing exactly what a child has mastered.

If the application were to calculate these macro-level statistics dynamically on the client side, a headmaster logging into a dashboard representing a school of 1,000 students could inadvertently trigger the client to read tens of thousands of individual assessment documents from Firestore. Because Firestore billing is metered by document reads (costing $0.06 per 100,000 reads), generating a single dashboard view could cost several cents. Repeated across dozens of administrators loading the page multiple times a day, this architecture would rapidly drain the operational budget.


### The Nightly Aggregation Pipeline

To eradicate this financial vulnerability, the architecture mandates the construction of an "Executive Data Warehouse". This concept relies heavily on database denormalization and server-side aggregation.

The solution involves deploying a scheduled Firebase Cloud Function (utilizing Cloud Scheduler and Pub/Sub). This aggregation pipeline is configured to execute automatically during off-peak hours (e.g., 2:00 AM local time). When triggered, the Cloud Function queries all newly created or modified assessment documents generated throughout the preceding 24 hours. Operating within the secure backend environment, the function calculates all necessary statistical metrics: average scores across cohorts, percentage changes in mastery, and specific demographic learning gaps.

Once the data is crunched, the function serializes the complex statistical object and executes a single write operation, overwriting a consolidated document named cambridge_executive_summary housed within a dedicated /aggregations collection in Firestore.

Consequently, when a headmaster authenticates and loads the analytics dashboard, the React frontend issues a query for exactly one document—the cambridge_executive_summary. This architectural pattern guarantees that regardless of whether the school has one hundred or ten thousand students, the operational cost to render the dashboard remains strictly limited to a single document read. This approach guarantees O(1) read scalability on the client side and ensures the user interface renders instantaneously.


### Automating the Parent Digest

The same server-side aggregation philosophy drives the "Premium Parent" feature. The codebase already contains an artificial intelligence prompt labeled generateWeeklyParentDigestEnglish located within the aiPrompts directory.

The architecture introduces a specialized scheduled Cloud Function configured to execute every Friday at 4:00 PM. This function queries the individual performance metrics for each student accumulated over the week, binds this raw statistical data to the generateWeeklyParentDigestEnglish prompt template, and dispatches the payload to the Gemini API for natural language generation. The AI synthesizes the raw data into a warm, personalized narrative detailing academic triumphs and upcoming curricular targets.

The resulting text strings are saved into a dedicated /parent_digests Firestore collection. When parents authenticate via the dedicated Parent Login, their frontend application subscribes exclusively to their specific document within this collection. By completely isolating the parent interface from the raw assessment data, the architecture ensures absolute data privacy, eliminates the possibility of unauthorized cross-tenant queries, and maintains the stringent O(1) read efficiency mandated by the data warehouse strategy.


### Multi-campus gap analysis (organization / coordinator UI)

For **multi-branch** private networks and pilot **MoE-style** roles, the application implements **Campus Gap Analysis**: client-side rollups of skill-gap signals from the latest assessments, **grouped by branch** (`schoolId`), with **minimum cohort suppression** and exportable CSV. Primary modules: [`src/services/analytics/organizationAnalyticsService.ts`](src/services/analytics/organizationAnalyticsService.ts) (`buildBranchGapRollups`, `branchGapRowsToCsv`), [`src/features/assessments/CampusGapAnalysisPanel.tsx`](src/features/assessments/CampusGapAnalysisPanel.tsx), app shell view **`org-admin-campus-gaps`**, and enterprise navigation flag **`showCampusGapAnalysis`** in [`src/auth/enterpriseAccess.ts`](src/auth/enterpriseAccess.ts). This is distinct from the B2G **geospatial** heatmap roadmap (Phase 3 planning doc); server-side pre-aggregation may be added later for very large organizations to mirror the executive-summary O(1) read pattern.


## Pillar 4: Design System Overhaul and The PWA Service Worker Trap

The final pillar of the Premium Tier involves a comprehensive overhaul of the visual interface. To align with the expectations of an elite private school demographic, the UI transitions to an "Obsidian & Gold" design system. This requires refactoring the Tailwind CSS configurations to implement a premium dark mode and integrating the framer-motion library to provide sophisticated micro-interactions, layout transitions, and fluid physics-based animations.

However, the BaseCamp application is structurally a Progressive Web App (PWA), engineered specifically to cache its entire core payload for offline operation in rural environments. This is achieved via a Service Worker, which acts as a localized proxy, intercepting network requests and serving application files directly from the browser's Cache Storage API. The specific files to be cached are determined at build-time by a precache manifest generated by the Vite PWA plugin (vite-plugin-pwa) and Google's workbox-build library.


### The Bundle Bloat Vulnerability

The architectural hazard lies in how workbox-build natively processes dependencies. By default, the globPatterns configuration in vite-plugin-pwa is aggressively set to **/*.{js,css,html}. This means that the plugin will blindly traverse the entire dist output folder and instruct the Service Worker to download and cache every single JavaScript and CSS file it finds.

The framer-motion library possesses a declarative API structure that makes it notoriously difficult for bundlers like Rollup or Webpack to effectively tree-shake. If imported standardly (e.g., import { motion } from "framer-motion"), it injects a minimum of 34kb of compressed JavaScript into the bundle. Furthermore, if the architecture relies on ffmpeg.wasm as a fallback for video compression, the compiled WebAssembly binary (ffmpeg-core.wasm) weighs upwards of 25MB.

If these premium dependencies are processed normally, they will be emitted into the dist folder. The Service Worker will then detect them and add them to the precache manifest. Consequently, when a teacher in a rural public school connects to a weak 3G cellular network, their device will automatically attempt to download megabytes of animation libraries and video processing binaries in the background. This massive data consumption would entirely obliterate the "lightweight" characteristics of the offline application, severely penalizing public school users with exorbitant mobile data costs.


### Lazy Loading and the LazyMotion Architecture

To mitigate the impact of the animation engine, framer-motion must be aggressively code-split and lazy-loaded. The architecture must strictly prohibit the use of the standard motion component. Instead, all premium animations must utilize the m component in conjunction with the &lt;LazyMotion> wrapper.

By importing the m component (e.g., &lt;m.div>) and supplying the &lt;LazyMotion> wrapper with a dynamically imported feature set (features={() => import("motion/react").then(res => res.domAnimation)}), the synchronous initial render cost of the animation library drops drastically from 34kb down to just 4.6kb. The bulky animation physics engine is split into a separate, isolated JavaScript chunk that is only requested by the browser when the Premium Tier components actually mount.


### Fortifying the Vite PWA Configuration

While lazy loading successfully splits the code into separate chunks, it does not stop the Service Worker from attempting to cache those chunks if they match the **/*.{js,css,html} pattern. To prevent the Service Worker from aggressively downloading the premium assets, the vite.config.ts configuration must be fortified using the globIgnores parameter.

The globIgnores array explicitly instructs workbox-build to bypass specific files during the precache manifest generation. The architecture must define rigid regular expressions that match the dynamically generated chunk names of the premium dependencies.

**Strict Vite PWA Workbox Configuration:**


| Configuration Parameter       | Value / Regex Pattern                                                            | Architectural Purpose                                                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| globPatterns                  | ['\*\*/\*.{js,css,html,ico,png,svg}']                                            | Explicitly lists the essential file extensions required to construct the offline app shell for the GES public schools.                                                                      |
| globIgnores                   | ['\*\*/ffmpeg-core.\*', '\*\*/assets/premium-\*.js', '\*\*/assets/motion-\*.js'] | Acts as a firewall. Explicitly prevents Workbox from caching the heavy WebAssembly binaries and the code-split framer-motion chunks, ensuring they never download on public school devices. |
| maximumFileSizeToCacheInBytes | 2097152                                                                          | Retains the default 2 MiB ceiling as a secondary failsafe. Workbox will automatically reject any un-ignored file that exceeds this limit from entering the cache.                           |
| includeManifestIcons          | false                                                                            | Prevents the automatic caching of high-resolution marketing assets that are unnecessary for offline functionality.                                                                          |



This precise configuration establishes a hermetic seal within the bundler. It guarantees that the rural offline app remains exceptionally lightweight and entirely isolated from the heavy payloads necessary to drive the Premium Digital Ecosystem.


## Advanced Architectural Extension: Dynamic Geometric Generation

While the Premium Tier focuses on the digital 1:1 iPad ecosystem, the architecture must continue to support the legacy offline tier through dynamic PDF worksheet generation for public schools. To enhance both mediums, the platform will utilize Gemini 3 Flash's exceptional coding and visualization capabilities to dynamically draw geometric shapes and mathematical objects.

**Static Worksheets (The Offline Tier):**

For printed PDF worksheets, the backend system will prompt Gemini 3 Flash to output raw LaTeX and TikZ code. The tikz package allows for the programmatic generation of highly precise mathematical diagrams, including complex polygons, ellipses, and spatial intersections. The Node.js service will compile this AI-generated TikZ code alongside the text content into the final printable PDF payload, providing offline students with high-fidelity visual aids.

**Gamified Application (The Premium Tier):** For the interactive web application, rendering TikZ is not natively supported by the browser. Instead, the AI prompt will be configured to output raw Scalable Vector Graphics (SVG) markup or structured JSON coordinate data. Gemini 3 Flash can enforce strict JSON payload outputs using the responseSchema configuration parameter, ensuring the generated coordinates map perfectly to React component props. The frontend will utilize utility tools to safely render the AI-generated SVG code directly into the React DOM. Furthermore, these dynamically generated SVG paths can be passed into the &lt;LazyMotion> engine implemented in Pillar 4, allowing the geometric shapes to fluidly animate, scale, or respond to physics-based micro-interactions within the live application.


## Phased Execution Roadmap

The complexity of retrofitting a synchronous, heavy-compute tier onto an asynchronous, offline-first foundation requires a highly disciplined execution strategy. Attempting to build the RTDB sync engine, the WebCodecs pipeline, and the Service Worker configurations simultaneously would generate chaotic code dependencies and inevitably lead to severe regressions within the public school application tier.

The implementation must adhere strictly to the "Separation of Concerns" methodology. Architectural planning, risk assessment, and technical benchmarking (the Reasoning phase) have been completed within this document. The actual coding (the Execution phase) must proceed through a serialized sequence of Atomic Sprints.


### Phase 1: Security, Context, and the Data Warehouse

The execution sequence begins by securing the backend infrastructure and establishing the global state boundaries before any frontend modifications are introduced.



* **Sprint 1.1:** Instantiate the isPremiumTier global state context within the React application. Bind this flag securely to the user's authentication token and the existing curriculumType tenant flag to prevent unauthorized client-side tampering.
* **Sprint 1.2:** Develop and deploy the Pub/Sub scheduled Firebase Cloud Function for the Executive Data Warehouse. Script the aggregation logic to query, compute, and serialize daily assessment metrics into the singular cambridge_executive_summary Firestore document.
* **Sprint 1.3:** Configure the secondary scheduled Cloud Function to automate the "Premium Parent" feature. Bind the generateWeeklyParentDigestEnglish prompt to the Gemini API, ensuring the resulting text is routed exclusively to the secured /parent_digests Firestore collection.


### Phase 2: The "Live Classroom" Sync Engine

With the persistent data infrastructure optimized, the architecture can safely introduce the ephemeral synchronization layer.



* **Sprint 2.1:** Execute the specific file targeting audit on src/services/core/offlineQueueService.ts and src/hooks/useSyncManager.ts. Implement the dependency inversion bypass, allowing data payloads to skip the IndexedDB transaction lifecycle exclusively when isPremiumTier is active during a live session.
* **Sprint 2.2:** Establish the flattened Firebase RTDB JSON tree architecture (/live_sessions/{sessionId}). Implement the Firebase Client SDK to establish the persistent WebSocket connections and manage onDisconnect presence tracking.
* **Sprint 2.3:** Develop the React components for the "Follow Me" quiz interface. Construct the teacher dashboard UI to listen to RTDB child-added and child-changed events, calculating the live leaderboard directly in client memory.
* **Sprint 2.4:** Deploy the asynchronous Cloud Function trigger to monitor RTDB for session termination events, ensuring the ephemeral scores are calculated, batched, and committed permanently to the Firestore /assessments collection.


### Phase 3: The Multimodal Video Pipeline and AI Shape Generation

Following the stabilization of the data pathways, the high-compute AI integrations are constructed.



* **Sprint 3.1:** Implement the client-side video capture interface within the StudentPortalApp.tsx. Integrate the native WebCodecs API to handle primary hardware-accelerated video compression on Apple Silicon iPads. Implement a lazy-loaded ffmpeg.wasm module strictly as a fallback mechanism for legacy browsers.
* **Sprint 3.2:** Provision the 2nd Generation Firebase Cloud Function (onObjectFinalized storage trigger). Apply the strict resource constraints formulated during the research phase: 4GB of RAM, 2 vCPUs, and an absolute execution timeout of 540 seconds.
* **Sprint 3.3:** Integrate the Gemini 3 Flash SDK within the Cloud Function. Configure the system prompt to evaluate the compressed video buffer for speech cadence and visual problem-solving steps, routing the resulting AI insights back to the teacher's dashboard UI.
* **Sprint 3.4:** Configure Gemini 3 Flash prompts for geometric shape generation. Implement conditional logic: for offline GES contexts, prompt the AI to generate TikZ/LaTeX code for PDF compilation. For Premium contexts, configure the prompt with responseSchema to output application/json containing SVG paths, and wire these paths to the React frontend for rendering and animation.


### Phase 4: Design System Overhaul & PWA Optimization

The final phase focuses on aesthetic enhancement and securing the application bundler to ensure the public school application remains perfectly lightweight.



* **Sprint 4.1:** Develop the "Obsidian & Gold" Tailwind CSS components, strictly conditionally rendering them behind the isPremiumTier React context.
* **Sprint 4.2:** Integrate the framer-motion library. Refactor all standard motion imports to exclusively utilize the &lt;LazyMotion features={domAnimation}> paradigm, strictly enforcing the 4.6kb initial load threshold.
* **Sprint 4.3:** Audit the vite.config.ts build file. Inject the precise regular expressions into the globIgnores array within the vite-plugin-pwa Workbox configuration block, explicitly filtering the WebAssembly binaries and asynchronous motion chunks to ensure they are permanently excluded from the offline precache manifest.

By meticulously applying these architectural principles—feature-flag isolation, IndexedDB queue bypassing, high-compute 2nd Gen Cloud Functions, and aggressive exclusion policies within the Vite PWA manifest—the BaseCamp platform can successfully support a highly profitable, high-bandwidth digital ecosystem for Cambridge private schools without compromising the critical stability, offline capability, and lightweight performance required by the Ghana Education Service.

