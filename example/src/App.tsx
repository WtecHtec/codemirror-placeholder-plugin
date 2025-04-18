import React, { use, useEffect, useState } from 'react';
import CodeEditor from './CodeEditor';

function App() {
  const [code, setCode] = useState(`lll: [left:0][right:0] 
    这是一个示例这是普通文本 [left:0][right:0]
    这是一个示例：[left:0][right:0]`);
  useEffect(() => {
    console.log('code', code)
  }, [code])
  return (
    <div>
       <CodeEditor
        value={code}
        onChange={setCode}
      />
    </div>
  );
}

export default App;