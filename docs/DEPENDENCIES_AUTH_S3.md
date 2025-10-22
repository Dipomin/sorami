# Configuration des Dépendances - Authentification & Stockage

## Dépendances Python Requises

```txt
# ============================================================================
# EXISTING DEPENDENCIES (déjà installées)
# ============================================================================
flask>=3.0.0
flask-cors>=4.0.0
crewai[tools]>=0.152.0
python-dotenv>=1.0.0
pydantic>=2.0.0
requests>=2.31.0

# ============================================================================
# NEW DEPENDENCIES (à installer)
# ============================================================================

# Authentification Clerk
PyJWT>=2.8.0                # Vérification des tokens JWT
cryptography>=41.0.0        # Cryptographie pour les signatures RSA

# AWS S3 Storage
boto3>=1.34.0              # SDK AWS officiel pour S3
botocore>=1.34.0           # Core utilities pour boto3
```

## Installation

### Installation complète
```bash
pip install PyJWT cryptography boto3
```

### Installation depuis requirements.txt
```bash
# Créer requirements.txt avec toutes les dépendances
pip freeze > requirements.txt

# Installer depuis requirements.txt
pip install -r requirements.txt
```

## Vérification de l'installation

```python
# test_dependencies.py
import sys

def check_dependencies():
    """Vérifie que toutes les dépendances sont installées"""
    
    required = {
        'jwt': 'PyJWT',
        'cryptography': 'cryptography',
        'boto3': 'boto3',
        'botocore': 'botocore',
        'flask': 'Flask',
        'flask_cors': 'flask-cors',
        'pydantic': 'pydantic'
    }
    
    missing = []
    
    for module, package in required.items():
        try:
            __import__(module)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - MANQUANT")
            missing.append(package)
    
    if missing:
        print(f"\n❌ Dépendances manquantes: {', '.join(missing)}")
        print(f"   Installation: pip install {' '.join(missing)}")
        sys.exit(1)
    else:
        print("\n✅ Toutes les dépendances sont installées!")

if __name__ == "__main__":
    check_dependencies()
```

Exécuter:
```bash
python test_dependencies.py
```

## Versions Compatibles

| Package | Version Min | Version Recommandée | Notes |
|---------|-------------|---------------------|-------|
| PyJWT | 2.8.0 | 2.8.0+ | Vérification JWT Clerk |
| cryptography | 41.0.0 | 42.0.0+ | Signatures RSA256 |
| boto3 | 1.34.0 | 1.34.51+ | Client S3 |
| flask | 3.0.0 | 3.0.2+ | API REST |
| flask-cors | 4.0.0 | 4.0.0+ | CORS |
| pydantic | 2.0.0 | 2.6.1+ | Validation |

## Configuration Docker (Optionnel)

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Installation des dépendances système
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copie et installation des requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code
COPY . .

# Variables d'environnement par défaut
ENV FLASK_APP=complete_crewai_api.py
ENV FLASK_ENV=production

# Exposition du port
EXPOSE 9006

# Commande de démarrage
CMD ["python", "complete_crewai_api.py"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "9006:9006"
    env_file:
      - .env
    volumes:
      - ./generated_books:/app/generated_books
      - ./generated_blogs:/app/generated_blogs
      - ./generated_images:/app/generated_images
      - ./generated_videos:/app/generated_videos
    restart: unless-stopped
    networks:
      - sorami-network

networks:
  sorami-network:
    driver: bridge
```

## Notes de Compatibilité

### Python Version
- **Minimum:** Python 3.9
- **Recommandé:** Python 3.11+
- **Testé avec:** Python 3.11.7

### Systèmes d'Exploitation
- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu 20.04+, Debian 11+)
- ✅ Windows 10/11 (avec WSL2 recommandé)

### Conflits Potentiels

⚠️ **Attention:**
- `pyjwt` vs `PyJWT`: Utiliser `PyJWT` (avec majuscule)
- `cryptography` nécessite des dépendances système (gcc, libssl-dev)
- `boto3` peut être lent au premier import (normal)

## Troubleshooting

### Erreur: "No module named 'jwt'"
```bash
pip uninstall pyjwt PyJWT
pip install PyJWT
```

### Erreur: "cryptography build error"
```bash
# Ubuntu/Debian
sudo apt-get install build-essential libssl-dev libffi-dev python3-dev

# macOS
brew install openssl
export LDFLAGS="-L/usr/local/opt/openssl/lib"
export CPPFLAGS="-I/usr/local/opt/openssl/include"
pip install cryptography

# Windows
# Utiliser les wheels pré-compilés (automatique avec pip)
```

### Erreur: "boto3 credentials not found"
```bash
# Vérifier les variables d'environnement
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY

# Ou configurer AWS CLI
aws configure
```
