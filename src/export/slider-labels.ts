/** Web-engine label styles. Caption paints Unicode; name paints the object name. */
export const SLIDER_LABEL_NAME = 0;
export const SLIDER_LABEL_CAPTION = 3;

export interface SliderLabelPlan {
  /** Written with setCaption. Omitted when the slider should show its name. */
  caption?: string;
  style: typeof SLIDER_LABEL_NAME | typeof SLIDER_LABEL_CAPTION;
}

export interface SliderLabelApi {
  getAllObjectNames(): string[];
  getObjectType(name: string): string;
  getXML(name: string): string;
  getCaption(name: string, substitutePlaceholders?: boolean): string;
  setCaption(name: string, caption: string): void;
  setLabelStyle(name: string, style: number): void;
  setLabelVisible(name: string, visible: boolean): void;
}

/** Object XML from getXML(name), not the whole construction. */
export function objectXmlIsSlider(xml: string): boolean {
  return /<slider\b/.test(xml);
}

/**
 * A caption that differs from the object name is shown in caption mode, which
 * paints Chinese and other Unicode beside the slider. Otherwise name mode
 * paints the object name. Both modes are applied after construction styling.
 */
export function planSliderLabel(name: string, caption: string | undefined, override?: string): SliderLabelPlan {
  const authored = override !== undefined ? override : caption;
  const text = (authored ?? '').trim();
  if (text && text !== name) return { caption: text, style: SLIDER_LABEL_CAPTION };
  return { style: SLIDER_LABEL_NAME };
}

/**
 * Show every slider's name or caption. Call this after any pass that hides
 * native labels. Returns the names that could not be updated.
 * setLabelVisible is last so a later style change in this function cannot hide it.
 */
export function showSliderLabels(api: SliderLabelApi, captionOverrides: Record<string, string> = {}): string[] {
  const failed: string[] = [];
  for (const name of api.getAllObjectNames() || []) {
    try {
      if (api.getObjectType(name) !== 'numeric' || !objectXmlIsSlider(api.getXML(name))) continue;
      const override = Object.prototype.hasOwnProperty.call(captionOverrides, name) ? captionOverrides[name] : undefined;
      let existing = '';
      try {
        existing = api.getCaption(name, false) ?? '';
      } catch {
        existing = api.getCaption(name) ?? '';
      }
      const plan = planSliderLabel(name, existing, override);
      if (plan.caption !== undefined) api.setCaption(name, plan.caption);
      api.setLabelStyle(name, plan.style);
      api.setLabelVisible(name, true);
    } catch {
      failed.push(name);
    }
  }
  return failed;
}
