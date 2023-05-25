# INSTALLING DEPENDENCIES
sudo apt-get update
sudo apt-get install build-essential libssl-dev traceroute snapd

# EXPORTING CHROMIUM BROWSER AND SETTING CHROME_PATH
sudo snap install chromium
export CHROME_PATH=$(which chromium-browser)

# INSTALLING NVM & LATEST NODE & NPM VERSION
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
npm install -g npm@latest

# SETTING UP ACCOUNT
git clone https://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@github.com/n00bgineer/tracepath-diagonostics ./diagonostics
cd diagonostics
touch .env && chmod a+x .env
npm i

