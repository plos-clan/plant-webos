const { loadComponent, loadComponentUrl } = (function () {
  const components = document.createElement('div');
  components.id = 'components';
  components.style.display = 'none';
  components.style.visibility = 'hidden';
  components.style.position = 'absolute';
  components.style.width = '0px';
  components.style.height = '0px';
  components.style.overflow = 'hidden';
  components.style.zIndex = '-1';
  components.style.pointerEvents = 'none';
  components.style.userSelect = 'none';
  components.style.opacity = '0';
  document.body.appendChild(components);

  function combineClasses(...classes) {
    class Combined {
      _call_constructor(template) {
        classes.forEach(C => C.prototype._constructor?.call?.(this, template));
      }
    }
    classes.forEach(C => Object.getOwnPropertyNames(C.prototype).forEach(name => {
      if (name === 'constructor') return;
      const descriptor = Object.getOwnPropertyDescriptor(C.prototype, name);
      Object.defineProperty(Combined.prototype, name, descriptor);
    }));
    return Combined;
  }

  function format(template, data) {
    return (new Function(...Object.keys(data), `return \`${template}\``))(...Object.values(data));
  }

  function loadComponent(template) {
    if (!template) return;
    if (template.parentNode !== components) {
      components.appendChild(template);
    }

    const tagName = template.getAttribute('name');
    if (!tagName?.includes('-') || customElements.get(tagName)) return;

    const moduleList = Array.from(template.content.querySelectorAll('script[data-module]'));
    const moduleClass = combineClasses(...moduleList.map(script => {
      try {
        const C = (new Function(script.textContent))();
        script.remove();
        return C;
      } catch (error) {
        console.error(`Error in template ${tagName}: ${error}`);
      }
    }));

    customElements.define(tagName, class extends HTMLElement {
      js = {};
      constructor() {
        super();
        this.js = new moduleClass();
        const shadow = this.attachShadow({ mode: 'open' });
        const child = template.content.cloneNode(true);
        child.querySelectorAll('*').forEach(el => {
          Array.from(el.attributes).forEach(attr => {
            if (!attr.name.startsWith('on')) return;
            el.removeAttribute(attr.name);
            el.addEventListener(attr.name.slice(2), (new Function('e', attr.value)).bind(this.js));
          });
          const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
          textNodes.forEach(node => node.fmtstr = node.textContent);
          el.flush = () => {
            if (el.fmtstr !== undefined && el.fmtstr !== null) {
              el.textContent = format(el.fmtstr, this.js);
            } else {
              textNodes.forEach(node => node.textContent = format(node.fmtstr, this.js));
              Array.from(el.children).forEach(child => typeof child.flush === 'function' ? child.flush() : null);
            }
          };
        });
        shadow.appendChild(child);
        shadow.flush = () => Array.from(shadow.childNodes).forEach(child => typeof child.flush === 'function' ? child.flush() : null);
        this.js.shadow = shadow;
        this.js.flush = shadow.flush;
        this.js.element = this;
        this.shadow = shadow;
        this.flush = shadow.flush;
        this.template = template;
      }
      connectedCallback() {
        this.js._call_constructor(template);
        this.flush();
      }
      disconnectedCallback() { }
      connectedMoveCallback() { }
      adoptedCallback() { }
    });
  }

  document.querySelectorAll('template[name]').forEach(template => loadComponent(template));

  async function loadComponentUrl(url) {
    if (!url) return;
    const response = await fetch(url);
    const data = await response.json();
    Object.keys(data).forEach(name => {
      const template = document.createElement('template');
      template.setAttribute('name', name);
      template.innerHTML = data[name];
      loadComponent(template);
    });
  }

  return { loadComponent, loadComponentUrl };
})();