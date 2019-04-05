

UID=$(shell id -u)
GID=$(shell id -g)


TAG="latest"

DEVDC=-f docker-compose-dev.yaml

define usercompose
version: "2.1"
services:
  base_config:
    build:
      args:
        GID: $(GID)
        UID: $(UID)
endef
export usercompose


prod: build
	docker-compose up

dev: .user.compose.yml
	docker-compose $(DEVDC) up --remove-orphans --build

build: .user.compose.yml containers/prod/app containers/prod/ui
	# build the needed images to build ui and go binary
	docker-compose $(DEVDC) build
	# tag imannotate image
	cd containers/prod/ && docker build -t smileinnovation/imannotate:$(TAG) .

.user.compose.yml:
	@echo "$$usercompose" > $@
	echo $@ created

containers/prod/ui:
	docker-compose $(DEVDC) run --rm ui ng build --prod
	mv ui/dist containers/prod/ui

containers/prod/app:
	echo 'go build -ldflags "-linkmode external -extldflags -static" -o app.bin' > builder.sh
	docker-compose $(DEVDC) run --rm api sh ./builder.sh
	mv app.bin containers/prod/app
	rm builder.sh

clean-all: clean-volumes clean clean-images

clean: clean-container-dist
	rm -rf ui/dist
	rm -f gin-bin app.bin

clean-container-dist: clean-ui-container-dist clean-api-container-dist

clean-ui-container-dist:
	rm -rf containers/prod/ui 

clean-api-container-dist:
	rm -rf  containers/prod/app

clean-docker:
	docker-compose down --remove-orphans
	docker-compose $(DEVDC) down --remove-orphans

clean-volumes:
	docker-compose down -v --remove-orphans
	docker-compose $(DEVDC) down -v --remove-orphans

clean-images:
	docker rmi $(shell docker image ls -q $(notdir $(shell pwd))*) || :
	docker rmi smileinnovation/imannotate:$(TAG)

test:
	go test -v ./api/... ./app/server/...
