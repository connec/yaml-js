build:
	coffee -o lib -c src

test: build
	coffee test/test.coffee

.PHONY: build test