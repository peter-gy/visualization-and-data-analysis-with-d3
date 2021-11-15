import * as d3 from 'd3';
import { ColorScheme } from '@models/color-scheme';
type GeoJsonMapProps = {
    colorScheme: ColorScheme;
};

export default function GeoJsonMap({ colorScheme }: GeoJsonMapProps): JSX.Element {
    return <h1>Map</h1>;
}
