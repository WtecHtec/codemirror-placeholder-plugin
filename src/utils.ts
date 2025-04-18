import { PlaceholderConfig } from './types';

/**
 * 解析文本中的占位符内容，返回纯文本
 * @param text 包含占位符的原始文本
 * @param config 占位符配置数组
 * @returns 处理后的纯文本，只包含占位符内容
 */
export function parsePlaceholderContent(text: string, config: PlaceholderConfig[]): string {
  let result = text;
  
  // 处理每个占位符配置
  config.forEach(item => {
    const { begin, end } = item;
    
    // 转义特殊字符用于正则表达式
    const escBegin = begin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escEnd = end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 构建正则表达式来匹配占位符
    const pattern = `${escBegin}(.*?)${escEnd}`;
    const regex = new RegExp(pattern, 'gs');
    
    // 替换所有匹配项，只保留内容部分
    result = result.replace(regex, '$1');
  });
  
  return result;
}