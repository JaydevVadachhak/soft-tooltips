import { TooltipContent } from './types/TooltipContent';
import { TooltipOptions } from './types/TooltipOptions';
import './styles/main.css';

class Tooltip {
  private readonly defaultConfig: TooltipOptions = {
    placement: 'bottom',
    marginLeft: 0,
    marginRight: 0,
    marginTop: 4,
    marginBottom: 0,
    delay: 0,
    hidingDelay: 0,
  };
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
   * Current Tooltip Configuration
   */
  private currentConfig!: TooltipOptions;

  /**
   * Mouseover/Mouseleave decorator
   *
   * @param {HTMLElement} element - target element to place Tooltip near that
   * @param {TooltipContent} content — any HTML Element of String that will be used as content
   * @param {TooltipOptions} config - custom tooltip configuration like placement and delays and margins
   */
  public onHover(
    element: HTMLElement,
    content: TooltipContent,
    config: TooltipOptions,
  ): void {
    element.addEventListener('mouseenter', () => {
      this.currentConfig = Object.assign(this.defaultConfig, config);
      if (this.currentConfig.delay) {
        setTimeout(() => {
          this.show(element, content, this.currentConfig);
        }, this.currentConfig.delay);
      } else {
        this.show(element, content, this.currentConfig);
      }
    });
    element.addEventListener('mouseleave', () => {
      this.currentConfig = Object.assign(this.defaultConfig, config);
      if (this.currentConfig.hidingDelay) {
        setTimeout(() => {
          this.hide();
        }, this.currentConfig.hidingDelay);
      } else {
        this.hide();
      }
    });
  }

  /**
   * Show Tooltip near passed element with specified HTML content
   *
   * @param {HTMLElement} element - target element to place Tooltip near that
   * @param {TooltipContent} content — any HTML Element of String that will be used as content
   * @param {TooltipOptions} config - custom tooltip configuration like placement and delays and margins
   */
  public show(
    element: HTMLElement,
    content: TooltipContent,
    config: TooltipOptions,
  ): void {
    this.nodes.wrapper?.remove();
    this.nodes.wrapper = this.make('div', this.CSS.tooltip);
    this.nodes.content = this.make('div', this.CSS.tooltipContent);
    this.nodes.wrapper.appendChild(this.nodes.content);
    document.body.appendChild(this.nodes.wrapper);
    if (content) {
      if (typeof content === 'string') {
        this.nodes.content?.appendChild(document.createTextNode(content));
      } else if (content instanceof Node) {
        this.nodes.content?.appendChild(content);
      } else {
        throw Error(
          '[Soft Tooltip] Wrong type of «content» passed. It should be an instance of Node or String. ' +
            'But ' +
            typeof content +
            ' given.',
        );
      }
    } else {
      throw Error(
        '[Soft Tooltip] Content is Missing. Tooltip content is must.',
      );
    }
    const targetRect = element.getBoundingClientRect();
    this.nodes.wrapper.style.position = 'absolute';
    this.nodes.wrapper.style.marginTop = `${config.marginTop}px`;
    this.nodes.wrapper.style.marginLeft = `${config.marginLeft}px`;
    this.nodes.wrapper.style.marginBottom = `${config.marginBottom}px`;
    this.nodes.wrapper.style.marginRight = `${config.marginRight}px`;
    switch (config?.placement) {
      case 'top':
        this.nodes.wrapper.style.top = `${window.scrollY + targetRect.top - this.nodes.wrapper.offsetHeight}px`;
        this.nodes.wrapper.style.left = `${window.scrollX + targetRect.left}px`;
        break;
      case 'bottom':
        this.nodes.wrapper.style.top = `${window.scrollY + targetRect.bottom}px`;
        this.nodes.wrapper.style.left = `${window.scrollX + targetRect.left}px`;
        break;
      case 'left':
        this.nodes.wrapper.style.top = `${window.scrollY + targetRect.top}px`;
        this.nodes.wrapper.style.left = `${window.scrollX + targetRect.left - this.nodes.wrapper.offsetWidth}px`;
        break;
      case 'right':
        this.nodes.wrapper.style.top = `${window.scrollY + targetRect.top}px`;
        this.nodes.wrapper.style.left = `${window.scrollX + targetRect.right}px`;
        break;
      default:
        break;
    }
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
