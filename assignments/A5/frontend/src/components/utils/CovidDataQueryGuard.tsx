import { ReactNode } from 'react';
import QueryGuard from '@components/utils/QueryGuard';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, AlertTitle, Button, CircularProgress } from '@mui/material';

type CovidDataQueryGuardProps<T> = {
    data: T;
    isLoading: boolean;
    children: ((data: T) => JSX.Element) | JSX.Element | ReactNode;
};

function CovidDataQueryGuard<T>({ data, isLoading, children }: CovidDataQueryGuardProps<T>) {
    return (
        <QueryGuard<T>
            data={data}
            isLoading={isLoading}
            errorMessage={data === undefined && !isLoading ? 'Error' : undefined}
            children={children}
            LoadingElement={
                <div className="flex justify-center items-center h-screen bg-primary">
                    <CustomLoadingElement />
                </div>
            }
            ErrorElement={
                <div className="flex justify-center items-center h-screen bg-primary">
                    <CustomErrorElement />
                </div>
            }
        />
    );
}

function CustomLoadingElement() {
    return (
        <div className="flex flex-col justify-center items-center bg-white rounded-lg p-8">
            <h1 className="text-2xl my-4">Fetching the most recent COVID Data...</h1>
            <p className='my-4 italic'>I am not even kidding, you are contacting the server at this very moment!</p>
            <CircularProgress />
        </div>
    );
}

function CustomErrorElement() {
    const handleRefresh = () => {
        window.location.reload();
    };
    return (
        <Alert severity="error" className="border-red-700 border-2">
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
