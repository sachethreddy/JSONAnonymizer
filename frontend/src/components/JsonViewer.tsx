import React, { useState } from 'react';

interface JsonViewerProps {
  data: any;
  onSelectPath: (path: string) => void;
  rootPath?: string;
  isRoot?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ 
  data, 
  onSelectPath, 
  rootPath = '$',
  isRoot = true
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const getType = (value: any) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const handleSelect = (e: React.MouseEvent, key: string | number, isArray: boolean) => {
    e.stopPropagation();
    
    // Construct valid JSONPath
    let currentPath = '';
    if (isArray) {
      currentPath = `${rootPath}[${key}]`;
    } else {
      // Check if key requires bracket notation (contains weird chars)
      const validKeyRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
      if (validKeyRegex.test(String(key))) {
        currentPath = `${rootPath}.${key}`;
      } else {
         currentPath = `${rootPath}["${key}"]`;
      }
    }
    
    onSelectPath(currentPath);
  };

  const type = getType(data);

  if (type === 'object' || type === 'array') {
    const isArray = type === 'array';
    const keys = Object.keys(data);

    if (keys.length === 0) {
       return <span className="json-empty">{isArray ? '[]' : '{}'}</span>;
    }

    return (
      <div className={`json-node ${isRoot ? 'json-root' : ''}`}>
         <div 
           className="json-node-opener" 
           onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
         >
           <span className="json-toggle">{collapsed ? '▶' : '▼'}</span>
           <span className="json-bracket">{isArray ? '[' : '{'}</span>
           {collapsed && <span className="json-collapsed-text"> ... {keys.length} items {isArray ? ']' : '}'}</span>}
         </div>

         {!collapsed && (
           <div className="json-children">
             {keys.map((key, index) => {
                const value = data[key as keyof typeof data];
                const childType = getType(value);
                const isComplex = childType === 'object' || childType === 'array';
                
                return (
                  <div key={key} className="json-child">
                     <span 
                       className="json-key"
                       onClick={(e) => handleSelect(e, key, isArray)}
                       title="Click to copy JSONPath"
                     >
                        {isArray ? '' : `"${key}": `}
                     </span>
                     
                     {isComplex ? (
                       <JsonViewer 
                         data={value} 
                         onSelectPath={onSelectPath} 
                         rootPath={isArray ? `${rootPath}[${key}]` : /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? `${rootPath}.${key}` : `${rootPath}["${key}"]`}
                         isRoot={false}
                       />
                     ) : (
                       <span 
                         className={`json-value json-value-${childType}`}
                         onClick={(e) => handleSelect(e, key, isArray)}
                         title="Click to copy JSONPath"
                       >
                         {childType === 'string' ? `"${value}"` : String(value)}
                       </span>
                     )}
                     {index < keys.length - 1 && <span className="json-comma">,</span>}
                  </div>
                );
             })}
           </div>
         )}
         
         {!collapsed && (
           <div className="json-bracket json-closer">
             {isArray ? ']' : '}'}
           </div>
         )}
      </div>
    );
  }

  // Fallback for direct primitives at root
  return (
     <div className={`json-value json-value-${type}`}>{String(data)}</div>
  );
};
