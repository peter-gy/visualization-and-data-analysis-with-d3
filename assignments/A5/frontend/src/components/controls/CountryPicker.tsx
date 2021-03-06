import { GeoLocation } from '@models/geo-location';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CountryFlagIso3 } from '@components/utils/CountryFlag';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import ClearIcon from '@mui/icons-material/Clear';
import FlagIcon from '@mui/icons-material/Flag';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Theme, useTheme } from '@mui/material/styles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 7.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

const INPUT_LABEL = 'Countries';

function getStyles(isSelected: boolean, theme: Theme) {
    return {
        fontWeight: isSelected
            ? theme.typography.fontWeightRegular
            : theme.typography.fontWeightMedium
    };
}

type CountryPickerFragmentProps = {
    countryPool: GeoLocation[];
    initialSelectedCountries?: GeoLocation[];
    onSelectionChanged?: (countries: GeoLocation[]) => void;
    onSelectAll?: () => void;
    onClear?: () => void;
};

function CountryPickerFragment({
    countryPool,
    initialSelectedCountries = [],
    onSelectionChanged = (_) => {},
    onSelectAll = () => {},
    onClear = () => {}
}: CountryPickerFragmentProps) {
    const theme = useTheme();
    const [selectedCountries, setSelectedCountries] = useState<GeoLocation[]>([]);

    useEffect(() => {
        setSelectedCountries(initialSelectedCountries);
    }, [initialSelectedCountries]);

    function handleSelection(event: SelectChangeEvent<typeof selectedCountries>) {
        const {
            target: { value }
        } = event;
        const items = value as GeoLocation[];
        const uniqueItems = items.reduce((acc, item) => {
            if (!acc.some((i) => i.iso_code === item.iso_code)) {
                acc.push(item);
            }
            return acc;
        }, [] as GeoLocation[]);

        if (uniqueItems.length === items.length) {
            const sortedItems = Array.from(uniqueItems).sort((c1, c2) =>
                c1.location.localeCompare(c2.location)
            );
            onSelectionChanged(sortedItems);
            setSelectedCountries(sortedItems);
        } else {
            const duplicateItem = items[items.length - 1];
            handleDelete(duplicateItem);
        }
    }

    function handleDelete(value: GeoLocation) {
        const newSelection = selectedCountries.filter(
            (country) => country.iso_code !== value.iso_code
        );
        setSelectedCountries(newSelection);
        onSelectionChanged(newSelection);
    }

    return (
        <div className="flex flex-col">
            <div className="mb-2 flex justify-start items-center">
                <div className="mx-1">
                    <Button variant="outlined" onClick={onSelectAll}>
                        Select All <FlagIcon />
                    </Button>
                </div>
                <div className="mx-1">
                    <Button variant="outlined" onClick={onClear}>
                        Clear <ClearIcon />
                    </Button>
                </div>
            </div>
            <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="country-picker-label">{INPUT_LABEL}</InputLabel>
                <Select
                    labelId="country-picker-label"
                    multiple
                    value={selectedCountries}
                    onChange={handleSelection}
                    input={<OutlinedInput label={INPUT_LABEL} />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip
                                    key={value.iso_code}
                                    label={
                                        <div>
                                            <span className="mr-1">{value.location}</span>
                                            <CountryFlagIso3 iso31661={value.iso_code} />
                                        </div>
                                    }
                                    {
                                        /* Empty delete action to show the (x) button */ ...{}
                                    }
                                    onDelete={() => {}}
                                    {
                                        /* Empty delete action to show the (x) button */ ...{}
                                    }
                                    onMouseDown={() => handleDelete(value)}
                                />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    {countryPool.map((country) => {
                        const isSelected =
                            selectedCountries.find((c) => c.iso_code === country.iso_code) !==
                            undefined;
                        return (
                            // @ts-ignore
                            <MenuItem
                                key={country.iso_code}
                                value={country}
                                style={getStyles(isSelected, theme)}
                            >
                                <div>
                                    <span className="mr-1">{country.location}</span>
                                    <CountryFlagIso3 iso31661={country.iso_code} />
                                </div>
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        </div>
    );
}

function CountryPicker() {
    // Get the query boundaries
    const {
        state: { countryList: countryPool }
    } = useOCDQueryConfig();
    const {
        dispatch: userConfigDispatch,
        state: { selectedCountries }
    } = useUserConfig();

    function onSelectionChanged(countries: GeoLocation[]) {
        userConfigDispatch({ type: 'SET_SELECTED_COUNTRIES', data: countries });
    }

    function onClear() {
        userConfigDispatch({ type: 'SET_SELECTED_COUNTRIES', data: [] });
    }

    function onSelectAll() {
        userConfigDispatch({ type: 'SET_SELECTED_COUNTRIES', data: countryPool });
    }

    return (
        <CountryPickerFragment
            countryPool={countryPool}
            initialSelectedCountries={selectedCountries}
            onSelectionChanged={onSelectionChanged}
            onSelectAll={onSelectAll}
            onClear={onClear}
        />
    );
}

export default CountryPicker;
