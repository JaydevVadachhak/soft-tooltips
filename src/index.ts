export { add } from './utils.js';

export default class Tooltip {
  private content!: string;

  public show(text: string): void {
    // TODO
    console.log(text);
    console.log(this.content);
  }
}
