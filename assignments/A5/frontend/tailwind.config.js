module.exports = {
    mode: 'jit',
    content: ['./index.html', './src/**/*.{ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#2A6595'
            },
            fontFamily: {
                code: ['Menlo', 'Monaco', 'Lucida Console', 'Liberation Mono']
            }
        },
        screens: {
            sm: '600px',
            // => @media (min-width: 600px) { ... }

            md: '768px',
            // => @media (min-width: 768px) { ... }

            lg: '1024px',
            // => @media (min-width: 1024px) { ... }

            xl: '1280px',
            // => @media (min-width: 1280px) { ... }

            '2xl': '1536px'
            // => @media (min-width: 1536px) { ... }
        }
    },
    plugins: []
};
