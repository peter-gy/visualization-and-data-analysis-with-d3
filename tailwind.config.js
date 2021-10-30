const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    purge: ['*.html', '*/**/*.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                primary: colors.blue[600]
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: []
};
