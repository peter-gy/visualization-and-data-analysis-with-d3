import { useState } from 'react';
import { initialTimeRange } from '@data/initial-data';
import { DatePicker } from '@mui/lab';
import { TextField } from '@mui/material';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import * as dayjs from 'dayjs';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';

// Use DayJS to pass values to the MUI DatePicker
const initialDateRange = { start: dayjs(initialTimeRange.start), end: dayjs(initialTimeRange.end) };

function DateRangePicker() {
    // State to be mutated by the DatePicker
    const [dateRange, setDateRange] = useState(initialDateRange);

    // Get the query boundaries
    const {
        state: {
            timeRange: { start, end }
        }
    } = useOCDQueryConfig();
    // Use DayJS to pass values to the MUI DatePicker
    const [minDate, maxDate] = [dayjs(start), dayjs(end)];

    // Change the user config state when the date range changes
    const { dispatch: userConfigDispatch } = useUserConfig();

    // Update the DateRange values and mutate the user config
    function updateDateRange(dateRange: { start: dayjs.Dayjs; end: dayjs.Dayjs }) {
        setDateRange(dateRange);
        userConfigDispatch({
            type: 'SET_SELECTED_TIME_RANGE',
            data: { start: dateRange.start.toDate(), end: dateRange.end.toDate() }
        });
    }

    return (
        <div className="p-4 flex justify-around items-center">
            <DatePicker
                label="Start Date"
                minDate={minDate}
                maxDate={dateRange.end}
                value={dateRange.start}
                openTo="year"
                onChange={(newValue) => {
                    if (newValue) {
                        updateDateRange({
                            ...dateRange,
                            start: newValue
                        });
                    }
                }}
                renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
                label="End Date"
                minDate={dateRange.start}
                maxDate={maxDate}
                value={dateRange.end}
                openTo="year"
                onChange={(newValue) => {
                    if (newValue) {
                        updateDateRange({
                            ...dateRange,
                            end: newValue
                        });
                    }
                }}
                renderInput={(params) => <TextField {...params} />}
            />
        </div>
    );
}

export default DateRangePicker;
