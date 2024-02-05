import { createStore } from "@ngneat/elf";
import {
  addEntities,
  getAllEntities,
  upsertEntities,
  withEntities,
} from "@ngneat/elf-entities";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { Subscription } from "rxjs";

interface Wat {
  id: string;
  a: number;
  b: number;
}

const id = "test";
const store = createStore({ name: "wat" }, withEntities<Wat>());
store.update(addEntities({ id, a: 1, b: 2 }));

@customElement("x-wat")
export class WatElement extends LitElement {
  private a = createRef<HTMLInputElement>();
  private b = createRef<HTMLInputElement>();
  private sub: Subscription | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.sub = store.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sub?.unsubscribe();
  }

  protected render(): unknown {
    const wat = store.query(getAllEntities());
    return html`<h1>wat</h1>
      <label>
        <input type="checkbox" ${ref(this.a)} />
        inc a
      </label>
      <label>
        <input type="checkbox" ${ref(this.b)} />
        inc b
      </label>
      <button @click=${() => this.increment(wat[0])}>Increment</button>
      <p>entities: (${wat.length})</p>
      <ul>
        ${wat.map(
          ({ a, b }) => html`<strong>a:</strong> ${a} <strong>b:</strong> ${b}`
        )}
      </ul>`;
  }

  private increment(wat: Wat) {
    const inca = this.a.value!.checked;
    const incb = this.b.value!.checked;

    const updates: Partial<Wat>[] = [];

    if (inca) updates.push({ id: wat.id, a: wat.a + 1 });
    if (incb) updates.push({ id: wat.id, b: wat.b + 1 });

    store.update(upsertEntities(updates));

    // updates.forEach((update) => store.update(upsertEntities(update)));
  }
}

// TODO issue in github oeffnen
