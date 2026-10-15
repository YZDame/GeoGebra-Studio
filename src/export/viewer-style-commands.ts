import { splitCommandArguments, evaluateViewerNumber } from './viewer-action-commands';

/** Execute literal styling commands through the language-independent applet API.
 * Return null for commands/expressions that must remain with GeoGebra's parser.
 */
export interface ViewerStyleApi {
  exists(name: string): boolean;
  getValue?(expression: string): number;
  setColor(name: string, red: number, green: number, blue: number): void;
  setLineThickness(name: string, value: number): void;
  setLineStyle(name: string, value: number): void;
  setPointSize(name: string, value: number): void;
}

export interface ViewerViewportApi {
  getValue?(expression: string): number;
  setCoordSystem(xmin: number, xmax: number, ymin: number, ymax: number): void;
}

/** ZoomIn's argument order differs from setCoordSystem's. */
export function executeViewerViewportCommand(api: ViewerViewportApi, command: string): true | null {
  const match = /^\s*ZoomIn\s*(?:\(([\s\S]*)\)|\[([\s\S]*)\])\s*$/.exec(command);
  if (!match) return null;
  const args = splitCommandArguments(match[1] ?? match[2]!);
  const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  if (args.length !== 4 || !args.every(arg => numeric.test(arg) || api.getValue)) return null;
  const [xmin, ymin, xmax, ymax] = args.map(arg => evaluateViewerNumber(api, arg)) as [number, number, number, number];
  if (![xmin, ymin, xmax, ymax].every(Number.isFinite) || xmin >= xmax || ymin >= ymax) {
    throw new Error('ZoomIn requires finite bounds with xmin < xmax and ymin < ymax');
  }
  api.setCoordSystem(xmin, xmax, ymin, ymax);
  return true;
}

export function executeViewerStyleCommand(api: ViewerStyleApi, command: string): true | null {
  const match = /^\s*(SetColor|SetLineThickness|SetLineStyle|SetPointSize)\s*[([]\s*([\p{L}_][\p{L}\p{N}_]*|'[^']+'|"[^"]+")\s*,\s*(.*?)\s*[)\]]\s*$/u.exec(command);
  if (!match) return null;
  const name = match[2]!.replace(/^['"]|['"]$/g, '');
  const operation = match[1]!;
  const argumentsText = match[3]!;
  const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const args = splitCommandArguments(argumentsText);
  let color: number[] | undefined;
  let value: number | undefined;
  if (operation === 'SetColor') {
    const named: Record<string, string> = {black:'000000',white:'ffffff',red:'ff0000',green:'008000',blue:'0000ff',yellow:'ffff00',orange:'ffa500',purple:'800080',gray:'808080',grey:'808080',pink:'ffc0cb',cyan:'00ffff',magenta:'ff00ff',brown:'a52a2a'};
    const colorName = /^"([a-z]+)"$/i.exec(argumentsText);
    const hex = /^"#([\da-f]{6})"$/i.exec(argumentsText) ?? (colorName && named[colorName[1]!.toLowerCase()] ? ['', named[colorName[1]!.toLowerCase()]!] : null);
    if (hex) {
      color = [0, 2, 4].map(offset => parseInt(hex[1]!.slice(offset, offset + 2), 16));
    } else if (args.length === 3 && args.every(arg => numeric.test(arg) || api.getValue)) {
      color = args.map(arg => evaluateViewerNumber(api, arg));
      // Accept command RGB (0..1), plus byte RGB commonly supplied by API callers.
      const maximum = color.some(component => component > 1) ? 255 : 1;
      if (color.some(component => !Number.isFinite(component) || component < 0 || component > maximum)) {
        throw new Error('SetColor RGB must be within 0..1 or 0..255');
      }
      color = color.map(component => Math.round(component * 255 / maximum));
    } else return null;
  } else {
    if (args.length !== 1 || (!numeric.test(args[0]!) && !api.getValue)) return null;
    value = evaluateViewerNumber(api, args[0]!);
    const maximum = operation === 'SetLineStyle' ? 4 : operation === 'SetPointSize' ? 9 : 13;
    if (!Number.isInteger(value) || value < 0 || value > maximum || (operation === 'SetPointSize' && value < 1)) {
      throw new Error(`${operation} requires an integer ${operation === 'SetPointSize' ? 1 : 0}..${maximum}`);
    }
  }
  if (!api.exists(name)) throw new Error(`Style target does not exist: ${name}`);
  switch (operation) {
    case 'SetColor': api.setColor(name, color![0]!, color![1]!, color![2]!); break;
    case 'SetLineThickness': api.setLineThickness(name, value!); break;
    case 'SetLineStyle': api.setLineStyle(name, value!); break;
    case 'SetPointSize': api.setPointSize(name, value!); break;
  }
  return true;
}
