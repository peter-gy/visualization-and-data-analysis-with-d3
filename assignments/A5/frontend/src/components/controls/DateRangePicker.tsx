import { useState } from 'react';
import { initialTimeRange } from '@data/initial-data';
import { DatePicker } from '@mui/lab';
import { TextField } from '@mui/material';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import * as dayjs from 'dayjs';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';

// Use DayJS to pass values to the MUI DatePicker
type DateRange = { start: dayjs.Dayjs; end: dayjs.Dayjs };

type _DateRangePickerProps = {
    initialDateRange: DateRange;
    queryBoundaryDateRange: DateRange;
    onSelectionChange?: (dateRange: DateRange) => void;
};

function _DateRangePicker({
    initialDateRange,
    queryBoundaryDateRange,
    onSelectionChange = (_) => {}
}: _DateRangePickerProps) {
    // State to be mutated by the DatePicker
    const [dateRange, setDateRange] = useState(initialDateRange);

    // Use DayJS to pass values to the MUI DatePicker
    const [minDate, maxDate] = [
        dayjs(queryBoundaryDateRange.start),
        dayjs(queryBoundaryDateRange.end)
    ];

    function dateRangeIsValid(dateRange: DateRange) {
        return (
            dateRange.start.isValid() &&
            dateRange.end.isValid() &&
            dateRange.start.isBefore(dateRange.end)
        );
    }

    // Update the DateRange values and mutate the user config
    function updateDateRange(dateRange: DateRange) {
        if (dateRangeIsValid(dateRange)) {
            setDateRange(dateRange);
            onSelectionChange(dateRange);
        }
    }

    return (
        <div className="flex flex-row justify-around items-center">
            <div className="mr-1">
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
            </div>
            <div className="ml-1">
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
        </div>
    );
}

const initialDateRange = { start: dayjs(initialTimeRange.start), end: dayjs(initialTimeRange.end) };

function DateRangePicker() {
    // Get the query boundaries
    const {
        state: {
            timeRange: { start, end }
        }
    } = useOCDQueryConfig();
    const queryBoundaryDateRange = { start: dayjs(start), end: dayjs(end) };
    // Change the user config state when the date range changes
    const { dispatch: userConfigDispatch } = useUserConfig();
    function handleSelectionChanged(dateRange: DateRange) {
        userConfigDispatch({
            type: 'SET_SELECTED_TIME_RANGE',
            data: { start: dateRange.start.toDate(), end: dateRange.end.toDate() }
        });
    }
    return (
        <_DateRangePicker
            initialDateRange={initialDateRange}
            queryBoundaryDateRange={queryBoundaryDateRange}
            onSelectionChange={handleSelectionChanged}
        />
    );
}

export default DateRangePicker;
