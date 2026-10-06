#!/bin/bash
# Starts PostgreSQL (localhost only), waits until it accepts connections, then starts the API.
# If either process exits, the container stops.
set -e

# The data is throwaway, so durability settings are off to save memory and I/O.
docker-entrypoint.sh postgres \
  -c listen_addresses=localhost \
  -c max_connections=20 \
  -c shared_buffers=16MB \
  -c fsync=off \
  -c synchronous_commit=off \
  -c full_page_writes=off &

# The init step runs a temporary server on the Unix socket only, so waiting on TCP skips it.
until pg_isready -q -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  sleep 1
done

# JAVA_OPTS is intentionally unquoted: it holds several flags.
gosu app java $JAVA_OPTS -jar /app/app.jar &

wait -n
exit $?
