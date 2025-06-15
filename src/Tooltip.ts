import { TooltipContent } from './types/TooltipContent';
import { TooltipOptions } from './types/TooltipOptions';
// CSS styles are included via rollup config

class Tooltip {
  private readonly defaultConfig: TooltipOptions = {
    placement: 'bottom',
    marginLeft: 0,
    marginRight: 0,
    marginTop: 4,
    marginBottom: 0,
    delay: 0,
    hidingDelay: 0,
    showArrow: true,
    theme: 'dark',
    animation: true,
    animationDuration: 300,
    autoAdjust: true,
    zIndex: 1000,
    maxWidth: 300,
    followCursor: false,
    disableOnTouch: false,
    trigger: 'hover',
    appendTo: 'parent', // 'parent' or 'body'
  };

  /**
   * Tooltip CSS classes
   */
  private get CSS() {
    return {
      tooltip: 'st',
      tooltipContent: 'st__content',
      tooltipArrow: 'st__arrow',
      tooltipVisible: 'st--visible',
      tooltipNoAnimation: 'st--no-animation',
      tooltipThemeLight: 'st--light',
      tooltipThemeCustom: 'st--custom',
      tooltipFollowCursor: 'st--follow-cursor',
      tooltipTouchDisabled: 'st--touch-disabled',
      tooltipPlacementTop: 'st--top',
      tooltipPlacementBottom: 'st--bottom',
      tooltipPlacementLeft: 'st--left',
      tooltipPlacementRight: 'st--right',
      tooltipFadeIn: 'st--fade-in',
      tooltipZoom: 'st--zoom',
    };
  }

  /**
   * Module nodes
   */
  private readonly nodes: {
    content: HTMLElement | null;
    wrapper: HTMLElement | null;
    arrow: HTMLElement | null;
  } = {
    wrapper: null,
    content: null,
    arrow: null,
  };

  /**
   * Current Tooltip Configuration
   */
  private currentConfig!: TooltipOptions;

  /**
   * Track if tooltip is visible
   */
  private isVisible: boolean = false;

  /**
   * Store timeout IDs
   */
  private showTimeoutId: number | null = null;
  private hideTimeoutId: number | null = null;

  /**
   * Track current target element
   */
  private currentTarget: HTMLElement | null = null;

  /**
   * Initialize tooltip for an element with specified options
   *
   * @param {HTMLElement} element - target element to attach tooltip to
   * @param {TooltipContent} content — HTML Element or String for tooltip content
   * @param {TooltipOptions} config - tooltip configuration
   */
  public init(
    element: HTMLElement,
    content: TooltipContent,
    config: TooltipOptions = {},
  ): void {
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Remove any existing listeners
    this.removeEventListeners(element);

    // Store element data
    element.dataset.tooltipInitialized = 'true';

    // Add appropriate event listeners based on trigger type
    if (mergedConfig.trigger === 'hover' || mergedConfig.trigger === 'both') {
      this.setupHoverEvents(element, content, mergedConfig);
    }

    if (mergedConfig.trigger === 'click' || mergedConfig.trigger === 'both') {
      this.setupClickEvents(element, content, mergedConfig);
    }

    // Add follow cursor event if enabled
    if (mergedConfig.followCursor) {
      this.setupFollowCursor(element, content, mergedConfig);
    }

    // Add ARIA attributes for accessibility
    element.setAttribute('aria-describedby', 'tooltip');
  }

  /**
   * Setup hover events for an element
   */
  private setupHoverEvents(
    element: HTMLElement,
    content: TooltipContent,
    config: TooltipOptions,
  ): void {
    const mouseenterHandler = () => {
      if (config.disableOnTouch && this.isTouchDevice()) {
        return;
      }

      this.clearTimeouts();

      if (config.delay && config.delay > 0) {
        this.showTimeoutId = window.setTimeout(() => {
          this.show(element, content, config);
        }, config.delay);
      } else {
        this.show(element, content, config);
      }
    };

    const mouseleaveHandler = () => {
      this.clearTimeouts();

      if (config.hidingDelay && config.hidingDelay > 0) {
        this.hideTimeoutId = window.setTimeout(() => {
          this.hide();
        }, config.hidingDelay);
      } else {
        this.hide();
      }
    };

    element.addEventListener('mouseenter', mouseenterHandler);
    element.addEventListener('mouseleave', mouseleaveHandler);

    // Store handlers on element for removal later
    element.dataset.tooltipMouseenterHandler = String(mouseenterHandler);
    element.dataset.tooltipMouseleaveHandler = String(mouseleaveHandler);
  }

