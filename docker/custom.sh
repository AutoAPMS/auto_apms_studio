set -e

NODEJS_MAJOR_VERSION=24

apt-get install -y curl
curl -fsSL https://deb.nodesource.com/setup_$NODEJS_MAJOR_VERSION.x | bash -
apt-get install -y nodejs
node -v | echo "Using Node.js version $(cat -)"