import { Continent, IsoCode } from '@models/geo-location';
import { FeatureCollection, Geometry } from 'geojson';
import worldGeoMap from '../../assets/world.geo.json';

export type WorldMapFeatureProps = {
    adm0_a3: IsoCode;
    name: string;
    continent: Continent;
};

export default worldGeoMap as FeatureCollection<Geometry, WorldMapFeatureProps>;
