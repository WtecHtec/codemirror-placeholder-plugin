import { EditorView, Decoration, ViewPlugin, ViewUpdate } from '@codemirror/view';

import { PlaceholderConfig, SlotRegion } from './types';
import { SlotLeftWidget } from './SlotLeftWidget';
import { SlotPlaceholderWidget } from './SlotPlaceholderWidget';
import { SlotRightWidget } from './SlotRightWidget';


// 使用模块级变量来保存状态
let globalIsDeleting = false;
let lastCursorPos = -1;

// 创建基于配置的占位符插件
export function createPlaceholderPlugin(config: PlaceholderConfig[] = []) {
  // 用于存储所有占位符区域的位置信息
  let slotRegions: SlotRegion[] = [];
  
  return ViewPlugin.fromClass(
    class {
      decorations;
      
      constructor(view: EditorView) {
        this.decorations = this.createDecorations(view);
      }
      
      // 修正光标位置的辅助方法
      correctCursorPosition(view: EditorView, pos: number): number {
        // 检查光标是否在任何占位符区域内
        for (const region of slotRegions) {
          const { beginPos, endPos } = region;
          
          // 获取区域的开始和结束标记长度
          const beginLength = config.find(c => c.id === region.id)?.begin.length || 0;
          const endLength = config.find(c => c.id === region.id)?.end.length || 0;
          
          const beginEndPos = beginPos + beginLength;
          const endStartPos = endPos - endLength;
          
          // 如果光标在开始标记内部，将其移到标记之后
          if (pos > beginPos && pos < beginEndPos) {
            return beginEndPos;
          }
          
          // 如果光标在结束标记内部，将其移到标记之前
          if (pos > endStartPos && pos < endPos) {
            return endStartPos;
          }
        }
        
        return pos;
      }
      
      createDecorations(view: EditorView) {
        const decorations: any[] = [];
        const text = view.state.doc.toString();
        const docLength = view.state.doc.length;
        
        // 重置区域信息
        slotRegions = [];
        
        // 处理每个占位符配置
        config.forEach(item => {
          const { id, begin, end, placeholder } = item;
          
          // 转义特殊字符用于正则表达式
          const escBegin = begin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const escEnd = end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          // 构建正则表达式来匹配占位符 - 支持多行模式
          const pattern = `${escBegin}(.*?)${escEnd}`;
          const regex = new RegExp(pattern, 'gs');

          let match;
          while ((match = regex.exec(text)) !== null) {
            try {
              const startPos = match.index;
              const endPos = startPos + match[0].length;
              const content = match[1];
              
              // 严格检查位置是否有效
              if (startPos >= endPos || startPos < 0 || endPos > docLength) {
                continue;
              }
              
              // 记录区域信息
              slotRegions.push({
                id,
                beginPos: startPos,
                endPos: endPos
              });
              
              const beginEndPos = startPos + begin.length;
              const contentStartPos = startPos + begin.length;
              const contentEndPos = endPos - end.length;
              
              // 检查内容是否为空
              const hasContent = content.length > 0;
              
              // 添加左侧边界装饰
              if (startPos < beginEndPos) {
                decorations.push(
                  Decoration.replace({
                    widget: new SlotLeftWidget(id),
                  }).range(startPos, beginEndPos)
                );
              }
              
              // 内容部分处理
              if (contentStartPos < contentEndPos) {
                if (!hasContent) {
                  // 如果内容为空，显示占位符
                  decorations.push(
                    Decoration.replace({
                      widget: new SlotPlaceholderWidget(placeholder, id),
                    }).range(contentStartPos, contentEndPos)
                  );
                } else {
                  // 检查内容是否包含换行符
                  const contentText = text.slice(contentStartPos, contentEndPos);
                  if (contentText.includes('\n')) {
                    // 如果包含换行符，分段处理每一行
                    let lineStart = contentStartPos;
                    
                    for (let i = 0; i < contentText.length; i++) {
                      const char = contentText[i];
                      const currentPos = contentStartPos + i;
                      
                      if (char === '\n') {
                        // 为当前行添加样式
                        if (currentPos > lineStart) {
                          decorations.push(
                            Decoration.mark({
                              class: 'slot-content',
                              attributes: { 'data-slot-id': id },
                              inclusive: false
                            }).range(lineStart, currentPos)
                          );
                        }
                        
                        // 换行符单独处理
                        decorations.push(
                          Decoration.mark({
                            class: 'slot-content-newline',
                            attributes: { 'data-slot-id': id },
                            inclusive: false
                          }).range(currentPos, currentPos + 1)
                        );
                        
                        lineStart = currentPos + 1;
                      }
                    }
                    
                    // 处理最后一行
                    if (lineStart < contentEndPos) {
                      decorations.push(
                        Decoration.mark({
                          class: 'slot-content',
                          attributes: { 'data-slot-id': id },
                          inclusive: false
                        }).range(lineStart, contentEndPos)
                      );
                    }
                  } else {
                    // 如果没有换行符，正常添加内容样式
                    decorations.push(
                      Decoration.mark({
                        class: 'slot-content',
                        attributes: { 'data-slot-id': id },
                        inclusive: false
                      }).range(contentStartPos, contentEndPos)
                    );
                  }
                }
              } else if (contentStartPos === contentEndPos) {
                // 处理 begin 与 end 邻接的情况
                // 创建一个零宽度的占位符小部件
                decorations.push(
                  Decoration.widget({
                    widget: new SlotPlaceholderWidget(placeholder, id),
                    side: 1, // 放置在位置的右侧
                    block: false
                  }).range(contentStartPos)
                );
              }
              
              // 添加右侧边界装饰
              const endStartPos = endPos - end.length;
              if (endStartPos < endPos) {
                decorations.push(
                  Decoration.replace({
                    widget: new SlotRightWidget(id),
                  }).range(endStartPos, endPos)
                );
              }
            } catch (error) {
              console.error('处理占位符时出错:', error);
            }
          }
        });
        
        // 确保所有装饰都有有效的范围
        const validDecorations = decorations.filter(deco => {
          try {
            const from = deco.from;
            const to = deco.to;
            return from <= to && from >= 0 && to <= docLength;
          } catch (e) {
            return false;
          }
        }).sort((a, b) => a.from - b.from);
        
        return Decoration.set(validDecorations);
      }
      
      update(update: ViewUpdate) {
        try {
          if (update.docChanged) {
            // 保存当前光标位置
            const selection = update.state.selection.main;
            const cursorPos = selection.head;
            
            // 检查内容变化
            update.changes.iterChangedRanges((fromA, toA, fromB, toB) => {
              const oldText = update.startState.doc.sliceString(fromA, toA);
              const newText = update.state.doc.sliceString(fromB, toB);
              
              // 检查是否是删除操作
              if (newText.length < oldText.length && !globalIsDeleting) {
                // 设置删除标记，防止连锁反应
                globalIsDeleting = true;
                
                // 获取完整文本
                const fullText = update.state.doc.toString();
                
                // 检查是否删除了占位符标记
                for (const item of config) {
                  const { begin, end } = item;
                  
                  // 转义特殊字符用于正则表达式
                  const escBegin = begin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const escEnd = end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  
                  // 检查是否删除了结束标记
                  if (oldText.includes(end)) {
                    // 查找被删除标记所在的完整区域
                    const beforeText = fullText.slice(Math.max(0, fromB - 100), fromB);
                    
                    // 向前查找最近的开始标记
                    const beginMatches = [...beforeText.matchAll(new RegExp(escBegin, 'g'))];
                    if (beginMatches.length > 0) {
                      const lastBeginMatch = beginMatches[beginMatches.length - 1];
                      const beginPos = lastBeginMatch.index + (Math.max(0, fromB - 100));
                      
                      try {
                        // 保存当前光标位置，用于恢复
                        lastCursorPos = beginPos;
                        
                        // 使用 setTimeout 延迟执行删除操作，避免在更新过程中触发新的更新
                        setTimeout(() => {
                          try {
                            const transaction = update.view.state.update({
                              changes: {from: beginPos, to: toB, insert: ''},
                              scrollIntoView: false
                            });
                            update.view.dispatch(transaction);
                          } catch (e) {
                            console.error('延迟删除区域时出错:', e);
                          } finally {
                            globalIsDeleting = false;
                          }
                        }, 0);
                        
                        return; // 防止继续处理
                      } catch (e) {
                        console.error('删除区域时出错:', e);
                        globalIsDeleting = false;
                      }
                    }
                  }
                  
                  // 检查是否删除了开始标记
                  else if (oldText.includes(begin)) {
                    // 查找被删除标记所在的完整区域
                    const afterText = fullText.slice(toB, Math.min(fullText.length, toB + 100));
                    
                    // 向后查找最近的结束标记
                    const endMatches = [...afterText.matchAll(new RegExp(escEnd, 'g'))];
                    if (endMatches.length > 0) {
                      const firstEndMatch = endMatches[0];
                      const endPos = toB + firstEndMatch.index + end.length;
                      
                      try {
                        // 保存当前光标位置，用于恢复
                        lastCursorPos = fromB;
                        
                        // 使用 setTimeout 延迟执行删除操作，避免在更新过程中触发新的更新
                        setTimeout(() => {
                          try {
                            const transaction = update.view.state.update({
                              changes: {from: fromB, to: endPos, insert: ''},
                              scrollIntoView: false
                            });
                            update.view.dispatch(transaction);
                          } catch (e) {
                            console.error('延迟删除区域时出错:', e);
                          } finally {
                            globalIsDeleting = false;
                          }
                        }, 0);
                        
                        return; // 防止继续处理
                      } catch (e) {
                        console.error('删除区域时出错:', e);
                        globalIsDeleting = false;
                      }
                    }
                  }
                }
                
                // 重置删除标记
                globalIsDeleting = false;
              }
            });
            
            // 更新装饰
            this.decorations = this.createDecorations(update.view);
            
            // 如果有保存的光标位置，恢复它
            if (lastCursorPos !== -1 && !globalIsDeleting) {
              try {
                // 使用 setTimeout 延迟执行光标恢复操作
                setTimeout(() => {
                  try {
                    const transaction = update.view.state.update({
                      selection: {anchor: lastCursorPos, head: lastCursorPos},
                      scrollIntoView: false
                    });
                    update.view.dispatch(transaction);
                  } catch (e) {
                    console.error('延迟恢复光标位置时出错:', e);
                  } finally {
                    lastCursorPos = -1; // 重置
                  }
                }, 0);
              } catch (e) {
                console.error('恢复光标位置时出错:', e);
              }
            }
          } else if (update.selectionSet) {
            // 处理光标移动
            const selection = update.state.selection.main;
            const cursorPos = selection.head;
            
            // 修正光标位置
            const correctedPos = this.correctCursorPosition(update.view, cursorPos);
            
            // 如果光标位置需要修正
            if (correctedPos !== cursorPos) {
              try {
                const transaction = update.view.state.update({
                  selection: {anchor: correctedPos, head: correctedPos},
                  scrollIntoView: false
                });
                update.view.dispatch(transaction);
              } catch (e) {
                console.error('修正光标位置时出错:', e);
              }
            }
          } else if (update.viewportChanged) {
            this.decorations = this.createDecorations(update.view);
          }
        } catch (e) {
          console.error('更新过程中出错:', e);
          globalIsDeleting = false; // 确保错误时重置状态
        }
      }
    },
    {
      decorations: v => v.decorations,
      provide: plugin => EditorView.atomicRanges.of(view => {
        try {
          // 确保边界标记是原子的
          const decorations = view.plugin(plugin)?.decorations || Decoration.none;
          return decorations.update({
            filter: (from, to, value) => {
              return value.spec.widget instanceof SlotLeftWidget || 
                     value.spec.widget instanceof SlotRightWidget ||
                     value.spec.widget instanceof SlotPlaceholderWidget;
            }
          });
        } catch (e) {
          console.error('提供装饰时出错:', e);
          return Decoration.none;
        }
      })
    }
  );
}