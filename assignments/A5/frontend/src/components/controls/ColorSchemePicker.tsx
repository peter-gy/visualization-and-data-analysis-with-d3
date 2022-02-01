import { colorSchemes } from '@models/color-scheme';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { Tooltip } from '@mui/material';

function ColorSchemePicker() {
    const {
        state: { colorScheme },
        dispatch
    } = useUserConfig();
    return (
        <div className="flex p-2">
            {colorSchemes.map((scheme) => (
                <Tooltip key={scheme.name} title={scheme.description}>
                    <div
                        className={`w-[35px] h-[35px] sm:w-[55px] sm:h-[55px] mx-4 rounded-full border-2 border-black cursor-pointer ${
                            scheme.name === colorScheme.name ? 'border-dashed' : ''
                        }`}
                        style={{ backgroundColor: scheme.palette.colorScale[5] }}
                        onClick={() => dispatch({ type: 'SET_COLOR_SCHEME', data: scheme })}
                    />
                </Tooltip>
            ))}
        </div>
    );
}

export default ColorSchemePicker;
