import { WidgetType } from "@codemirror/view";

// 左侧边界小部件
export class SlotLeftWidget extends WidgetType {
    constructor(private id: string) {
      super();
    }
  
    eq(other: SlotLeftWidget): boolean {
      return this.id === other.id;
    }
  
    toDOM(): HTMLElement {
      const span = document.createElement("span");
      span.className = "slot-side-left";
      span.contentEditable = "false";
      span.setAttribute("data-slot-id", this.id);
      return span;
    }
  }