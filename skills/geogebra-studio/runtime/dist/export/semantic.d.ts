export interface SceneObject {
    name: string;
    type: string;
    visible: boolean;
    labelVisible: boolean;
    caption: string;
    coordinates?: [number, number];
    command?: {
        name: string;
        inputs: string[];
        outputs: string[];
    };
    expression?: string;
    style: {
        color: [number, number, number];
        thickness: number;
        dash: number;
        pointSize: number;
        pointStyle: number;
        fill: number;
    };
}
export interface SemanticScene {
    schemaVersion: '1.0';
    source: 'geogebra-xml';
    xml: string;
    objects: SceneObject[];
}
/** Preserve command edges as well as evaluated coordinates and appearance. */
export declare function sceneFromXML(xml: string): SemanticScene;
export type SourceFormat = 'tikz' | 'asymptote' | 'tsqx';
export interface SourceResult {
    format: SourceFormat;
    code: string;
    complete: boolean;
    warnings: string[];
    coordinateFallbacks: string[];
    unsupportedObjects: string[];
    semantics: 'preserved-subset' | 'partial';
}
/** Deliberately small semantic backend. Unsupported relations remain visible in the report. */
export declare function exportSource(scene: SemanticScene, format: SourceFormat, strict?: boolean, standalone?: boolean): SourceResult;
//# sourceMappingURL=semantic.d.ts.map