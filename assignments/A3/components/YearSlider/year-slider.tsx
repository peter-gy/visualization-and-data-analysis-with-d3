import Slider from 'react-input-slider';
import { useAppData } from '@components/AppDataProvider/app-data-context';
import { startYear, endYear } from '@models/state-data';

export default function YearSlider(): JSX.Element {
    const {
        state: { selectedYear },
        dispatch
    } = useAppData();
    return (
        <Slider
            axis="x"
            x={selectedYear}
            onChange={({ x }) => dispatch({ type: 'setSelectedYear', data: x })}
            xmin={startYear}
            xmax={endYear}
            styles={{
                track: {
                    width: '80vw'
                },
                active: {
                    backgroundColor: '#ffec84'
                }
            }}
        />
    );
}
