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
        <div className="flex flex-col justify-center items-center bg-white rounded-lg m-4 p-8 w-[100vw] sm:w-[75vw] md:sm:w-[50vw]">
            <h1 className="text-2xl my-4">Fetching the most recent COVID Data...</h1>
            <p className="my-4 italic">
                I am not even kidding, you are contacting the server at this very moment!
            </p>
            <p className="my-4 italic">
                Be careful, the longer the selected time range, the longer the request will take, as
                we need to crunch more data under the hood...⚙️
            </p>
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
            <p className={'my-1'}>
                (It should be running under {import.meta.env.VITE_OCD_API_HOST})
            </p>
            <p className={'my-1'}>Please try again later!</p>
            <p className="my-1 italic">
                You can also take a look at the source code of the project{' '}
                <a
                    href="https://github.com/peter-gy/visualization-and-data-analysis-with-d3/tree/main/assignments/A5"
                    target="_blank"
                    className="underline text-blue-500 hover:text-blue-700"
                >
                    here
                </a>
                .
            </p>
            <div className="mt-2">
                <Button color="inherit" size="small" onClick={handleRefresh}>
                    Refresh <RefreshIcon />
                </Button>
            </div>
        </Alert>
    );
}

export default CovidDataQueryGuard;
