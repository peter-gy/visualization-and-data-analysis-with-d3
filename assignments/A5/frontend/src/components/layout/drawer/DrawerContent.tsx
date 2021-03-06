import ColorSchemePicker from '@components/controls/ColorSchemePicker';
import ControlContainer from '@components/controls/ControlContainer';
import CountryPicker from '@components/controls/CountryPicker';
import DateRangePicker from '@components/controls/DateRangePicker';
import RiskFactorPicker from '@components/controls/RiskFactorPicker';
import UserConfigResetButton from '@components/controls/UserConfigResetButton';

const controlComponentData = [
    {
        title: 'Reset To Defaults',
        description: 'You can reset your configurations to the default values.',
        ControlComponent: <UserConfigResetButton />
    },
    {
        title: 'Date Range Picker',
        description:
            'You can choose the date range for the data you want to see by setting a start date and an end date.',
        ControlComponent: <DateRangePicker />
    },
    {
        title: 'Country Picker',
        description: 'You can select the countries you want to see the data for.',
        ControlComponent: <CountryPicker />
    },
    {
        title: 'Risk Factor Selector',
        description:
            'You can select a risk factor of your choice to be displayed on the lollipop chart.',
        ControlComponent: <RiskFactorPicker />
    },
    {
        title: 'Color Scheme Selector',
        description: 'You can select a color scheme of your choice.',
        ControlComponent: <ColorSchemePicker />
    }
];

function DrawerContent() {
    return (
        <div className="flex flex-col justify-start items-start overflow-y-scroll">
            {controlComponentData.map((data) => (
                <div key={data.title} className="mt-1 mb-2 py-4 border-b-[1px] border-[#e0e0e0] w-full">
                    <div className="px-4">
                        <ControlContainer {...data} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DrawerContent;
