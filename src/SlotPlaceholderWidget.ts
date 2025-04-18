import { WidgetType } from "@codemirror/view";

// 占位符小部件
export class SlotPlaceholderWidget extends WidgetType {
    constructor(private placeholder: string, private id: string) {
      super();
    }
  
    eq(other: SlotPlaceholderWidget): boolean {
      return other.placeholder === this.placeholder && other.id === this.id;
    }
  
    toDOM(): HTMLElement {
      const span = document.createElement("span");
      span.className = "slot-placeholder";
      span.contentEditable = "false";
      span.textContent = this.placeholder;
      span.setAttribute("data-slot-id", this.id);
      return span;
    }
  }