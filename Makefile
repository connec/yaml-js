build: build-node build-browser

build-node:
	coffee -o lib -c src

build-browser:
	node node_modules/squash/bin/cli.js --coffee -f yaml.js -o -r ./=yaml
	node node_modules/squash/bin/cli.js --coffee -c -f yaml.min.js -o -r ./=yaml

test: build
	coffee test/test.coffee

.PHONY: build build-node build-browser test