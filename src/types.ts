// 定义占位符配置接口
export interface PlaceholderConfig {
    id: string;
    begin: string;
    end: string;
    placeholder: string;
  }
  
  // 定义区域信息接口
  export interface SlotRegion {
    id: string;
    beginPos: number;
    endPos: number;
  }
  
  // 定义主题配置接口
  export interface PlaceholderTheme {
    placeholder?: Record<string, string>;
    slotContent?: Record<string, string>;
    placeholderBegin?: Record<string, string>;
    placeholderEnd?: Record<string, string>;
  }