  /**
   * Setup click events for an element
   */
  private setupClickEvents(
    element: HTMLElement,
    content: TooltipContent,
    config: TooltipOptions,
  ): void {
    const clickHandler = (e: MouseEvent) => {
      e.preventDefault();

      if (this.isVisible && this.currentTarget === element) {
        this.hide();
      } else {
        this.show(element, content, config);

        // Add document click listener to close tooltip when clicking outside
        const documentClickHandler = (e: MouseEvent) => {
          const target = e.target as Node;
          if (
            this.nodes.wrapper &&
            !this.nodes.wrapper.contains(target) &&
            target !== element
          ) {
            this.hide();
            document.removeEventListener('click', documentClickHandler);
          }
        };

        // Add with slight delay to prevent immediate closing
        setTimeout(() => {
          document.addEventListener('click', documentClickHandler);
        }, 10);
      }
    };

    element.addEventListener('click', clickHandler);

    // Store handler on element for removal later
    element.dataset.tooltipClickHandler = String(clickHandler);
  }

  /**
   * Setup follow cursor functionality
   */
  private setupFollowCursor(
    element: HTMLElement,
    content: TooltipContent,
    config: TooltipOptions,
  ): void {
    const mousemoveHandler = (e: MouseEvent) => {
      if (this.isVisible && this.nodes.wrapper) {
        const x = e.clientX;
        const y = e.clientY;

        this.nodes.wrapper.style.left = `${window.scrollX + x + 15}px`;
        this.nodes.wrapper.style.top = `${window.scrollY + y + 15}px`;
      }
    };

    element.addEventListener('mousemove', mousemoveHandler);

    // Store handler on element for removal later
    element.dataset.tooltipMousemoveHandler = String(mousemoveHandler);
  }

  /**
   * Remove all event listeners from an element
   */
  private removeEventListeners(element: HTMLElement): void {
    if (element.dataset.tooltipInitialized) {
      // We can't directly use the stored handlers because they're stringified
      // Just remove all relevant event listeners
      element.removeEventListener('mouseenter', () => {});
      element.removeEventListener('mouseleave', () => {});
      element.removeEventListener('click', () => {});
      element.removeEventListener('mousemove', () => {});

      // Clean up dataset
      delete element.dataset.tooltipInitialized;
      delete element.dataset.tooltipMouseenterHandler;
      delete element.dataset.tooltipMouseleaveHandler;
      delete element.dataset.tooltipClickHandler;
      delete element.dataset.tooltipMousemoveHandler;
    }
  }

  /**
   * Mouseover/Mouseleave decorator (legacy support)
   *
   * @param {HTMLElement} element - target element to place Tooltip near that
   * @param {TooltipContent} content — any HTML Element of String that will be used as content
   * @param {TooltipOptions} config - custom tooltip configuration like placement and delays and margins
   */
  public onHover(
    element: HTMLElement,
    content: TooltipContent,
    config: TooltipOptions = {},
  ): void {
    const mergedConfig: TooltipOptions = {
      ...this.defaultConfig,
      ...config,
      trigger: 'hover' as const,
    };
    this.init(element, content, mergedConfig);
  }

