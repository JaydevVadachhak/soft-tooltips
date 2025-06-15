export interface TooltipOptions {
  /**
   * Tooltip placement: top|bottom|left|right
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  marginBottom?: number;
  delay?: number;
  hidingDelay?: number;
  /**
   * Show arrow indicator
   */
  showArrow?: boolean;
  /**
   * Theme for the tooltip: dark|light|custom
   */
  theme?: 'dark' | 'light' | 'custom';
  /**
   * Custom CSS class for the tooltip
   */
  className?: string;
  /**
   * Trigger type: hover|click|both
   */
  trigger?: 'hover' | 'click' | 'both';
  /**
   * Enable animations
   */
  animation?: boolean;
  /**
   * Animation duration in ms
   */
  animationDuration?: number;
  /**
   * Auto adjust position if tooltip overflows viewport
   */
  autoAdjust?: boolean;
  /**
   * Z-index for the tooltip
   */
  zIndex?: number;
  /**
   * Max width for the tooltip
   */
  maxWidth?: number | string;
  /**
   * Whether tooltip should follow cursor
   */
  followCursor?: boolean;
  /**
   * Disable tooltip on touch devices
   */
  disableOnTouch?: boolean;
  /**
   * Where to append the tooltip: 'parent' or 'body'
   * When 'parent', the tooltip is positioned relative to its parent element
   * When 'body', the tooltip is positioned relative to the viewport
   */
  appendTo?: 'parent' | 'body';
}
