import { Coordinate } from '@models/coordinate';
import { useAppData } from '@components/AppDataProvider/app-data-context';
import { bivariateColorGenerator } from '@utils/color-utils';
import { getStateDataValues } from '@utils/app-data-utils';
import { ColorScheme } from '@models/color-scheme';

export default function useBivariateColorGenerator(
    colorScheme: ColorScheme
): ({ x, y }: Coordinate) => string {
    const {
        state: { selectedYear, educationRates, personalIncome }
    } = useAppData();
    const xValues = getStateDataValues(educationRates, selectedYear);
    const yValues = getStateDataValues(personalIncome, selectedYear);
    return bivariateColorGenerator(colorScheme, { x: xValues, y: yValues });
}
