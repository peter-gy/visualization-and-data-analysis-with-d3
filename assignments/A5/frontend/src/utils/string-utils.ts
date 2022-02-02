function snakeCaseToCapitalCase(snake_case: string) {
    return snake_case
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export { snakeCaseToCapitalCase };
