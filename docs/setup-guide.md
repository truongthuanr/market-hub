# Catalog service:
docker compose up -d catalog-service

##### Troubleshoot inside container
docker compose exec catalog-service bash

check and make migration: 

python manage.py showmigrations catalog
python manage.py makemigrations catalog
python manage.py migrate


Seed initial data:
python manage.py loaddata initial_data

##### Notes
- `catalog-service` mounts `./catalog-service` into `/app`, so fixtures and code changes are available without rebuilding.
- If you change `requirements.txt`, rebuild is still required:
  - `docker compose up -d --build catalog-service`
