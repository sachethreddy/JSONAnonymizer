import React, { useState, useRef, useMemo } from 'react';
import './index.css';
import './tree.css';
import { JsonViewer } from './components/JsonViewer';

interface Rule {
  key: string;
  strategy: 'mask' | 'redact' | 'hash' | 'fake' | 'tokenize';
  fakeType?: string;
}

function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [keyInput, setKeyInput] = useState('');
  const [strategyInput, setStrategyInput] = useState<'mask'|'redact'|'hash'|'fake'|'tokenize'>('mask');
  const [fakeInput, setFakeInput] = useState('name');
  
  // View mode
  const [viewMode, setViewMode] = useState<'file'|'text'>('text');
  const [renderMode, setRenderMode] = useState<'raw'|'tree'>('raw');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  
  // Layout mode
  const [rulesExpanded, setRulesExpanded] = useState(true);

  // File state
  const [file, setFile] = useState<File | null>(null);

  // Text state
  const [inputText, setInputText] = useState('{\n  "user": {\n    "email": "user@example.com",\n    "ssn": "123-45-6789"\n  }\n}');
  const [outputText, setOutputText] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ruleFileInputRef = useRef<HTMLInputElement>(null);

  const exportRules = () => {
    if (rules.length === 0) {
      setStatus({ type: 'error', message: 'No rules to export.' });
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rules, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'obfuscator-rules.json');
    dlAnchorElem.click();
    dlAnchorElem.remove();
  };

  const importRules = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileItem = e.target.files?.[0];
    if (!fileItem) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
           setRules(json);
           setStatus({ type: 'success', message: 'Rules configuration successfully imported!' });
        } else {
           setStatus({ type: 'error', message: 'Invalid rules format. Must be a JSON array.' });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to parse rules JSON file.' });
      }
    };
    reader.readAsText(fileItem);
    e.target.value = ''; // reset so same file can be re-imported
  };

  const addRule = () => {
    if (!keyInput.trim()) return;
    setRules([...rules, { 
      key: keyInput.trim(), 
      strategy: strategyInput,
      fakeType: strategyInput === 'fake' ? fakeInput : undefined
    }]);
    setKeyInput('');
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const executePayload = async () => {
    setLoading(true);
    setStatus(null);

    const formData = new FormData();

    if (viewMode === 'file') {
      if (!file) {
        setStatus({ type: 'error', message: 'Please select a file first.' });
        setLoading(false);
        return;
      }
      formData.append('file', file);
    } else {
      if (!inputText.trim()) {
        setStatus({ type: 'error', message: 'Input JSON cannot be empty.' });
        setLoading(false);
        return;
      }
      // Create a virtual file to satisfy the Multer endpoint without requiring a backend rewrite
      const textBlob = new Blob([inputText], { type: 'application/json' });
      formData.append('file', textBlob, 'inline.json');
    }
    
    // Construct configuration
    const config = {
      keys: rules.reduce((acc, rule) => {
        acc[rule.key] = { strategy: rule.strategy, fakeType: rule.fakeType };
        return acc;
      }, {} as Record<string, any>),
      deterministic: true
    };
    
    formData.append('config', JSON.stringify(config));

    try {
      const response = await fetch('http://localhost:3001/api/obfuscate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server Error');
      }

      if (viewMode === 'file') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `obfuscated-${file!.name}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        setStatus({ type: 'success', message: 'File successfully anonymized and downloaded!' });
      } else {
        const jsonText = await response.text();
        try {
          const parsed = JSON.parse(jsonText);
          setOutputText(JSON.stringify(parsed, null, 2));
          setStatus({ type: 'success', message: 'Successfully Processed!' });
        } catch {
           setOutputText(jsonText);
           setStatus({ type: 'success', message: 'Successfully Processed Object' });
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'An error occurred during processing.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setStatus({ type: 'success', message: 'Copied to clipboard' });
  };

  return (
    <div className="app-container">
      <header>
        <h1>JSON Anonymizer</h1>
        <p>Dynamic Data Protection & Obfuscation Pipeline</p>
      </header>

      <div className={`dashboard-grid ${rulesExpanded ? 'rules-open' : 'rules-closed'}`}>
        <div className={`panel rules-panel ${rulesExpanded ? '' : 'collapsed'}`}>
          {rulesExpanded ? (
            <>
              <div className="panel-header">
                <h2>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Config Rules
                </h2>
                <button className="icon-btn" style={{ padding: '8px' }} onClick={() => setRulesExpanded(false)} title="Collapse Rules">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                </button>
              </div>
              
              <div className="rule-group">
                <label>Add new field rule</label>
                <div className="input-row">
                  <input 
                    type="text" 
                    placeholder="Key (e.g., email)" 
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRule()}
                  />
                  <select value={strategyInput} onChange={(e) => setStrategyInput(e.target.value as any)}>
                    <option value="mask">Mask</option>
                    <option value="redact">Redact</option>
                    <option value="hash">Hash</option>
                    <option value="tokenize">Tokenize</option>
                    <option value="fake">Fake</option>
                  </select>
                </div>
              </div>
              
              {strategyInput === 'fake' && (
                <div className="rule-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <label>Fake Data Type</label>
                  <select value={fakeInput} onChange={(e) => setFakeInput(e.target.value)}>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="creditCard">Credit Card</option>
                    <option value="uuid">UUID</option>
                    <option value="address">Address (Street)</option>
                    <option value="city">City</option>
                    <option value="state">State</option>
                    <option value="zip">Zip / Postal Code</option>
                    <option value="country">Country</option>
                    <option value="date">Date (Past)</option>
                  </select>
                </div>
              )}

              <button className="primary" onClick={addRule}>+ Add Rule</button>

              <div className="rules-list">
                {rules.map((rule, idx) => (
                  <div key={idx} className="rule-item">
                    <div>
                      <span className="key">{rule.key}</span>
                      {' → '}
                      <span className="strategy">
                        {rule.strategy} {rule.fakeType ? `(${rule.fakeType})` : ''}
                      </span>
                    </div>
                    <button className="icon-btn" onClick={() => removeRule(idx)} title="Remove">✕</button>
                  </div>
                ))}
                {rules.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>
                    No explicit rules defined. Default heuristic Pattern matching applies.
                  </p>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="icon-btn" onClick={exportRules} style={{ flex: 1, padding: '8px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>📤 Export Setup</button>
                <button className="icon-btn" onClick={() => ruleFileInputRef.current?.click()} style={{ flex: 1, padding: '8px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>📥 Import Setup</button>
                <input type="file" ref={ruleFileInputRef} style={{ display: 'none' }} accept=".json" onChange={importRules} />
              </div>
            </>
          ) : (
            <button className="icon-btn" style={{ padding: '12px' }} onClick={() => setRulesExpanded(true)} title="Expand Rules">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </button>
          )}
        </div>

        <div className={`panel ${viewMode === 'text' ? 'naked-panel' : ''}`} style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
          
          <div className="mode-toggle" style={{ marginBottom: viewMode === 'text' ? '10px' : '20px' }}>
            <button 
              className={viewMode === 'text' ? 'active' : ''} 
              onClick={() => { setViewMode('text'); setStatus(null); }}
            >
              Paste JSON
            </button>
            <button 
              className={viewMode === 'file' ? 'active' : ''} 
              onClick={() => { setViewMode('file'); setStatus(null); }}
            >
              Upload File
            </button>
          </div>

          {viewMode === 'text' && (
             <div className="sub-mode-toggle">
                <button 
                   className={renderMode === 'raw' ? 'active-outline' : ''}
                   onClick={() => setRenderMode('raw')}
                >Raw Editor</button>
                <button 
                   className={renderMode === 'tree' ? 'active-outline' : ''}
                   onClick={() => setRenderMode('tree')}
                >Interactive Explorer</button>
             </div>
          )}
          
          {viewMode === 'text' && selectedPath && (
             <div className="path-banner">
                <span>Selected JSONPath:</span>
                <code>{selectedPath}</code>
                <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(selectedPath); setStatus({type: 'success', message: 'Path Copied!'}) }}>Copy</button>
                <button className="icon-btn" onClick={() => setSelectedPath(null)} style={{marginLeft: 'auto'}}>✕</button>
             </div>
          )}

          <h2 style={{ marginBottom: '10px' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            Process Payload
          </h2>
          
          {viewMode === 'file' ? (
            <div 
              className={`file-dropzone ${file ? 'active' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && setFile(e.target.files[0])} 
              />
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--primary-accent)', marginBottom: '10px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              </svg>
              {file ? (
                <p>Selected: <strong>{file.name}</strong></p>
              ) : (
                <p>Drag & Drop your JSON file here<br/>or <strong>Browse</strong></p>
              )}
            </div>
          ) : (
            <div className="text-mode-container">
               <div className="textarea-wrapper">
                 <label>Original JSON</label>
                 {renderMode === 'raw' ? (
                   <textarea 
                      className="json-textarea"
                      placeholder="Paste your JSON here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                   />
                 ) : (
                   <div className="json-textarea tree-view-container">
                      {(() => {
                         try { return <JsonViewer data={JSON.parse(inputText)} onSelectPath={setSelectedPath} />; }
                         catch { return <div className="json-error">Invalid JSON input. Fix in Raw Editor.</div>; }
                      })()}
                   </div>
                 )}
               </div>
               <div className="textarea-wrapper">
                 <label>
                   Obfuscated JSON
                   {outputText && (
                     <button onClick={handleCopy} title="Copy to clipboard">
                       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                     </button>
                   )}
                 </label>
                 {renderMode === 'raw' ? (
                   <textarea 
                      className="json-textarea"
                      readOnly
                      placeholder="Result will appear here..."
                      value={outputText}
                   />
                 ) : (
                   <div className="json-textarea tree-view-container">
                      {(() => {
                         if (!outputText) return <span className="json-empty">No output to display</span>;
                         try { return <JsonViewer data={JSON.parse(outputText)} onSelectPath={setSelectedPath} />; }
                         catch { return <div className="json-error">Invalid JSON output. Check Raw Editor.</div>; }
                      })()}
                   </div>
                 )}
               </div>
            </div>
          )}

          <button 
            className="primary" 
            onClick={executePayload}
            disabled={loading || (viewMode === 'file' && !file)}
            style={{ marginTop: 'auto', alignSelf: 'stretch', padding: '16px' }}
          >
             {loading ? 'Processing...' : (viewMode === 'file' ? 'Obfuscate & Download File' : 'Run Obfuscation Rules')}
          </button>

          {status && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
