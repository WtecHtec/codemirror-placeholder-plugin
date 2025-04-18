import React from 'react';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';

// import { createPlaceholderPlugin, createPlaceholderTheme } from '../../src'
import { createPlaceholderPlugin, createPlaceholderTheme } from 'codemirror-placeholder-plugin';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholderConfig?: PlaceholderConfig[];
}

// 定义占位符配置接口
interface PlaceholderConfig {
  id: string;
  begin: string;
  end: string;
  placeholder: string;
}


console.log(createPlaceholderPlugin)



const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange,
  placeholderConfig = [
    { id: '0', begin: '[left:0]', end: '[right:0]', placeholder: '请输入内容' },
    { id: '1', begin: '[left:1]', end: '[right:1]', placeholder: '请输入内容1' }
  ] 
}) => {
  const extensions = React.useMemo(() => {
    return [
      createPlaceholderPlugin(placeholderConfig),
      EditorView.lineWrapping,
      createPlaceholderTheme(),
    ];
  }, [placeholderConfig]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
    />
  );
};

export default CodeEditor;