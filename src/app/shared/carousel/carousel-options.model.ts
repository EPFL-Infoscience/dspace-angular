export interface CarouselOptions {
  title: string;
  link: string;
  description: string;

  fitWidth: boolean;
  fitHeight: boolean;
  targetBlank: boolean;

  /**
   * Adapt the height of the carousel to its width
   */
  keepAspectRatio: boolean;

  /**
   * Set the height of the carousel in pixels (when keepAspectRatio is false)
   */
  carouselHeightPx: number;

  /**
   * Set a fixed width/height ratio (when keepAspectRatio is true)
   */
  aspectRatio: number;

  /**
   * Classes to be applied to the caption
   */
  captionStyle: string;

  /**
   * Classes to be applied to the title
   */
  titleStyle: string;
}
