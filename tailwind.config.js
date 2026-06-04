/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./public/**/*.{html,js}"
    ],
    theme: {
        extend: {
            colors: {
                utama: '#25D366', // Warna khas WA
                kedua: '#128C7E',
            },
        },
    },
    plugins: [],
}