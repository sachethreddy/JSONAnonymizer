<div align="center">
  <h1>🛡️ JSON Anonymizer</h1>
  <p><b>A high-performance, compliance-ready framework for deeply nested data obfuscation and PII extraction.</b></p>
</div>

---

## 📖 Overview
JSON Anonymizer is a specialized pipeline tool built to intercept, scrub, and rewrite sensitive data payloads (like API dumps, log traces, and localized databases) prior to entering lower-security environments. Whether through exact key configurations or intelligent heuristic deep-scanning, the anonymization engine dynamically protects data boundaries.

---

## ✨ Primary Features

### 1. **Data Intelligent Heuristics (Zero-Config PII Detection)**
You don’t have to manually build rules for standard identifiers. The backend `Heuristic Rule Engine` automatically recognizes dozens of semantic contexts (e.g., `dateofbirth`, `city`, `phone`, `username`) and natively replaces them with geographically contextual synthetic equivalents using internal `Faker` parameters.

### 2. **Recursive Inline Scanning Mode**
Free-text payload descriptions or aggregated log strings are not safe from the scanner. The `Inline Scanner` deeply analyzes all string nodes, matching arbitrary values against standardized structures to proactively mask:
* **Emails** (`j***n@example.com`)
* **Credit Cards** (validated via *Luhn Context Checking*)
* **IP Addresses** & **MAC Attributes**

### 3. **High-Risk Mandatory Enforcements**
Certain assets are simply never safe. A built-in sub-layer intercepts hard-coded risk parameters (`password`, `jwt`, `api-keys`, `secret`, `cvv`) and enacts an aggressive forced `<REDACTED>` tag override regardless of active user configurations. 

### 4. **Exportable Rulesets**
Targeting specific data layouts? Users can explicitly define the execution parameters for exact keys (`Mask`, `Hash`, `Redact`, `Fake`, `Tokenize`). Once your dashboard layout is constructed, **Export It** as a preset `JSON` object to be effortlessly **Imported** back during your next active mapping session.

### 5. **Interactive UI Explorer with JSONPath Navigation**
Ditch standard text boxes for navigating massive payloads. Swap into the **Interactive Explorer**—a custom React tree structure layered with glassmorphic aesthetics that calculates recursive algorithmic node-depth. Click any nested value, array, or key to instantly return its copied `JSONPath` execution route.

---

## 🛠 System Architecture & Stack

### **Backend Engine (`Node.js`, `Express`, `TypeScript`)**
- `Obfuscator Core`: Processes the master array depth and distributes execution to worker classes.
- `RuleEngine`: Ingests and assigns the specific manipulation targets natively or manually defined.
- `Detector & InlineScanner`: Executes real-time Regex matching definitions across parsed objects.
- `Transformers`: Action functions generating Hashes, handling Mock Geometries via `Faker`, or issuing static Redactions.

### **Frontend Environment (`React`, `Vite`)**
- Advanced CSS3 **Glassmorphism** GUI framework with reactive element scaling.
- Seamless "Raw Sandbox" to algorithmic "Interactive Tree" module swapping logic built into state processing.
- Supports inline text processing or direct `.json` File Drag-&-Drop payloads for larger downloads.

---

## 🚀 Getting Started

Ensure you have `npm` and `node` initialized in your local setup.

### 1. Boot up the Backend Core
```bash
# Navigate to the project root
npm install

# Start the TypeScript Server
npx ts-node src/api/server.ts 
# The processing server runs on http://localhost:3001
```

### 2. Boot up the UI Dashboard
```bash
# Open a secondary terminal instance
cd frontend
npm install

# Deploy the Vite developer node
npm run dev
# The React UI runs natively on http://localhost:5173
```
