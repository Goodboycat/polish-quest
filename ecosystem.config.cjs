module.exports = { apps: [{ name: 'pq', script: 'python3', args: '-m http.server 3000 --bind 0.0.0.0 --directory site', env: { PORT: 3000 }, watch: false, instances: 1, exec_mode: 'fork' }] }
