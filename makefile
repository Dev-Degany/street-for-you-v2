
PROJECT = "enigma_web"
COMPOSE = docker-compose -p ${PROJECT}
EXEC = ${COMPOSE} exec
UID = $(shell id -u)
GID = $(shell id -g)
ARGS = --force-rm --build-arg TZ=`cat /etc/timezone` --build-arg USER_ID=${UID} --build-arg GROUP_ID=$(GID)

.PHONY: all
all: build start

.PHONY: build
build: allow-mariadb
	@${COMPOSE} build ${ARGS}

.PHONY: rebuild
rebuild: stop allow-mariadb
	@${COMPOSE} rm -f -s -v | true
	@${COMPOSE} build--no-cache ${ARGS}

.PHONY: allow-mariadb
allow-mariadb:
	@export UID=${UID}
	@export GID=${GID}

.PHONY: start
start: allow-mariadb
	@${COMPOSE} up

.PHONY: stop
stop:
	@${COMPOSE} down | true

.PHONY: recreate
recreate: stop start

.PHONY: exec
exec:
	@${EXEC} -u www-data:www-data web /bin/bash

.PHONY: exec-root
exec-root:
	@${EXEC} web /bin/bash

.PHONY: mysql
mysql:
	@${EXEC} db /bin/mysql -u root -p enigma --password=root

.PHONY: clean
clean:
	@${COMPOSE} rm -fs
