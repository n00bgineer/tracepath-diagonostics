# INSTALLING DEPENDENCIES
sudo apt-get update
sudo apt-get install traceroute
sudo apt-get install chromium-browser
sudo apt-get install build-essential libssl-dev

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
npm i
export PANGEA_TOKEN=pts_z3qrpgcz25ienbo625uztaofkglismmj
export MAXMIND_ACCOUNT_NO=865383
export MAXMIND_TOKEN=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
export PORT=443