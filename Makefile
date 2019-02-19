export PATH := $(shell pwd)/node_modules/.bin:$(PATH)

.PHONY: build test unit acceptance lint

test: build unit acceptance lint

build:
	rm -rf build
	./node_modules/.bin/tsc

unit:
	./node_modules/.bin/mocha build/test/bootstrap.js 'build/test/unit/**/*.test.js'

acceptance:
	./node_modules/.bin/mocha build/test/bootstrap.js 'build/test/acceptance/**/*.test.js'

lint:
	./node_modules/.bin/tslint --project ./ --fix
