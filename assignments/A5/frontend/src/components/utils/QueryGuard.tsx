type QueryGuardProps<T> = {
    data: T;
    isLoading: boolean;
    errorMessage?: string;
    children: ((data: T) => JSX.Element) | JSX.Element;
    LoadingElement: JSX.Element;
    ErrorElement: ((errorMessage: string) => JSX.Element) | JSX.Element;
};

function QueryGuard<T>({
    data,
    errorMessage,
    children,
    LoadingElement,
    ErrorElement
}: QueryGuardProps<T>) {
    if (errorMessage) {
        return typeof ErrorElement === 'function' ? ErrorElement(errorMessage) : ErrorElement;
    }
    if (data !== undefined) {
        return typeof children === 'function' ? children(data) : children;
    }
    return LoadingElement;
}

export default QueryGuard;
