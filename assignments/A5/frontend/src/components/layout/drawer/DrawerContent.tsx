import DateRangePicker from '@components/controls/DateRangePicker';
import CountryPicker from '@components/controls/CountryPicker';
import ControlContainer from '@components/controls/ControlContainer';
import ColorSchemePicker from '@components/controls/ColorSchemePicker';

const controlComponentData = [
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
        title: 'Color Scheme Picker',
        description: 'You can select a color scheme of your choice.',
        ControlComponent: <ColorSchemePicker />
    }
];

function DrawerContent() {
    return (
        <div className="flex flex-col justify-start items-start overflow-y-scroll">
            {controlComponentData.map((data) => (
                <div key={data.title} className="my-2 py-4 border-b-[1px] border-[#e0e0e0] w-full">
                    <div className="px-4">
                        <ControlContainer {...data} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DrawerContent;
