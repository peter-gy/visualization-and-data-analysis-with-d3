import { RiskFactor } from '@models/covid-data-item';
import { useEffect, useState } from 'react';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import riskFactorData from '@data/risk-factor-data';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

function RiskFactorPicker() {
    const {
        state: { selectedRiskFactor },
        dispatch
    } = useUserConfig();
    return (
        <RiskFactorPickerFragment
            initialRiskFactor={selectedRiskFactor}
            onChange={(riskFactor: RiskFactor) => {
                dispatch({ type: 'SET_SELECTED_RISK_FACTOR', data: riskFactor });
            }}
        />
    );
}
type RiskFactorPickerFragmentProps = {
    initialRiskFactor: RiskFactor;
    onChange: (riskFactor: RiskFactor) => void;
};

function RiskFactorPickerFragment({ initialRiskFactor, onChange }: RiskFactorPickerFragmentProps) {
    const [riskFactor, setRiskFactor] = useState<RiskFactor>(initialRiskFactor);
    const handleChange = (event: SelectChangeEvent) => {
        const riskFactor = event.target.value as RiskFactor;
        onChange(riskFactor);
        setRiskFactor(riskFactor);
    };

    useEffect(() => {
        setRiskFactor(initialRiskFactor);
    }, [initialRiskFactor]);

    return (
        <div className="flex flex-col">
            <FormControl fullWidth>
                <InputLabel
                    id="risk-factor-select-label"
                    className="bg-white
                "
                >
                    Risk Factor
                </InputLabel>
                <Select<RiskFactor>
                    labelId="risk-factor-select-label"
                    value={riskFactor}
                    label="Risk Factor"
                    onChange={handleChange}
                >
                    {Object.keys(riskFactorData).map((riskFactor) => {
                        const riskFactorDataItem = riskFactorData[riskFactor as RiskFactor];
                        return (
                            <MenuItem key={riskFactor} value={riskFactor}>
                                {riskFactorDataItem.capitalized}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
            <p className="text-sm italic mt-2">{riskFactorData[riskFactor].description}</p>
        </div>
    );
}

export default RiskFactorPicker;
