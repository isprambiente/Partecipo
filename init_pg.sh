#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER $PARTECIPO_USER WITH PASSWORD '$PARTECIPO_PASSWORD';
	CREATE DATABASE partecipo_production OWNER $PARTECIPO_USER;
  GRANT ALL PRIVILEGES ON DATABASE partecipo_production TO $PARTECIPO_USER;
  CREATE DATABASE partecipo_production_cache OWNER $PARTECIPO_USER;
  GRANT ALL PRIVILEGES ON DATABASE partecipo_production_cache TO $PARTECIPO_USER;
  CREATE DATABASE partecipo_production_queue OWNER $PARTECIPO_USER;
	GRANT ALL PRIVILEGES ON DATABASE partecipo_production_queue TO $PARTECIPO_USER;
  CREATE DATABASE partecipo_production_cable OWNER $PARTECIPO_USER;
	GRANT ALL PRIVILEGES ON DATABASE partecipo_production_cable TO $PARTECIPO_USER;
EOSQL