  /**
   * Click decorator
   *
   * @param {HTMLElement} element - target element to place Tooltip near that
   * @param {TooltipContent} content — any HTML Element of String that will be used as content
   * @param {TooltipOptions} config - custom tooltip configuration
   */
  public onClick(
    element: HTMLElement,
    content: TooltipContent,
    config: TooltipOptions = {},
  ): void {
    const mergedConfig: TooltipOptions = {
      ...this.defaultConfig,
      ...config,
      trigger: 'click' as const,
    };
    this.init(element, content, mergedConfig);
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
    this.currentConfig = { ...this.defaultConfig, ...config };
    this.currentTarget = element;

    // Remove any existing tooltip
    this.nodes.wrapper?.remove();

    // Create tooltip elements
    this.nodes.wrapper = this.make('div', this.CSS.tooltip);
    this.nodes.content = this.make('div', this.CSS.tooltipContent);
    this.nodes.wrapper.appendChild(this.nodes.content);

    // Add arrow if enabled
    if (this.currentConfig.showArrow) {
      this.nodes.arrow = this.make('div', this.CSS.tooltipArrow);
      this.nodes.wrapper.appendChild(this.nodes.arrow);
    }

    // Apply theme
    if (this.currentConfig.theme === 'light') {
      this.nodes.wrapper.classList.add(this.CSS.tooltipThemeLight);
    } else if (this.currentConfig.theme === 'custom') {
      this.nodes.wrapper.classList.add(this.CSS.tooltipThemeCustom);
    }

    // Apply custom class if provided
    if (this.currentConfig.className) {
      this.nodes.wrapper.classList.add(this.currentConfig.className);
    }

    // Apply animation class
    if (this.currentConfig.animation) {
      this.nodes.wrapper.classList.add(this.CSS.tooltipFadeIn);
      this.nodes.wrapper.style.transitionDuration = `${this.currentConfig.animationDuration}ms`;
    } else {
      this.nodes.wrapper.classList.add(this.CSS.tooltipNoAnimation);
    }

    // Apply follow cursor class if enabled
    if (this.currentConfig.followCursor) {
      this.nodes.wrapper.classList.add(this.CSS.tooltipFollowCursor);
    }

    // Apply touch disabled class if enabled
    if (this.currentConfig.disableOnTouch && this.isTouchDevice()) {
      this.nodes.wrapper.classList.add(this.CSS.tooltipTouchDisabled);
    }

    // Append to parent or body based on configuration
    const appendTarget =
      this.currentConfig.appendTo === 'parent'
        ? element.parentElement || document.body
        : document.body;
    appendTarget.appendChild(this.nodes.wrapper);

    // Set content
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

    // Set z-index if provided
    if (this.currentConfig.zIndex) {
      this.nodes.wrapper.style.zIndex = String(this.currentConfig.zIndex);
    }

    // Set max width if provided
    if (this.currentConfig.maxWidth) {
      const maxWidth =
        typeof this.currentConfig.maxWidth === 'number'
          ? `${this.currentConfig.maxWidth}px`
          : this.currentConfig.maxWidth;
      this.nodes.wrapper.style.maxWidth = maxWidth;
    }

    // Position the tooltip
    this.position(element);

    // Make tooltip visible with slight delay to allow for positioning
    setTimeout(() => {
      if (this.nodes.wrapper) {
        this.nodes.wrapper.classList.add(this.CSS.tooltipVisible);
        this.isVisible = true;
      }
    }, 10);

    // Set ARIA attributes for accessibility
    this.nodes.wrapper.setAttribute('role', 'tooltip');
    this.nodes.wrapper.id = 'tooltip';
  }

