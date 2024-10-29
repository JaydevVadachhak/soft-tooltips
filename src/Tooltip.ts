import { TooltipContent } from './types/TooltipContent';
import './styles/main.css';

class Tooltip {
  /**
   * Tooltip CSS classes
   */
  private get CSS() {
    return {
      tooltip: 'st',
      tooltipContent: 'st__content',
    };
  }

  /**
   * Module nodes
   */
  private readonly nodes: {
    content: HTMLElement | null;
    wrapper: HTMLElement | null;
  } = {
    wrapper: null,
    content: null,
  };

  /**
   * Mouseover/Mouseleave decorator
   *
   * @param {HTMLElement} element - target element to place Tooltip near that
   * @param {TooltipContent} content — any HTML Element of String that will be used as content
   */
  public onHover(element: HTMLElement, content: TooltipContent): void {
    element.addEventListener('mouseenter', () => {
      this.show(element, content);
    });
    element.addEventListener('mouseleave', () => {
      this.hide();
    });
  }

  /**
   * Show Tooltip near passed element with specified HTML content
   *
   * @param {HTMLElement} element - target element to place Tooltip near that
   * @param {TooltipContent} content — any HTML Element of String that will be used as content
   */
  public show(element: HTMLElement, content: TooltipContent): void {
    this.nodes.wrapper?.remove();
    this.nodes.wrapper = this.make('div', this.CSS.tooltip);
    this.nodes.content = this.make('div', this.CSS.tooltipContent);
    this.nodes.wrapper.appendChild(this.nodes.content);
    document.body.appendChild(this.nodes.wrapper);
    if (typeof content === 'string') {
      this.nodes.content?.appendChild(document.createTextNode(content));
    } else if (content instanceof Node) {
      this.nodes.content?.appendChild(content);
    } else {
      throw Error(
        '[CodeX Tooltip] Wrong type of «content» passed. It should be an instance of Node or String. ' +
          'But ' +
          typeof content +
          ' given.',
      );
    }
    this.positionTooltip(element, this.nodes.wrapper);
  }

  /**
   * position tooltip to the element
   */
  private positionTooltip(
    targetElement: HTMLElement,
    tooltipElement: HTMLElement,
  ): void {
    const targetRect = targetElement.getBoundingClientRect();
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.top = `${window.scrollY + targetRect.bottom}px`;
    tooltipElement.style.left = `${window.scrollX + targetRect.left}px`;
  }

  /**
   * Hide toolbox tooltip and clean content
   */
  public hide(): void {
    this.nodes.wrapper?.remove();
  }

  /**
   * Helper for making Elements with classname and attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @return {HTMLElement}
   */
  private make(
    tagName: string,
    classNames: string | string[] | null = null,
    attributes: any = {},
  ): HTMLElement {
    const el: any = document.createElement(tagName);
    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }
    for (const attrName in attributes) {
      if (attributes.hasOwnProperty(attrName)) {
        el[attrName] = attributes[attrName];
      }
    }
    return el;
  }
}

export { Tooltip };
