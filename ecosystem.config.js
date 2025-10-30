module.exports = {
  apps: [{
    name: 'sorami-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/sorami/sorami',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logs
    error_file: '/home/sorami/logs/err.log',
    out_file: '/home/sorami/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Comportement
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Ressources
    node_args: '--max-old-space-size=2048',
    
    // Health check
    listen_timeout: 10000,
    kill_timeout: 5000,
    
    // Variables d'environnement additionnelles
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }],
  
  // Configuration du déploiement (optionnel)
  deploy: {
    production: {
      user: 'sorami',
      host: 'votre-vps-ip',
      ref: 'origin/main',
      repo: 'git@github.com:Dipomin/sorami.git',
      path: '/home/sorami/sorami',
      'pre-deploy': 'git fetch --all',
      'post-deploy': 'npm ci && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': ''
    }
  }
};
