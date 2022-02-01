import QueryGuard from '@components/utils/QueryGuard';
import { Alert, AlertTitle, Button, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

type CovidDataQueryGuardProps<T> = {
    data: T;
    isLoading: boolean;
    children: ((data: T) => JSX.Element) | JSX.Element;
};

function CovidDataQueryGuard<T>({ data, isLoading, children }: CovidDataQueryGuardProps<T>) {
    return (
        <QueryGuard<T>
            data={data}
            isLoading={isLoading}
            errorMessage={data === undefined && !isLoading ? 'Error' : undefined}
            children={children}
            LoadingElement={<CircularProgress />}
            ErrorElement={<CustomErrorElement />}
        />
    );
}

function CustomErrorElement() {
    const handleRefresh = () => {
        window.location.reload();
    };
    return (
        <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            <strong>The Custom Covid Data Server is not available.</strong>
            <p>(It should be running under {import.meta.env.VITE_OCD_API_HOST})</p>
            <p>Please try again later!</p>
            <div className="mt-2">
                <Button color="inherit" size="small" onClick={handleRefresh}>
                    Refresh <RefreshIcon />
                </Button>
            </div>
        </Alert>
    );
}

export default CovidDataQueryGuard;
