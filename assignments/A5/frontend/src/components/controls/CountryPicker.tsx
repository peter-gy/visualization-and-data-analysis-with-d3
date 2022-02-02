import { GeoLocation } from '@models/geo-location';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { iso31661Alpha3To2 } from '@data/country-iso-codes';
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

type _CountryPickerProps = {
    countryPool: GeoLocation[];
    initialSelectedCountries?: GeoLocation[];
    onSelectionChanged?: (countries: GeoLocation[]) => void;
};

function CountryPickerFragment({
    countryPool,
    initialSelectedCountries = [],
    onSelectionChanged = (_) => {}
}: _CountryPickerProps) {
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
                                        <CountryFlag
                                            isoAlpha2={iso31661Alpha3To2(value.iso_code)}
                                        />
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
                    const isoAlpha2 = iso31661Alpha3To2(country.iso_code);
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
                                <CountryFlag isoAlpha2={isoAlpha2} />
                            </div>
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}

function CountryFlag({ isoAlpha2 }: { isoAlpha2: string }) {
    return <span className={`flag-icon flag-icon-${isoAlpha2.toLowerCase()}`} />;
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

    return (
        <CountryPickerFragment
            countryPool={countryPool}
            initialSelectedCountries={selectedCountries}
            onSelectionChanged={onSelectionChanged}
        />
    );
}

export default CountryPicker;
