set -e

npm install
docker build -t ptushki-api .
docker tag ptushki-api:latest ptushkiregistry.azurecr.io/ptushki-api:latest
docker login ptushkiregistry.azurecr.io
docker push ptushkiregistry.azurecr.io/ptushki-api:latest