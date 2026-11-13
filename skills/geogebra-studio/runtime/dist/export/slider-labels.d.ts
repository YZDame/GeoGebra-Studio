/** Web-engine label styles. Caption paints Unicode; name paints the object name. */
export declare const SLIDER_LABEL_NAME = 0;
export declare const SLIDER_LABEL_CAPTION = 3;
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
export declare function objectXmlIsSlider(xml: string): boolean;
/**
 * A slider is a numeric object, but an angle slider reports type `angle`.
 * Both carry a `<slider>` element and both must keep their visible label.
 */
export declare function isSliderType(type: string): boolean;
/**
 * A caption that differs from the object name is shown in caption mode, which
 * paints Chinese and other Unicode beside the slider. Otherwise name mode
 * paints the object name. Both modes are applied after construction styling.
 */
export declare function planSliderLabel(name: string, caption: string | undefined, override?: string): SliderLabelPlan;
/**
 * Show every slider's name or caption. Call this after any pass that hides
 * native labels. Returns the names that could not be updated.
 * setLabelVisible is last so a later style change in this function cannot hide it.
 */
export declare function showSliderLabels(api: SliderLabelApi, captionOverrides?: Record<string, string>): string[];
//# sourceMappingURL=slider-labels.d.ts.map