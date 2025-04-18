import { EditorView } from '@codemirror/view';
// 从 @codemirror/state 包导入 Extension 类型
import type { Extension } from '@codemirror/state';
import { PlaceholderTheme } from './types';

export function createPlaceholderTheme(customTheme: PlaceholderTheme = {}): Extension {
  return  EditorView.theme({
    '.slot-content': {
      backgroundColor: 'rgba(186, 192, 255, .2)',
      color: '#4e40e5',
      wordBreak: 'break-all',
      lineHeight: '20px',
      minHeight: '20px',
      display: 'inline-block',
      verticalAlign: 'middle',
      border: '1px solid rgba(148, 152, 247, .3)',
      borderLeft: 'none',
      borderRight: 'none',
      ...(customTheme.slotContent || {}),
    },
    '.slot-content-newline': {
      backgroundColor: 'rgba(186, 192, 255, .2)',
      color: '#4e40e5',
      display: 'inline',
    },
    '.slot-side-left': {
      position: 'relative',
      display: 'inline-block',
      width: '8px',
      height: '20px',
      backgroundColor: 'rgba(186, 192, 255, 0.5)',
      borderRadius: '4px 0 0 4px',
      border: '1px solid rgba(148, 152, 247, .5)',
      borderRight: 'none',
      verticalAlign: 'middle',
      cursor: 'default',
      ...(customTheme.placeholderBegin || {}),
    },
    '.slot-side-right': {
      position: 'relative',
      display: 'inline-block',
      width: '8px',
      height: '20px',
      backgroundColor: 'rgba(186, 192, 255, 0.5)',
      borderRadius: '0 4px 4px 0',
      border: '1px solid rgba(148, 152, 247, .5)',
      borderLeft: 'none',
      verticalAlign: 'middle',
      cursor: 'default',
      ...(customTheme.placeholderEnd || {}),
    },
    '.slot-placeholder': {
      display: 'inline-block',
      backgroundColor: 'rgba(186, 192, 255, .2)',
      color: 'rgba(148, 152, 247, .7)',
      padding: '0 4px',
      lineHeight: '20px',
      minHeight: '20px',
      verticalAlign: 'middle',
      cursor: 'text',
      border: '1px solid rgba(148, 152, 247, .3)',
      borderLeft: 'none',
      borderRight: 'none',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '150px',
      ...(customTheme.placeholder || {}),
    },
    '.cm-widgetBuffer': {
      display: 'inline',
      width: '0',
      height: '0',
    },
    '&': {
      fontSize: '14px',
    },
    '.cm-gutters': {
      display: 'none',
    },
  });
}