#!/bin/bash

##############################################################################
# Script de configuration initiale du VPS pour Sorami Frontend
# À exécuter une seule fois lors de la première installation
# Usage: sudo bash setup-vps.sh
##############################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Vérifier que le script est exécuté en root
if [ "$EUID" -ne 0 ]; then 
    log_error "Ce script doit être exécuté en root (sudo)"
    exit 1
fi

log_info "🚀 Configuration initiale du VPS pour Sorami"
echo "=============================================="

# 1. Mise à jour du système
log_info "📦 Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation des paquets de base
log_info "📦 Installation des paquets essentiels..."
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    ufw \
    fail2ban \
    htop \
    vim \
    certbot \
    python3-certbot-nginx \
    mysql-client

log_success "✅ Paquets installés"

# 3. Configuration du firewall
log_info "🔥 Configuration du firewall UFW..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw status

log_success "✅ Firewall configuré"

# 4. Configuration de fail2ban
log_info "🛡️ Configuration de fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
EOF

systemctl restart fail2ban
log_success "✅ fail2ban configuré"

# 5. Créer l'utilisateur sorami
log_info "👤 Création de l'utilisateur 'sorami'..."
if id "sorami" &>/dev/null; then
    log_warning "L'utilisateur sorami existe déjà"
else
    adduser --disabled-password --gecos "" sorami
    usermod -aG sudo sorami
    
    # Copier les clés SSH
    mkdir -p /home/sorami/.ssh
    if [ -f /root/.ssh/authorized_keys ]; then
        cp /root/.ssh/authorized_keys /home/sorami/.ssh/
        chown -R sorami:sorami /home/sorami/.ssh
        chmod 700 /home/sorami/.ssh
        chmod 600 /home/sorami/.ssh/authorized_keys
    fi
    
    log_success "✅ Utilisateur sorami créé"
fi

# 6. Installer Node.js via NVM pour l'utilisateur sorami
log_info "🟢 Installation de Node.js 20 LTS..."
su - sorami << 'EOF'
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20
node -v
npm -v
EOF

log_success "✅ Node.js installé"

# 7. Installer PM2 globalement
log_info "📦 Installation de PM2..."
su - sorami << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm install -g pm2
EOF

# Configurer PM2 pour démarrer au boot
su - sorami -c "pm2 startup systemd -u sorami --hp /home/sorami" | tail -n 1 > /tmp/pm2-startup.sh
bash /tmp/pm2-startup.sh
rm /tmp/pm2-startup.sh

log_success "✅ PM2 installé et configuré"

# 8. Installer Nginx
log_info "🌐 Installation de Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Configuration Nginx par défaut (sera remplacée par le déploiement)
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

nginx -t
systemctl reload nginx

log_success "✅ Nginx installé"

# 9. Créer les répertoires nécessaires
log_info "📁 Création des répertoires..."
su - sorami << 'EOF'
mkdir -p ~/logs
mkdir -p ~/backups
mkdir -p ~/sorami
EOF

log_success "✅ Répertoires créés"

# 10. Configuration SSH sécurisée
log_info "🔐 Sécurisation SSH..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Configurer SSH
cat > /etc/ssh/sshd_config.d/security.conf << 'EOF'
# Login root autorisé (pour la maintenance)
# PermitRootLogin no  # Décommenté pour permettre l'accès root

# Désactiver l'authentification par mot de passe (sécurité par clé SSH)
PasswordAuthentication no
PubkeyAuthentication yes

# Autres sécurisations
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

log_success "✅ SSH sécurisé (authentification par clé uniquement)"
log_info "ℹ️  Login root reste activé pour la maintenance"

# 11. Installation de logrotate pour les logs
log_info "📜 Configuration de logrotate..."
cat > /etc/logrotate.d/sorami << 'EOF'
/home/sorami/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    missingok
    create 0640 sorami sorami
}
EOF

log_success "✅ Logrotate configuré"

# 12. Créer un script de backup automatique
log_info "💾 Configuration du backup automatique..."
cat > /home/sorami/backup.sh << 'EOFSCRIPT'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/sorami/backups"

# Backup de la base de données MySQL
# Remplacer avec vos credentials
# mysqldump -h host -u user -ppassword sorami | gzip > $BACKUP_DIR/sorami_$DATE.sql.gz

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "sorami_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOFSCRIPT

chmod +x /home/sorami/backup.sh
chown sorami:sorami /home/sorami/backup.sh

# Ajouter au cron (tous les jours à 2h du matin)
(crontab -u sorami -l 2>/dev/null; echo "0 2 * * * /home/sorami/backup.sh >> /home/sorami/logs/backup.log 2>&1") | crontab -u sorami -

log_success "✅ Backup automatique configuré"

# 13. Afficher le résumé
echo ""
echo "=============================================="
log_success "🎉 Configuration du VPS terminée!"
echo "=============================================="
echo ""
echo "📋 Résumé de l'installation:"
echo "   ✅ Système mis à jour"
echo "   ✅ Firewall UFW configuré"
echo "   ✅ fail2ban installé"
echo "   ✅ Utilisateur 'sorami' créé"
echo "   ✅ Node.js 20 LTS installé"
echo "   ✅ PM2 installé"
echo "   ✅ Nginx installé"
echo "   ✅ Répertoires créés"
echo "   ✅ Logrotate configuré"
echo "   ✅ Backup automatique configuré"
echo ""
echo "📝 Prochaines étapes:"
echo ""
echo "1. Configurer le DNS de votre domaine vers cette IP"
echo ""
echo "2. Se connecter avec l'utilisateur sorami:"
echo "   ssh sorami@votre-ip"
echo ""
echo "3. Cloner le repository:"
echo "   cd ~"
echo "   git clone https://github.com/Dipomin/sorami.git"
echo ""
echo "4. Configurer les variables d'environnement:"
echo "   cd sorami"
echo "   cp .env.example .env.production"
echo "   nano .env.production"
echo ""
echo "5. Lancer le déploiement:"
echo "   ./deploy.sh production"
echo ""
echo "6. Configurer SSL avec Let's Encrypt:"
echo "   sudo certbot --nginx -d sorami.app -d www.sorami.app"
echo ""
echo "7. Créer la configuration Nginx pour Sorami"
echo "   (voir DEPLOYMENT.md)"
echo ""
echo "⚠️  IMPORTANT: Redémarrez le serveur pour appliquer les changements SSH:"
echo "   sudo reboot"
echo ""
echo "=============================================="
