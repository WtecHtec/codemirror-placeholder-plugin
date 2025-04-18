import { WidgetType } from "@codemirror/view";

// 右侧边界小部件 
export class SlotRightWidget extends WidgetType {
  constructor(private id: string) {
    super();
  }

  eq(other: SlotRightWidget): boolean {
    return this.id === other.id;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "slot-side-right";
    span.contentEditable = "false";
    span.setAttribute("data-slot-id", this.id);
    return span;
  }
}