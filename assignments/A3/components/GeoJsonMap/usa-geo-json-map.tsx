import GeoJsonMap from './geo-json-map';
import { bivariateColorScheme } from '@models/color-scheme';

export default function UsaGeoJsonMap(): JSX.Element {
    return <GeoJsonMap colorScheme={bivariateColorScheme} />;
}
