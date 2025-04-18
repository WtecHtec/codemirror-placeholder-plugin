# CodeMirror 占位符插件

这是一个用于 CodeMirror 6 的插件，可以创建可编辑的占位符区域。

## 安装

```bash
npm install codemirror-placeholder-plugin
```
## 使用
```javascript

import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { createPlaceholderPlugin, createPlaceholderTheme } from 'codemirror-placeholder-plugin';

// 定义占位符配置
const placeholderConfig = [
  { id: '0', begin: '[left:0]', end: '[right:0]', placeholder: '请输入内容' },
  { id: '1', begin: '[left:1]', end: '[right:1]', placeholder: '请输入内容1' }
];

// 在 React 组件中使用
function MyEditor() {
  const extensions = [
    createPlaceholderPlugin(placeholderConfig),
    createPlaceholderTheme(),
    EditorView.lineWrapping
  ];

  return (
    <CodeMirror
      value="这是一段示例文本，包含[left:0]占位符内容[right:0]和[left:1]另一个占位符[right:1]"
      extensions={extensions}
    />
  );
}

```
## 自定义主题
你可以通过自定义主题来修改占位符的样式。以下是一个示例：
```javascript
import { createPlaceholderTheme } from 'codemirror-placeholder-plugin';

const customTheme = createPlaceholderTheme({
  placeholder: {
    backgroundColor: 'rgba(255, 200, 200, .2)',
    color: 'red'
  },
  slotContent: {
    backgroundColor: 'rgba(200, 255, 200, .2)',
    color: 'green'
  }
});

// 在扩展中使用
const extensions = [
  createPlaceholderPlugin(placeholderConfig),
  customTheme,
  // ...其他扩展
];

```

## API
### createPlaceholderPlugin(config)
创建一个占位符插件实例。

- config : 占位符配置数组，每个配置包含：
  - id : 唯一标识符
  - begin : 开始标记
  - end : 结束标记
  - placeholder : 当内容为空时显示的占位符文本
### createPlaceholderTheme(customTheme)
创建占位符主题。

- customTheme : 可选的自定义主题对象，可以包含：
  - placeholder : 占位符样式
  - slotContent : 内容区域样式
  - placeholderBegin : 开始标记样式
  - placeholderEnd : 结束标记样式