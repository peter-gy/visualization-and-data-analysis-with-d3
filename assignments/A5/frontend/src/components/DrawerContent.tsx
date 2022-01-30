import DateRangePicker from '@components/DateRangePicker';
import CountryPicker from '@components/CountryPicker';

function DrawerContent() {
    return (
        <div className="p-4 flex flex-col justify-center items-start">
            <div className="my-2">
                <DateRangePicker />
            </div>
            <div className="my-2">
                <CountryPicker />
            </div>
        </div>
    );
}

export default DrawerContent;
