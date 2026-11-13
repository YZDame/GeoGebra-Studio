"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLIDER_LABEL_CAPTION = exports.SLIDER_LABEL_NAME = void 0;
exports.objectXmlIsSlider = objectXmlIsSlider;
exports.isSliderType = isSliderType;
exports.planSliderLabel = planSliderLabel;
exports.showSliderLabels = showSliderLabels;
/** Web-engine label styles. Caption paints Unicode; name paints the object name. */
exports.SLIDER_LABEL_NAME = 0;
exports.SLIDER_LABEL_CAPTION = 3;
/** Object XML from getXML(name), not the whole construction. */
function objectXmlIsSlider(xml) {
    return /<slider\b/.test(xml);
}
/**
 * A slider is a numeric object, but an angle slider reports type `angle`.
 * Both carry a `<slider>` element and both must keep their visible label.
 */
function isSliderType(type) {
    return type === 'numeric' || type === 'angle';
}
/**
 * A caption that differs from the object name is shown in caption mode, which
 * paints Chinese and other Unicode beside the slider. Otherwise name mode
 * paints the object name. Both modes are applied after construction styling.
 */
function planSliderLabel(name, caption, override) {
    const authored = override !== undefined ? override : caption;
    const text = (authored ?? '').trim();
    if (text && text !== name)
        return { caption: text, style: exports.SLIDER_LABEL_CAPTION };
    return { style: exports.SLIDER_LABEL_NAME };
}
/**
 * Show every slider's name or caption. Call this after any pass that hides
 * native labels. Returns the names that could not be updated.
 * setLabelVisible is last so a later style change in this function cannot hide it.
 */
function showSliderLabels(api, captionOverrides = {}) {
    const failed = [];
    for (const name of api.getAllObjectNames() || []) {
        try {
            if (!isSliderType(api.getObjectType(name)) || !objectXmlIsSlider(api.getXML(name)))
                continue;
            const override = Object.prototype.hasOwnProperty.call(captionOverrides, name) ? captionOverrides[name] : undefined;
            let existing = '';
            try {
                existing = api.getCaption(name, false) ?? '';
            }
            catch {
                existing = api.getCaption(name) ?? '';
            }
            const plan = planSliderLabel(name, existing, override);
            if (plan.caption !== undefined)
                api.setCaption(name, plan.caption);
            api.setLabelStyle(name, plan.style);
            api.setLabelVisible(name, true);
        }
        catch {
            failed.push(name);
        }
    }
    return failed;
}
//# sourceMappingURL=slider-labels.js.map