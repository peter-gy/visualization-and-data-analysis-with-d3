import worldGeoMap from '../../assets/world.geo.json';
import { FeatureCollection, Geometry } from 'geojson';
import { Continent, IsoCode } from '@models/geo-location';

export type WorldMapFeatureProps = {
    adm0_a3: IsoCode;
    name: string;
    continent: Continent;
};

export default worldGeoMap as FeatureCollection<Geometry, WorldMapFeatureProps>;
