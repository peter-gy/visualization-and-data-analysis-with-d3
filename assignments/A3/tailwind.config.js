module.exports = {
    mode: 'jit',
    purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    darkMode: false,
    theme: {
        extend: {
            colors: {
                primary: '#2A6595'
            },
            fontFamily: {
                code: ['Menlo', 'Monaco', 'Lucida Console', 'Liberation Mono']
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: []
};
