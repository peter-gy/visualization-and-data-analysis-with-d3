import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import UndoIcon from '@mui/icons-material/UndoOutlined';
import { Button } from '@mui/material';

function UserConfigResetButton() {
    const { dispatch } = useUserConfig();
    return (
        <Button onClick={() => dispatch({ type: 'RESET_TO_DEFAULTS' })} variant="outlined">
            Reset <UndoIcon />
        </Button>
    );
}

export default UserConfigResetButton;
