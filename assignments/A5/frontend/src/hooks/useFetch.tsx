import { constructFetchUrl } from '@utils/fetch-utils';
import { useEffect, useState } from 'react';

function useFetch(
    url: string,
    params: Record<string, string> = {},
    errorMessageGetter?: (response: any) => string
) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // The encoded url to be fetched
    const fetchUrl = constructFetchUrl(url, params);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(fetchUrl);
                const json = await response.json();
                if (response.ok) {
                    setData(json);
                    setIsLoading(false);
                    setHasError(false);
                } else {
                    setErrorMessage(errorMessageGetter ? errorMessageGetter(json) : 'Error');
                    setHasError(true);
                    setIsLoading(false);
                }
            } catch (error) {
                setErrorMessage((error as Error).message);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        }

        // Reset the state before each fetch
        setData(null);
        setIsLoading(true);
        setHasError(false);
        setErrorMessage('');
        fetchData();
    }, [url, fetchUrl]);

    return { data, isLoading, hasError, errorMessage };
}
export default useFetch;
