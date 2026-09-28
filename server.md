# SERVER.md — Configuration du serveur Ubuntu pour CI/CD GitLab

> **But** : préparer un serveur auto-hébergé (Dell OptiPlex 7050, 8 Go RAM, 128 Go SSD) capable d'héberger des applications Docker, d'exécuter des pipelines GitLab CI/CD et d'être administré à distance — sans VPS ni ouverture de ports sur la box.

> **Base** : ce document reprend la configuration **réellement effectuée** et validée. Chaque étape a été testée.

---

## 1. Environnement

| Élément          | Valeur                    |
| ---------------- | ------------------------- |
| Machine          | Dell OptiPlex 7050        |
| OS               | Ubuntu Server 26.04.1 LTS |
| Architecture     | x86-64                    |
| Nom d'hôte       | `mcsoltice`               |
| RAM              | ~7,1 GiB (8 Go physique)  |
| Stockage         | ~128 Go                   |
| Interface réseau | `enp0s31f6`               |
| MAC              | `14:b3:1f:27:0e:d8`       |

```bash
hostnamectl
```

---

## 2. Configuration réseau

### 2.1 DHCP initial

Fichier : `/etc/netplan/00-installer-config.yaml`

```yaml
network:
  version: 2
  ethernets:
    enp0s31f6:
      dhcp4: true
```

```bash
sudo netplan apply
ip link
ip -4 addr
ip route
ping -c 4 8.8.8.8
ping -c 4 google.com
```

Adresse obtenue : `192.168.1.164/24`.

### 2.2 Passage en IP statique

L'adresse `192.168.1.164` a été **conservée comme IP statique** pour garder une cible stable côté administration et CI/CD.

```yaml
network:
  version: 2
  ethernets:
    enp0s31f6:
      addresses:
        - 192.168.1.164/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
          - 1.1.1.1
          - 8.8.8.8
```

```bash
sudo netplan generate
sudo netplan apply
ip -4 addr
```

Résultat attendu :

```
192.168.1.164/24
valid_lft forever
preferred_lft forever
```

| Élément   | Valeur               |
| --------- | -------------------- |
| Interface | `enp0s31f6`          |
| IP locale | `192.168.1.164/24`   |
| Gateway   | `192.168.1.1`        |
| DNS       | `1.1.1.1`, `8.8.8.8` |

> ⚠️ L'IP statique a été configurée **sans accès à l'administration du routeur**. Un conflit DHCP reste possible : à surveiller, ou réserver l'adresse côté box dès que possible.

---

## 3. SSH local

```bash
sudo apt install openssh-server
sudo systemctl enable --now ssh
sudo systemctl status ssh
```

Test depuis le réseau local :

```bash
ssh mcsoltice@192.168.1.164
```

✅ Connexion validée.

---

## 4. Privilèges administrateur

```bash
sudo -v
```

✅ Fonctionnel.

---

## 5. Pare-feu UFW

```bash
sudo ufw status        # Status: inactive
sudo ufw allow ssh
sudo ufw enable
sudo ufw status
```

État final :

```
Status: active
22/tcp          ALLOW   Anywhere
22/tcp (v6)     ALLOW   Anywhere (v6)
```

---