  /**
   * Position the tooltip relative to the element
   */
  private position(element: HTMLElement): void {
    if (!this.nodes.wrapper) return;

    const targetRect = element.getBoundingClientRect();
    const tooltipRect = this.nodes.wrapper.getBoundingClientRect();
    const parentRect = (
      element.parentElement || document.body
    ).getBoundingClientRect();

    // Remove any existing placement classes
    this.nodes.wrapper.classList.remove(
      this.CSS.tooltipPlacementTop,
      this.CSS.tooltipPlacementBottom,
      this.CSS.tooltipPlacementLeft,
      this.CSS.tooltipPlacementRight,
    );

    // Set initial position based on placement
    let placement = this.currentConfig.placement || 'bottom';
    let top = 0;
    let left = 0;

    // Apply margins
    const marginTop = this.currentConfig.marginTop || 0;
    const marginBottom = this.currentConfig.marginBottom || 0;
    const marginLeft = this.currentConfig.marginLeft || 0;
    const marginRight = this.currentConfig.marginRight || 0;

    // Set position style to absolute
    this.nodes.wrapper.style.position = 'absolute';

    // If appended to parent, position relative to parent
    if (this.currentConfig.appendTo === 'parent' && element.parentElement) {
      // Calculate position relative to parent element
      switch (placement) {
        case 'top':
          top =
            targetRect.top - parentRect.top - tooltipRect.height - marginBottom;
          left =
            targetRect.left -
            parentRect.left +
            targetRect.width / 2 -
            tooltipRect.width / 2;
          this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementTop);
          break;
        case 'bottom':
          top = targetRect.bottom - parentRect.top + marginTop;
          left =
            targetRect.left -
            parentRect.left +
            targetRect.width / 2 -
            tooltipRect.width / 2;
          this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementBottom);
          break;
        case 'left':
          top =
            targetRect.top -
            parentRect.top +
            targetRect.height / 2 -
            tooltipRect.height / 2;
          left =
            targetRect.left - parentRect.left - tooltipRect.width - marginRight;
          this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementLeft);
          break;
        case 'right':
          top =
            targetRect.top -
            parentRect.top +
            targetRect.height / 2 -
            tooltipRect.height / 2;
          left = targetRect.right - parentRect.left + marginLeft;
          this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementRight);
          break;
      }
    } else {
      // Position relative to viewport with scroll offset (absolute to body)
      switch (placement) {
        case 'top':
          top =
            window.scrollY + targetRect.top - tooltipRect.height - marginBottom;
          left =
            window.scrollX +
            targetRect.left +
            targetRect.width / 2 -
            tooltipRect.width / 2;
          this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementTop);
          break;
        case 'bottom':
          top = window.scrollY + targetRect.bottom + marginTop;
          left =
            window.scrollX +
            targetRect.left +
            targetRect.width / 2 -
            tooltipRect.width / 2;
          this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementBottom);
          break;
        case 'left':
          top =
            window.scrollY +
            targetRect.top +
            targetRect.height / 2 -
            tooltipRect.height / 2;
          left =
            window.scrollX + targetRect.left - tooltipRect.width - marginRight;
          this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementLeft);
          break;
        case 'right':
          top =
            window.scrollY +
            targetRect.top +
            targetRect.height / 2 -
            tooltipRect.height / 2;
          left = window.scrollX + targetRect.right + marginLeft;
          this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementRight);
          break;
      }
    }

    // Auto adjust position if enabled and tooltip would overflow viewport
    if (this.currentConfig.autoAdjust) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get absolute position for viewport overflow check
      const absLeft =
        this.currentConfig.appendTo === 'parent'
          ? left + parentRect.left
          : left;
      const absTop =
        this.currentConfig.appendTo === 'parent' ? top + parentRect.top : top;

      // Check for horizontal overflow
      if (absLeft < 0) {
        left =
          this.currentConfig.appendTo === 'parent' ? 5 - parentRect.left : 5;
      } else if (absLeft + tooltipRect.width > viewportWidth) {
        const adjustment =
          this.currentConfig.appendTo === 'parent'
            ? viewportWidth - tooltipRect.width - 5 - parentRect.left
            : viewportWidth - tooltipRect.width - 5;
        left = adjustment;
      }

      // Check for vertical overflow
      if (absTop < 0) {
        // If top placement overflows, switch to bottom
        if (placement === 'top') {
          if (this.currentConfig.appendTo === 'parent') {
            top = targetRect.bottom - parentRect.top + marginTop;
            this.nodes.wrapper.classList.remove(this.CSS.tooltipPlacementTop);
            this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementBottom);
          } else {
            top = window.scrollY + targetRect.bottom + marginTop;
            this.nodes.wrapper.classList.remove(this.CSS.tooltipPlacementTop);
            this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementBottom);
          }
        } else {
          top =
            this.currentConfig.appendTo === 'parent' ? 5 - parentRect.top : 5;
        }
      } else if (absTop + tooltipRect.height > viewportHeight) {
        // If bottom placement overflows, switch to top
        if (placement === 'bottom') {
          if (this.currentConfig.appendTo === 'parent') {
            top =
              targetRect.top -
              parentRect.top -
              tooltipRect.height -
              marginBottom;
            this.nodes.wrapper.classList.remove(
              this.CSS.tooltipPlacementBottom,
            );
            this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementTop);
          } else {
            top =
              window.scrollY +
              targetRect.top -
              tooltipRect.height -
              marginBottom;
            this.nodes.wrapper.classList.remove(
              this.CSS.tooltipPlacementBottom,
            );
            this.nodes.wrapper.classList.add(this.CSS.tooltipPlacementTop);
          }
        } else {
          const adjustment =
            this.currentConfig.appendTo === 'parent'
              ? viewportHeight - tooltipRect.height - 5 - parentRect.top
              : viewportHeight - tooltipRect.height - 5;
          top = adjustment;
        }
      }
    }

    // Apply position
    this.nodes.wrapper.style.top = `${top}px`;
    this.nodes.wrapper.style.left = `${left}px`;
  }

  /**
   * Hide toolbox tooltip and clean content
   */
  public hide(): void {
    if (this.nodes.wrapper) {
      // If animation is enabled, wait for it to complete
      if (this.currentConfig?.animation) {
        this.nodes.wrapper.classList.remove(this.CSS.tooltipVisible);

        setTimeout(() => {
          this.nodes.wrapper?.remove();
          this.isVisible = false;
          this.currentTarget = null;
        }, this.currentConfig.animationDuration || 300);
      } else {
        this.nodes.wrapper.remove();
        this.isVisible = false;
        this.currentTarget = null;
      }
    }
  }

  /**
   * Clear any pending timeouts
   */
  private clearTimeouts(): void {
    if (this.showTimeoutId !== null) {
      window.clearTimeout(this.showTimeoutId);
      this.showTimeoutId = null;
    }

    if (this.hideTimeoutId !== null) {
      window.clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }
  }

  /**
   * Detect if device is touch-enabled
   */
  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Destroy tooltip and remove all event listeners
   */
  public destroy(element: HTMLElement): void {
    this.removeEventListeners(element);
    this.hide();
    element.removeAttribute('aria-describedby');
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
    attributes: Record<string, any> = {},
  ): HTMLElement {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      if (attributes.hasOwnProperty(attrName)) {
        // Use setAttribute instead of direct property assignment
        el.setAttribute(attrName, attributes[attrName]);
      }
    }

    return el;
  }
}

export { Tooltip };
