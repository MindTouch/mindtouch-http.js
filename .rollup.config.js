export default {
    entry: './main.js',
    targets: [
        { dest: 'dist/index.es.js', format: 'es' },
        { dest: 'dist/index.js', format: 'cjs' }
    ]
};