## 6. Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
docker --version
# Docker version 29.1.3
```

### 6.1 Utilisation sans sudo

```bash
sudo usermod -aG docker $USER
# Reconnexion SSH
docker ps
```

✅ Fonctionne sans `sudo`.

### 6.2 Test réel

```bash
docker run --rm hello-world
# Hello from Docker!
```

Cette étape valide : accès Docker Hub, téléchargement d'image, création/exécution de conteneur, récupération de la sortie.

### 6.3 Docker Compose

```bash
docker compose version
# Docker Compose version 2.40.3+ds1-0ubuntu1
```

---

## 7. GitLab Runner

### 7.1 Installation

```bash
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt install -y gitlab-runner
gitlab-runner --version
# Version: 19.4.1
```

### 7.2 Service

```bash
sudo systemctl status gitlab-runner     # active (running)
sudo systemctl enable gitlab-runner
systemctl is-enabled gitlab-runner      # enabled
```

### 7.3 Accès Docker pour le Runner

Le compte système `gitlab-runner` doit pouvoir piloter Docker (l'executor Docker monte le socket).

```bash
sudo usermod -aG docker gitlab-runner
sudo systemctl restart gitlab-runner
sudo systemctl status gitlab-runner     # active (running)
```

### 7.4 Redémarrage automatique

```bash
sudo systemctl enable docker
sudo systemctl enable gitlab-runner
systemctl is-enabled docker gitlab-runner
# enabled
# enabled
```

Les configurations réseau, SSH, UFW, Docker et GitLab Runner sont stockées dans leurs fichiers système → **persistantes après reboot**.

---

## 8. Accès distant avec Tailscale

### 8.1 Pourquoi

L'IP `192.168.1.164` n'est joignable que sur le LAN. **L'administration du routeur étant indisponible**, Tailscale fournit un accès sécurisé depuis n'importe où, **sans exposer SSH sur Internet**.

```
PC Windows ──Tailscale──▶ Réseau Tailscale ──▶ Serveur Ubuntu
```

### 8.2 Installation

```bash
curl -fsSL https://tailscale.com/install.sh | sudo sh
# Tailscale 1.102.4
# Le service tailscaled démarre automatiquement
```

### 8.3 Connexion

```bash
sudo tailscale up
# Suivre l'URL d'authentification fournie
tailscale status
```

Adresse Tailscale du serveur : **`100.106.174.38`**

### 8.4 Autorisation SSH sur l'interface Tailscale

```bash
sudo ufw allow in on tailscale0 to any port 22 proto tcp
sudo ufw status
# 22/tcp on tailscale0   ALLOW   Anywhere
```

### 8.5 Côté PC Windows

Installer Tailscale, se connecter au **même compte**, puis :

```powershell
tailscale status
# 100.116.69.79   ets-p1      windows
# 100.106.174.38  mcsoltice   linux
```

### 8.6 Validation

```powershell
ssh mcsoltice@100.106.174.38
# Welcome to Ubuntu 26.04.1 LTS
```

✅ Accès distant validé.

> Commande à retenir depuis le PC lorsque le serveur n'est pas sur le même LAN :
> `ssh mcsoltice@100.106.174.38`

---

## 9. État actuel de l'infrastructure

Deux chemins d'accès :

```
LAN          → 192.168.1.164       → SSH
Internet/    → 100.106.174.38      → SSH (via Tailscale)
autre réseau
```

```
Ubuntu Server
├── Réseau statique  → 192.168.1.164
├── SSH              → administration distante
├── UFW              → SSH autorisé (LAN + tailscale0)
├── Tailscale        → 100.106.174.38
├── Docker           → 29.1.3
├── Docker Compose   → 2.40.3
└── GitLab Runner    → 19.4.1
```

---

## 10. Prochaine étape — Enregistrement du Runner

Avant d'enregistrer le Runner dans GitLab, **vérifier que le compte `gitlab-runner` peut bien piloter Docker** :

```bash
sudo -u gitlab-runner docker ps
```

Si cette commande renvoie la liste des conteneurs (même vide), l'executor Docker fonctionnera. Sinon :

```bash
sudo usermod -aG docker gitlab-runner
sudo systemctl restart gitlab-runner
```

Le parcours CI/CD cible :

```
GitLab ──▶ GitLab Runner ──▶ Docker ──▶ Build/Test ──▶ Déploiement ──▶ App sur le serveur
```

---

## 11. Points de sécurité à conserver

- ✅ SSH non exposé sur Internet (uniquement LAN + tailscale0).
- ✅ UFW actif, seuls 22/tcp (LAN et tailscale0) autorisés.
- ✅ Docker accessible via groupe `docker` (pas en root direct).
- ✅ Le Runner utilise le compte système `gitlab-runner` isolé.
- ⏳ À faire plus tard : `PermitRootLogin no`, `PasswordAuthentication no`, Fail2ban, swap, sauvegardes automatiques, nettoyage Docker planifié.

> **Rappel** : l'IP statique `192.168.1.164` a été posée sans réserver côté box → surveiller un éventuel conflit DHCP.
