function constructFetchUrl(baseUrl: string, params: Record<string, string>): string {
    const queryString = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    return `${baseUrl}?${queryString}`;
}

export { constructFetchUrl };
