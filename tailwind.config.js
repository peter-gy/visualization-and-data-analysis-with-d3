const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    purge: ['*.html', '*/**/*.html'],
    darkMode: false, // or 'media' or 'class'
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
